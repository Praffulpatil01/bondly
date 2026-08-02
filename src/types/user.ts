import type { Timestamp } from 'firebase/firestore';
import type { BaseDocument } from './index';

// ============================================
// User Types
// ============================================

/** Firebase Auth user representation in Firestore */
export interface User extends BaseDocument {
  email: string;
  displayName: string;
  photoURL: string | null;
  phoneNumber: string | null;
  isOnline: boolean;
  lastSeen: Timestamp;
  isEmailVerified: boolean;
  isAnonymous: boolean;
  role: UserRole;
  status: AccountStatus;
}

/** User profile — public-facing information */
export interface UserProfile extends BaseDocument {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarURL: string | null;
  coverPhotoURL: string | null;
  dateOfBirth: Timestamp | null;
  gender: Gender | null;
  location: string | null;
  interests: string[];
  socialLinks: SocialLinks;
  friendCount: number;
  isProfilePublic: boolean;
}

/** User application settings */
export interface UserSettings extends BaseDocument {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

// ============================================
// Supporting Types
// ============================================

export type UserRole = 'user' | 'moderator' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'deactivated' | 'banned';
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  snapchat?: string;
  website?: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  friendRequests: boolean;
  messages: boolean;
  mentions: boolean;
  updates: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowFriendRequests: boolean;
  showProfile: 'everyone' | 'friends' | 'nobody';
}
