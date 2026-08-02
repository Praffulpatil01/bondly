import * as React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex w-full mb-4 justify-start"
    >
      <div className="bg-surface-container rounded-2xl rounded-bl-sm border border-outline-variant/20 px-4 py-3 flex items-center gap-1.5 shadow-sm h-10 w-16">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/70"
        />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/70"
        />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/70"
        />
      </div>
    </motion.div>
  );
};
