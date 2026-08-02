import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';
import { type ChatMessage } from '../services/chat.service';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
}) => {
  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, type: 'spring', damping: 25, stiffness: 300 }}
      className={`flex w-full mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
        <div
          className={`px-4 py-2.5 shadow-sm text-sm md:text-base ${
            isOwnMessage
              ? 'bg-primary text-on-primary rounded-2xl rounded-br-sm'
              : 'bg-surface-container text-on-surface rounded-2xl rounded-bl-sm border border-outline-variant/20'
          }`}
          style={{ wordBreak: 'break-word' }}
        >
          {message.text}
        </div>
        
        {/* Timestamp and Status */}
        <div className={`flex items-center gap-1 mt-1 text-[10px] text-on-surface-variant ${
          isOwnMessage ? 'justify-end' : 'justify-start ml-1'
        }`}>
          <span>{timeString}</span>
          {isOwnMessage && (
            <span className={message.isRead ? 'text-primary' : ''}>
              {message.isRead ? <CheckCheck size={12} /> : <Check size={12} />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
