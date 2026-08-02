import {
  Settings,
  MessageCircle,
  Heart,
  ArrowRight,
  Search,
  Timer,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Bell,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
/* Local image assets */
const MASCOT_IMG = '/images/mascot.png';
const SAFETY_IMG = '/images/safety.png';

export const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* ============ Top Navigation ============ */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-5 md:px-10 h-16 bg-surface/80 backdrop-blur-xl z-50 floating-shadow">
        <span className="typ-headline-md font-bold text-primary tracking-tight">
          Bondly
        </span>
        <button
          aria-label="Settings"
          className="p-2 text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 duration-200"
        >
          <Settings size={24} />
        </button>
      </nav>

      <main className="pt-16 pb-20 md:pb-0">
        {/* ============ Hero Section ============ */}
        <section className="relative px-5 md:px-10 pt-8 pb-12 overflow-hidden">
          {/* Background blurs */}
          <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 blur-[80px] rounded-full" />
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary-container/20 blur-[100px] rounded-full" />
          </div>

          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            {/* Floating illustrations */}
            <div className="relative w-full h-64 mb-6">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 left-4 sm:left-8 z-10"
              >
                <div className="w-28 h-20 sm:w-32 sm:h-24 bg-surface-container-lowest floating-shadow rounded-2xl p-4 flex items-center justify-center border border-outline-variant/30">
                  <MessageCircle
                    size={40}
                    className="text-primary"
                    fill="rgba(84,66,221,0.15)"
                  />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [-20, 0, -20] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-4 right-4 sm:right-8 z-10"
              >
                <div className="w-24 h-18 sm:w-28 sm:h-20 bg-primary-container floating-shadow rounded-2xl p-4 flex items-center justify-center">
                  <Heart
                    size={36}
                    className="text-on-primary-container"
                    fill="currentColor"
                  />
                </div>
              </motion.div>

              {/* Central Mascot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  className="w-36 h-36 sm:w-40 sm:h-40 object-contain drop-shadow-2xl"
                  alt="Bondly mascot — a friendly purple heart character on a cloud"
                  src={MASCOT_IMG}
                  onError={(e) => {
                    // Fallback just in case local image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>

            <h1 className="typ-headline-xl text-on-surface mb-4">
              Meet someone <span className="text-primary">new.</span>
            </h1>
            <p className="typ-body-lg text-on-surface-variant mb-8 px-2">
              Experience a secure, anonymous way to form real human connections in
              just 10 minutes.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full max-w-sm h-14 bg-primary text-on-primary rounded-full typ-label-md flex items-center justify-center gap-2 floating-shadow hover:opacity-90 active:scale-[0.97] transition-all"
            >
              Start chatting
              <ArrowRight size={20} />
            </button>
          </div>
        </section>

        {/* ============ How It Works (Bento Layout) ============ */}
        <section className="px-5 md:px-10 py-12 bg-surface-container-low">
          <h2 className="typ-headline-lg-mobile md:typ-headline-lg text-center mb-8">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Card 1 — Match */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="bento-card p-6 md:p-8 bg-surface-container-lowest rounded-2xl floating-shadow border border-outline-variant/20 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-4">
                <Search size={28} className="text-on-primary-fixed" />
              </div>
              <h3 className="typ-headline-sm mb-2">1. Match</h3>
              <p className="text-on-surface-variant typ-body-sm">
                Our smart algorithm pairs you with a stranger based on shared vibe
                and anonymity.
              </p>
            </motion.div>

            {/* Card 2 — Chat */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bento-card p-6 md:p-8 bg-surface-container-lowest rounded-2xl floating-shadow border border-outline-variant/20 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-secondary-fixed rounded-full flex items-center justify-center mb-4">
                <Timer size={28} className="text-on-secondary-fixed" />
              </div>
              <h3 className="typ-headline-sm mb-2">2. Chat 10 mins</h3>
              <p className="text-on-surface-variant typ-body-sm">
                Enter a timed, distraction-free chatroom. No bios, no profile pics,
                just conversation.
              </p>
            </motion.div>

            {/* Card 3 — Bond */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bento-card p-6 md:p-8 bg-primary-container rounded-2xl floating-shadow text-on-primary-container flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-on-primary-container" />
              </div>
              <h3 className="typ-headline-sm mb-2">3. Bond</h3>
              <p className="text-white/80 typ-body-sm">
                Decide if you want to reveal your profile. Connections made here are
                built on real bonding.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ============ Statistics ============ */}
        <section className="py-12 px-5 md:px-10 text-center">
          <div className="bg-surface-container rounded-2xl p-8 flex flex-col md:flex-row justify-around items-center gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <span className="typ-headline-xl text-primary">50K+</span>
              <span className="typ-label-md text-on-surface-variant uppercase tracking-widest">
                Active Users
              </span>
            </div>
            <div className="w-16 h-px md:w-px md:h-12 bg-outline-variant/50" />
            <div className="flex flex-col items-center">
              <span className="typ-headline-xl text-secondary">1M+</span>
              <span className="typ-label-md text-on-surface-variant uppercase tracking-widest">
                Bonds Created
              </span>
            </div>
            <div className="w-16 h-px md:w-px md:h-12 bg-outline-variant/50" />
            <div className="flex flex-col items-center">
              <span className="typ-headline-xl text-tertiary-container">4.9/5</span>
              <span className="typ-label-md text-on-surface-variant uppercase tracking-widest">
                User Rating
              </span>
            </div>
          </div>
        </section>

        {/* ============ Community & Safety ============ */}
        <section className="px-5 md:px-10 py-12">
          <div className="max-w-lg mx-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden floating-shadow">
            <div className="h-48 overflow-hidden relative">
              <img
                className="w-full h-full object-cover"
                alt="Abstract digital art representing security and privacy"
                src={SAFETY_IMG}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent" />
            </div>
            <div className="p-6 md:p-8 -mt-12 relative z-10">
              <div className="inline-flex items-center gap-1 bg-primary-fixed px-3 py-1 rounded-full text-on-primary-fixed typ-label-sm mb-4">
                <ShieldCheck size={14} />
                Secure by design
              </div>
              <h2 className="typ-headline-md mb-4">Community &amp; Safety First</h2>
              <p className="text-on-surface-variant typ-body-md mb-6">
                Bondly is built on the foundation of anonymity. No personal data is
                shared until you choose to reveal it. Our AI-driven moderation
                ensures every conversation stays kind and curious.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-primary shrink-0" />
                  <span className="typ-body-sm">
                    Zero-knowledge identity protection
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-primary shrink-0" />
                  <span className="typ-body-sm">
                    Real-time anti-toxicity filters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-primary shrink-0" />
                  <span className="typ-body-sm">24/7 Human support team</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ Footer ============ */}
        <footer className="w-full flex flex-col md:flex-row justify-between items-center px-5 md:px-10 py-12 gap-4 bg-surface-container-lowest">
          <div className="flex flex-col items-center md:items-start">
            <span className="typ-headline-sm font-bold text-primary mb-1">
              Bondly
            </span>
            <p className="typ-body-sm text-on-surface-variant">
              © 2024 Bondly. Stay curious, stay kind.
            </p>
          </div>
          <div className="flex gap-6">
            <a
              className="text-on-surface-variant hover:text-primary transition-colors typ-body-sm"
              href="#safety"
            >
              Safety
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors typ-body-sm"
              href="#privacy"
            >
              Privacy
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors typ-body-sm"
              href="#guidelines"
            >
              Guidelines
            </a>
          </div>
        </footer>
      </main>

      {/* ============ Bottom Navigation (Mobile Only) ============ */}
      <nav
        aria-label="Main navigation"
        className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-surface/90 backdrop-blur-xl z-50 shadow-[0_-4px_20px_rgba(109,94,247,0.08)] rounded-t-2xl"
      >
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl px-4 py-1.5 active:scale-90 transition-transform duration-150 min-w-[64px]">
          <MessageCircle size={22} fill="currentColor" />
          <span className="typ-label-sm mt-0.5">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 hover:bg-surface-variant/50 rounded-xl active:scale-90 transition-transform duration-150 min-w-[64px]">
          <Users size={22} />
          <span className="typ-label-sm mt-0.5">Friends</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 hover:bg-surface-variant/50 rounded-xl active:scale-90 transition-transform duration-150 min-w-[64px]">
          <Bell size={22} />
          <span className="typ-label-sm mt-0.5">Alerts</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 hover:bg-surface-variant/50 rounded-xl active:scale-90 transition-transform duration-150 min-w-[64px]">
          <User size={22} />
          <span className="typ-label-sm mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default LandingPage;
