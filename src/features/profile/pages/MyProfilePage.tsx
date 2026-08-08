import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Settings as SettingsIcon, Edit2, UserCog, Star, Heart, Zap, ShieldCheck, Lock, Bell, HelpCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { collections, UserProfile } from '@/firebase/collections';
import { BottomNav } from '@/components/layout/BottomNav';
import { Loader } from '@/components/ui/Loader';
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';
import { EditProfileModal } from '../components/EditProfileModal';

export const MyProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        // Mock for UI dev
        setProfile({
          uid: 'me',
          email: 'demo@bondly.com',
          nickname: 'Alex Rivera',
          bio: 'Creating meaningful connections through small acts of kindness. ✨ Tech explorer & coffee enthusiast.',
          photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADCpHtBWLJs7ROScL63A6mBoyByVs_oQ38Eax2zUYgO4Jr3YTcLnJRK40ZI7Mk5xanODeK9WR7KYMqU4oJmPxWh9uMT41qsORbReazCCi02UFh633tH0wiPVT1972YJuWZ_ZlpzDZGxa-lSPwB3-by4f-oacYolHAaMpRF5YjgeN2p1Gb6HGzJhRf1YmsvLi9-ZUqgZX4ClVO2Q-clpb757Tu5tDDvqheznd3kTIixPG0FemqB4AYLVQ',
          createdAt: Date.now() - 10000000000,
          updatedAt: Date.now(),
          onboardingCompleted: true,
          friendsCount: 124,
          chatsCount: 8200
        } as UserProfile);
        setLoading(false);
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
            bio: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            onboardingCompleted: true,
            friendsCount: 0,
            chatsCount: 0
          } as UserProfile);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading || !profile) {
    return <Loader fullScreen size={48} />;
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-surface/80 backdrop-blur-xl z-50 shadow-[0_4px_20px_rgba(109,94,247,0.08)]">
        <button onClick={() => navigate('/dashboard')} className="text-primary p-2 hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <ArrowLeft size={24} />
        </button>
        <span className="text-2xl font-bold font-['Outfit'] text-primary">Bondly</span>
        <button onClick={() => navigate('/settings')} className="text-primary p-2 hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <SettingsIcon size={24} />
        </button>
      </nav>

      <main className="pt-24 px-5 max-w-2xl mx-auto space-y-8">
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative group cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-surface-container">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.nickname} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary text-4xl font-bold bg-primary/10">
                  {profile.nickname.charAt(0)}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-1 right-1 bg-primary text-on-primary p-3 rounded-full shadow-lg active:scale-90 transition-transform hover:bg-secondary"
            >
              <Edit2 size={20} />
            </button>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-['Outfit'] text-on-surface">{profile.nickname}</h1>
            <p className="text-on-surface-variant text-base px-4 max-w-md">
              {profile.bio || 'Update your bio to tell people more about yourself.'}
            </p>
          </div>
          
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="bg-primary-container text-on-primary-container font-semibold py-3 px-8 rounded-full shadow-md active:scale-95 transition-transform hover:opacity-90 flex items-center gap-2"
          >
            <UserCog size={20} />
            Edit Profile
          </button>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-[0_4px_20px_rgba(109,94,247,0.05)] border border-outline-variant/30">
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-xl font-bold font-['Outfit'] text-primary">{profile.friendsCount || 0}</span>
            <span className="text-xs font-medium text-on-surface-variant">Friends</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 border-x border-outline-variant/30">
            <span className="text-xl font-bold font-['Outfit'] text-primary">{profile.chatsCount || 0}</span>
            <span className="text-xs font-medium text-on-surface-variant">Chats</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-xl font-bold font-['Outfit'] text-primary">
              {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </span>
            <span className="text-xs font-medium text-on-surface-variant">Joined</span>
          </div>
        </section>

        {/* Interests Bento */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-['Outfit'] text-on-surface">Interests</h2>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="text-primary font-semibold text-sm hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {profile.interests && profile.interests.length > 0 ? (
              profile.interests.map((interest, index) => (
                <div key={index} className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center gap-2 border border-outline-variant/20 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="text-primary fill-current" size={24} />
                  </div>
                  <span className="text-sm font-medium text-on-surface text-center capitalize">{interest}</span>
                </div>
              ))
            ) : (
              <div className="col-span-full py-4 text-center">
                <span className="text-sm font-medium text-on-surface-variant">No interests added yet.</span>
              </div>
            )}
          </div>
        </section>

        {/* Quick Settings */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-['Outfit'] text-on-surface px-1">Settings & Privacy</h2>
          <div className="bg-surface-container-lowest rounded-xl divide-y divide-outline-variant/20 overflow-hidden border border-outline-variant/20">
            <button onClick={() => navigate('/settings')} className="w-full px-4 py-4 flex justify-between items-center hover:bg-surface-container-low transition-colors text-left group">
              <div className="flex items-center gap-4">
                <Lock className="text-on-surface-variant group-hover:text-primary transition-colors" size={24} />
                <span className="text-base font-medium">Privacy Center</span>
              </div>
              <ChevronRight className="text-outline-variant" size={20} />
            </button>
            <button onClick={() => navigate('/notifications')} className="w-full px-4 py-4 flex justify-between items-center hover:bg-surface-container-low transition-colors text-left group">
              <div className="flex items-center gap-4">
                <Bell className="text-on-surface-variant group-hover:text-primary transition-colors" size={24} />
                <span className="text-base font-medium">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBadge />
                <ChevronRight className="text-outline-variant" size={20} />
              </div>
            </button>
            <button onClick={() => navigate('/settings')} className="w-full px-4 py-4 flex justify-between items-center hover:bg-surface-container-low transition-colors text-left group">
              <div className="flex items-center gap-4">
                <HelpCircle className="text-on-surface-variant group-hover:text-primary transition-colors" size={24} />
                <span className="text-base font-medium">Help & Support</span>
              </div>
              <ChevronRight className="text-outline-variant" size={20} />
            </button>
          </div>
        </section>
      </main>
      
      {profile && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          profile={profile} 
          onSave={(updates) => setProfile({ ...profile, ...updates })} 
        />
      )}

      <BottomNav />
    </div>
  );
};
