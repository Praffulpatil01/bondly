import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { collections, UserProfile } from '@/firebase/collections';
import { BottomNav } from '@/components/layout/BottomNav';
import { Loader } from '@/components/ui/Loader';
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
        // Mock data from Stitch
        setProfile({
          uid: 'me',
          email: 'alex@bondly.com',
          nickname: 'Alex Rivera',
          bio: 'Creating meaningful connections through small acts of kindness. ✨ Tech explorer & coffee enthusiast.',
          photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADCpHtBWLJs7ROScL63A6mBoyByVs_oQ38Eax2zUYgO4Jr3YTcLnJRK40ZI7Mk5xanODeK9WR7KYMqU4oJmPxWh9uMT41qsORbReazCCi02UFh633tH0wiPVT1972YJuWZ_ZlpzDZGxa-lSPwB3-by4f-oacYolHAaMpRF5YjgeN2p1Gb6HGzJhRf1YmsvLi9-ZUqgZX4ClVO2Q-clpb757Tu5tDDvqheznd3kTIixPG0FemqB4AYLVQ',
          createdAt: new Date('2024-01-01').getTime(),
          updatedAt: Date.now(),
          onboardingCompleted: true,
          friendsCount: 124,
          chatsCount: 8200,
        } as UserProfile);
        setLoading(false);
        return;
      }
      try {
        let docRef = doc(collections.profiles, user.uid);
        let snap = await getDoc(docRef);
        if (!snap.exists()) {
          docRef = doc(collections.users, user.uid);
          snap = await getDoc(docRef);
        }
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          setProfile({
            uid: user.uid,
            email: user.email || '',
            nickname: user.displayName || 'Alex Rivera',
            photoURL: user.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuADCpHtBWLJs7ROScL63A6mBoyByVs_oQ38Eax2zUYgO4Jr3YTcLnJRK40ZI7Mk5xanODeK9WR7KYMqU4oJmPxWh9uMT41qsORbReazCCi02UFh633tH0wiPVT1972YJuWZ_ZlpzDZGxa-lSPwB3-by4f-oacYolHAaMpRF5YjgeN2p1Gb6HGzJhRf1YmsvLi9-ZUqgZX4ClVO2Q-clpb757Tu5tDDvqheznd3kTIixPG0FemqB4AYLVQ',
            bio: 'Creating meaningful connections through small acts of kindness. ✨ Tech explorer & coffee enthusiast.',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            onboardingCompleted: true,
            friendsCount: 124,
            chatsCount: 8200,
          } as UserProfile);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading || !profile) return <Loader fullScreen size={48} />;

  return (
    <div className="bg-[#fcf8ff] text-[#1b1b24] min-h-screen pb-32 font-[Inter] antialiased">
      
      {/* ── Top Navigation ── */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-[#fcf8ff]/80 backdrop-blur-xl z-50 border-b border-[#c8c4d7]/20 shadow-[0_4px_20px_rgba(109,94,247,0.08)]">
        <button 
          onClick={() => navigate('/dashboard')}
          className="material-symbols-outlined text-[#5442dd] p-2 hover:opacity-80 transition-opacity active:scale-95 duration-200"
        >
          arrow_back
        </button>
        <span className="text-2xl font-bold font-[Outfit] text-[#5442dd]">Bondly</span>
        <button 
          onClick={() => navigate('/settings')}
          className="material-symbols-outlined text-[#5442dd] p-2 hover:opacity-80 transition-opacity active:scale-95 duration-200"
        >
          settings
        </button>
      </nav>

      {/* ── Main Content Container ── */}
      <main className="pt-24 px-5 max-w-2xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-[#f0ecf9]">
              <img 
                className="w-full h-full object-cover" 
                src={profile.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuADCpHtBWLJs7ROScL63A6mBoyByVs_oQ38Eax2zUYgO4Jr3YTcLnJRK40ZI7Mk5xanODeK9WR7KYMqU4oJmPxWh9uMT41qsORbReazCCi02UFh633tH0wiPVT1972YJuWZ_ZlpzDZGxa-lSPwB3-by4f-oacYolHAaMpRF5YjgeN2p1Gb6HGzJhRf1YmsvLi9-ZUqgZX4ClVO2Q-clpb757Tu5tDDvqheznd3kTIixPG0FemqB4AYLVQ'} 
                alt="Profile" 
              />
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-1 right-1 bg-[#5442dd] text-white p-3 rounded-full shadow-lg active:scale-90 transition-transform hover:bg-[#5846c8]"
            >
              <span className="material-symbols-outlined text-[20px] block">edit</span>
            </button>
          </div>
          <div className="space-y-1">
            <h1 className="font-[Outfit] font-bold text-[28px] text-[#1b1b24]">{profile.nickname}</h1>
            <p className="text-[#474555] text-[15px] leading-relaxed max-w-md px-2">
              {profile.bio}
            </p>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="bg-[#6d5ef7] text-white font-semibold py-3 px-8 rounded-full shadow-md active:scale-95 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">person_edit</span>
            Edit Profile
          </button>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-4 bg-white p-4 rounded-[2rem] shadow-[0_4px_20px_rgba(109,94,247,0.05)] border border-[#c8c4d7]/30">
          <div className="flex flex-col items-center justify-center py-2">
            <span className="font-[Outfit] font-bold text-xl text-[#5442dd]">{profile.friendsCount}</span>
            <span className="text-xs font-semibold text-[#474555]">Friends</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2 border-x border-[#c8c4d7]/30">
            <span className="font-[Outfit] font-bold text-xl text-[#5442dd]">
              {profile.chatsCount !== undefined && profile.chatsCount >= 1000 
                ? `${(profile.chatsCount / 1000).toFixed(1)}k` 
                : profile.chatsCount ?? 0}
            </span>
            <span className="text-xs font-semibold text-[#474555]">Chats</span>
          </div>
          <div className="flex flex-col items-center justify-center py-2">
            <span className="font-[Outfit] font-bold text-xl text-[#5442dd]">
              {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </span>
            <span className="text-xs font-semibold text-[#474555]">Joined</span>
          </div>
        </section>

        {/* Achievements Bento */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-[Outfit] font-bold text-lg text-[#1b1b24]">Achievements</h2>
            <button className="text-[#5442dd] font-semibold text-sm hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Badge 1 */}
            <div className="bg-[#f6f2ff] p-4 rounded-2xl flex flex-col items-center gap-2 border border-[#c8c4d7]/20 hover:border-[#5442dd]/30 transition-all hover:scale-105 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#ffdcc6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ffb785]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <span className="text-xs font-semibold text-[#1b1b24] text-center">Early Adopter</span>
            </div>
            {/* Badge 2 */}
            <div className="bg-[#f6f2ff] p-4 rounded-2xl flex flex-col items-center gap-2 border border-[#c8c4d7]/20 hover:border-[#5442dd]/30 transition-all hover:scale-105 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#e4dfff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c7bfff]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <span className="text-xs font-semibold text-[#1b1b24] text-center">Top Liked</span>
            </div>
            {/* Badge 3 */}
            <div className="bg-[#f6f2ff] p-4 rounded-2xl flex flex-col items-center gap-2 border border-[#c8c4d7]/20 hover:border-[#5442dd]/30 transition-all hover:scale-105 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#e4dfff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#5442dd]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <span className="text-xs font-semibold text-[#1b1b24] text-center">Daily Streak</span>
            </div>
            {/* Badge 4 */}
            <div className="bg-[#f6f2ff] p-4 rounded-2xl flex flex-col items-center gap-2 border border-[#c8c4d7]/20 opacity-50 grayscale hover:scale-105 cursor-pointer transition-all">
              <div className="w-12 h-12 rounded-full bg-[#e5e0ed] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#787586]">verified_user</span>
              </div>
              <span className="text-xs font-semibold text-[#1b1b24] text-center">Verified</span>
            </div>
          </div>
        </section>

        {/* Settings & Privacy List */}
        <section className="space-y-3">
          <h2 className="font-[Outfit] font-bold text-lg text-[#1b1b24] px-1">Settings &amp; Privacy</h2>
          <div className="bg-white rounded-2xl overflow-hidden border border-[#c8c4d7]/20 shadow-sm divide-y divide-[#c8c4d7]/10">
            <button 
              onClick={() => navigate('/settings')}
              className="w-full px-4 py-4 flex justify-between items-center hover:bg-[#f6f2ff]/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#474555] group-hover:text-[#5442dd] transition-colors">lock</span>
                <span className="text-[15px] font-medium text-[#1b1b24]">Privacy Center</span>
              </div>
              <span className="material-symbols-outlined text-[#c8c4d7]">chevron_right</span>
            </button>
            <button 
              onClick={() => navigate('/notifications')}
              className="w-full px-4 py-4 flex justify-between items-center hover:bg-[#f6f2ff]/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#474555] group-hover:text-[#5442dd] transition-colors">notifications</span>
                <span className="text-[15px] font-medium text-[#1b1b24]">Notifications</span>
              </div>
              <span className="material-symbols-outlined text-[#c8c4d7]">chevron_right</span>
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="w-full px-4 py-4 flex justify-between items-center hover:bg-[#f6f2ff]/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#474555] group-hover:text-[#5442dd] transition-colors">help</span>
                <span className="text-[15px] font-medium text-[#1b1b24]">Help &amp; Support</span>
              </div>
              <span className="material-symbols-outlined text-[#c8c4d7]">chevron_right</span>
            </button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center px-10 py-12 space-y-4 md:space-y-0 bg-white border-t border-[#c8c4d7]/10 mt-16 mb-20">
        <span className="font-[Outfit] font-bold text-xl text-[#5442dd]">Bondly</span>
        <p className="text-xs text-[#474555]">© 2024 Bondly. Stay curious, stay kind.</p>
        <div className="flex gap-6">
          <a className="text-[#474555] hover:text-[#5442dd] transition-colors text-xs" href="#">Safety</a>
          <a className="text-[#474555] hover:text-[#5442dd] transition-colors text-xs" href="#">Privacy</a>
          <a className="text-[#474555] hover:text-[#5442dd] transition-colors text-xs" href="#">Guidelines</a>
        </div>
      </footer>

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

export default MyProfilePage;
