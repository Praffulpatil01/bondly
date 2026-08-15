import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { collections, UserProfile } from '@/firebase/collections';
import { BottomNav } from '@/components/layout/BottomNav';
import { Loader } from '@/components/ui/Loader';
import { EditProfileModal } from '../components/EditProfileModal';

// Stitch avatar sprite — 4 columns × 2 rows grid
const AVATARS_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA3Do5bvSlH2WSw862TZzWccUJJESenQB2FqqizzpLlapyJIBTO4CCdBULetW32XZJQWSmHD93MAyg6DCIM4Ns5Jx7_2J6uN27rpL7LPMp3RRHpLokHNDErIgRDwWoHhJJv2E_kr-LdHmxQmg-s-DoFiHtG7920SgoLTw16t0xwxZTAdM130eMd7fXzu0Nz0nfsscetnAZKOZ6nQWt5MHzBsqVbyTUFL2cGePLe7ECETINAxUT7yrPdKg";

const AvatarCell = ({
  col, row, className = "",
}: { col: number; row: number; className?: string }) => (
  <div
    className={`relative overflow-hidden w-full h-full rounded-full ${className}`}
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

export const MyProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      let uidToUse = 'me';
      let emailToUse = 'alex@Ryple.com';
      let nicknameToUse = 'Alex Rivera';
      let bioToUse = 'Creating meaningful connections through small acts of kindness. ✨ Tech explorer & coffee enthusiast.';
      let photoURLToUse = '';
      let createdAtToUse = Date.now();
      let onboardingCompletedToUse = true;

      let friendsCount = 0;
      let chatsCount = 0;

      if (!user) {
        const demoUserRaw = localStorage.getItem('Ryple_demo_user');
        let localProfile: Partial<UserProfile> = {};
        if (demoUserRaw) {
          try {
            localProfile = JSON.parse(demoUserRaw);
          } catch (e) {
            console.error("Failed to parse local profile", e);
          }
        }
        uidToUse = localProfile.uid || 'me';
        emailToUse = localProfile.email || 'alex@Ryple.com';
        nicknameToUse = localProfile.nickname || 'Alex Rivera';
        bioToUse = localProfile.bio !== undefined ? localProfile.bio : bioToUse;
        photoURLToUse = localProfile.photoURL || '';
        createdAtToUse = localProfile.createdAt || Date.now();
        onboardingCompletedToUse = localProfile.onboardingCompleted !== undefined ? localProfile.onboardingCompleted : true;
      } else {
        uidToUse = user.uid;
        emailToUse = user.email || '';
        nicknameToUse = user.displayName || 'Alex Rivera';
        photoURLToUse = user.photoURL || '';
      }

      // Fetch dynamic stats from Firestore
      try {
        const { getDocs, query, where, collection } = await import('firebase/firestore');
        const { db } = await import('@/firebase/firebase');
        
        const friendsQuery = query(
          collection(db, 'friendships'),
          where('users', 'array-contains', uidToUse),
          where('status', '==', 'active')
        );
        const friendsSnap = await getDocs(friendsQuery);
        friendsCount = friendsSnap.size;

        const chatsQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', uidToUse)
        );
        const chatsSnap = await getDocs(chatsQuery);
        chatsCount = chatsSnap.size;
      } catch (err) {
        console.error('Failed to load counts from Firestore:', err);
      }

      if (!user) {
        setProfile({
          uid: uidToUse,
          email: emailToUse,
          nickname: nicknameToUse,
          bio: bioToUse,
          photoURL: photoURLToUse,
          createdAt: createdAtToUse,
          updatedAt: Date.now(),
          onboardingCompleted: onboardingCompletedToUse,
          friendsCount,
          chatsCount,
          interests: [],
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
          setProfile({
            ...snap.data(),
            friendsCount,
            chatsCount
          } as UserProfile);
        } else {
          setProfile({
            uid: uidToUse,
            email: emailToUse,
            nickname: nicknameToUse,
            photoURL: photoURLToUse,
            bio: bioToUse,
            createdAt: createdAtToUse,
            updatedAt: Date.now(),
            onboardingCompleted: onboardingCompletedToUse,
            friendsCount,
            chatsCount,
            interests: [],
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

  // Selected avatar index from profile.photoURL or default to col0,row0
  const avatarInfo = (() => {
    if (!profile?.photoURL) return { col: 0, row: 0 };
    const match = profile.photoURL.match(/avatar_(\d)_(\d)/);
    if (match) return { col: parseInt(match[1]), row: parseInt(match[2]) };
    return { col: 0, row: 0 };
  })();

  const isCustomImage = profile?.photoURL && 
    !profile.photoURL.includes('avatar_') && 
    !profile.photoURL.includes('aida-public');

  if (loading || !profile) return <Loader fullScreen size={48} />;

  // Safe Date formatter helper for Joined date
  const getJoinedDate = () => {
    if (!profile?.createdAt) return "Aug '26";
    let date: Date;
    if (typeof profile.createdAt === 'number') {
      date = new Date(profile.createdAt);
    } else if (profile.createdAt && typeof (profile.createdAt as any).toDate === 'function') {
      date = (profile.createdAt as any).toDate();
    } else if (profile.createdAt && (profile.createdAt as any).seconds) {
      date = new Date((profile.createdAt as any).seconds * 1000);
    } else {
      date = new Date(profile.createdAt);
    }
    if (isNaN(date.getTime())) return "Aug '26";
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(2);
    return `${month} '${year}`;
  };

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
        <span className="text-2xl font-bold font-[Outfit] text-[#5442dd]">Ryple</span>
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
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-[#e4dfff]">
              {isCustomImage ? (
                <img 
                  className="w-full h-full object-cover" 
                  src={profile.photoURL} 
                  alt="Profile" 
                />
              ) : (
                <AvatarCell col={avatarInfo.col} row={avatarInfo.row} />
              )}
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
            <span className="font-[Outfit] font-bold text-xl text-[#5442dd]">{profile.friendsCount ?? 0}</span>
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
              {getJoinedDate()}
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
            <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border border-[#c8c4d7]/20 hover:border-[#5442dd]/30 transition-all hover:scale-105 cursor-pointer ${profile.friendsCount && profile.friendsCount > 0 ? 'bg-[#f6f2ff]' : 'bg-[#f6f2ff] opacity-50 grayscale'}`}>
              <div className="w-12 h-12 rounded-full bg-[#e4dfff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c7bfff]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <span className="text-xs font-semibold text-[#1b1b24] text-center">Top Liked</span>
            </div>
            {/* Badge 3 */}
            <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border border-[#c8c4d7]/20 hover:border-[#5442dd]/30 transition-all hover:scale-105 cursor-pointer ${profile.chatsCount && profile.chatsCount > 0 ? 'bg-[#f6f2ff]' : 'bg-[#f6f2ff] opacity-50 grayscale'}`}>
              <div className="w-12 h-12 rounded-full bg-[#e4dfff] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#5442dd]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <span className="text-xs font-semibold text-[#1b1b24] text-center">Daily Streak</span>
            </div>
            {/* Badge 4 */}
            <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border border-[#c8c4d7]/20 hover:border-[#5442dd]/30 transition-all hover:scale-105 cursor-pointer ${user?.emailVerified || profile.onboardingCompleted ? 'bg-[#f6f2ff]' : 'bg-[#f6f2ff] opacity-50 grayscale'}`}>
              <div className="w-12 h-12 rounded-full bg-[#e5e0ed] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#787586]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
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
      <footer className="w-full flex flex-col items-center gap-1 px-6 py-4 bg-white border-t border-[#c8c4d7]/10 mt-6">
        <span className="font-[Outfit] font-bold text-base text-[#5442dd]">Ryple</span>
        <p className="text-[11px] text-[#787586]">© 2024 Ryple. Stay curious, stay kind.</p>
        <div className="flex gap-5">
          <a className="text-[#787586] hover:text-[#5442dd] transition-colors text-[11px]" href="#">Safety</a>
          <a className="text-[#787586] hover:text-[#5442dd] transition-colors text-[11px]" href="#">Privacy</a>
          <a className="text-[#787586] hover:text-[#5442dd] transition-colors text-[11px]" href="#">Guidelines</a>
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
