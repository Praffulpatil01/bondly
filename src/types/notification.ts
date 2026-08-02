import type { Timestamp } from 'firebase/firestore';
import type { BaseDocument } from './index';

// ============================================
// Notification Types
// ============================================

/** In-app notification */
export interface Notification extends BaseDocument {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: Timestamp | null;
  actionURL: string | null;
  senderInfo: {
    userId: string;
    displayName: string;
    avatarURL: string | null;
  } | null;
}

/** Report submitted by a user */
export interface Report extends BaseDocument {
  reporterId: string;
  reportedUserId: string;
  reportedContentId: string | null;
  type: ReportType;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: Timestamp | null;
  resolution: string | null;
}

// ============================================
// Supporting Types
// ============================================

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'message'
  | 'mention'
  | 'system'
  | 'report_update';

export type ReportType = 'user' | 'message' | 'content';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'impersonation'
  | 'hate_speech'
  | 'violence'
  | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
