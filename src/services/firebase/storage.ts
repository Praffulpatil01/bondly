import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadMetadata,
  type UploadTask,
} from 'firebase/storage';
import { storage } from './config';

// ============================================
// Storage Service
// ============================================

/**
 * Upload a file to Firebase Storage.
 * Returns the download URL.
 */
export async function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: UploadMetadata,
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(storageRef);
}

/**
 * Upload a file with progress tracking.
 * Returns an UploadTask for monitoring progress.
 */
export function uploadFileWithProgress(
  path: string,
  file: File | Blob,
  metadata?: UploadMetadata,
): UploadTask {
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file, metadata);
}

/**
 * Get the download URL for a file.
 */
export async function getFileURL(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * Delete a file from Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * List all files in a storage path.
 */
export async function listFiles(path: string): Promise<string[]> {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);
  return Promise.all(result.items.map((item) => getDownloadURL(item)));
}

// ============================================
// Path Helpers
// ============================================

/**
 * Generate storage paths for different resource types.
 */
export const storagePaths = {
  userAvatar: (userId: string) => `users/${userId}/avatar`,
  userCover: (userId: string) => `users/${userId}/cover`,
  chatMedia: (chatId: string, fileName: string) => `chats/${chatId}/media/${fileName}`,
  chatAttachment: (chatId: string, fileName: string) => `chats/${chatId}/attachments/${fileName}`,
} as const;
