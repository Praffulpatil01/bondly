import { useNotificationStore } from '../store/notification.store';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationBadge = () => {
  const unreadCount = useNotificationStore(state => state.unreadCount);

  return (
    <AnimatePresence>
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -top-1 -right-1 flex items-center justify-center bg-error text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-1"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
