import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MatchStatusProps {
  messages: string[];
  intervalMs?: number;
}

/**
 * Shows one rotating status message at a time with a smooth fade transition.
 */
export const MatchStatus = ({ messages, intervalMs = 2500 }: MatchStatusProps) => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [messages.length, intervalMs]);

  return (
    <div className="h-6 relative flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-on-surface-variant/80 absolute"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
