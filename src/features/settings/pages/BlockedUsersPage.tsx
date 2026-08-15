import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Ban, UserX, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { toast } from 'sonner';

interface BlockedUser {
  id: string;
  uid: string;
  nickname: string;
  photoURL?: string;
  blockedAt?: number;
}

const AVATARS_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA3Do5bvSlH2WSw862TZzWccUJJESenQB2FqqizzpLlapyJIBTO4CCdBULetW32XZJQWSmHD93MAyg6DCIM4Ns5Jx7_2J6uN27rpL7LPMp3RRHpLokHNDErIgRDwWoHhJJv2E_kr-LdHmxQmg-s-DoFiHtG7920SgoLTw16t0xwxZTAdM130eMd7fXzu0Nz0nfsscetnAZKOZ6nQWt5MHzBsqVbyTUFL2cGePLe7ECETINAxUT7yrPdKg";

const parseAvatarCoords = (photoURL?: string) => {
  if (!photoURL) return null;
  const match = photoURL.match(/avatar_(\d)_(\d)/);
  if (match) return { col: parseInt(match[1]), row: parseInt(match[2]) };
  return null;
};

const AvatarSprite = ({ col, row }: { col: number; row: number }) => (
  <div className="relative overflow-hidden w-full h-full rounded-full">
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

export const BlockedUsersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchBlockedUsers();
  }, [user]);

  const fetchBlockedUsers = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'friendships'),
        where('users', 'array-contains', user.uid),
        where('status', '==', 'blocked')
      );
      const snap = await getDocs(q);
      const list: BlockedUser[] = [];
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        // Only include blocks where this user is the blocker
        if (data.blockedBy !== user.uid) continue;
        const otherUid = data.users.find((u: string) => u !== user.uid);
        if (!otherUid) continue;
        let profileSnap = await getDoc(doc(db, 'profiles', otherUid));
        if (!profileSnap.exists()) profileSnap = await getDoc(doc(db, 'users', otherUid));
        const profile = profileSnap.exists() ? profileSnap.data() : {};
        list.push({
          id: docSnap.id,
          uid: otherUid,
          nickname: profile.nickname || 'Unknown User',
          photoURL: profile.photoURL,
          blockedAt: data.blockedAt,
        });
      }
      setBlockedUsers(list);
    } catch (e) {
      console.error('Failed to load blocked users', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (friendshipId: string, name: string) => {
    setUnblocking(friendshipId);
    try {
      await updateDoc(doc(db, 'friendships', friendshipId), {
        status: 'active',
        blockedBy: null
      });
      setBlockedUsers(prev => prev.filter(u => u.id !== friendshipId));
      toast.success(`${name} has been unblocked and restored to your friend list.`);
    } catch (e) {
      toast.error('Failed to unblock user.');
    } finally {
      setUnblocking(null);
    }
  };

  return (
    <div className="bg-[#fcf8ff] text-[#1b1b24] min-h-screen pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-white/85 backdrop-blur-xl shadow-[0_2px_20px_rgba(84,66,221,0.06)] z-50 border-b border-[#c7c4d2]/20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e4dfff]/50 text-[#5442dd] active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold font-['Outfit'] text-[#5442dd]">Blocked Users</h1>
        <div className="w-10" />
      </header>

      <main className="pt-24 px-5 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#5442dd]" size={36} />
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#e4dfff]/60 flex items-center justify-center">
              <Ban size={36} className="text-[#5442dd]" />
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] text-[#1b1b24]">No blocked users</h2>
            <p className="text-sm text-[#787586] max-w-xs">
              People you block won't be able to send you messages or see your profile.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {blockedUsers.map(u => {
              const coords = parseAvatarCoords(u.photoURL);
              return (
                <div key={u.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-[#c7c4d2]/20 shadow-[0_2px_12px_rgba(84,66,221,0.04)]">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#e4dfff] flex-shrink-0">
                    {coords ? (
                      <AvatarSprite col={coords.col} row={coords.row} />
                    ) : u.photoURL?.startsWith('http') ? (
                      <img src={u.photoURL} alt={u.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarSprite col={0} row={0} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold font-['Outfit'] text-[#1b1b24] truncate">{u.nickname}</p>
                    {u.blockedAt && (
                      <p className="text-xs text-[#787586]">
                        Blocked {new Date(u.blockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnblock(u.id, u.nickname)}
                    disabled={unblocking === u.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e4dfff]/60 text-[#5442dd] text-sm font-semibold hover:bg-[#5442dd] hover:text-white transition-all active:scale-95 disabled:opacity-50"
                  >
                    {unblocking === u.id ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
                    Unblock
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default BlockedUsersPage;
