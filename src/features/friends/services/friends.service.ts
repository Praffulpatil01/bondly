import { 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { collections, Friendship, UserProfile, FriendRequest } from '@/firebase/collections';
import { NotificationService } from '@/features/notifications/services/notification.service';

export interface FriendData {
  friendship: Friendship;
  profile: UserProfile;
}

export const FriendsService = {
  /**
   * Subscribe to all active friendships for a given user.
   * Joins the profile data for the other user.
   */
  subscribeToFriends: (
    userId: string,
    onUpdate: (friends: FriendData[]) => void,
    onError: (error: Error) => void
  ) => {
    // Query friendships where user is a participant
    // Removed where('status', '==', 'active') to avoid requiring a composite index
    const q = query(
      collections.friendships,
      where('users', 'array-contains', userId)
    );

    return onSnapshot(q, async (snapshot) => {
      try {
        const friendships = snapshot.docs
          .map(d => ({ ...(d.data() as Omit<Friendship, 'id'>), id: d.id } as Friendship))
          .filter(f => f.status === 'active'); // Filter in memory
        
        // Fetch profiles for all friends
        const friendsDataPromises = friendships.map(async (friendship) => {
          // Find the other user's ID
          const friendId = friendship.users.find(id => id !== userId);
          if (!friendId) return null;

          let profileRef = doc(collections.profiles, friendId);
          let profileSnap = await getDoc(profileRef);
          
          if (!profileSnap.exists()) {
            // Fallback to legacy 'users' collection
            profileRef = doc(collections.users, friendId);
            profileSnap = await getDoc(profileRef);
          }
          
          if (profileSnap.exists()) {
            return {
              friendship,
              profile: profileSnap.data() as UserProfile
            } as FriendData;
          }
          return null;
        });

        const resolvedFriends = (await Promise.all(friendsDataPromises)).filter(Boolean) as FriendData[];
        
        // Sort by last message or created at
        resolvedFriends.sort((a, b) => {
          const timeA = a.friendship.lastMessageTimestamp || a.friendship.createdAt;
          const timeB = b.friendship.lastMessageTimestamp || b.friendship.createdAt;
          return timeB - timeA;
        });

        onUpdate(resolvedFriends);
      } catch (error) {
        console.error("Error processing friends:", error);
        onError(error as Error);
      }
    }, onError);
  },

  /**
   * Block a friend
   */
  blockFriend: async (friendshipId: string, blockedByUserId: string) => {
    const ref = doc(collections.friendships, friendshipId);
    await updateDoc(ref, {
      status: 'blocked',
      blockedBy: blockedByUserId
    });
  },

  /**
   * Remove a friend (Deletes the friendship document)
   */
  removeFriend: async (friendshipId: string) => {
    const ref = doc(collections.friendships, friendshipId);
    await deleteDoc(ref);
  },

  /**
   * Get friend profile and friendship status
   */
  getFriendProfile: async (friendId: string, currentUserId: string): Promise<FriendData | null> => {
    let profileRef = doc(collections.profiles, friendId);
    let profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      // Fallback to legacy 'users' collection
      profileRef = doc(collections.users, friendId);
      profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        throw new Error("PROFILE_NOT_FOUND");
      }
    }

    // Find the friendship document
    const q = query(
      collections.friendships,
      where('users', 'array-contains', currentUserId)
    );
    
    const { getDocs } = await import('firebase/firestore');
    const querySnapshot = await getDocs(q);
    
    const friendshipDoc = querySnapshot.docs.find(d => {
      const data = d.data() as Friendship;
      return data.users.includes(friendId) && data.status === 'active';
    });

    if (!friendshipDoc) {
      throw new Error("FRIENDSHIP_NOT_FOUND");
    }

    return {
      friendship: { ...(friendshipDoc.data() as Omit<Friendship, 'id'>), id: friendshipDoc.id } as Friendship,
      profile: profileSnap.data() as UserProfile
    };
  },

  /**
   * Subscribe to pending friend requests received by the user
   */
  subscribeToFriendRequests: (
    userId: string,
    onUpdate: (requests: FriendRequest[]) => void,
    onError: (error: Error) => void
  ) => {
    const q = query(
      collections.friendRequests,
      where('receiverId', '==', userId),
      where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as FriendRequest));
      requests.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(requests);
    }, onError);
  },

  acceptFriendRequest: async (requestId: string, senderId: string, receiverId: string) => {
    // 1. Update request status
    const reqRef = doc(collections.friendRequests, requestId);
    await updateDoc(reqRef, { status: 'accepted' });

    // 2. Create friendship
    const newFriendship: Omit<Friendship, 'id'> = {
      users: [senderId, receiverId],
      createdAt: Date.now(),
      status: 'active'
    };
    await addDoc(collections.friendships, newFriendship);

    // 3. Create notification for the sender
    await NotificationService.createNotification({
      recipientId: senderId,
      senderId: receiverId,
      type: 'friend_request_accepted',
      title: 'Request Accepted!',
      message: 'Your friend request was accepted. You can now chat permanently.',
      isRead: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: { requestId }
    });
  },

  declineFriendRequest: async (requestId: string) => {
    const reqRef = doc(collections.friendRequests, requestId);
    
    // To send a decline notification, we'd need the senderId and receiverId.
    // For now, we'll just update the request status. 
    // In a real app, we fetch the request first or pass the senderId.
    const reqSnap = await getDoc(reqRef);
    if (reqSnap.exists()) {
      const data = reqSnap.data() as FriendRequest;
      await updateDoc(reqRef, { status: 'declined' });

      await NotificationService.createNotification({
        recipientId: data.senderId,
        senderId: data.receiverId,
        type: 'friend_request_declined',
        title: 'Request Declined',
        message: 'Your friend request was declined.',
        isRead: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: { requestId }
      });
    }
  }
};
