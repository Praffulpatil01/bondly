import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';

// Components
import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { SystemMessage } from '../components/SystemMessage';
import { FriendRequestModal } from '../components/FriendRequestModal';

// Service & Types
import { ChatService, type ChatMessage } from '../services/chat.service';
import { FriendsService } from '@/features/friends/services/friends.service';
import { auth, db } from '@/config/firebase';
import { doc, onSnapshot, DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';

export const AnonymousChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [timeLeftMs, setTimeLeftMs] = React.useState(10 * 60 * 1000); // 10 minutes
  
  // Friend Request State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [requestStatus, setRequestStatus] = React.useState<'idle' | 'sending' | 'sent' | 'received' | 'accepted' | 'declined'>('idle');
  const [requestId, setRequestId] = React.useState<string | null>(null);
  const [incomingRequestId, setIncomingRequestId] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatId = location.state?.chatId || 'mock-chat-123';
  const myUid = auth.currentUser?.uid || 'demo-user-123';
  const [theirUid, setTheirUid] = React.useState<string | null>(null);
  const [isTyping, setIsTyping] = React.useState(false);

  // Fetch chat details and sync timer
  React.useEffect(() => {
    if (chatId === 'mock-chat-123') return;
    
    const unsubscribe = onSnapshot(doc(db, 'chats', chatId), (chatDoc: DocumentSnapshot<DocumentData>) => {
      if (chatDoc.exists()) {
        const data = chatDoc.data({ serverTimestamps: 'estimate' });
        
        let foundOtherId = null;
        if (data.participants && Array.isArray(data.participants)) {
          const otherId = data.participants.find((id: string) => id !== myUid);
          if (otherId) {
            setTheirUid(otherId);
            foundOtherId = otherId;
          }
        }
        
        if (foundOtherId && data.typing) {
          setIsTyping(!!data.typing[foundOtherId]);
        }
        
        // Sync timer
        if (data.startedAt) {
          const startedAtMs = data.startedAt.toMillis ? data.startedAt.toMillis() : (typeof data.startedAt === 'number' ? data.startedAt : Date.now());
          const elapsed = Date.now() - startedAtMs;
          const maxTime = 10 * 60 * 1000;
          let remaining = maxTime - elapsed;
          if (remaining < 0) remaining = 0;
          setTimeLeftMs(remaining);
        }
      }
    });

    return () => unsubscribe();
  }, [chatId, myUid]);

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

  // Listen to outbound friend request status changes
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

  // Listen for incoming friend requests
  React.useEffect(() => {
    const unsubscribe = ChatService.subscribeToIncomingRequest(myUid, chatId, (request) => {
      if (request) {
        if (request.status === 'pending') {
          setIncomingRequestId(request.id);
          setRequestStatus('received');
          setIsModalOpen(true);
        } else if (request.status === 'accepted' || request.status === 'declined') {
          setRequestStatus(request.status);
        }
      }
    });
    return () => unsubscribe();
  }, [chatId, myUid]);

  const handleSendFriendRequest = async () => {
    if (!theirUid) {
      toast.error('Cannot send request at this time.');
      return;
    }
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

  const handleAcceptRequest = async () => {
    if (!incomingRequestId || !theirUid) return;
    await FriendsService.acceptFriendRequest(incomingRequestId, theirUid, myUid);
  };

  const handleDeclineRequest = async () => {
    if (!incomingRequestId) return;
    await FriendsService.declineFriendRequest(incomingRequestId);
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

            {/* Become Friends Call-to-Action */}
            {messages.length > 0 && requestStatus !== 'accepted' && (
              <div className="flex justify-center my-6 transition-all duration-700">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  disabled={requestStatus === 'sending' || requestStatus === 'sent'}
                  className={`group relative overflow-hidden px-8 py-4 rounded-xl shadow-lg flex items-center gap-3 transition-transform active:scale-95 ${
                    requestStatus === 'sent' 
                      ? 'bg-surface-variant text-on-surface-variant' 
                      : 'bg-gradient-to-r from-primary to-secondary text-white'
                  }`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Heart size={20} className={requestStatus === 'sent' ? 'fill-current' : 'fill-white'} />
                  <span className="font-headline-sm font-bold">
                    {requestStatus === 'sent' ? 'Request Sent' : requestStatus === 'sending' ? 'Sending...' : 'Become Friends'}
                  </span>
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Area (Input) */}
        <div className="absolute bottom-0 left-0 w-full flex flex-col">
          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-8 pb-2 flex items-center gap-2"
              >
                <div className="bg-surface-variant text-on-surface-variant text-xs py-1.5 px-3 rounded-full flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span>Someone is typing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={false}
            onTyping={(typing) => ChatService.setTyping(chatId, myUid, typing)}
          />
        </div>
      </main>

      {/* Modals */}
      <FriendRequestModal
        isOpen={isModalOpen}
        status={requestStatus}
        onClose={() => setIsModalOpen(false)}
        onSendRequest={handleSendFriendRequest}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
        onContinueChatting={() => {
          setIsModalOpen(false);
          // In real implementation, this might redirect to permanent chat view
        }}
      />
    </div>
  );
};
