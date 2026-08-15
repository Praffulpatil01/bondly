import { useNavigate } from 'react-router';
import { ArrowLeft, MessageCircle, Mail, ExternalLink, Book, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const FAQ = [
  { q: 'How does anonymous matching work?', a: 'Ryple matches you with another user based on your selected "vibe". The chat is fully anonymous — no names, no profiles — until both of you decide to become permanent friends.' },
  { q: 'Can I get my account back after deletion?', a: 'Once your account is deleted, it cannot be recovered. All your data, messages, and friends list are permanently removed within 30 days.' },
  { q: 'How do I report someone?', a: 'During any chat, tap the ⋮ menu in the top right corner and select "Report". You can also report from a friend\'s profile page.' },
  { q: 'Why did my chat session end early?', a: 'Anonymous chats have a time limit set at the start. When time runs out, both users get the chance to add each other as permanent friends before the session closes.' },
  { q: 'How is my data protected?', a: 'Your anonymous chat messages are deleted after each session. Permanent chats are stored securely in Firebase with access restricted to participants only.' },
];

export const HelpSupportPage = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) { toast.error('Please write a message first.'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setMessage('');
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
  };

  return (
    <div className="bg-[#fcf8ff] text-[#1b1b24] min-h-screen pb-24">
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-white/85 backdrop-blur-xl shadow-[0_2px_20px_rgba(84,66,221,0.06)] z-50 border-b border-[#c7c4d2]/20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e4dfff]/50 text-[#5442dd] active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold font-['Outfit'] text-[#5442dd]">Help & Support</h1>
        <div className="w-10" />
      </header>

      <main className="pt-24 px-5 max-w-2xl mx-auto space-y-6">
        {/* Contact options */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#5442dd] uppercase tracking-wider px-1">Contact Us</h3>
          <div className="bg-white rounded-2xl overflow-hidden border border-[#c7c4d2]/20 shadow-[0_4px_20px_rgba(84,66,221,0.04)] divide-y divide-[#c7c4d2]/10">
            <a href="mailto:support@Ryple.app" className="flex items-center justify-between p-4 hover:bg-[#f6f2ff]/60 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-medium text-[#1b1b24]">Email Support</p>
                  <p className="text-xs text-[#787586]">support@Ryple.app</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#c7c4d2] group-hover:text-[#5442dd] transition-colors" />
            </a>
            <a href="https://twitter.com/Rypleapp" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 hover:bg-[#f6f2ff]/60 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 group-hover:scale-105 transition-transform">
                  <ExternalLink size={18} />
                </div>
                <div>
                  <p className="font-medium text-[#1b1b24]">Twitter / X</p>
                  <p className="text-xs text-[#787586]">@Rypleapp</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#c7c4d2] group-hover:text-[#5442dd] transition-colors" />
            </a>
          </div>
        </div>

        {/* Send a message */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#5442dd] uppercase tracking-wider px-1">Send a Message</h3>
          <div className="bg-white rounded-2xl border border-[#c7c4d2]/20 shadow-[0_4px_20px_rgba(84,66,221,0.04)] p-4 space-y-3">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe your issue or question..."
              className="w-full resize-none rounded-xl border border-[#c7c4d2]/40 p-3 text-sm text-[#1b1b24] placeholder-[#a09eb8] focus:outline-none focus:ring-2 focus:ring-[#5442dd]/30 focus:border-[#5442dd]/60 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full h-12 bg-[#5442dd] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#4232c0] active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#5442dd] uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Book size={12} />
            Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#c7c4d2]/20 shadow-[0_2px_8px_rgba(84,66,221,0.04)] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left gap-3"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <span className="font-medium text-sm text-[#1b1b24] leading-snug">{item.q}</span>
                  <ChevronRight
                    size={16}
                    className={`text-[#a09eb8] flex-shrink-0 transition-transform duration-200 ${expanded === i ? 'rotate-90' : ''}`}
                  />
                </button>
                {expanded === i && (
                  <div className="px-4 pb-4">
                    <div className="h-px bg-[#c7c4d2]/20 mb-3" />
                    <p className="text-sm text-[#787586] leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpSupportPage;
