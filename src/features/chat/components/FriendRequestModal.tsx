import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, Loader2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FriendRequestModalProps {
  isOpen: boolean;
  status: 'idle' | 'sending' | 'sent' | 'accepted' | 'declined';
  onClose: () => void;
  onSendRequest: () => void;
  onContinueChatting: () => void;
}

export const FriendRequestModal: React.FC<FriendRequestModalProps> = ({
  isOpen,
  status,
  onClose,
  onSendRequest,
  onContinueChatting,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface/60 backdrop-blur-sm z-[100]"
            onClick={status === 'idle' || status === 'declined' ? onClose : undefined}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto border border-outline-variant/30 flex flex-col relative"
            >
              {/* IDLE STATE (Initial Prompt) */}
              {status === 'idle' && (
                <>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors z-10"
                  >
                    <X size={18} />
                  </button>
                  <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-6 relative">
                      <Heart size={40} className="text-primary fill-primary" />
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm">💬</span>
                      </div>
                    </div>
                    <h2 className="typ-headline-sm font-bold text-on-surface mb-3">
                      Become Friends?
                    </h2>
                    <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                      If both of you choose to become friends, this anonymous chat will become a permanent conversation.
                      Your identities remain private until both users agree.
                    </p>
                    <div className="w-full bg-surface-container-low rounded-2xl p-4 flex flex-col gap-3 text-left mb-8">
                      <div className="flex items-center gap-3 text-sm text-on-surface">
                        <Check size={16} className="text-primary" />
                        <span>Continue chatting forever</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-on-surface">
                        <Check size={16} className="text-primary" />
                        <span>Stay connected anytime</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-on-surface">
                        <Check size={16} className="text-primary" />
                        <span>Safe mutual approval</span>
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-3">
                      <Button onClick={onSendRequest} className="w-full h-12 rounded-full gap-2 text-base font-semibold shadow-md hover:shadow-lg transition-shadow">
                        <Heart size={18} className="fill-white" />
                        Send Friend Request
                      </Button>
                      <Button variant="ghost" onClick={onClose} className="w-full h-12 rounded-full text-on-surface-variant font-medium">
                        Maybe Later
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* SENDING / SENT STATE */}
              {(status === 'sending' || status === 'sent') && (
                <div className="p-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative">
                    {status === 'sending' ? (
                      <Loader2 size={32} className="text-primary animate-spin" />
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                      >
                        <Heart size={32} className="text-primary fill-primary" />
                      </motion.div>
                    )}
                  </div>
                  <h2 className="typ-headline-sm font-bold text-on-surface mb-3">
                    {status === 'sending' ? 'Sending Request...' : 'Friend Request Sent'}
                  </h2>
                  <p className="text-sm text-on-surface-variant max-w-[250px]">
                    Waiting for the other person to accept...
                  </p>
                  {status === 'sent' && (
                    <div className="mt-8 flex gap-1.5">
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-primary/40" />
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary/60" />
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary/80" />
                    </div>
                  )}
                </div>
              )}

              {/* ACCEPTED STATE */}
              {status === 'accepted' && (
                <div className="p-10 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(109,94,247,0.3)]"
                  >
                    <PartyPopper size={40} className="text-white" />
                  </motion.div>
                  <h2 className="typ-headline-sm font-bold text-on-surface mb-3">
                    Congratulations! 🎉
                  </h2>
                  <p className="text-sm text-on-surface-variant mb-8 max-w-[260px]">
                    You both accepted! Your identities have been revealed and you are now friends on Bondly.
                  </p>
                  <Button onClick={onContinueChatting} className="w-full h-12 rounded-full font-semibold shadow-md">
                    Continue Chatting
                  </Button>
                </div>
              )}

              {/* DECLINED STATE */}
              {status === 'declined' && (
                <div className="p-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">👋</span>
                  </div>
                  <h2 className="typ-headline-sm font-bold text-on-surface mb-3">
                    No worries!
                  </h2>
                  <p className="text-sm text-on-surface-variant mb-8 max-w-[280px]">
                    They decided not to continue after this conversation. You can keep chatting until the timer ends.
                  </p>
                  <Button onClick={onClose} className="w-full h-12 rounded-full font-semibold bg-surface-container-high text-on-surface hover:bg-surface-variant">
                    Okay
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
