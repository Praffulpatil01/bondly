import * as React from 'react';
import { MoreVertical, ShieldAlert, UserX, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface ChatHeaderProps {
  timeLeftMs: number;
  onLeaveChat: () => void;
  onReport: () => void;
  onBlock: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  timeLeftMs,
  onLeaveChat,
  onReport,
  onBlock,
}) => {
  // Format MM:SS
  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeftMs < 60000; // Less than 1 minute
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 w-full h-16 md:h-20 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 z-50 px-4 md:px-8 flex items-center justify-between">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl">
            🕵️
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></span>
        </div>
        <div className="flex flex-col">
          <h2 className="typ-title-md font-semibold text-on-surface">Anonymous User</h2>
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            Secure Connection
          </span>
        </div>
      </div>

      {/* Right Side: Timer & Menu */}
      <div className="flex items-center gap-4">
        {/* Timer */}
        <div className={`px-3 py-1.5 rounded-full font-mono text-sm md:text-base font-bold transition-colors ${
          isLowTime ? 'bg-error-container text-error' : 'bg-surface-variant text-on-surface-variant'
        }`}>
          {formatTime(timeLeftMs)}
        </div>

        {/* Custom More Menu */}
        <div className="relative" ref={menuRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-on-surface-variant rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MoreVertical size={20} />
          </Button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.1)] flex flex-col z-50">
              <button 
                onClick={() => { setIsMenuOpen(false); onReport(); }} 
                className="w-full text-left px-3 py-2.5 text-sm text-error hover:bg-error-container rounded-xl flex items-center gap-2 transition-colors"
              >
                <ShieldAlert size={16} />
                Report User
              </button>
              <button 
                onClick={() => { setIsMenuOpen(false); onBlock(); }} 
                className="w-full text-left px-3 py-2.5 text-sm text-error hover:bg-error-container rounded-xl flex items-center gap-2 transition-colors"
              >
                <UserX size={16} />
                Block User
              </button>
              <button 
                onClick={() => { setIsMenuOpen(false); onLeaveChat(); }} 
                className="w-full text-left px-3 py-2.5 text-sm text-on-surface hover:bg-surface-variant rounded-xl flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Leave Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
