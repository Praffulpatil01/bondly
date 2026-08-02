import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Star } from 'lucide-react';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen font-body-md text-on-surface antialiased overflow-hidden flex flex-col items-center justify-center px-5 md:px-10 py-12">
      {/* Decorative Atmosphere Background */}
      <div className="fixed inset-0 -z-10 bg-surface">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"
        />
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px]"
        />

        {/* Floating Micro-Decorations */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-20 left-[10%] text-primary/20"
        >
          <ChevronLeft size={32} />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3.5 }}
          className="absolute bottom-32 right-[15%] text-secondary/20"
        >
          <Heart size={40} fill="currentColor" />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          className="absolute top-1/2 left-[5%] text-tertiary/20"
        >
          <Star size={24} fill="currentColor" />
        </motion.div>
      </div>

      {/* Main Content Wrapper */}
      <div className="relative w-full max-w-[440px] z-10">
        {children}

        {/* Footer info */}
        <footer className="mt-8 text-center space-y-2">
          <p className="text-xs font-medium text-outline">
            By continuing, you agree to Bondly's{' '}
            <a className="underline hover:text-on-surface transition-colors" href="#">
              Terms of Service
            </a>{' '}
            &amp;{' '}
            <a className="underline hover:text-on-surface transition-colors" href="#">
              Privacy Policy
            </a>
          </p>
          <p className="text-xs font-medium text-outline-variant">
            © 2024 Bondly. Stay curious, stay kind.
          </p>
        </footer>
      </div>
    </div>
  );
};
