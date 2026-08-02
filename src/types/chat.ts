import type { Timestamp } from 'firebase/firestore';
import type { BaseDocument } from './index';

// ============================================
// Chat Types
// ============================================

/** Chat room / conversation */
export interface Chat extends BaseDocument {
  type: ChatType;
  participants: string[];
  participantDetails: Record<string, ChatParticipant>;
  lastMessage: LastMessage | null;
  unreadCount: Record<string, number>;
  isArchived: Record<string, boolean>;
  isPinned: Record<string, boolean>;
  metadata: ChatMetadata;
}

/** Individual message within a chat */
export interface Message extends BaseDocument {
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaURL: string | null;
  mediaType: string | null;
  thumbnailURL: string | null;
  replyTo: string | null;
  readBy: Record<string, Timestamp>;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt: Timestamp | null;
  reactions: Record<string, string[]>;
}

// ============================================
// Supporting Types
// ============================================

export type ChatType = 'direct' | 'group';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';

export interface ChatParticipant {
  userId: string;
  displayName: string;
  avatarURL: string | null;
  joinedAt: Timestamp;
  role: 'member' | 'admin' | 'owner';
}

export interface LastMessage {
  content: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  timestamp: Timestamp;
}

export interface ChatMetadata {
  /** Group chat name (null for direct chats) */
  name: string | null;
  /** Group chat avatar (null for direct chats) */
  avatarURL: string | null;
  /** Group chat description */
  description: string | null;
}
