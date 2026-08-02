import type { Timestamp } from 'firebase/firestore';

// ============================================
// Base Types
// ============================================

/** Firestore document base fields */
export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Pagination cursor for Firestore queries */
export interface PaginationCursor {
  lastDoc?: string;
  pageSize: number;
}

/** Generic paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  lastDoc?: string;
}

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Loading state for async operations */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Re-export domain types
export type { User, UserProfile, UserSettings } from './user';
export type { Chat, Message, MessageType, ChatType } from './chat';
export type { FriendRequest, Friendship, FriendRequestStatus } from './friend';
export type { Notification, NotificationType } from './notification';
