import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Moon, Bell, Lock, Ban, ShieldAlert, Gavel, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { collections, UserProfile } from '@/firebase/collections';
import { auth } from '@/firebase/firebase';
import { signOut } from 'firebase/auth';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for dark mode
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    const fetchProfile = async () => {
      if (!user) {
        setProfile({
          uid: 'me',
          email: 'demo@bondly.com',
          nickname: 'Alex Rivera',
          photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ84WXijhTVp5zEkWxdpEcDFGAOlPPoQB7511mpIMjPyiNCiTDUu-gacEpC0QkIxPwH2ker0OlgOin1rGC75LOHaDoe-Y21VQtuM5iiJAeG8q3tP9hcggyG4_0oILWnun_lNNJ_msmbHd-ACOaGk6xRIq9m7TKtQO35hXzyORZOkILTowopzKLN7Z0krrqGPotCHEKqNc5J8V-cUaA85OdXIRFBfCY-_zibmCJyNau9fkg5vFjwB7l3g'
        } as UserProfile);
        return;
      }
      
      const docRef = doc(collections.profiles, user.uid);
      const profileSnap = await getDoc(docRef);
      if (profileSnap.exists()) {
        setProfile(profileSnap.data());
      }
    };
    
    fetchProfile();
  }, [user]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear localStorage demo states if any
      localStorage.removeItem('onboardingCompleted');
      localStorage.removeItem('match_history');
      navigate('/login');
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(109,94,247,0.08)] z-50 border-b border-outline-variant/20">
        <button onClick={() => navigate(-1)} className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold font-['Outfit'] text-primary">Settings</h1>
        <div className="w-6"></div> {/* Spacer */}
      </header>
      
      <main className="mt-20 px-5 md:px-10 max-w-2xl mx-auto space-y-8">
        
        {/* Profile Overview Card */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center space-x-4 shadow-sm">
          <div className="relative">
            <img src={profile?.photoURL} alt="Profile" className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-['Outfit'] text-on-surface">{profile?.nickname || 'Loading...'}</h2>
            <p className="text-sm font-medium text-on-surface-variant">{profile?.email || 'email@example.com'}</p>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider px-1">Preferences</h3>
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm divide-y divide-outline-variant/10">
            
            <div className="flex items-center justify-between p-4 hover:bg-surface-container/30 transition-colors cursor-pointer" onClick={toggleDarkMode}>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary">
                  <Moon size={20} />
                </div>
                <span className="text-base font-medium">Dark Mode</span>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-outline-variant'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container/30 transition-colors text-left">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                  <Bell size={20} />
                </div>
                <span className="text-base font-medium">Notifications</span>
              </div>
              <ChevronRight className="text-outline-variant" size={20} />
            </button>
            
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container/30 transition-colors text-left">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                  <Lock size={20} />
                </div>
                <span className="text-base font-medium">Privacy & Visibility</span>
              </div>
              <ChevronRight className="text-outline-variant" size={20} />
            </button>
          </div>
        </div>

        {/* Connections */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider px-1">Connections</h3>
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm">
            <button className="w-full flex items-center justify-between p-4 hover:bg-surface-container/30 transition-colors text-left">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-error-container/10 flex items-center justify-center text-error">
                  <Ban size={20} />
                </div>
                <span className="text-base font-medium">Blocked Users</span>
              </div>
              <ChevronRight className="text-outline-variant" size={20} />
            </button>
          </div>
        </div>

        {/* Safety & Support */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider px-1">Safety & Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-start space-y-3 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                <ShieldAlert size={24} />
              </div>
              <h4 className="text-lg font-bold font-['Outfit']">Safety Center</h4>
              <p className="text-sm text-on-surface-variant">Resources and tools to keep your experience secure.</p>
            </div>
            
            <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-start space-y-3 cursor-pointer hover:border-tertiary/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-tertiary text-white flex items-center justify-center shadow-md">
                <Gavel size={24} />
              </div>
              <h4 className="text-lg font-bold font-['Outfit']">Guidelines</h4>
              <p className="text-sm text-on-surface-variant">Our community standards for a kind atmosphere.</p>
            </div>
            
            <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col items-start space-y-3 md:col-span-2 cursor-pointer hover:border-secondary/30 transition-colors">
              <div className="flex items-center space-x-4 w-full">
                <div className="w-12 h-12 rounded-xl bg-secondary text-white flex items-center justify-center">
                  <HelpCircle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold font-['Outfit']">Help & Support</h4>
                  <p className="text-sm text-on-surface-variant">Need help? We're here 24/7.</p>
                </div>
                <ChevronRight className="text-primary" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full h-14 rounded-xl bg-surface-container-lowest border border-error/20 text-error font-semibold flex items-center justify-center space-x-2 hover:bg-error-container/20 active:scale-[0.98] transition-all mt-8"
        >
          <LogOut size={20} />
          <span>Logout Account</span>
        </button>

      </main>
    </div>
  );
};
