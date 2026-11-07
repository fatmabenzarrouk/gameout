import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { PrivacySettings, BlockedUser, GamerProfile } from '../types';

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'public',
  whoCanMessage: 'everyone',
  whoCanViewExperiences: 'everyone',
  whoCanViewAdventures: 'everyone',
  whoCanViewAchievements: 'everyone',
  allowActivityBroadcasting: true
};

/**
 * Fetch privacy settings from user profile in Firestore
 */
export async function fetchPrivacySettings(userId: string): Promise<PrivacySettings> {
  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(`gameout_privacy_${userId}`);
    if (cached) return JSON.parse(cached);
  } catch {}

  if (!auth.currentUser) return DEFAULT_PRIVACY_SETTINGS;

  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists() && snap.data().privacySettings) {
      return snap.data().privacySettings as PrivacySettings;
    }
  } catch (err) {
    console.warn('fetchPrivacySettings notice:', err);
  }

  return DEFAULT_PRIVACY_SETTINGS;
}

/**
 * Save privacy settings to Firestore and local storage
 */
export async function savePrivacySettings(
  userId: string,
  settings: PrivacySettings
): Promise<void> {
  try {
    localStorage.setItem(`gameout_privacy_${userId}`, JSON.stringify(settings));

    if (auth.currentUser) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { privacySettings: settings });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

/**
 * Fetch list of users blocked by this gamer
 */
export async function fetchBlockedUsers(userId: string): Promise<BlockedUser[]> {
  const cachedKey = `gameout_blocks_${userId}`;
  const localBlocks: BlockedUser[] = (() => {
    try {
      const raw = localStorage.getItem(cachedKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  if (!auth.currentUser) return localBlocks;

  try {
    const blocksRef = collection(db, 'blocks');
    const q = query(blocksRef, where('blockerId', '==', userId));
    const snap = await getDocs(q);
    const remoteBlocks: BlockedUser[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any)
    }));

    localStorage.setItem(cachedKey, JSON.stringify(remoteBlocks));
    return remoteBlocks;
  } catch (err) {
    console.warn('fetchBlockedUsers notice (using local fallback):', err);
    return localBlocks;
  }
}

/**
 * Block a user to prevent direct messaging and squad invites
 */
export async function blockGamer(
  currentUser: GamerProfile,
  targetUser: { id: string; username: string; displayName: string; avatarUrl: string }
): Promise<BlockedUser> {
  const blockId = `block_${currentUser.id}_${targetUser.id}`;
  const blockRecord: BlockedUser = {
    id: blockId,
    blockerId: currentUser.id,
    blockedId: targetUser.id,
    blockedUsername: targetUser.username,
    blockedDisplayName: targetUser.displayName,
    blockedAvatarUrl: targetUser.avatarUrl,
    createdAt: new Date().toISOString()
  };

  // Local storage cache update
  try {
    const existing = await fetchBlockedUsers(currentUser.id);
    const updated = [...existing.filter((b) => b.blockedId !== targetUser.id), blockRecord];
    localStorage.setItem(`gameout_blocks_${currentUser.id}`, JSON.stringify(updated));
  } catch {}

  if (auth.currentUser) {
    try {
      const blockRef = doc(db, 'blocks', blockId);
      await setDoc(blockRef, blockRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `blocks/${blockId}`);
    }
  }

  return blockRecord;
}

/**
 * Unblock a gamer
 */
export async function unblockGamer(
  currentUserId: string,
  targetUserId: string
): Promise<void> {
  const blockId = `block_${currentUserId}_${targetUserId}`;

  try {
    const existing = await fetchBlockedUsers(currentUserId);
    const updated = existing.filter((b) => b.blockedId !== targetUserId);
    localStorage.setItem(`gameout_blocks_${currentUserId}`, JSON.stringify(updated));
  } catch {}

  if (auth.currentUser) {
    try {
      const blockRef = doc(db, 'blocks', blockId);
      await deleteDoc(blockRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `blocks/${blockId}`);
    }
  }
}
