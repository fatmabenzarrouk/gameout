import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import {
  GamingExperience,
  GamingAdventure,
  GameAchievement,
  AchievementRarity
} from '../types';

// Transparent XP rules by rarity
export const XP_REWARDS: Record<AchievementRarity, number> = {
  Common: 250,
  Rare: 500,
  Epic: 1000,
  Legendary: 2500
};

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
}

export const LEVEL_TIERS: LevelInfo[] = [
  { level: 1, title: 'Beginner', minXp: 0, maxXp: 1000 },
  { level: 2, title: 'Explorer', minXp: 1000, maxXp: 2500 },
  { level: 3, title: 'Skilled Gamer', minXp: 2500, maxXp: 5000 },
  { level: 4, title: 'Advanced Player', minXp: 5000, maxXp: 10000 },
  { level: 5, title: 'Elite Gamer', minXp: 10000, maxXp: 20000 },
  { level: 10, title: 'Veteran Competitor', minXp: 20000, maxXp: 50000 },
  { level: 20, title: 'Grandmaster Tactician', minXp: 50000, maxXp: 100000 }
];

export function calculateLevelFromXP(totalXp: number): {
  level: number;
  title: string;
  progressPercentage: number;
  nextLevelXp: number;
} {
  let currentTier = LEVEL_TIERS[0];
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (totalXp >= LEVEL_TIERS[i].minXp) {
      currentTier = LEVEL_TIERS[i];
    }
  }

  const range = currentTier.maxXp - currentTier.minXp;
  const currentInTier = Math.max(0, totalXp - currentTier.minXp);
  const progressPercentage = Math.min(100, Math.round((currentInTier / range) * 100));

  return {
    level: currentTier.level,
    title: currentTier.title,
    progressPercentage,
    nextLevelXp: currentTier.maxXp
  };
}

// ================= GAMING EXPERIENCES =================

export async function fetchUserExperiences(userId: string): Promise<GamingExperience[]> {
  try {
    const q = query(collection(db, 'gamingExperiences'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'gamingExperiences');
    return [];
  }
}

export async function saveGamingExperience(exp: GamingExperience): Promise<void> {
  try {
    await setDoc(doc(db, 'gamingExperiences', exp.id), exp, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `gamingExperiences/${exp.id}`);
  }
}

export async function deleteGamingExperience(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'gamingExperiences', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `gamingExperiences/${id}`);
  }
}

// ================= GAMING ADVENTURES =================

export async function fetchUserAdventures(userId: string): Promise<GamingAdventure[]> {
  try {
    const q = query(collection(db, 'gamingAdventures'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'gamingAdventures');
    return [];
  }
}

export async function saveGamingAdventure(adv: GamingAdventure): Promise<void> {
  try {
    await setDoc(doc(db, 'gamingAdventures', adv.id), adv, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `gamingAdventures/${adv.id}`);
  }
}

export async function deleteGamingAdventure(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'gamingAdventures', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `gamingAdventures/${id}`);
  }
}

// ================= ACHIEVEMENTS =================

export async function fetchUserAchievements(userId: string): Promise<GameAchievement[]> {
  try {
    const q = query(collection(db, 'achievements'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'achievements');
    return [];
  }
}

export async function saveAchievement(
  ach: GameAchievement,
  userId: string
): Promise<void> {
  // Enforce transparent XP cap to prevent users from awarding unlimited XP
  const maxAllowedXp = XP_REWARDS[ach.rarity] || 500;
  const verifiedXp = Math.min(ach.xpReward, maxAllowedXp);

  const payload: GameAchievement = {
    ...ach,
    xpReward: verifiedXp,
    userId
  };

  try {
    await setDoc(doc(db, 'achievements', ach.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `achievements/${ach.id}`);
  }
}

export async function deleteAchievement(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'achievements', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `achievements/${id}`);
  }
}
