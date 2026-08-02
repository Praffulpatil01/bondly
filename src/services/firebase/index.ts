/**
 * Firebase Services — Barrel Export
 *
 * Import all Firebase services from this single entry point:
 * import { auth, db, signInWithEmail, ... } from '@/services/firebase';
 */

// Firebase app & instances
export { app, auth, db, storage, functions, connectEmulators } from './config';

// Auth service
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInAnonymously,
  signOut,
  resetPassword,
  verifyEmail,
  updateUserProfile,
  onAuthChanged,
  getCurrentUser,
} from './auth';

// Firestore service
export {
  getCollectionRef,
  getDocRef,
  getDocument,
  getDocuments,
  createDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  queryHelpers,
  subscribeToDocument,
  subscribeToCollection,
} from './firestore';

// Storage service
export {
  uploadFile,
  uploadFileWithProgress,
  getFileURL,
  deleteFile,
  listFiles,
  storagePaths,
} from './storage';

// Cloud Functions service
export { callFunction, cloudFunctions } from './functions';
