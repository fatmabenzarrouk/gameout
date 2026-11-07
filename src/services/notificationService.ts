import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { NotificationItem, NotificationType, NotificationPreferences } from '../types';
import { INITIAL_NOTIFICATIONS } from './mockData';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  likes: true,
  comments: true,
  replies: true,
  friendRequests: true,
  messages: true,
  achievements: true,
  mentions: true,
  soundEnabled: true,
  inAppAlerts: true
};

/**
 * Fetch cached/stored notification preferences from localStorage or Firestore
 */
export function getStoredNotificationPreferences(userId: string): NotificationPreferences {
  try {
    const raw = localStorage.getItem(`gameout_notif_prefs_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

/**
 * Save notification preferences
 */
export async function saveNotificationPreferences(
  userId: string,
  prefs: NotificationPreferences
): Promise<void> {
  try {
    localStorage.setItem(`gameout_notif_prefs_${userId}`, JSON.stringify(prefs));
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { notificationPreferences: prefs });
  } catch (err) {
    // Non-fatal if offline
  }
}

/**
 * Seed initial sample notifications for a user if empty
 */
export async function seedInitialNotifications(userId: string): Promise<void> {
  // Only execute Firestore operations if auth is ready and user is authenticated
  if (!auth.currentUser) return;

  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, where('recipientId', '==', userId), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) {
      for (const item of INITIAL_NOTIFICATIONS) {
        const notifDocId = `notif_${userId}_${item.id}`;
        await setDoc(doc(db, 'notifications', notifDocId), {
          id: notifDocId,
          recipientId: userId,
          type: item.type,
          actor: item.actor,
          content: item.content,
          target: item.target || '',
          timestamp: item.timestamp,
          createdAt: new Date().toISOString(),
          isRead: item.isRead
        });
      }
    }
  } catch (err) {
    console.warn('Seed notifications notice (non-fatal):', err);
  }
}

/**
 * Real-time subscription to notifications for a recipient
 */
export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: NotificationItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  // CRITICAL: Only attach onSnapshot listeners if auth is ready and user is authenticated
  if (!auth.currentUser) {
    onUpdate(INITIAL_NOTIFICATIONS);
    return () => {};
  }

  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(
      notifsRef,
      where('recipientId', '==', userId),
      limit(50)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: NotificationItem[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            recipientId: data.recipientId,
            type: data.type || 'like',
            actor: {
              id: data.actor?.id,
              name: data.actor?.name || 'Gamer',
              username: data.actor?.username || 'player',
              avatarUrl: data.actor?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            },
            content: data.content || '',
            target: data.target,
            targetId: data.targetId,
            targetType: data.targetType,
            timestamp: data.timestamp || 'Just now',
            createdAt: data.createdAt,
            isRead: Boolean(data.isRead)
          };
        });

        // Sort descending by createdAt
        list.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'notifications');
    return () => {};
  }
}

/**
 * Generic notification creator that respects user preferences
 */
export async function createNotification(params: {
  recipientId: string;
  type: NotificationType;
  actor: {
    id?: string;
    name: string;
    username?: string;
    avatarUrl: string;
  };
  content: string;
  targetId?: string;
  targetType?: 'post' | 'adventure' | 'conversation' | 'profile' | 'friends' | 'achievement';
}): Promise<NotificationItem | null> {
  // Do not notify self
  if (params.actor.id && params.actor.id === params.recipientId) {
    return null;
  }

  // Check recipient preferences
  const prefs = getStoredNotificationPreferences(params.recipientId);
  if (params.type === 'like' && !prefs.likes) return null;
  if (params.type === 'comment' && !prefs.comments) return null;
  if (params.type === 'reply' && !prefs.replies) return null;
  if ((params.type === 'friend_request' || params.type === 'friend_request_accepted' || params.type === 'follow') && !prefs.friendRequests) return null;
  if (params.type === 'message' && !prefs.messages) return null;
  if (params.type === 'achievement' && !prefs.achievements) return null;
  if (params.type === 'mention' && !prefs.mentions) return null;

  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const item: NotificationItem = {
    id: notifId,
    recipientId: params.recipientId,
    type: params.type,
    actor: params.actor,
    content: params.content,
    targetId: params.targetId,
    targetType: params.targetType,
    timestamp: 'Just now',
    createdAt: now.toISOString(),
    isRead: false
  };

  try {
    const notifRef = doc(db, 'notifications', notifId);
    await setDoc(notifRef, item);
    return item;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `notifications/${notifId}`);
    return null;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { isRead: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notifsRef = collection(db, 'notifications');
    const q = query(
      notifsRef,
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);

    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { isRead: true });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'notifications');
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notifRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `notifications/${notificationId}`);
  }
}

// ================= SPECIFIC TRIGGER HELPERS =================

export async function notifyLike(
  recipientId: string,
  actor: { id: string; name: string; username: string; avatarUrl: string },
  postTitleOrSnippet: string,
  postId: string
) {
  return createNotification({
    recipientId,
    type: 'like',
    actor,
    content: `cheered your gaming moment: "${postTitleOrSnippet.substring(0, 40)}${postTitleOrSnippet.length > 40 ? '...' : ''}"`,
    targetId: postId,
    targetType: 'post'
  });
}

export async function notifyComment(
  recipientId: string,
  actor: { id: string; name: string; username: string; avatarUrl: string },
  commentText: string,
  postId: string
) {
  return createNotification({
    recipientId,
    type: 'comment',
    actor,
    content: `commented on your post: "${commentText.substring(0, 45)}${commentText.length > 45 ? '...' : ''}"`,
    targetId: postId,
    targetType: 'post'
  });
}

export async function notifyReply(
  recipientId: string,
  actor: { id: string; name: string; username: string; avatarUrl: string },
  replyText: string,
  postId: string
) {
  return createNotification({
    recipientId,
    type: 'reply',
    actor,
    content: `replied to your comment: "${replyText.substring(0, 45)}${replyText.length > 45 ? '...' : ''}"`,
    targetId: postId,
    targetType: 'post'
  });
}

export async function notifyFriendRequest(
  recipientId: string,
  actor: { id: string; name: string; username: string; avatarUrl: string }
) {
  return createNotification({
    recipientId,
    type: 'friend_request',
    actor,
    content: 'sent you a gaming friend & squad connection request.',
    targetId: actor.id,
    targetType: 'friends'
  });
}

export async function notifyFriendRequestAccepted(
  recipientId: string,
  actor: { id: string; name: string; username: string; avatarUrl: string }
) {
  return createNotification({
    recipientId,
    type: 'friend_request_accepted',
    actor,
    content: 'accepted your gaming friend request! You can now squad up and chat.',
    targetId: actor.id,
    targetType: 'profile'
  });
}

export async function notifyFollow(
  recipientId: string,
  actor: { id: string; name: string; username: string; avatarUrl: string }
) {
  return createNotification({
    recipientId,
    type: 'follow',
    actor,
    content: 'started following your gaming profile and adventures.',
    targetId: actor.id,
    targetType: 'profile'
  });
}

export async function notifyAchievementUnlock(
  userId: string,
  achievementTitle: string,
  rarity: string,
  xp: number
) {
  return createNotification({
    recipientId: userId,
    type: 'achievement',
    actor: {
      name: 'GameOut Trophy System',
      avatarUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=150&q=80'
    },
    content: `unlocked the [${rarity}] achievement "${achievementTitle}" (+${xp} XP)!`,
    targetType: 'achievement'
  });
}

export async function notifyNewMessage(
  recipientId: string,
  sender: { id: string; name: string; username: string; avatarUrl: string },
  messageText: string,
  conversationId: string
) {
  return createNotification({
    recipientId,
    type: 'message',
    actor: sender,
    content: `sent you a message: "${messageText.substring(0, 45)}${messageText.length > 45 ? '...' : ''}"`,
    targetId: conversationId,
    targetType: 'conversation'
  });
}

export async function notifyMention(
  recipientId: string,
  actor: { id: string; name: string; username: string; avatarUrl: string },
  contextSnippet: string,
  postId: string
) {
  return createNotification({
    recipientId,
    type: 'mention',
    actor,
    content: `mentioned you in a gaming discussion: "${contextSnippet.substring(0, 40)}..."`,
    targetId: postId,
    targetType: 'post'
  });
}
