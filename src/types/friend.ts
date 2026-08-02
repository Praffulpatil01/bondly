import type { Timestamp } from 'firebase/firestore';
import type { BaseDocument } from './index';

// ============================================
// Friend Types
// ============================================

/** Friend request between two users */
export interface FriendRequest extends BaseDocument {
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar: string | null;
  receiverName: string;
  receiverAvatar: string | null;
  status: FriendRequestStatus;
  message: string | null;
  respondedAt: Timestamp | null;
}

/** Friendship record (bidirectional) */
export interface Friendship extends BaseDocument {
  users: [string, string];
  userDetails: Record<
    string,
    {
      displayName: string;
      avatarURL: string | null;
    }
  >;
  since: Timestamp;
  chatId: string | null;
}

// ============================================
// Supporting Types
// ============================================

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
