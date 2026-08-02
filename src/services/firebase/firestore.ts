import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type DocumentReference,
  type CollectionReference,
  type Unsubscribe,
  type WithFieldValue,
  type UpdateData,
  type WhereFilterOp,
  type OrderByDirection,
} from 'firebase/firestore';
import { db } from './config';

// ============================================
// Collection References
// ============================================

/**
 * Get a typed collection reference.
 */
export function getCollectionRef<T = DocumentData>(
  collectionPath: string,
): CollectionReference<T> {
  return collection(db, collectionPath) as CollectionReference<T>;
}

/**
 * Get a typed document reference.
 */
export function getDocRef<T = DocumentData>(
  collectionPath: string,
  docId: string,
): DocumentReference<T> {
  return doc(db, collectionPath, docId) as DocumentReference<T>;
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Get a single document by ID.
 */
export async function getDocument<T>(
  collectionPath: string,
  docId: string,
): Promise<(T & { id: string }) | null> {
  const docRef = getDocRef<T>(collectionPath, docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
}

/**
 * Get multiple documents with optional query constraints.
 */
export async function getDocuments<T>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
): Promise<(T & { id: string })[]> {
  const colRef = getCollectionRef<T>(collectionPath);
  const q = query(colRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  })) as (T & { id: string })[];
}

/**
 * Create a new document with auto-generated ID.
 */
export async function createDocument<T extends DocumentData>(
  collectionPath: string,
  data: WithFieldValue<T>,
): Promise<string> {
  const colRef = getCollectionRef(collectionPath);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Create or overwrite a document with a specific ID.
 */
export async function setDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: WithFieldValue<T>,
  merge = true,
): Promise<void> {
  const docRef = getDocRef(collectionPath, docId);
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge },
  );
}

/**
 * Update specific fields on an existing document.
 */
export async function updateDocument<T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: UpdateData<T>,
): Promise<void> {
  const docRef = getDocRef(collectionPath, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a document.
 */
export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  const docRef = getDocRef(collectionPath, docId);
  await deleteDoc(docRef);
}

// ============================================
// Query Helpers
// ============================================

/**
 * Build common query constraints.
 */
export const queryHelpers = {
  whereEqual: (field: string, value: unknown) => where(field, '==', value),
  whereIn: (field: string, values: unknown[]) => where(field, 'in', values),
  whereContains: (field: string, value: unknown) => where(field, 'array-contains', value),
  whereFilter: (field: string, op: WhereFilterOp, value: unknown) => where(field, op, value),
  orderByField: (field: string, direction: OrderByDirection = 'asc') => orderBy(field, direction),
  limitTo: (count: number) => limit(count),
  startAfterDoc: (lastDoc: unknown) => startAfter(lastDoc),
};

// ============================================
// Realtime Listeners
// ============================================

/**
 * Subscribe to a single document's realtime updates.
 */
export function subscribeToDocument<T>(
  collectionPath: string,
  docId: string,
  callback: (data: (T & { id: string }) | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const docRef = getDocRef<T>(collectionPath, docId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T & { id: string });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`Realtime listener error [${collectionPath}/${docId}]:`, error);
      onError?.(error);
    },
  );
}

/**
 * Subscribe to a collection query's realtime updates.
 */
export function subscribeToCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[],
  callback: (data: (T & { id: string })[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const colRef = getCollectionRef<T>(collectionPath);
  const q = query(colRef, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as (T & { id: string })[];
      callback(data);
    },
    (error) => {
      console.error(`Realtime listener error [${collectionPath}]:`, error);
      onError?.(error);
    },
  );
}
