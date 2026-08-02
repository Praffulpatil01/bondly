import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Ban, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

interface FriendCardProps {
  id: string;
  name: string;
  lastMessage: string;
  timeAgo: string;
  avatarUrl: string;
  isOnline: boolean;
  isTyping?: boolean;
  hasUnread?: boolean;
  onRemove: (id: string) => void;
  onBlock: (id: string) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  id,
  name,
  lastMessage,
  timeAgo,
  avatarUrl,
  isOnline,
  isTyping,
  hasUnread,
  onRemove,
  onBlock
}) => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const SWIPE_THRESHOLD = -60;
  const MAX_SWIPE = -140;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      controls.start({ x: MAX_SWIPE });
    } else {
      controls.start({ x: 0 });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on actions
    if ((e.target as HTMLElement).closest('.swipe-actions')) return;
    navigate(`/chat/permanent/${id}`);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl group bg-error-container">
      {/* Background Actions */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end px-4 gap-2 swipe-actions z-0">
        <button 
          onClick={() => {
            onBlock(id);
          }}
          className="p-4 text-on-error-container flex flex-col items-center hover:bg-error/10 rounded-xl transition-colors"
        >
          <Ban size={24} />
          <span className="text-[10px] font-bold mt-1">BLOCK</span>
        </button>
        <button 
          onClick={() => onRemove(id)}
          className="p-4 text-on-error-container flex flex-col items-center hover:bg-error/10 rounded-xl transition-colors"
        >
          <Trash2 size={24} />
          <span className="text-[10px] font-bold mt-1">REMOVE</span>
        </button>
      </div>

      {/* Foreground Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: MAX_SWIPE, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={handleCardClick}
        className="relative z-10 bg-surface-container-lowest p-4 flex items-center gap-4 border border-outline-variant/50 rounded-2xl shadow-[0_4px_20px_rgba(109,94,247,0.04)] cursor-pointer hover:border-primary/20 transition-colors"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container-high border-2 border-white flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                {name.charAt(0)}
              </div>
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold font-['Outfit'] text-on-surface truncate">{name}</h3>
          <p className={`text-sm truncate ${isTyping ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>
            {isTyping ? 'Typing...' : lastMessage}
          </p>
        </div>
        
        <div className="text-right flex flex-col items-end gap-1">
          <span className="text-xs font-medium text-outline">{timeAgo}</span>
          {hasUnread && (
            <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1"></div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
