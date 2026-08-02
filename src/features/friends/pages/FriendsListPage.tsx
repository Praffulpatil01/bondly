import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Settings, Search, Loader2 } from 'lucide-react';
import { BottomNav } from '@/components/layout/BottomNav';
import { FriendCard } from '../components/FriendCard';
import { FriendsService, FriendData } from '../services/friends.service';
import { useAuth } from '@/context/AuthContext';

export const FriendsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<'online' | 'all'>('online');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = FriendsService.subscribeToFriends(
      user.uid,
      (data) => {
        setFriends(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to fetch friends", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleBlock = async (friendshipId: string) => {
    if (!user) return;
    try {
      await FriendsService.blockFriend(friendshipId, user.uid);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (friendshipId: string) => {
    try {
      await FriendsService.removeFriend(friendshipId);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return 'Just now';
    const diff = Math.floor((Date.now() - timestamp) / 60000); // minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filteredFriends = friends.filter(f => {
    if (tab === 'online' && f.profile.onlineStatus !== 'online') return false;
    if (searchQuery && !f.profile.nickname.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-surface/80 backdrop-blur-xl z-50 shadow-[0_4px_20px_rgba(109,94,247,0.08)] border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-variant/50 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold font-['Outfit'] text-primary">Bondly</h1>
        </div>
        <button onClick={() => navigate('/settings')} className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant/50 transition-colors">
          <Settings size={24} />
        </button>
      </header>

      <main className="pt-24 px-5 max-w-screen-md mx-auto">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant/60 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base" 
            placeholder="Search friends..." 
            type="text"
          />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-surface-container-low rounded-xl mb-6">
          <button 
            onClick={() => setTab('online')}
            className={`flex-1 py-2 text-sm font-semibold transition-all rounded-lg ${tab === 'online' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
          >
            Online
          </button>
          <button 
            onClick={() => setTab('all')}
            className={`flex-1 py-2 text-sm font-semibold transition-all rounded-lg ${tab === 'all' ? 'bg-surface-container-highest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
          >
            All
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map(({ friendship, profile }) => (
              <FriendCard 
                key={friendship.id}
                id={friendship.id}
                name={profile.nickname}
                avatarUrl={profile.photoURL || ''}
                isOnline={profile.onlineStatus === 'online'}
                lastMessage={friendship.lastMessageText || 'No messages yet'}
                timeAgo={formatTimeAgo(friendship.lastMessageTimestamp || friendship.createdAt)}
                onBlock={handleBlock}
                onRemove={handleRemove}
              />
            ))
          ) : (
            <div className="text-center py-12 text-on-surface-variant">
              No friends found.
            </div>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};
