import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Video, Settings, Plus, Smile, Send, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PermanentChatService } from '../services/permanent-chat.service';
import { PermanentMessage } from '@/firebase/collections';
import { Loader } from '@/components/ui/Loader';

export const PermanentChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>(); // Using friendshipId as chatId
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<PermanentMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [friendProfile, setFriendProfile] = useState<any>(null);
  
  const chatContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!user || !chatId) return;

    // Load friend profile based on chat ID (assuming chatId == friendshipId)
    const loadData = async () => {
      // Find the friend's ID by checking friendship details or just finding the other participant
      // This is a bit tricky if we don't know the friend's ID upfront. 
      // In a real app we'd fetch the chat document to get participants.
      // For now, mock the friend profile if it fails.
      
      setFriendProfile({
        nickname: 'Avery Bloom',
        photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDry111lE2-3cw3Ze1CwmL90QLQuaS-G5OfLbgN4ydr390c9RpAQ-jJPRRm2EUZbWT3-PY1lAWbwPPtTl3nJH6_d4zxpULv-1XsaOmG5mOkBjdVA8b4gYwbtoJsDNWFEgnPg228FZDJqlP7MXHGTenE8MnKxheFRGMWQVdzpnc8jhzuqpca7a2gHqvGyeqm3MGZLEiQ2jzCWiQFA89YN2R-vcvssW0wDLueMWO0Fc9_yzrCWl_9x2Gngg',
        onlineStatus: 'online'
      });
      setLoading(false);
    };

    loadData();

    const unsubscribe = PermanentChatService.subscribeToMessages(
      chatId,
      (msgs) => {
        setMessages(msgs);
        // Auto mark as read
        msgs.forEach(m => {
          if (m.senderId !== user.uid && !m.readBy.includes(user.uid)) {
            PermanentChatService.markAsRead(chatId, m.id, user.uid, m.readBy).catch(console.error);
          }
        });
      },
      (error) => console.error(error)
    );

    return () => unsubscribe();
  }, [chatId, user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !chatId) return;
    
    const text = inputText;
    setInputText('');
    
    try {
      await PermanentChatService.sendMessage(chatId, user.uid, text);
    } catch (error) {
      console.error('Failed to send message', error);
      // rollback UI or show error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return <Loader fullScreen size={48} />;
  }

  // Mock messages if empty for UI dev
  const displayMessages = messages.length > 0 ? messages : [
    {
      id: 'm1', chatId: 'mock', senderId: 'friend', text: 'Hey! Did you see the new designs for the Bondly dashboard? I think the violet accents really pop. ✨', timestamp: Date.now() - 300000, readBy: ['me']
    },
    {
      id: 'm2', chatId: 'mock', senderId: user?.uid || 'me', text: 'I just saw them! The "Sophisticated Playfulness" vibe is exactly what we needed. Feels very Apple-esque but warmer.', timestamp: Date.now() - 200000, readBy: ['me', 'friend']
    }
  ] as PermanentMessage[];

  return (
    <div className="bg-background text-on-surface font-body-md h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-surface/80 backdrop-blur-xl z-50 shadow-[0_4px_20px_rgba(109,94,247,0.08)] border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200">
            <ArrowLeft className="text-primary" size={24} />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/friends/${chatId}`)}>
            <div className="relative">
              <img src={friendProfile?.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10" />
              {friendProfile?.onlineStatus === 'online' && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></div>
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold font-['Outfit'] text-primary leading-tight">{friendProfile?.nickname}</h1>
              <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                {friendProfile?.onlineStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200 text-on-surface-variant">
            <Video size={20} />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200 text-on-surface-variant">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Chat Canvas */}
      <main ref={chatContainerRef} className="flex-grow pt-20 pb-24 overflow-y-auto px-5 space-y-4 max-w-screen-md mx-auto w-full no-scrollbar">
        <div className="flex justify-center my-6">
          <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">
            Today
          </span>
        </div>

        {displayMessages.map((msg) => {
          const isMe = msg.senderId === user?.uid;
          const isRead = msg.readBy.length > 1; // Assuming 2 participants, length > 1 means the other read it
          
          return (
            <div key={msg.id} className={`flex flex-col max-w-[85%] space-y-1 ${isMe ? 'items-end ml-auto' : 'items-start'}`}>
              <div className={`p-4 rounded-xl shadow-sm ${
                isMe 
                  ? 'bg-primary text-on-primary rounded-br-sm' 
                  : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-bl-sm'
              }`}>
                <p className="text-base">{msg.text}</p>
              </div>
              <div className={`flex items-center gap-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                <span className="text-[10px] text-on-surface-variant">{formatTime(msg.timestamp)}</span>
                {isMe && (
                  isRead ? <CheckCheck size={12} className="text-primary" /> : <Check size={12} className="text-outline-variant" />
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Input Area */}
      <footer className="fixed bottom-0 left-0 w-full bg-surface/80 backdrop-blur-xl p-4 z-50 border-t border-outline-variant/30">
        <div className="max-w-screen-md mx-auto flex items-center gap-3">
          <button className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-highest/50 text-primary hover:bg-surface-container-highest transition-all active:scale-90">
            <Plus size={24} />
          </button>
          
          <div className="relative flex-grow">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full py-3 pl-5 pr-12 text-base outline-none transition-all" 
              placeholder="Type a message..." 
              type="text"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
              <Smile size={20} />
            </button>
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 active:scale-90 transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            <Send size={20} className="ml-1" />
          </button>
        </div>
      </footer>
    </div>
  );
};
