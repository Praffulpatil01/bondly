import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Settings, Smile, Send, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PermanentChatService } from '../services/permanent-chat.service';
import { PermanentMessage } from '@/firebase/collections';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import { Loader } from '@/components/ui/Loader';
import { AnimatePresence, motion } from 'framer-motion';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';

export const PermanentChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>(); // Using friendshipId as chatId
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<PermanentMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [friendProfile, setFriendProfile] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [friendId, setFriendId] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !chatId) return;

    const loadData = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { collections } = await import('@/firebase/collections');
        
        let friendId: string | undefined = '';
        
        // 1. Check friendship document first
        const friendshipRef = doc(collections.friendships, chatId);
        const friendshipSnap = await getDoc(friendshipRef);
        
        if (friendshipSnap.exists()) {
          const friendship = friendshipSnap.data();
          friendId = friendship.users.find((id: string) => id !== user.uid);
        } else {
          // 2. Fallback to permanentChats if friendship missing
          const chatRef = doc(collections.permanentChats, chatId);
          const chatSnap = await getDoc(chatRef);
          if (chatSnap.exists()) {
            friendId = chatSnap.data().participants.find((id: string) => id !== user.uid);
          }
        }

        if (friendId) {
          // Initialize chat doc if it doesn't exist yet
          await PermanentChatService.getOrInitializeChat(chatId, [user.uid, friendId]);

          // Fetch friend profile with users fallback
          let profileRef = doc(collections.profiles, friendId);
          let profileSnap = await getDoc(profileRef);
          
          if (!profileSnap.exists()) {
            profileRef = doc(collections.users, friendId);
            profileSnap = await getDoc(profileRef);
          }
          
          
          if (profileSnap.exists()) {
            setFriendProfile(profileSnap.data());
            setFriendId(friendId);
          }
        }
      } catch (error) {
        console.error("Error loading chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const unsubscribe = PermanentChatService.subscribeToMessages(
      chatId,
      (msgs) => {
        setMessages(msgs);
        // Auto mark as read
        msgs.forEach(m => {
          const currentReadBy = m.readBy || [];
          if (m.senderId !== user.uid && !currentReadBy.includes(user.uid)) {
            PermanentChatService.markAsRead(chatId, m.id, user.uid, currentReadBy).catch(console.error);
          }
        });
      },
      (error) => console.error(error)
    );

    const unsubscribeChat = onSnapshot(doc(db, 'permanent_chats', chatId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.typing) {
          const isSomeoneTyping = Object.entries(data.typing).some(([uid, typing]) => uid !== user.uid && typing);
          setIsTyping(isSomeoneTyping);
        }
      }
    });

    return () => {
      unsubscribe();
      unsubscribeChat();
    };
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
      PermanentChatService.setTyping(chatId, user.uid, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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

  const displayMessages = messages;

  return (
    <div className="bg-background text-on-surface font-body-md h-screen flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-surface/80 backdrop-blur-xl z-50 shadow-[0_4px_20px_rgba(109,94,247,0.08)] border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50 transition-colors active:scale-95 duration-200">
            <ArrowLeft className="text-primary" size={24} />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => friendId && navigate(`/friends/${friendId}`)}>
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
          const readByArray = msg.readBy || [];
          const isRead = readByArray.length > 1; 
          
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
      <footer className="fixed bottom-0 left-0 w-full z-50 flex flex-col pointer-events-none">
        
        {/* Typing Indicator */}
        <div className="max-w-screen-md mx-auto w-full px-5 pb-2">
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 pointer-events-auto"
              >
                <div className="bg-surface-variant text-on-surface-variant text-xs py-1.5 px-3 rounded-full flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span>{friendProfile?.nickname || 'Someone'} is typing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full bg-surface/80 backdrop-blur-xl p-4 border-t border-outline-variant/30 pointer-events-auto">
          <div className="max-w-screen-md mx-auto flex items-center gap-3">
            <div className="relative flex-grow">
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-4 right-0 z-[100] shadow-2xl rounded-2xl overflow-hidden border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <EmojiPicker 
                  theme={Theme.AUTO}
                  emojiStyle={EmojiStyle.APPLE}
                  onEmojiClick={(emojiData) => {
                    setInputText(prev => prev + emojiData.emoji);
                  }}
                  lazyLoadEmojis
                  width={320}
                  height={400}
                />
              </div>
            )}
            <input 
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (user && chatId) {
                  PermanentChatService.setTyping(chatId, user.uid, true);
                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = setTimeout(() => {
                    PermanentChatService.setTyping(chatId, user.uid, false);
                  }, 2000);
                }
              }}
              onKeyDown={handleKeyPress}
              className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full py-3 pl-5 pr-12 text-base outline-none transition-all" 
              placeholder="Type a message..." 
              type="text"
            />
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${showEmojiPicker ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <Smile size={20} />
            </button>
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 active:scale-90 transition-transform disabled:opacity-50 disabled:active:scale-100 pointer-events-auto"
          >
            <Send size={20} className="ml-1" />
          </button>
        </div>
        </div>
      </footer>
    </div>
  );
};
