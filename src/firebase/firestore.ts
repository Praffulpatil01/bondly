import {
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  SetOptions,
  DocumentData,
} from 'firebase/firestore';

// Helper to prevent infinite hangs if Firestore is not created in the console
const withTimeout = <T>(promise: Promise<T>, ms: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Firestore operation timed out after ${ms}ms. Please ensure Cloud Firestore is enabled in your Firebase Console.`)), ms)
    )
  ]);
};

/**
 * Generic fetch document helper
 */
export const getDocument = async <T = DocumentData>(
  ref: DocumentReference<T>
): Promise<T | null> => {
  try {
    const snap = await withTimeout(getDoc(ref));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

/**
 * Generic set document helper
 */
export const setDocument = async <T>(
  ref: DocumentReference<T>,
  data: Partial<T>,
  options: SetOptions = { merge: true }
): Promise<void> => {
  try {
    // Cast necessary due to Partial<T> and Firestore typings
    await setDoc(ref, data as any, options);
  } catch (error) {
    console.error('Error setting document:', error);
    throw error;
  }
};

/**
 * Generic update document helper
 */
export const updateDocument = async <T>(
  ref: DocumentReference<T>,
  data: Partial<T>
): Promise<void> => {
  try {
    await updateDoc(ref, data as any);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

/**
 * Generic delete document helper
 */
export const deleteDocument = async <T>(ref: DocumentReference<T>): Promise<void> => {
  try {
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};
