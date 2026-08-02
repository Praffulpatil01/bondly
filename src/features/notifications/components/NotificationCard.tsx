import { motion, useAnimation, PanInfo } from 'framer-motion';
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  MessageCircle, 
  Clock, 
  Info, 
  ShieldAlert, 
  AlertCircle,
  Megaphone,
  Trash2,
  Check,
  Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/firebase/collections';
import { Button } from '@/components/ui/Button';

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notification: Notification) => void;
  onClick?: (notification: Notification) => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'friend_request_received': return <UserPlus className="text-primary" size={20} />;
    case 'friend_request_accepted': return <UserCheck className="text-green-500" size={20} />;
    case 'friend_request_declined': return <UserX className="text-error" size={20} />;
    case 'new_friend': return <UserCheck className="text-primary" size={20} />;
    case 'new_message': return <MessageCircle className="text-secondary" size={20} />;
    case 'chat_ended': return <Clock className="text-tertiary" size={20} />;
    case 'system': return <Info className="text-blue-500" size={20} />;
    case 'community': return <Megaphone className="text-orange-500" size={20} />;
    case 'account': return <AlertCircle className="text-error" size={20} />;
    case 'security': return <ShieldAlert className="text-error" size={20} />;
    default: return <Bell className="text-on-surface-variant" size={20} />;
  }
};

export const NotificationCard = ({ notification, onRead, onDelete, onAction, onClick }: NotificationCardProps) => {
  const controls = useAnimation();
  const SWIPE_THRESHOLD = -60;
  const MAX_SWIPE = -140;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      controls.start({ x: MAX_SWIPE });
    } else {
      controls.start({ x: 0 });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.swipe-actions')) return;
    if ((e.target as HTMLElement).closest('.action-button')) return;
    
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (onClick) onClick(notification);
  };

  const timeAgo = formatDistanceToNow(notification.createdAt, { addSuffix: true });

  return (
    <div className="relative overflow-hidden rounded-2xl group bg-error-container mb-3 last:mb-0">
      {/* Background Actions */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end px-4 gap-2 swipe-actions z-0">
        <button 
          onClick={() => onDelete(notification.id)}
          className="p-4 text-on-error-container flex flex-col items-center hover:bg-error/10 rounded-xl transition-colors"
        >
          <Trash2 size={24} />
          <span className="text-[10px] font-bold mt-1">DELETE</span>
        </button>
      </div>

      {/* Foreground Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: MAX_SWIPE, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={handleCardClick}
        className={`relative z-10 p-4 flex gap-4 border-l-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer transition-colors ${
          notification.isRead 
            ? 'bg-surface-container-lowest border-transparent' 
            : 'bg-surface-container border-primary'
        }`}
      >
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant/30 overflow-hidden">
            {notification.metadata?.senderAvatar ? (
              <img src={notification.metadata.senderAvatar} alt="Sender" className="w-full h-full object-cover" />
            ) : (
              getIconForType(notification.type)
            )}
          </div>
          {!notification.isRead && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary border-2 border-background rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4 className={`text-sm truncate ${notification.isRead ? 'font-semibold text-on-surface' : 'font-bold text-on-surface'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-on-surface-variant ml-2 whitespace-nowrap">
              {timeAgo}
            </span>
          </div>
          <p className={`text-xs mb-2 ${notification.isRead ? 'text-on-surface-variant' : 'text-on-surface'}`}>
            {notification.message}
          </p>

          {/* Conditional Action Button */}
          {notification.type === 'friend_request_received' && onAction && (
            <div className="mt-3 action-button flex gap-2">
               <Button 
                 onClick={(e) => {
                   e.stopPropagation();
                   onAction(notification);
                 }}
                 className="h-8 text-xs font-semibold px-4 rounded-full gap-1.5"
               >
                 <Check size={14} />
                 Accept Request
               </Button>
            </div>
          )}
          {notification.type === 'new_message' && onAction && (
            <div className="mt-3 action-button flex gap-2">
               <Button 
                 variant="outline"
                 onClick={(e) => {
                   e.stopPropagation();
                   onAction(notification);
                 }}
                 className="h-8 text-xs font-semibold px-4 rounded-full gap-1.5 border-primary text-primary hover:bg-primary-container"
               >
                 <MessageCircle size={14} />
                 Reply
               </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
