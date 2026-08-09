import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Moon, Bell, Lock, Ban, ShieldAlert, Gavel, HelpCircle, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { collections, UserProfile } from '@/firebase/collections';
import { auth } from '@/firebase/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from 'next-themes';

// Stitch avatar sprite — 4 columns × 2 rows grid
const AVATARS_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA3Do5bvSlH2WSw862TZzWccUJJESenQB2FqqizzpLlapyJIBTO4CCdBULetW32XZJQWSmHD93MAyg6DCIM4Ns5Jx7_2J6uN27rpL7LPMp3RRHpLokHNDErIgRDwWoHhJJv2E_kr-LdHmxQmg-s-DoFiHtG7920SgoLTw16t0xwxZTAdM130eMd7fXzu0Nz0nfsscetnAZKOZ6nQWt5MHzBsqVbyTUFL2cGePLe7ECETINAxUT7yrPdKg";

const AvatarCell = ({
  col, row, size, className = "",
}: { col: number; row: number; size: number; className?: string }) => (
  <div
    className={`relative overflow-hidden shrink-0 rounded-full ${className}`}
    style={{ width: size, height: size }}
  >
    <img
      src={AVATARS_IMG}
      alt="Avatar"
      style={{
        position: "absolute",
        width: "400%",
        height: "200%",
        maxWidth: "none",
        left: `${col * -100}%`,
        top: `${row * -100}%`,
        objectFit: "cover",
      }}
    />
  </div>
);

