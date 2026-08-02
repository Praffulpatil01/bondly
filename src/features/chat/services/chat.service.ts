import { db } from '@/config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { NotificationService } from '@/features/notifications/services/notification.service';

export interface ChatParticipant {
  uid: string;
  isAnonymous: boolean;
  displayName: string;
  avatarUrl?: string;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  type: 'user' | 'system';
  isRead?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  timestamp: number;
}

class ChatServiceImpl {
  
  // Real Firestore send message
  async sendMessage(
    chatId: string,
    senderId: string,
    text: string
  ): Promise<ChatMessage> {
    const messageData = {
      chatId,
      senderId,
      text,
      timestamp: Date.now(), // Use local time for instant UI, or serverTimestamp() for strictness
      type: 'user',
      isRead: false,
    };
    
    // Write to /chats/{chatId}/messages/{msgId}
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      createdAt: serverTimestamp() // For ordering
    });

    return { id: docRef.id, ...messageData } as ChatMessage;
  }

  // Subscribe to messages
  subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void
  ) {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          chatId: data.chatId,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp || Date.now(),
          type: data.type || 'user',
          isRead: data.isRead,
        } as ChatMessage);
      });
      callback(messages);
    });
  }

  // Mock method preserved for UI fallbacks if real connection isn't working
  async simulateReply(_chatId: string, _theirUid: string): Promise<ChatMessage> {
    return new Promise((resolve) => setTimeout(() => resolve({} as any), 1000));
  }

  // Real Firestore send friend request
  async sendFriendRequest(fromUid: string, toUid: string, chatId?: string): Promise<FriendRequest> {
    const requestsRef = collection(db, 'friend_requests');
    const requestData = {
      fromUid,
      toUid,
      chatId: chatId || null,
      status: 'pending',
      timestamp: Date.now(),
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(requestsRef, requestData);
    
    // Auto-create notification for the receiver
    try {
      await NotificationService.createNotification({
        recipientId: toUid,
        senderId: fromUid,
        type: 'friend_request_received',
        title: 'New Friend Request!',
        message: 'Someone wants to connect with you.',
        isRead: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: { requestId: docRef.id }
      });
    } catch (e) {
      console.error('Failed to create notification', e);
    }
    
    return { id: docRef.id, ...requestData } as FriendRequest;
  }

  // Subscribe to friend request status
  subscribeToFriendRequest(
    requestId: string,
    callback: (status: 'pending' | 'accepted' | 'declined' | 'expired') => void
  ) {
    return onSnapshot(doc(db, 'friend_requests', requestId), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().status);
      }
    });
  }

  // Real Firestore accept friend request
  async acceptFriendRequest(requestId: string): Promise<boolean> {
    const reqRef = doc(db, 'friend_requests', requestId);
    try {
      await updateDoc(reqRef, { status: 'accepted', updatedAt: serverTimestamp() });
      return true;
    } catch {
      return false;
    }
  }
}

export const ChatService = new ChatServiceImpl();
