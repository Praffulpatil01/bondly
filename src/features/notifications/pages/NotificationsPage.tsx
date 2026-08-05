import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
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
      <header className="fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-5 md:px-10 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-variant/50 transition-colors -ml-2"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-xl font-bold font-['Outfit']">Alerts</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMarkAllRead}
            title="Mark All Read"
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
          >
            <CheckCircle2 size={20} />
          </button>
          <button 
            onClick={handleDeleteAllRead}
            title="Delete Read"
            className="w-10 h-10 flex items-center justify-center rounded-full text-error hover:bg-error-container transition-colors"
          >
            <Trash2 size={20} />
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
