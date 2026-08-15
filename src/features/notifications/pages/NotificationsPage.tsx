import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { NotificationService } from '../services/notification.service';
import { useNotificationStore } from '../store/notification.store';
import { NotificationCard } from '../components/NotificationCard';
import { NotificationTabs } from '../components/NotificationTabs';
import { EmptyNotification } from '../components/EmptyNotification';
import { Loader } from '@/components/ui/Loader';
import { BottomNav } from '@/components/layout/BottomNav';
import { FriendsService } from '@/features/friends/services/friends.service';
import { Notification } from '@/firebase/collections';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const setNotifications = useNotificationStore(state => state.setNotifications);
  const setLoading = useNotificationStore(state => state.setLoading);
  const isLoading = useNotificationStore(state => state.isLoading);
  const getFilteredNotifications = useNotificationStore(state => state.getFilteredNotifications);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = NotificationService.subscribeToNotifications(
      user.uid,
      (notifications) => {
        setNotifications(notifications);
      },
      (error) => {
        console.error("Failed to load notifications", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, setNotifications, setLoading]);

  const filteredNotifications = getFilteredNotifications();

  const handleRead = (id: string) => {
    NotificationService.markAsRead(id).catch(console.error);
  };

  const handleDelete = (id: string) => {
    NotificationService.deleteNotification(id).catch(console.error);
  };

  const handleMarkAllRead = () => {
    if (user) {
      NotificationService.markAllAsRead(user.uid).catch(console.error);
    }
  };

  const handleDeleteAllRead = () => {
    if (user) {
      NotificationService.deleteAllRead(user.uid).catch(console.error);
    }
  };

  const handleAction = async (notification: Notification) => {
    if (!user) return;
    
    try {
      if (notification.type === 'friend_request_received') {
        // Accept request
        const requestId = notification.metadata?.requestId;
        if (requestId && notification.senderId) {
          await FriendsService.acceptFriendRequest(requestId, notification.senderId, user.uid);
          // Mark notification as read
          await NotificationService.markAsRead(notification.id);
        }
      } else if (notification.type === 'new_message') {
        // Navigate to chat
        const chatId = notification.metadata?.chatId;
        if (chatId) {
          await NotificationService.markAsRead(notification.id);
          navigate(`/chat/permanent/${chatId}`);
        }
      }
    } catch (e) {
      console.error("Action failed", e);
    }
  };

  const handleClick = (notification: Notification) => {
    if (notification.type === 'new_friend' || notification.type === 'friend_request_accepted') {
      const friendId = notification.senderId;
      if (friendId) navigate(`/friends/${friendId}`);
    } else if (notification.type === 'new_message') {
      const chatId = notification.metadata?.chatId;
      if (chatId) navigate(`/chat/permanent/${chatId}`);
    }
  };

  if (isLoading) {
    return <Loader fullScreen size={48} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-5 bg-white/80 backdrop-blur-xl border-b border-[#c8c4d7]/20 shadow-[0_2px_20px_rgba(84,66,221,0.06)] transition-all duration-300">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e4dfff]/50 text-[#5442dd] active:scale-90 transition-all -ml-2"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
          </button>
          <span className="text-xl font-bold font-['Outfit'] text-[#5442dd]">Alerts</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMarkAllRead}
            title="Mark All Read"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e4dfff]/50 text-[#5442dd] active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">done_all</span>
          </button>
          <button 
            onClick={handleDeleteAllRead}
            title="Delete Read"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 text-red-500 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">delete_sweep</span>
          </button>
        </div>
      </header>

      <main className="pt-16 max-w-screen-xl mx-auto">
        <NotificationTabs />

        <div className="p-5 md:px-10">
          {filteredNotifications.length === 0 ? (
            <EmptyNotification />
          ) : (
            <div className="flex flex-col">
              {filteredNotifications.map((notification) => (
                <NotificationCard 
                  key={notification.id}
                  notification={notification}
                  onRead={handleRead}
                  onDelete={handleDelete}
                  onAction={handleAction}
                  onClick={handleClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
