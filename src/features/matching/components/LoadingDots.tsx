
import { motion } from 'framer-motion';

/**
 * Three bouncing dots styled like the Stitch design's loading indicator.
 */
export const LoadingDots = () => {
  return (
    <div className="flex gap-2">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-primary"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 0.6,
            delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
