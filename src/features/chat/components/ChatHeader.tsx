import * as React from 'react';
import { Flag } from 'lucide-react';

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
}) => {
  // Format MM:SS
  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const maxTimeMs = 3 * 60 * 1000; // 3 minutes total time (adjust if needed)
  const isLowTime = timeLeftMs < 60000; // Less than 1 minute
  const progressPercent = Math.max(0, Math.min(100, (timeLeftMs / maxTimeMs) * 100));

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(109,94,247,0.08)]">
      {/* Left: User Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-2 border-primary/20">
            {/* Fallback avatar matching Stitch vibe */}
            <img 
              className="w-[120%] h-[120%] object-cover opacity-90"
              alt="Anonymous" 
              src="https://api.dicebear.com/7.x/bottts/svg?seed=Ryple-robot&backgroundColor=f5f3ff&colors=6d5ef7" 
            />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-primary font-['Outfit'] leading-tight">Anonymous</h1>
          <p className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
          </p>
        </div>
      </div>

      {/* Center: Timer (Mobile Optimized) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
        <span className={`text-lg font-bold font-['Outfit'] tabular-nums tracking-tight ${isLowTime ? 'text-error' : 'text-primary'}`}>
          {formatTime(timeLeftMs)}
        </span>
        <div className="w-16 h-1 bg-surface-variant rounded-full overflow-hidden mt-0.5">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${isLowTime ? 'bg-error' : 'bg-primary'}`} 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onReport}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-error-container hover:text-error transition-all" 
          title="Report"
        >
          <Flag size={18} />
        </button>
        <button 
          onClick={onLeaveChat}
          className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          Skip
        </button>
      </div>
    </header>
  );
};
