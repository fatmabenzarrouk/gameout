import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { GamerProfile } from '../types';

interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  dateOfBirth?: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  gamerProfile: GamerProfile | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  updateGamerProfile: (updates: Partial<GamerProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [gamerProfile, setGamerProfile] = useState<GamerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load gamer profile from Firestore
  const fetchGamerProfile = async (uid: string): Promise<GamerProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: uid,
          username: data.username || 'gamer',
          displayName: data.displayName || 'Gamer',
          avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
          tagline: data.tagline || 'Play • Connect • Level Up 🎮',
          bio: data.bio || 'Exploring games and building achievements.',
          location: data.location || 'Earth',
          schoolOrOrg: data.schoolOrOrg || '',
          isVerified: Boolean(data.isVerified),
          level: data.level || 1,
          xp: data.xp || 0,
          xpToNextLevel: data.xpToNextLevel || 1000,
          levelProgressPercentage: data.levelProgressPercentage || 0,
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          friendsCount: data.friendsCount || 0,
          platforms: data.platforms || ['PC'],
          favoriteGames: data.favoriteGames || ['Valorant'],
          roles: data.roles || ['Casual Player'],
          joinedDate: data.joinedDate || 'Recent',
          status: 'online',
          currentGame: data.currentGame,
          stats: data.stats || {
            hoursLogged: 0,
            achievementsUnlocked: 0,
            adventuresCompleted: 0,
            tournamentsWon: 0,
          },
        };
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      return null;
    }
  };

  // Check username availability
  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 3) return false;
    try {
      const ref = doc(db, 'usernames', clean);
      const snapshot = await getDoc(ref);
      return !snapshot.exists();
    } catch (err) {
      console.warn('Error checking username:', err);
      return true; // Fallback to avoid blocking on network glitch
    }
  };

  // Create default Firestore profile
  const createFirestoreProfile = async (
    user: FirebaseUser,
    username: string,
    displayName: string
  ): Promise<GamerProfile> => {
    const cleanUsername = username.trim().toLowerCase();
    const joinedMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

    const initialProfile: GamerProfile = {
      id: user.uid,
      username: cleanUsername,
      displayName: displayName.trim(),
      avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Play • Connect • Level Up 🎮',
      bio: 'New Gamer on GameOut! Ready to showcase my journey and connect with players.',
      location: '',
      schoolOrOrg: '',
      isVerified: false,
      level: 1,
      xp: 0,
      xpToNextLevel: 1000,
      levelProgressPercentage: 0,
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      platforms: ['PC'],
      favoriteGames: ['Valorant'],
      roles: ['Casual Player'],
      joinedDate: joinedMonth,
      status: 'online',
      stats: {
        hoursLogged: 0,
        achievementsUnlocked: 0,
        adventuresCompleted: 0,
        tournamentsWon: 0,
      },
    };

    // 1. Reserve username
    try {
      await setDoc(doc(db, 'usernames', cleanUsername), {
        userId: user.uid,
        username: cleanUsername,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `usernames/${cleanUsername}`);
    }

    // 2. Create User Profile
    try {
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        username: cleanUsername,
        displayName: displayName.trim(),
        email: user.email,
        avatarUrl: initialProfile.avatarUrl,
        coverUrl: initialProfile.coverUrl,
        tagline: initialProfile.tagline,
        bio: initialProfile.bio,
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        levelProgressPercentage: 0,
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
        platforms: initialProfile.platforms,
        favoriteGames: initialProfile.favoriteGames,
        roles: initialProfile.roles,
        visibility: 'public',
        isVerified: false,
        joinedDate: joinedMonth,
        createdAt: new Date().toISOString(),
        stats: initialProfile.stats,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }

    return initialProfile;
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        let profile = await fetchGamerProfile(user.uid);
        if (!profile) {
          // If profile doesn't exist yet (e.g. from Google sign-in), create one
          const derivedUsername = (user.email?.split('@')[0] || `gamer_${user.uid.slice(0, 5)}`).replace(/[^a-zA-Z0-9_]/g, '');
          profile = await createFirestoreProfile(
            user,
            derivedUsername,
            user.displayName || 'GameOut Player'
          );
        }
        setGamerProfile(profile);
      } else {
        setGamerProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // 1. Verify username availability
      const isAvailable = await checkUsernameAvailable(data.username);
      if (!isAvailable) {
        throw new Error(`The gamer handle "@${data.username}" is already taken. Please choose another.`);
      }

      // 2. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      const user = userCredential.user;

      // 3. Update Auth display name
      await updateProfile(user, { displayName: data.displayName.trim() });

      // 4. Create Firestore document profile
      const profile = await createFirestoreProfile(user, data.username, data.displayName);
      setGamerProfile(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setGamerProfile(null);
      setFirebaseUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      const updated = await fetchGamerProfile(firebaseUser.uid);
      if (updated) setGamerProfile(updated);
    }
  };

  const updateGamerProfile = async (updates: Partial<GamerProfile>) => {
    if (!firebaseUser) throw new Error('Must be signed in to update profile.');

    const userId = firebaseUser.uid;
    const userDocRef = doc(db, 'users', userId);

    // If username is being changed, verify uniqueness first
    if (updates.username && gamerProfile && updates.username.toLowerCase() !== gamerProfile.username.toLowerCase()) {
      const newUsername = updates.username.trim().toLowerCase();
      const isAvailable = await checkUsernameAvailable(newUsername);
      if (!isAvailable) {
        throw new Error(`The gamer handle "@${newUsername}" is already taken.`);
      }

      // Reserve new username
      try {
        await setDoc(doc(db, 'usernames', newUsername), {
          userId,
          username: newUsername,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `usernames/${newUsername}`);
      }
    }

    try {
      await setDoc(userDocRef, updates, { merge: true });
      setGamerProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        gamerProfile,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        checkUsernameAvailable,
        refreshProfile,
        updateGamerProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
