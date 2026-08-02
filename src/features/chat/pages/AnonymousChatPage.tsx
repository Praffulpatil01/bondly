import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Components
import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { SystemMessage } from '../components/SystemMessage';
import { FriendRequestModal } from '../components/FriendRequestModal';

// Service & Types
import { ChatService, type ChatMessage } from '../services/chat.service';
import { auth } from '@/config/firebase';
import { toast } from 'sonner';

export const AnonymousChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [timeLeftMs, setTimeLeftMs] = React.useState(10 * 60 * 1000); // 10 minutes
  
  // Friend Request State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [requestStatus, setRequestStatus] = React.useState<'idle' | 'sending' | 'sent' | 'accepted' | 'declined'>('idle');
  const [requestId, setRequestId] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatId = location.state?.chatId || 'mock-chat-123';
  const myUid = auth.currentUser?.uid || 'demo-user-123';
  // In a real app we'd fetch the other participant's ID from the chat document
  const theirUid = 'anon-user-456'; 

  // Check auth
  React.useEffect(() => {
    const demoUser = localStorage.getItem('bondly_demo_user');
    if (!auth.currentUser && !demoUser) {
      navigate('/login');
    }
  }, [navigate]);

  // Initial System Message & Real-time Subscription
  React.useEffect(() => {
    // Set initial system messages
    setMessages([
      {
        id: 'sys-1',
        chatId,
        senderId: 'system',
        text: 'You are now connected.',
        timestamp: Date.now(),
        type: 'system',
      },
      {
        id: 'sys-2',
        chatId,
        senderId: 'system',
        text: 'Both users remain anonymous. Stay respectful.',
        timestamp: Date.now(),
        type: 'system',
      },
    ]);

    // Subscribe to real messages
    const unsubscribe = ChatService.subscribeToMessages(chatId, (newMessages) => {
      // Append real messages after system messages
      setMessages((prev) => {
        const sysMsgs = prev.filter(m => m.type === 'system');
        return [...sysMsgs, ...newMessages];
      });
    });

    return () => unsubscribe();
  }, [chatId]);

  // Timer logic
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          navigate('/time-up', {
            state: {
              messagesExchanged: messages.length,
              friendRequestStatus: requestStatus,
            },
          });
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate, messages.length, requestStatus]);

  // Auto-scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    // Send to real Firestore (subscription will update the UI automatically)
    await ChatService.sendMessage(chatId, myUid, text);
  };

  // Listen to friend request status changes if we have a requestId
  React.useEffect(() => {
    if (!requestId) return;
    const unsubscribe = ChatService.subscribeToFriendRequest(requestId, (status) => {
      if (status === 'pending') {
        setRequestStatus('sent');
      } else if (status === 'accepted' || status === 'declined') {
        setRequestStatus(status);
      }
    });
    return () => unsubscribe();
  }, [requestId]);

  const handleSendFriendRequest = async () => {
    setRequestStatus('sending');
    try {
      const request = await ChatService.sendFriendRequest(myUid, theirUid, chatId);
      setRequestId(request.id);
      setRequestStatus('sent');
    } catch (e) {
      console.error(e);
      setRequestStatus('idle');
      toast.error('Failed to send request');
    }
  };

  const handleLeaveChat = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-background text-on-surface h-screen flex flex-col md:flex-row overflow-hidden font-['Inter']">
      {/* Desktop Side Information */}
      <aside className="hidden md:flex flex-col w-[300px] lg:w-[360px] h-full bg-surface-container-low border-r border-outline-variant/30 p-8 pt-28">
        <h3 className="typ-title-lg font-bold mb-6 font-['Outfit']">Conversation Tips</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-sm font-bold">1</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">Stay respectful and keep an open mind.</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-sm font-bold">2</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">Don't share sensitive personal information until you're comfortable.</p>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-sm font-bold">3</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">Friendship requires mutual acceptance via the heart button below.</p>
          </li>
        </ul>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative">
        <ChatHeader
          timeLeftMs={timeLeftMs}
          onLeaveChat={handleLeaveChat}
          onReport={() => toast.success('Report submitted. We will review this user.')}
          onBlock={() => {
            toast.success('User blocked.');
            navigate('/dashboard');
          }}
        />

        {/* Message List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-24 pb-32">
          <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                msg.type === 'system' ? (
                  <SystemMessage key={msg.id} text={msg.text} />
                ) : (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwnMessage={msg.senderId === myUid}
                  />
                )
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Area (Input + Floating Actions) */}
        <div className="absolute bottom-0 left-0 w-full flex flex-col">
          {/* Floating Actions */}
          <div className="w-full flex justify-center px-4 mb-4 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-3 bg-surface-container-low/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-outline-variant/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeaveChat}
                className="text-on-surface-variant hover:text-on-surface rounded-full text-xs font-medium"
              >
                Skip
              </Button>
              <div className="w-[1px] h-4 bg-outline-variant/50"></div>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="rounded-full gap-1.5 text-xs font-bold shadow-sm bg-primary text-on-primary hover:opacity-90"
              >
                Become Friends <Heart size={14} className="fill-white" />
              </Button>
            </div>
          </div>

          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={requestStatus === 'accepted'} // Disable if chat became permanent (for now)
          />
        </div>
      </main>

      {/* Modals */}
      <FriendRequestModal
        isOpen={isModalOpen}
        status={requestStatus}
        onClose={() => setIsModalOpen(false)}
        onSendRequest={handleSendFriendRequest}
        onContinueChatting={() => {
          setIsModalOpen(false);
          // In real implementation, this might redirect to permanent chat view
        }}
      />
    </div>
  );
};
