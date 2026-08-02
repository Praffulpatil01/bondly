import * as React from 'react';
import { motion } from 'framer-motion';

interface SystemMessageProps {
  text: string;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({ text }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center my-6"
    >
      <div className="px-4 py-1.5 bg-surface-variant/50 rounded-full text-xs font-medium text-on-surface-variant border border-outline-variant/30">
        {text}
      </div>
    </motion.div>
  );
};