// Scroll reveal hook
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { theme, setTheme, systemTheme } = useTheme();
  
  // To avoid hydration mismatch errors on render
  const [mounted, setMounted] = useState(false);

  // Selected avatar index from profile.photoURL or default to col0,row0
  const activeAvatar = () => {
    if (!profile?.photoURL) return { col: 0, row: 0 };
    const match = profile.photoURL.match(/avatar_(\d)_(\d)/);
    if (match) return { col: parseInt(match[1]), row: parseInt(match[2]) };
    return { col: 0, row: 0 };
  };

  useEffect(() => {
    setMounted(true);
    
    const fetchProfile = async () => {
      if (!user) {
        setProfile({
          uid: 'me',
          email: 'demo@bondly.com',
          nickname: 'Praful',
          photoURL: '',
        } as UserProfile);
        return;
      }
      try {
        let docRef = doc(collections.profiles, user.uid);
        let profileSnap = await getDoc(docRef);
        
        if (!profileSnap.exists()) {
          docRef = doc(collections.users, user.uid);
          profileSnap = await getDoc(docRef);
        }
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          setProfile({
            uid: user.uid,
            email: user.email || '',
            nickname: user.displayName || 'User',
            photoURL: user.photoURL || '',
          } as UserProfile);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    
    fetchProfile();
  }, [user]);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDarkMode = currentTheme === 'dark';

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('onboardingCompleted');
      localStorage.removeItem('match_history');
      navigate('/login');
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const avatarInfo = activeAvatar();

  const prefReveal = useReveal();
  const connReveal = useReveal();
  const safetyReveal = useReveal();

  return (
    <div className="bg-[#fcf8ff] text-[#1b1b24] min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-white/85 backdrop-blur-xl shadow-[0_2px_20px_rgba(84,66,221,0.06)] z-50 border-b border-[#c7c4d2]/20 transition-all duration-300">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e4dfff]/50 text-[#5442dd] active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold font-['Outfit'] text-[#5442dd]">Settings</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>
      
      <main className="pt-24 px-5 md:px-10 max-w-2xl mx-auto space-y-8">
        
        {/* Profile Overview Card — dynamic entry animation */}
        <div 
          onClick={() => navigate('/profile')}
          className="p-5 rounded-2xl bg-white border border-[#c7c4d2]/20 flex items-center justify-between shadow-[0_4px_20px_rgba(84,66,221,0.06)] hover:shadow-[0_8px_30px_rgba(84,66,221,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#e4dfff] shadow-inner ring-4 ring-[#5442dd]/10">
              {profile?.photoURL && !profile.photoURL.includes('avatar_') ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <AvatarCell col={avatarInfo.col} row={avatarInfo.row} size={64} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-[#1b1b24] group-hover:text-[#5442dd] transition-colors">{profile?.nickname || 'Loading...'}</h2>
              <p className="text-sm font-medium text-[#787586]">{profile?.email || 'email@example.com'}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#f6f2ff] flex items-center justify-center text-[#5442dd] opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={18} />
          </div>
        </div>

        {/* Preferences */}
        <div ref={prefReveal.ref}>
          <div className={`space-y-3 transition-all duration-700 ${prefReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h3 className="text-xs font-semibold text-[#5442dd] uppercase tracking-wider px-1">Preferences</h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-[#c7c4d2]/20 shadow-[0_4px_20px_rgba(84,66,221,0.04)] divide-y divide-[#c7c4d2]/10">
              
              {/* Dark mode switch */}
              <div 
                className="flex items-center justify-between p-4 hover:bg-[#f6f2ff]/60 transition-colors cursor-pointer group" 
                onClick={toggleDarkMode}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                    <Moon size={20} />
                  </div>
                  <span className="text-base font-medium text-[#1b1b24]">Dark Mode</span>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${mounted && isDarkMode ? 'bg-[#5442dd]' : 'bg-[#c7c4d2]'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${mounted && isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </div>
              </div>
              
              {/* Notifications */}
              <button 
                onClick={() => navigate('/notifications')}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f6f2ff]/60 transition-colors text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                    <Bell size={20} />
                  </div>
                  <span className="text-base font-medium text-[#1b1b24]">Notifications</span>
                </div>
                <ChevronRight className="text-[#c7c4d2] group-hover:text-[#5442dd] transition-colors" size={20} />
              </button>
              
              {/* Privacy */}
              <button className="w-full flex items-center justify-between p-4 hover:bg-[#f6f2ff]/60 transition-colors text-left group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                    <Lock size={20} />
                  </div>
                  <span className="text-base font-medium text-[#1b1b24]">Privacy &amp; Visibility</span>
                </div>
                <ChevronRight className="text-[#c7c4d2] group-hover:text-[#5442dd] transition-colors" size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Connections */}
        <div ref={connReveal.ref}>
          <div className={`space-y-3 transition-all duration-700 ${connReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h3 className="text-xs font-semibold text-[#5442dd] uppercase tracking-wider px-1">Connections</h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-[#c7c4d2]/20 shadow-[0_4px_20px_rgba(84,66,221,0.04)]">
              <button className="w-full flex items-center justify-between p-4 hover:bg-[#f6f2ff]/60 transition-colors text-left group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-105 transition-transform">
                    <Ban size={20} />
                  </div>
                  <span className="text-base font-medium text-[#1b1b24]">Blocked Users</span>
                </div>
                <ChevronRight className="text-[#c7c4d2] group-hover:text-[#5442dd] transition-colors" size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Safety & Support */}
        <div ref={safetyReveal.ref}>
          <div className={`space-y-3 transition-all duration-700 ${safetyReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h3 className="text-xs font-semibold text-[#5442dd] uppercase tracking-wider px-1">Safety &amp; Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Safety card */}
              <div className="p-5 rounded-2xl bg-white border border-[#c7c4d2]/20 flex flex-col items-start space-y-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-xl bg-[#e4dfff]/60 text-[#5442dd] flex items-center justify-center shadow-sm group-hover:bg-[#5442dd] group-hover:text-white transition-colors duration-300">
                  <ShieldAlert size={24} />
                </div>
                <h4 className="text-lg font-bold font-['Outfit'] text-[#1b1b24]">Safety Center</h4>
                <p className="text-sm text-[#787586]">Resources and tools to keep your experience secure.</p>
              </div>
              
              {/* Guidelines card */}
              <div className="p-5 rounded-2xl bg-white border border-[#c7c4d2]/20 flex flex-col items-start space-y-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                  <Gavel size={24} />
                </div>
                <h4 className="text-lg font-bold font-['Outfit'] text-[#1b1b24]">Guidelines</h4>
                <p className="text-sm text-[#787586]">Our community standards for a kind atmosphere.</p>
              </div>
              
              {/* Support */}
              <div className="p-5 rounded-2xl bg-white border border-[#c7c4d2]/20 flex flex-col items-start space-y-3 md:col-span-2 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shadow-sm group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                      <HelpCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-['Outfit'] text-[#1b1b24]">Help &amp; Support</h4>
                      <p className="text-sm text-[#787586]">Need help? We're here 24/7.</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#f6f2ff] flex items-center justify-center text-[#5442dd]">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full h-14 rounded-2xl bg-white border border-red-200 text-red-500 font-semibold flex items-center justify-center space-x-2 hover:bg-red-50 active:scale-[0.98] transition-all shadow-sm"
        >
          <LogOut size={20} />
          <span>Logout Account</span>
        </button>

      </main>
    </div>
  );
};

export default SettingsPage;
