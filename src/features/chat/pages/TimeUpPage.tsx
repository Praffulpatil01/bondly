
import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Hourglass,
  MessageCircle,
  Heart,
  PartyPopper,
  Search,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TimeUpState {
  messagesExchanged: number;
  friendRequestStatus: 'accepted' | 'declined' | 'pending' | 'none';
}

export const TimeUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve state passed from the chat screen, or use defaults for direct access
  const state = (location.state as TimeUpState) || {
    messagesExchanged: 52, // Mock data
    friendRequestStatus: 'none',
  };

  const isSuccess = state.friendRequestStatus === 'accepted';

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-6 text-on-surface overflow-hidden relative">
      {/* Soft background gradient based on state */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000 ${
        isSuccess ? 'bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_60%)]' : 'bg-[radial-gradient(circle_at_center,_var(--surface-variant)_0%,_transparent_60%)]'
      }`} />

      {/* Confetti particles for success */}
      {isSuccess && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 0, rotate: 0 }}
              animate={{ 
                y: window.innerHeight + 50, 
                opacity: [0, 1, 1, 0],
                rotate: Math.random() * 360 
              }}
              transition={{
                duration: Math.random() * 3 + 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear'
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#6D5EF7', '#34C759', '#FF9500', '#FF2D55'][Math.floor(Math.random() * 4)]
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
        className="w-full max-w-md z-10 flex flex-col items-center text-center"
      >
        {/* Center Illustration */}
        <div className="relative w-32 h-32 mb-8">
          <motion.div
            animate={isSuccess ? { y: [0, -10, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`w-full h-full rounded-full flex items-center justify-center shadow-lg ${
              isSuccess ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface'
            }`}
          >
            {isSuccess ? <PartyPopper size={56} /> : <Hourglass size={56} className="text-primary" />}
          </motion.div>
          
          {!isSuccess && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-2 -right-2 w-14 h-14 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-md border border-outline-variant/30"
            >
              <MessageCircle size={24} className="text-primary fill-primary/20" />
            </motion.div>
          )}
          {isSuccess && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-12 h-12 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-md border border-outline-variant/30"
            >
              <Heart size={20} className="text-error fill-error" />
            </motion.div>
          )}
        </div>

        {/* Headlines */}
        <h1 className="typ-headline-lg font-bold mb-3 font-['Outfit']">
          {isSuccess ? 'Congratulations!' : "Time's Up!"}
        </h1>
        
        {/* Description Text */}
        <div className="text-on-surface-variant typ-body-lg mb-10 max-w-[320px]">
          {isSuccess ? (
            <p>You're now friends. You can continue chatting with them anytime!</p>
          ) : (
            <>
              <p className="mb-4">Your anonymous conversation has ended.</p>
              <p className="text-sm">Every conversation is a chance to meet someone amazing. It's time to meet someone new.</p>
            </>
          )}
        </div>

        {/* Summary Card */}
        <div className="w-full bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">Conversation Time</span>
            <span className="text-sm font-bold text-on-surface">10 Minutes</span>
          </div>
          <div className="w-full h-[1px] bg-outline-variant/30"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">Messages Exchanged</span>
            <span className="text-sm font-bold text-on-surface">{state.messagesExchanged} Messages</span>
          </div>
          <div className="w-full h-[1px] bg-outline-variant/30"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-on-surface-variant">Friend Request</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              state.friendRequestStatus === 'accepted' ? 'bg-green-100 text-green-700' :
              state.friendRequestStatus === 'declined' ? 'bg-error-container text-error' :
              state.friendRequestStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
              'bg-surface-variant text-on-surface-variant'
            }`}>
              {state.friendRequestStatus === 'accepted' ? 'Accepted' :
               state.friendRequestStatus === 'declined' ? 'Declined' :
               state.friendRequestStatus === 'pending' ? 'Pending' : 'Not Sent'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          {isSuccess ? (
            <Button 
              onClick={() => navigate('/friends')}
              className="w-full h-14 rounded-full text-base font-semibold gap-2 shadow-md hover:shadow-lg"
            >
              <Users size={20} />
              Open Friend Chat
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/match-search')}
              className="w-full h-14 rounded-full text-base font-semibold gap-2 shadow-md hover:shadow-lg"
            >
              <Search size={20} />
              Find New Person
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="w-full h-14 rounded-full text-base font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant gap-2"
          >
            <LayoutDashboard size={20} />
            Back to Dashboard
          </Button>
        </div>

      </motion.div>
    </div>
  );
};
