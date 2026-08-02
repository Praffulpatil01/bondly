import {
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { collections, Notification } from '@/firebase/collections';

export const NotificationService = {
  /**
   * Subscribe to all notifications for a specific user
   */
  subscribeToNotifications: (
    userId: string,
    onUpdate: (notifications: Notification[]) => void,
    onError: (error: Error) => void
  ) => {
    const q = query(
      collections.notifications,
      where('recipientId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id
      })) as Notification[];
      
      // Sort by newest first
      notifications.sort((a, b) => b.createdAt - a.createdAt);
      
      onUpdate(notifications);
    }, onError);
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (notificationId: string) => {
    const ref = doc(collections.notifications, notificationId);
    await updateDoc(ref, {
      isRead: true,
      updatedAt: Date.now()
    });
  },

  /**
   * Mark all unread notifications as read for a specific user
   */
  markAllAsRead: async (userId: string) => {
    const q = query(
      collections.notifications,
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.update(d.ref, { 
        isRead: true,
        updatedAt: Date.now()
      });
    });

    await batch.commit();
  },

  /**
   * Delete a specific notification
   */
  deleteNotification: async (notificationId: string) => {
    const ref = doc(collections.notifications, notificationId);
    await deleteDoc(ref);
  },

  /**
   * Delete all read notifications for a user
   */
  deleteAllRead: async (userId: string) => {
    const q = query(
      collections.notifications,
      where('recipientId', '==', userId),
      where('isRead', '==', true)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();
  },

  /**
   * Create a new notification
   */
  createNotification: async (notification: Omit<Notification, 'id'>) => {
    await addDoc(collections.notifications, notification);
  }
};
