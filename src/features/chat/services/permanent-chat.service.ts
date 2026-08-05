import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc,
  getDoc,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { collections, PermanentChat, PermanentMessage } from '@/firebase/collections';

export const PermanentChatService = {
  /**
   * Initialize a permanent chat if it doesn't exist, or return the existing one.
   */
  getOrInitializeChat: async (friendshipId: string, participants: string[]): Promise<string> => {
    // Check if the chat already exists (using friendshipId as chatId for 1:1 is convenient)
    const chatRef = doc(collections.permanentChats, friendshipId);
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        id: friendshipId,
        participants,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as PermanentChat);
      
      // Update the friendship to link the chat
      await updateDoc(doc(collections.friendships, friendshipId), {
        chatId: friendshipId
      });
    }
    
    return friendshipId;
  },

  /**
   * Subscribe to messages in a permanent chat
   */
  subscribeToMessages: (
    chatId: string, 
    onUpdate: (messages: PermanentMessage[]) => void,
    onError: (error: Error) => void
  ) => {
    const q = query(
      collection(db, 'permanent_chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PermanentMessage));
      onUpdate(msgs);
    }, onError);
  },

  /**
   * Send a message
   */
  sendMessage: async (chatId: string, senderId: string, text: string) => {
    const messagesRef = collection(db, 'permanent_chats', chatId, 'messages');
    
    const newMessage: Omit<PermanentMessage, 'id'> = {
      chatId,
      senderId,
      text,
      timestamp: Date.now(),
      readBy: [senderId],
    };
    
    await addDoc(messagesRef, newMessage);
    
    // Update last message on the chat document and friendship
    await updateDoc(doc(collections.permanentChats, chatId), {
      updatedAt: Date.now(),
      lastMessage: text,
      lastMessageSenderId: senderId
    });
    
    // Update friendship
    await updateDoc(doc(collections.friendships, chatId), {
      lastMessageText: text,
      lastMessageTimestamp: Date.now()
    });

    // Auto-create notification
    try {
      const chatSnap = await getDoc(doc(collections.permanentChats, chatId));
      if (chatSnap.exists()) {
        const participants = chatSnap.data().participants;
        const receiverId = participants.find((p: string) => p !== senderId);
        
        if (receiverId) {
          const { NotificationService } = await import('@/features/notifications/services/notification.service');
          await NotificationService.createNotification({
            recipientId: receiverId,
            senderId,
            type: 'new_message',
            title: 'New Message',
            message: text.length > 30 ? text.substring(0, 30) + '...' : text,
            isRead: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            metadata: { chatId }
          });
        }
      }
    } catch (e) {
      console.error('Failed to send message notification', e);
    }
  },
  
  /**
   * Mark message as read
   */
  markAsRead: async (chatId: string, messageId: string, userId: string, currentReadBy: string[]) => {
    if (currentReadBy.includes(userId)) return;
    
    const msgRef = doc(db, 'permanent_chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, {
      readBy: [...currentReadBy, userId]
    });
  },

  /**
   * Set typing indicator
   */
  setTyping: async (chatId: string, userId: string, isTyping: boolean) => {
    try {
      await updateDoc(doc(collections.permanentChats, chatId), {
        [`typing.${userId}`]: isTyping
      });
    } catch (e) {
      console.error('Failed to set typing status', e);
    }
  }
};
