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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !friendId) {
      setLoading(false);
      return;
    }

    const fetchFriend = async () => {
      try {
        const data = await FriendsService.getFriendProfile(friendId, user.uid);
        if (data) {
          setFriendData(data);
        } else {
          // Friend profile not found will now throw specific errors
        }
      } catch (e: any) {
        console.error(e);
        if (e.message === "PROFILE_NOT_FOUND") {
          setError("Error: The user profile document does not exist in the database (PROFILE_NOT_FOUND).");
        } else if (e.message === "FRIENDSHIP_NOT_FOUND") {
          setError("Error: We found the profile, but could not find an active friendship between you two (FRIENDSHIP_NOT_FOUND).");
        } else {
          setError("Failed to load friend profile: " + (e.message || "Unknown error"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFriend();
  }, [friendId, user]);

  if (loading) {
    return <Loader fullScreen size={48} />;
  }

  if (error || !friendData) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center p-5">
        <ArrowLeft size={48} className="text-outline mb-4 cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-2xl font-bold font-['Outfit'] mb-2">Oops!</h1>
        <p className="text-on-surface-variant text-center">{error || "User not found."}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-6 text-primary font-bold">Go to Dashboard</button>
      </div>
    );
  }

  const { profile, friendship } = friendData;

  const handleOpenChat = () => {
    navigate(`/chat/permanent/${friendship.id}`);
  };

  const getInterestIcon = (_interest: string, index: number) => {
    const icons = [
      <Star size={24} className="text-primary fill-current opacity-80" />,
      <Heart size={24} className="text-secondary fill-current opacity-80" />,
      <Zap size={24} className="text-tertiary fill-current opacity-80" />
    ];
    const bgColors = ['bg-primary/10', 'bg-secondary/10', 'bg-tertiary/10'];
    
    return {
      icon: icons[index % icons.length],
      bg: bgColors[index % bgColors.length]
    };
  };

  return (
    <div className="bg-background text-on-surface font-['Inter'] min-h-screen pb-32">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-surface/80 backdrop-blur-xl z-50 shadow-[0_4px_20px_rgba(109,94,247,0.08)] border-b border-outline-variant/30">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-variant/50 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="text-xl font-bold font-['Outfit'] text-primary">Bondly</span>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-variant/50 transition-colors">
          <MoreVertical size={20} />
        </button>
      </nav>

      <main className="pt-24 px-5 max-w-xl mx-auto space-y-8">
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border-[4px] border-surface bg-surface-container overflow-hidden z-10">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.nickname} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary text-5xl font-bold bg-primary/10 font-['Outfit']">
                  {profile.nickname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Status Indicator */}
            {profile.onlineStatus === 'online' && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-[3px] border-surface rounded-full z-20"></div>
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold font-['Outfit'] text-on-surface">{profile.nickname}</h1>
            <p className="text-on-surface-variant text-base px-4 max-w-md mx-auto leading-relaxed">
              {profile.bio || "This user hasn't set up a bio yet, but they're ready to chat!"}
            </p>
          </div>
          
          <button 
            onClick={handleOpenChat}
            className="group relative overflow-hidden px-10 py-4 rounded-2xl shadow-[0_8px_30px_rgba(109,94,247,0.3)] bg-gradient-to-r from-primary to-secondary text-white transition-transform active:scale-95 flex items-center gap-3"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <MessageCircle size={22} className="fill-current" />
            <span className="font-bold text-lg font-['Outfit'] tracking-wide">Send Message</span>
          </button>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center gap-1 border border-outline-variant/30 hover:bg-surface-container transition-colors shadow-sm">
            <span className="text-2xl font-bold font-['Outfit'] text-primary">{profile.friendsCount || 0}</span>
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Friends</span>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center gap-1 border border-outline-variant/30 hover:bg-surface-container transition-colors shadow-sm">
            <span className="text-2xl font-bold font-['Outfit'] text-secondary">{profile.chatsCount || 0}</span>
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Chats</span>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center gap-1 border border-outline-variant/30 hover:bg-surface-container transition-colors shadow-sm">
            <span className="text-lg font-bold font-['Outfit'] text-tertiary">
              {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </span>
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Joined</span>
          </div>
        </section>

        {/* Badges/Interests Section */}
        <section className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-bold font-['Outfit'] text-on-surface flex items-center gap-2">
              <Star size={20} className="text-primary" /> Interests
            </h2>
          </div>
          
          {(!profile.interests || profile.interests.length === 0) ? (
             <div className="bg-surface-container-lowest rounded-2xl p-6 text-center border border-outline-variant/20">
               <p className="text-on-surface-variant">No interests added yet.</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {profile.interests.map((interest, idx) => {
                const styling = getInterestIcon(interest, idx);
                return (
                  <div key={interest} className="bg-gradient-to-br from-surface-container-low to-surface-container rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 rounded-full ${styling.bg} flex items-center justify-center shrink-0`}>
                      {styling.icon}
                    </div>
                    <span className="text-sm font-semibold text-on-surface capitalize truncate">{interest}</span>
                  </div>
                );
              })}
              
              {/* Always show verified badge as a flex flex-col placeholder for design */}
              <div className="bg-gradient-to-br from-surface-container-low to-surface-container rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow col-span-2">
                <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-tertiary opacity-80" size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-on-surface">Verified Member</span>
                  <span className="text-xs text-on-surface-variant">Identity securely checked</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="space-y-3 pt-6">
          <h2 className="text-base font-bold font-['Outfit'] text-error px-1 uppercase tracking-wider">Danger Zone</h2>
          <div className="bg-surface-container-lowest rounded-2xl border border-error/20 overflow-hidden divide-y divide-error/10">
            <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-error/5 transition-colors text-left group">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <Lock className="text-error" size={18} />
              </div>
              <span className="text-base text-error font-medium">Block User</span>
            </button>
            <button className="w-full px-5 py-4 flex items-center gap-4 hover:bg-error/5 transition-colors text-left group">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <HelpCircle className="text-error" size={18} />
              </div>
              <span className="text-base text-error font-medium">Report User</span>
            </button>
          </div>
        </section>
      </main>
      
      <BottomNav />
    </div>
  );
};
