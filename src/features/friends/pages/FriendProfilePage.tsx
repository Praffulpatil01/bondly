import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MoreVertical, MessageCircle, Star, Heart, Zap, ShieldCheck, Lock, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { FriendsService, FriendData } from '../services/friends.service';
import { BottomNav } from '@/components/layout/BottomNav';
import { Loader } from '@/components/ui/Loader';

export const FriendProfilePage = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [friendData, setFriendData] = useState<FriendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we're rendering a UI demo without DB, we inject mock data
    if (!user || !friendId) {
      setFriendData({
        profile: {
          uid: 'mock',
          email: 'mock',
          nickname: 'Alex Rivera',
          bio: 'Creating meaningful connections through small acts of kindness. ✨ Tech explorer & coffee enthusiast.',
          photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADCpHtBWLJs7ROScL63A6mBoyByVs_oQ38Eax2zUYgO4Jr3YTcLnJRK40ZI7Mk5xanODeK9WR7KYMqU4oJmPxWh9uMT41qsORbReazCCi02UFh633tH0wiPVT1972YJuWZ_ZlpzDZGxa-lSPwB3-by4f-oacYolHAaMpRF5YjgeN2p1Gb6HGzJhRf1YmsvLi9-ZUqgZX4ClVO2Q-clpb757Tu5tDDvqheznd3kTIixPG0FemqB4AYLVQ',
          createdAt: Date.now() - 10000000000,
          updatedAt: Date.now(),
          onboardingCompleted: true,
          friendsCount: 124,
          chatsCount: 8200
        },
        friendship: {
          id: 'mock_friendship',
          users: ['mock', 'mock2'],
          createdAt: Date.now(),
          status: 'active'
        }
      });
      setLoading(false);
      return;
    }

    const fetchFriend = async () => {
      try {
        const data = await FriendsService.getFriendProfile(friendId, user.uid);
        if (data) {
          setFriendData(data);
        } else {
          // Fallback to mock for UI dev
          setFriendData({
            profile: {
              uid: 'mock',
              email: 'mock',
              nickname: 'Alex Rivera',
              bio: 'Creating meaningful connections through small acts of kindness. ✨ Tech explorer & coffee enthusiast.',
              photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADCpHtBWLJs7ROScL63A6mBoyByVs_oQ38Eax2zUYgO4Jr3YTcLnJRK40ZI7Mk5xanODeK9WR7KYMqU4oJmPxWh9uMT41qsORbReazCCi02UFh633tH0wiPVT1972YJuWZ_ZlpzDZGxa-lSPwB3-by4f-oacYolHAaMpRF5YjgeN2p1Gb6HGzJhRf1YmsvLi9-ZUqgZX4ClVO2Q-clpb757Tu5tDDvqheznd3kTIixPG0FemqB4AYLVQ',
              createdAt: Date.now() - 10000000000,
              updatedAt: Date.now(),
              onboardingCompleted: true,
              friendsCount: 124,
              chatsCount: 8200
            },
            friendship: {
              id: 'mock_friendship',
              users: ['mock', 'mock2'],
              createdAt: Date.now(),
              status: 'active'
            }
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchFriend();
  }, [friendId, user]);

  if (loading || !friendData) {
    return <Loader fullScreen size={48} />;
  }

  const { profile, friendship } = friendData;

  const handleOpenChat = () => {
    navigate(`/chat/permanent/${friendship.id}`);
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-surface/80 backdrop-blur-xl z-50 shadow-[0_4px_20px_rgba(109,94,247,0.08)]">
        <button onClick={() => navigate(-1)} className="text-primary p-2 hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <ArrowLeft size={24} />
        </button>
        <span className="text-2xl font-bold font-['Outfit'] text-primary">Bondly</span>
        <button className="text-primary p-2 hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <MoreVertical size={24} />
        </button>
      </nav>

      <main className="pt-24 px-5 max-w-2xl mx-auto space-y-8">
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-surface-container">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.nickname} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary text-4xl font-bold bg-primary/10">
                {profile.nickname.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-['Outfit'] text-on-surface">{profile.nickname}</h1>
            <p className="text-on-surface-variant text-base px-4 max-w-md">
              {profile.bio || 'This user has not set a bio yet.'}
            </p>
          </div>
          
          <button 
            onClick={handleOpenChat}
            className="bg-primary-container text-on-primary-container font-semibold py-3 px-8 rounded-full shadow-md active:scale-95 transition-transform hover:opacity-90 flex items-center gap-2"
          >
            <MessageCircle size={20} />
            Message
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

        {/* Badges/Interests Section (Reusing Achievements layout from design) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-['Outfit'] text-on-surface">Interests</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center gap-2 border border-outline-variant/20 hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <Star className="text-on-tertiary-fixed fill-current" size={24} />
              </div>
              <span className="text-sm font-medium text-on-surface text-center">Gaming</span>
            </div>
            
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center gap-2 border border-outline-variant/20">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center">
                <Heart className="text-on-secondary-fixed fill-current" size={24} />
              </div>
              <span className="text-sm font-medium text-on-surface text-center">Music</span>
            </div>
            
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center gap-2 border border-outline-variant/20">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
                <Zap className="text-on-primary-fixed fill-current" size={24} />
              </div>
              <span className="text-sm font-medium text-on-surface text-center">Fitness</span>
            </div>
            
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col items-center gap-2 border border-outline-variant/20 opacity-50 grayscale">
              <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
                <ShieldCheck className="text-outline" size={24} />
              </div>
              <span className="text-sm font-medium text-on-surface text-center">Verified</span>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-2 pt-4">
          <h2 className="text-xl font-bold font-['Outfit'] text-error px-1">Actions</h2>
          <div className="bg-error-container/30 rounded-xl divide-y divide-error/20 border border-error/20 overflow-hidden">
            <button className="w-full px-4 py-4 flex justify-between items-center hover:bg-error-container/50 transition-colors text-left group">
              <div className="flex items-center gap-4">
                <Lock className="text-error" size={20} />
                <span className="text-base text-error font-medium">Block User</span>
              </div>
            </button>
            <button className="w-full px-4 py-4 flex justify-between items-center hover:bg-error-container/50 transition-colors text-left group">
              <div className="flex items-center gap-4">
                <HelpCircle className="text-error" size={20} />
                <span className="text-base text-error font-medium">Report User</span>
              </div>
            </button>
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};
