import * as React from 'react';
import { Send, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme, EmojiStyle } from 'emoji-picker-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  onTyping,
}) => {
  const [text, setText] = React.useState('');
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
      setShowEmojiPicker(false);
      if (onTyping) onTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
    inputRef.current?.focus();
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prevInput) => prevInput + emojiData.emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-full right-4 mb-4 z-[100] shadow-2xl rounded-2xl overflow-hidden border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <EmojiPicker 
            onEmojiClick={onEmojiClick}
            theme={Theme.AUTO}
            emojiStyle={EmojiStyle.APPLE}
            lazyLoadEmojis={true}
            searchDisabled={false}
            skinTonesDisabled
            width={320}
            height={400}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl p-4 pb-safe shadow-[0_-4px_20px_rgba(109,94,247,0.08)] rounded-t-2xl"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (onTyping) {
                  onTyping(true);
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => {
                    onTyping(false);
                  }, 2000);
                }
              }}
              disabled={disabled}
              placeholder="Type a message..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full py-3 pl-5 pr-12 text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-on-surface-variant/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            >
              <Smile size={20} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-container text-on-primary shadow-md hover:opacity-90 active:scale-90 transition-all shrink-0 disabled:opacity-50"
          >
            <Send size={20} className={text.trim() && !disabled ? 'ml-1' : ''} />
          </button>
        </div>
      </form>
    </div>
  );
};
