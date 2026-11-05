import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  WifiOff,
  UserX,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { auth } from '@/config/firebase';
import {
  MatchmakingService,
  type MatchState,
} from '../services/matchmaking.service';

export const MatchSearchPage = () => {
  const navigate = useNavigate();
  const [matchState, setMatchState] = React.useState<MatchState>('searching');
  const [matchResult, setMatchResult] = React.useState<any>(null);
  const abortRef = React.useRef(false);

  React.useEffect(() => {
    // Ensure user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const demoUser = localStorage.getItem('Ryple_demo_user');
      if (!user && !demoUser) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Start the simulated search
  React.useEffect(() => {
    abortRef.current = false;
    const search = async () => {
      try {
        const { state, result } = await MatchmakingService.simulateSearch(15000); // give cloud functions time to run
        if (!abortRef.current) {
          setMatchState(state);
          if (result) setMatchResult(result);
        }
      } catch {
        if (!abortRef.current) {
          setMatchState('network-error');
        }
      }
    };
    if (matchState === 'searching') {
      search();
    }
    return () => {
      abortRef.current = true;
    };
  }, [matchState]);

  // Auto-redirect on match found
  React.useEffect(() => {
    if (matchState === 'found') {
      const timer = setTimeout(() => {
        navigate('/chat', { state: { chatId: matchResult?.chatId } });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [matchState, matchResult, navigate]);

  const handleCancel = () => {
    abortRef.current = true;
    navigate('/dashboard');
  };

  const handleRetry = () => {
    setMatchState('searching');
  };

  return (
    <div className="bg-[#FDFBFF] text-on-surface min-h-screen flex flex-col overflow-hidden font-body-md">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-5 h-16 z-50">
        <button
          onClick={handleCancel}
          className="flex items-center justify-center w-10 h-10 rounded-full text-primary hover:bg-primary/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold font-['Outfit'] text-primary">Ryple</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start relative px-6 pt-4">
        <AnimatePresence mode="wait">
          {/* ===== SEARCHING STATE ===== */}
          {matchState === 'searching' && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full z-10"
            >
              {/* Illustration Circle */}
              <div className="w-[300px] h-[300px] bg-white rounded-full shadow-[0_20px_60px_rgba(109,94,247,0.08)] flex items-center justify-center overflow-hidden mb-8">
                {/* Fallback to DiceBear if exact robot image isn't available */}
                <img 
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=Ryple-robot&backgroundColor=f5f3ff&colors=6d5ef7" 
                  alt="Robot searching" 
                  className="w-[80%] h-[80%] object-contain opacity-90"
                />
              </div>

              {/* Headline */}
              <h2 className="text-[28px] font-extrabold font-['Outfit'] text-on-surface text-center leading-tight mb-4 max-w-[280px]">
                Finding someone for you...
              </h2>

              {/* Subtitle */}
              <p className="text-base text-on-surface-variant text-center mb-10">
                This usually takes a few seconds.
              </p>

              {/* 3 Dots Loader */}
              <div className="flex gap-2">
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} className="w-3.5 h-3.5 rounded-full bg-primary" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} className="w-3.5 h-3.5 rounded-full bg-primary" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} className="w-3.5 h-3.5 rounded-full bg-primary" />
              </div>
            </motion.div>
          )}

          {/* ===== MATCH FOUND STATE ===== */}
          {matchState === 'found' && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="flex flex-col items-center w-full z-10 mt-12"
            >
              <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mb-8 shadow-[0_12px_40px_rgba(109,94,247,0.3)]">
                <CheckCircle2 className="text-white" size={64} />
              </div>
              <h2 className="text-[28px] font-extrabold font-['Outfit'] text-on-surface mb-3 text-center">
                Match Found! 🎉
              </h2>
              <p className="text-base text-on-surface-variant text-center mb-10">
                Connecting you securely...
              </p>
              <div className="flex gap-2">
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} className="w-3.5 h-3.5 rounded-full bg-primary" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} className="w-3.5 h-3.5 rounded-full bg-primary" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} className="w-3.5 h-3.5 rounded-full bg-primary" />
              </div>
            </motion.div>
          )}

          {/* ===== FAILED / NETWORK ERROR ===== */}
          {(matchState === 'failed' || matchState === 'network-error') && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center w-full z-10 mt-12 text-center"
            >
              <div className="w-32 h-32 bg-error-container rounded-full flex items-center justify-center mb-8">
                {matchState === 'failed' ? <UserX className="text-error" size={56} /> : <WifiOff className="text-error" size={56} />}
              </div>
              <h2 className="text-[28px] font-extrabold font-['Outfit'] text-on-surface mb-3">
                {matchState === 'failed' ? 'No one available' : 'Connection Lost'}
              </h2>
              <p className="text-base text-on-surface-variant max-w-[280px] mb-12">
                {matchState === 'failed' 
                  ? 'Everyone seems busy at the moment. Try again in a bit!' 
                  : 'Please check your internet connection and try again.'}
              </p>
              <div className="flex flex-col gap-4 w-full">
                <Button onClick={handleRetry} className="w-full h-14 rounded-full text-lg">
                  <Search size={20} className="mr-2" /> Try Again
                </Button>
                <Button variant="outline" onClick={handleCancel} className="w-full h-14 rounded-full text-lg border-2">
                  Go Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Cancel Action — Only during searching */}
      {matchState === 'searching' && (
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full pb-10 px-6 flex flex-col items-center z-10"
        >
          <button
            onClick={handleCancel}
            className="w-full h-14 rounded-[30px] border border-[#DCD6FF] bg-transparent text-primary text-[17px] font-medium hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <X size={20} />
            Cancel
          </button>
        </motion.footer>
      )}
    </div>
  );
};
