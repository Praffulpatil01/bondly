import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FunFactCardProps {
  facts: string[];
  intervalMs?: number;
}

/**
 * Displays one rotating fun fact at a time while user waits.
 */
export const FunFactCard = ({ facts, intervalMs = 5000 }: FunFactCardProps) => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % facts.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [facts.length, intervalMs]);

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-4 w-full max-w-sm">
      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
        Did you know?
      </p>
      <div className="h-10 relative flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.35 }}
            className="text-sm text-on-surface-variant absolute"
          >
            "{facts[index]}"
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};
