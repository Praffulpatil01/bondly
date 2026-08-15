import * as React from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  Settings,
  Sparkles,
  Check,
  X,
  // LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc } from 'firebase/firestore';
import { getDocument } from '@/firebase/firestore';
import { collections, UserProfile, FriendRequest } from '@/firebase/collections';
import { Button } from '@/components/ui/Button';
import { FriendsService, FriendData } from '@/features/friends/services/friends.service';
import { Loader } from '@/components/ui/Loader';
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';
import { BottomNav } from '@/components/layout/BottomNav';

const VIBES = [
  { id: 'surprise', emoji: '✨', title: 'Surprise Me', desc: 'Meet someone unexpected' },
  { id: 'deep-talk', emoji: '🧠', title: 'Deep Talk', desc: 'Meaningful conversations' },
  { id: 'fun', emoji: '😂', title: 'Fun & Casual', desc: 'Light and funny' },
  { id: 'culture-travel', emoji: '🌎', title: 'Culture & Travel', desc: 'Explore ideas and places' },
  { id: 'ideas-startups', emoji: '🚀', title: 'Ideas & Startups', desc: 'Talk about ideas and the future' },
  { id: 'gaming', emoji: '🎮', title: 'Gaming', desc: 'Games, hobbies and fun' },
  { id: 'career', emoji: '💼', title: 'Career', desc: 'Goals, work and ambitions' },
  { id: 'music-movies', emoji: '🎵', title: 'Music & Movies', desc: 'Share what you love' },
  { id: 'language-practice', emoji: '🗣️', title: 'Language Practice', desc: 'Practice a language together' },
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [recentFriends, setRecentFriends] = React.useState<FriendData[]>([]);
  const [friendRequests, setFriendRequests] = React.useState<FriendRequest[]>([]);
  const [selectedVibe, setSelectedVibe] = React.useState('surprise');

  React.useEffect(() => {
    const fetchProfile = async () => {
      const demoUser = localStorage.getItem('Ryple_demo_user');

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
        try {
          setUserProfile(JSON.parse(demoUser) as UserProfile);
        } catch (e) {
          setUserProfile({ nickname: 'Demo User' } as UserProfile);
        }
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
          <span className="text-xl font-bold font-['Outfit'] text-primary">Ryple</span>
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
          {/* <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            title="Log Out"
            className="w-10 h-10 flex items-center justify-center rounded-full text-error hover:bg-error-container transition-colors ml-1"
          >
            <LogOut size={20} />
          </button> */}
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

        {/* Conversation Vibes */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold font-['Outfit'] text-on-surface">
              Who do you feel like talking to today?
            </h2>
            <p className="text-sm text-on-surface-variant">
              Choose a vibe and Ryple will find someone interesting to talk to.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {VIBES.map((vibe) => {
              const isSelected = selectedVibe === vibe.id;
              return (
                <button
                  key={vibe.id}
                  onClick={() => setSelectedVibe(vibe.id)}
                  className={`relative p-4 rounded-2xl border text-left transition-all overflow-hidden ${isSelected
                    ? 'bg-primary/10 border-primary shadow-sm'
                    : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant/60'
                    }`}
                  style={{ minHeight: '110px' }}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-primary">
                      <Check size={18} strokeWidth={3} />
                    </div>
                  )}
                  <div className="text-2xl mb-2">{vibe.emoji}</div>
                  <h3 className={`font-bold font-['Outfit'] text-sm mb-1 ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                    {vibe.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-tight">
                    {vibe.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <Button
            onClick={() => navigate('/match-search', { state: { vibe: selectedVibe } })}
            className="w-full h-14 rounded-full text-lg font-bold gap-2 mt-2 shadow-lg active:scale-[0.98] transition-transform"
          >
            <Sparkles size={20} />
            Find Someone
          </Button>
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

      </main>
      <BottomNav />
    </div>
  );
};
