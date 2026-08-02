import { create } from 'zustand';
import { Notification } from '@/firebase/collections';

export type NotificationFilterType = 'All' | 'Unread' | 'Friends' | 'Messages' | 'System';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  selectedFilter: NotificationFilterType;
  isLoading: boolean;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  setFilter: (filter: NotificationFilterType) => void;
  setLoading: (isLoading: boolean) => void;
  
  // Selectors
  getFilteredNotifications: () => Notification[];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  selectedFilter: 'All',
  isLoading: true,

  setNotifications: (notifications) => set({ 
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    isLoading: false
  }),

  setFilter: (filter) => set({ selectedFilter: filter }),
  
  setLoading: (isLoading) => set({ isLoading }),

  getFilteredNotifications: () => {
    const { notifications, selectedFilter } = get();
    
    switch (selectedFilter) {
      case 'Unread':
        return notifications.filter(n => !n.isRead);
      case 'Friends':
        return notifications.filter(n => 
          n.type === 'friend_request_received' || 
          n.type === 'friend_request_accepted' ||
          n.type === 'friend_request_declined' ||
          n.type === 'new_friend'
        );
      case 'Messages':
        return notifications.filter(n => 
          n.type === 'new_message' || 
          n.type === 'chat_ended'
        );
      case 'System':
        return notifications.filter(n => 
          n.type === 'system' || 
          n.type === 'community' ||
          n.type === 'account' ||
          n.type === 'security'
        );
      case 'All':
      default:
        return notifications;
    }
  }
}));
