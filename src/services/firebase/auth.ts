import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from './config';

// ============================================
// Auth Providers
// ============================================

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// ============================================
// Auth Service
// ============================================

/**
 * Sign up with email and password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await sendEmailVerification(user);
  return user;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/**
 * Sign in with Google OAuth.
 */
export async function signInWithGoogle(): Promise<User> {
  const { user } = await signInWithPopup(auth, googleProvider);
  return user;
}

/**
 * Sign in anonymously (future-ready).
 */
export async function signInAnonymously(): Promise<User> {
  const { user } = await firebaseSignInAnonymously(auth);
  return user;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Send email verification to the current user.
 */
export async function verifyEmail(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
}

/**
 * Update the current user's profile.
 */
export async function updateUserProfile(data: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, data);
  }
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChanged(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current authenticated user (synchronous snapshot).
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
