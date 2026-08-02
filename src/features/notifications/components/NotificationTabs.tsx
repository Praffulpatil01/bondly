import { useNotificationStore, NotificationFilterType } from '../store/notification.store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const NotificationTabs = () => {
  const selectedFilter = useNotificationStore(state => state.selectedFilter);
  const setFilter = useNotificationStore(state => state.setFilter);

  const tabs: NotificationFilterType[] = ['All', 'Unread', 'Friends', 'Messages', 'System'];

  return (
    <div className="sticky top-16 z-40 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 py-3 px-5 overflow-x-auto no-scrollbar flex items-center gap-2">
      {tabs.map((tab) => {
        const isActive = selectedFilter === tab;
        return (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
              isActive ? "text-on-primary" : "text-on-surface-variant hover:bg-surface-variant/50"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-full z-0"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </div>
  );
};
