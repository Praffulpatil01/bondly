import * as React from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  Settings,
  Sparkles,
  MessageCircle,
  Users,
  ShieldCheck,
  Check,
  X,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc } from 'firebase/firestore';
import { getDocument } from '@/firebase/firestore';
import { collections, UserProfile, FriendRequest } from '@/firebase/collections';
import { Button } from '@/components/ui/Button';
import { FriendsService, FriendData } from '@/features/friends/services/friends.service';
import { Loader } from '@/components/ui/Loader';
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [recentFriends, setRecentFriends] = React.useState<FriendData[]>([]);
  const [friendRequests, setFriendRequests] = React.useState<FriendRequest[]>([]);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const demoUser = localStorage.getItem('bondly_demo_user');
      
      if (user) {
        try {
          const docRef = doc(collections.profiles, user.uid);
          const profile = await getDocument(docRef);
          
          if (profile) {
            setUserProfile(profile);
            if (!profile.onboardingCompleted) {
              navigate('/onboarding');
            }
          }
        } catch (e) {
          console.error("Failed to load profile", e);
        }
      } else if (demoUser) {
        setUserProfile({ nickname: 'Demo User' } as UserProfile);
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, [user, navigate]);

  React.useEffect(() => {
    if (!user) return;

    // Subscriptions for dynamic data
    const unsubscribeFriends = FriendsService.subscribeToFriends(
      user.uid,
      (friends) => setRecentFriends(friends.slice(0, 10)), // Only show recent 10
      (error) => console.error("Friends fetch error:", error)
    );

    const unsubscribeRequests = FriendsService.subscribeToFriendRequests(
      user.uid,
      (requests) => setFriendRequests(requests),
      (error) => console.error("Requests fetch error:", error)
    );

    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    };
  }, [user]);

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!user) return;
    try {
      await FriendsService.acceptFriendRequest(request.id, request.senderId, user.uid);
    } catch (e) {
      console.error("Error accepting request:", e);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await FriendsService.declineFriendRequest(requestId);
    } catch (e) {
      console.error("Error declining request:", e);
    }
  };

  if (loading) {
    return <Loader fullScreen size={48} />;
  }

  const nickname = userProfile?.nickname || 'Friend';

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-5 md:px-10 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold font-['Outfit'] text-primary">Bondly</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
          >
            <Bell size={20} />
            <NotificationBadge />
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
            <Settings size={20} />
          </button>
          <button 
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            title="Log Out"
            className="w-10 h-10 flex items-center justify-center rounded-full text-error hover:bg-error-container transition-colors ml-1"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="pt-24 px-5 md:px-10 max-w-screen-xl mx-auto space-y-10">
        {/* Welcome Greeting */}
        <section>
          <h1 className="text-3xl md:text-4xl font-bold font-['Outfit'] text-on-surface mb-2">
            Hi, {nickname}! ✨
          </h1>
          <p className="text-base text-on-surface-variant">Your connection circle is growing.</p>
        </section>

        {/* Main Action Card */}
        <section>
          <div onClick={() => navigate('/match-search')} className="relative group cursor-pointer overflow-hidden bg-primary-container rounded-2xl p-6 md:p-8 shadow-[0_12px_40px_rgba(109,94,247,0.25)] transition-all hover:scale-[1.02] active:scale-95">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold font-['Outfit'] text-on-primary-container mb-2">
                  Find a new match
                </h2>
                <p className="text-sm text-on-primary-container/80 max-w-sm">
                  Discover someone new who shares your passions and vibes today.
                </p>
              </div>
              <div className="flex items-center">
                <Button className="bg-surface-container-lowest text-primary hover:bg-surface-container-lowest hover:opacity-90 shadow-lg text-sm rounded-full gap-2 px-6 h-12">
                  <Sparkles size={18} />
                  Start Exploring
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div onClick={() => navigate('/match-search')} className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-container transition-colors border border-outline-variant/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <span className="text-sm font-semibold">Start Chat</span>
          </div>
          <div onClick={() => navigate('/friends')} className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-container transition-colors border border-outline-variant/30">
            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
              <Users size={24} />
            </div>
            <span className="text-sm font-semibold">Friends</span>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-container transition-colors border border-outline-variant/30">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
              <Bell size={24} />
            </div>
            <span className="text-sm font-semibold">Alerts</span>
          </div>
          <div onClick={() => navigate('/settings')} className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-container transition-colors border border-outline-variant/30">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <span className="text-sm font-semibold">Safety</span>
          </div>
        </section>

        {/* Recent Friends Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold font-['Outfit'] text-on-surface">Recent Friends</h3>
            {recentFriends.length > 0 && (
              <button onClick={() => navigate('/friends')} className="text-primary text-sm font-semibold hover:underline">View All</button>
            )}
          </div>
          {recentFriends.length === 0 ? (
            <p className="text-on-surface-variant text-sm">No friends yet. Start exploring to meet people!</p>
          ) : (
            <div className="flex overflow-x-auto gap-6 no-scrollbar pb-4 -mx-5 px-5 md:mx-0 md:px-0">
              {recentFriends.map((friendData) => (
                <div key={friendData.friendship.id} onClick={() => navigate(`/chat/permanent/${friendData.friendship.id}`)} className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative w-16 h-16 rounded-full p-1 border-2 border-primary/20 group-hover:border-primary transition-colors">
                    <div className="w-full h-full rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant overflow-hidden">
                      {friendData.profile.photoURL ? (
                        <img src={friendData.profile.photoURL} alt={friendData.profile.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold">{friendData.profile.nickname.charAt(0)}</span>
                      )}
                    </div>
                    {/* Assuming online if they have recent activity or just mock online for UI */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant truncate w-16 text-center">{friendData.profile.nickname}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <section>
            <h3 className="text-xl font-bold font-['Outfit'] text-on-surface mb-4">Friend Requests</h3>
            <div className="space-y-4">
              {friendRequests.map(req => (
                <div key={req.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-[0_4px_20px_rgba(109,94,247,0.04)] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-variant flex-shrink-0 flex items-center justify-center text-on-surface-variant overflow-hidden">
                    {req.senderAvatar ? (
                      <img src={req.senderAvatar} alt={req.senderName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold">{req.senderName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-on-surface truncate">{req.senderName}</h4>
                    {req.message && (
                      <p className="text-xs text-on-surface-variant truncate">{req.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeclineRequest(req.id)}
                      className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                    >
                      <X size={18} />
                    </button>
                    <button 
                      onClick={() => handleAcceptRequest(req)}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bento Grid Insights */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-high rounded-2xl p-6 flex flex-col justify-between border border-outline-variant/20">
            <div>
              <Sparkles className="text-primary mb-3" size={24} />
              <h4 className="text-lg font-bold font-['Outfit'] text-on-surface mb-1">Daily Tip</h4>
              <p className="text-sm text-on-surface-variant">Update your interests to find more accurate matches.</p>
            </div>
            <button className="mt-6 w-10 h-10 rounded-full bg-surface flex items-center justify-center hover:bg-surface-variant transition-colors self-end">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="bg-primary text-white rounded-2xl p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(109,94,247,0.2)]">
            <div>
              <ShieldCheck className="text-primary-container mb-3" size={24} />
              <h4 className="text-lg font-bold font-['Outfit'] mb-1">Safety First</h4>
              <p className="text-sm text-primary-container/80">Review our community guidelines to keep Bondly a safe space.</p>
            </div>
            <button className="mt-6 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors self-end">
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
