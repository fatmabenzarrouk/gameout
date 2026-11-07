import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { FriendRequest, GamerCommunity, FollowRecord } from '../types';
import {
  notifyFriendRequest,
  notifyFriendRequestAccepted,
  notifyFollow
} from './notificationService';

// ================= FRIEND REQUEST OPERATIONS =================

export async function sendFriendRequest(
  data: Omit<FriendRequest, 'id' | 'createdAt' | 'status'>
): Promise<FriendRequest> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newRequest: FriendRequest = {
    ...data,
    id: requestId,
    status: 'pending',
    createdAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  try {
    await setDoc(doc(db, 'friendRequests', requestId), newRequest);

    // Trigger notification for recipient
    notifyFriendRequest(data.receiverId, {
      id: data.senderId,
      name: data.senderName,
      username: data.senderUsername,
      avatarUrl: data.senderAvatarUrl
    }).catch(console.warn);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `friendRequests/${requestId}`);
  }

  return newRequest;
}

export async function acceptFriendRequest(
  requestId: string,
  senderId?: string,
  acceptor?: { id: string; name: string; username: string; avatarUrl: string }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'accepted'
    });

    if (senderId && acceptor) {
      notifyFriendRequestAccepted(senderId, acceptor).catch(console.warn);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `friendRequests/${requestId}`);
  }
}

export async function rejectFriendRequest(requestId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'rejected'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `friendRequests/${requestId}`);
  }
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'friendRequests', requestId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `friendRequests/${requestId}`);
  }
}

export async function fetchUserFriendRequests(userId: string): Promise<FriendRequest[]> {
  try {
    const q = query(collection(db, 'friendRequests'), where('receiverId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'friendRequests');
    return [];
  }
}

// ================= FOLLOW OPERATIONS =================

export async function followGamer(
  followerId: string,
  followingId: string,
  followerInfo?: { name: string; username: string; avatarUrl: string }
): Promise<void> {
  if (followerId === followingId) {
    throw new Error('Anti-self-follow constraint: Gamers cannot follow themselves.');
  }

  const followId = `follow_${followerId}_${followingId}`;
  const record: FollowRecord = {
    id: followId,
    followerId,
    followingId,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'follows', followId), record);

    if (followerInfo) {
      notifyFollow(followingId, {
        id: followerId,
        name: followerInfo.name,
        username: followerInfo.username,
        avatarUrl: followerInfo.avatarUrl
      }).catch(console.warn);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `follows/${followId}`);
  }
}

export async function unfollowGamer(followerId: string, followingId: string): Promise<void> {
  const followId = `follow_${followerId}_${followingId}`;
  try {
    await deleteDoc(doc(db, 'follows', followId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `follows/${followId}`);
  }
}

// ================= REPORT & BLOCK =================

export async function reportGamer(
  reporterId: string,
  reportedUserId: string,
  reportedUsername: string,
  reason: string,
  details?: string
): Promise<void> {
  const reportId = `report_${Date.now()}`;
  const payload = {
    id: reportId,
    reporterId,
    reportedUserId,
    reportedUsername,
    reason,
    details: details || '',
    status: 'pending_review',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'reports', reportId), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reports/${reportId}`);
  }
}

// ================= GAMING COMMUNITIES =================

export async function fetchCommunities(): Promise<GamerCommunity[]> {
  try {
    const snap = await getDocs(collection(db, 'communities'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'communities');
    return [];
  }
}

export async function saveCommunity(community: GamerCommunity): Promise<void> {
  try {
    await setDoc(doc(db, 'communities', community.id), community, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `communities/${community.id}`);
  }
}

export async function toggleJoinCommunity(
  communityId: string,
  isCurrentlyJoined: boolean,
  currentMembersCount: number
): Promise<{ isJoined: boolean; membersCount: number }> {
  const nextJoined = !isCurrentlyJoined;
  const nextMembers = nextJoined ? currentMembersCount + 1 : Math.max(1, currentMembersCount - 1);

  try {
    await updateDoc(doc(db, 'communities', communityId), {
      isJoined: nextJoined,
      membersCount: nextMembers
    });
  } catch (err) {
    // Non-blocking in case of offline or local testing
  }

  return { isJoined: nextJoined, membersCount: nextMembers };
}
