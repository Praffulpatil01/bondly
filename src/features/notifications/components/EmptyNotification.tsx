import { BellOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptyNotification = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center h-full"
    >
      <div className="w-20 h-20 bg-surface-variant rounded-full flex items-center justify-center text-on-surface-variant mb-6">
        <BellOff size={32} />
      </div>
      <h3 className="text-xl font-bold font-['Outfit'] text-on-surface mb-2">
        You're all caught up!
      </h3>
      <p className="text-sm text-on-surface-variant max-w-xs">
        There are no new notifications for this category right now. Check back later!
      </p>
    </motion.div>
  );
};
