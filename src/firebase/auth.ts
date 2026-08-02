import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { auth } from './firebase';
import { collections, UserProfile } from './collections';
import { setDocument } from './firestore';

const googleProvider = new GoogleAuthProvider();

/**
 * Ensures a User Profile document exists in Firestore.
 * Automatically called during registration.
 */
const ensureUserProfile = async (user: FirebaseUser, displayName?: string) => {
  const userRef = doc(collections.users, user.uid);
  const profileRef = doc(collections.profiles, user.uid);
  
  const now = Date.now();
  const nameToUse = displayName || user.displayName || user.email?.split('@')[0] || 'Anonymous';

  const defaultProfile: Partial<UserProfile> = {
    uid: user.uid,
    email: user.email || '',
    nickname: nameToUse,
    photoURL: user.photoURL || '',
    createdAt: now,
    updatedAt: now,
    onboardingCompleted: false,
    onlineStatus: 'online',
    lastSeen: now,
  };

  // Create both the base user record and the public profile record
  await setDocument(userRef, defaultProfile, { merge: true });
  await setDocument(profileRef, defaultProfile, { merge: true });
};

export const AuthService = {
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async signup(email: string, password: string, displayName: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
      await ensureUserProfile(userCredential.user, displayName);
    }
    return userCredential;
  },

  async loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      // For Google login, it might be their first time or a returning visit.
      // merge: true handles not overwriting existing data if they already exist.
      await ensureUserProfile(result.user);
    }
    return result;
  },

  async logout() {
    return firebaseSignOut(auth);
  },
};
