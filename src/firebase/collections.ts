import { collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Strongly typed user profile model
 */
export interface UserProfile {
  uid: string;
  email: string;
  nickname: string;
  photoURL?: string;
  bio?: string;
  interests?: string[];
  friendsCount?: number;
  chatsCount?: number;
  createdAt: number;
  updatedAt: number;
  onboardingCompleted: boolean;
  onlineStatus?: 'online' | 'offline' | 'away';
  lastSeen?: number;
}

/**
 * Friend Request Model
 */
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

/**
 * Friendship relationship model
 */
export interface Friendship {
  id: string; // Document ID (usually a compound ID like userA_userB)
  users: string[]; // Array of the two UIDs
  createdAt: number;
  status: 'active' | 'blocked';
  blockedBy?: string; // UID of user who blocked
  lastMessageText?: string;
  lastMessageTimestamp?: number;
  chatId?: string; // Link to the permanent chat
}

/**
 * Permanent Chat Room Model
 */
export interface PermanentChat {
  id: string;
  participants: string[];
  createdAt: number;
  updatedAt: number;
  lastMessage?: string;
  lastMessageSenderId?: string;
}

/**
 * Permanent Message Model
 */
export interface PermanentMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  readBy: string[]; // Array of UIDs who read it
  emojiReactions?: Record<string, string>; // { uid: emoji }
}

/**
 * Notification Model
 */
export type NotificationType = 
  | 'friend_request_received' 
  | 'friend_request_accepted' 
  | 'friend_request_declined' 
  | 'new_friend' 
  | 'new_message' 
  | 'chat_ended' 
  | 'system' 
  | 'community' 
  | 'account' 
  | 'security';

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Helper to create a strongly-typed collection reference
 */
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

export const collections = {
  users: createCollection<UserProfile>('users'),
  profiles: createCollection<UserProfile>('profiles'),
  friendRequests: createCollection<FriendRequest>('friend_requests'),
  friendships: createCollection<Friendship>('friendships'),
  permanentChats: createCollection<PermanentChat>('permanent_chats'),
  chats: createCollection('chats'),
  matchmakingQueue: createCollection('matchmaking_queue'),
  notifications: createCollection<Notification>('notifications'),
};
