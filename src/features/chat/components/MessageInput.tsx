import * as React from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [text, setText] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
    }
    // Keep focus on input after sending
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 p-4 md:px-8 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-on-surface-variant flex-shrink-0 rounded-full"
          disabled={disabled}
        >
          <Smile size={22} />
        </Button>
        
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder="Type a message..."
          className="flex-1 h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-full px-4 md:px-6 text-sm md:text-base outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-on-surface-variant disabled:opacity-50"
        />

        <Button
          type="submit"
          disabled={!text.trim() || disabled}
          size="icon"
          className="w-12 h-12 rounded-full flex-shrink-0 bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:bg-surface-variant disabled:text-on-surface-variant"
        >
          <Send size={20} className={text.trim() && !disabled ? 'ml-1' : ''} />
        </Button>
      </div>
    </form>
  );
};
