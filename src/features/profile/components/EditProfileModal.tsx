import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Search } from 'lucide-react';
import { UserProfile, collections } from '@/firebase/collections';
import { setDocument } from '@/firebase/firestore';
import { doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

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

const AVATAR_OPTIONS = [
  { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 },
  { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 },
];

const INTERESTS = [
  'Music', 'Gaming', 'Movies', 'Anime', 'Sports',
  'Technology', 'Travel', 'Food', 'Photography',
  'Fitness', 'Books', 'Business', 'Art', 'Pets', 'Coding',
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
}

export const EditProfileModal = ({ isOpen, onClose, profile, onSave }: EditProfileModalProps) => {
  const parseAvatar = (url: string) => {
    if (!url) return { col: 0, row: 0 };
    const match = url.match(/avatar_(\d)_(\d)/);
    if (match) return { col: parseInt(match[1]), row: parseInt(match[2]) };
    return { col: 0, row: 0 };
  };

  const [nickname, setNickname] = useState(profile.nickname || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState<{ col: number; row: number }>({ col: 0, row: 0 });
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);
  const [searchInterest, setSearchInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNickname(profile.nickname || '');
      setBio(profile.bio || '');
      setSelectedAvatar(parseAvatar(profile.photoURL || ''));
      setSelectedInterests(profile.interests || []);
      setSearchInterest('');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const filteredInterests = INTERESTS.filter((i) =>
    i.toLowerCase().includes(searchInterest.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.length < 3) {
      toast.error('Nickname must be at least 3 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: Partial<UserProfile> = {
        nickname,
        bio,
        photoURL: `avatar_${selectedAvatar.col}_${selectedAvatar.row}`,
        interests: selectedInterests,
        updatedAt: Date.now(),
      };

      if (profile.uid === 'me' || profile.uid === 'demo-user-123' || !profile.uid) {
        const demoUser = localStorage.getItem('Ryple_demo_user');
        const parsed = demoUser ? JSON.parse(demoUser) : {};
        const avatarStr = `avatar_${selectedAvatar.col}_${selectedAvatar.row}`;
        localStorage.setItem('Ryple_demo_user', JSON.stringify({
          ...parsed,
          uid: profile.uid || 'me',
          nickname,
          bio,
          photoURL: avatarStr,
          interests: selectedInterests,
        }));
        onSave(updates);
        toast.success('Profile updated successfully!');
        onClose();
        return;
      }

      const docRefProfile = doc(collections.profiles, profile.uid);
      const docRefUser = doc(collections.users, profile.uid);
      
      await setDocument(docRefProfile, updates, { merge: true });
      await setDocument(docRefUser, updates, { merge: true });
      
      onSave(updates);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-outline-variant/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-outline-variant/30 bg-surface/95 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-xl font-bold font-['Outfit'] text-on-surface">Edit Profile</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 no-scrollbar">
            <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Photo URL */}
              {/* Select Avatar */}
              <div className="space-y-3">
                <Label>Choose Avatar</Label>
                <div className="grid grid-cols-4 gap-3 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/20">
                  {AVATAR_OPTIONS.map((av, idx) => {
                    const isSelected = selectedAvatar.col === av.col && selectedAvatar.row === av.row;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`relative rounded-full aspect-square overflow-hidden border-4 transition-all hover:scale-105 active:scale-95 ${
                          isSelected
                            ? "border-[#5442dd] shadow-[0_4px_16px_rgba(84,66,221,0.3)]"
                            : "border-transparent hover:border-outline-variant"
                        }`}
                      >
                        <AvatarCell col={av.col} row={av.row} />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#5442dd]/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[20px] drop-shadow-md">check</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname *</Label>
                <Input 
                  id="nickname" 
                  placeholder="e.g. DreamyCloud" 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio"
                  placeholder="Tell people about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/50 resize-none font-body-md"
                  maxLength={150}
                />
                <div className="text-right text-xs text-on-surface-variant">
                  {bio.length}/150
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <Label>Interests</Label>
                <Input
                  placeholder="Search interests..."
                  value={searchInterest}
                  onChange={(e) => setSearchInterest(e.target.value)}
                  icon={<Search size={20} />}
                />

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 no-scrollbar p-1">
                  {filteredInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedInterests((prev) => prev.filter((i) => i !== interest));
                          } else {
                            setSelectedInterests((prev) => [...prev, interest]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full border transition-all text-xs font-medium ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                  {filteredInterests.length === 0 && (
                    <span className="text-sm text-on-surface-variant py-2">No interests found matching "{searchInterest}"</span>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-outline-variant/30 bg-surface/95 backdrop-blur-md sticky bottom-0">
            <Button 
              type="submit" 
              form="edit-profile-form" 
              className="w-full gap-2"
              disabled={isSubmitting || nickname.length < 3}
            >
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              Save Changes
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
