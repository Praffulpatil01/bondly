import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const RULES = [
  { id: 1, emoji: '🤝', title: 'Be Respectful', body: 'Treat every person with kindness and respect. Harassment, hate speech, or bullying of any kind will result in an immediate ban.' },
  { id: 2, emoji: '🔒', title: 'Protect Privacy', body: 'Do not share personal information (addresses, phone numbers, etc.) of yourself or others. Never pressure someone to share personal details.' },
  { id: 3, emoji: '🚫', title: 'No Explicit Content', body: 'Ryple is not a platform for explicit, sexual, or adult content. Any such content will result in permanent removal.' },
  { id: 4, emoji: '✅', title: 'Be Authentic', body: 'Do not impersonate others or create fake personas. Be genuine and honest in your interactions.' },
  { id: 5, emoji: '🛡️', title: 'Report, Don\'t Retaliate', body: 'If someone breaks the rules, use the report feature. Do not engage in retaliatory behavior — let our moderation team handle it.' },
  { id: 6, emoji: '💬', title: 'Constructive Conversations', body: 'Keep discussions healthy and constructive. Disagreements are fine; personal attacks are not.' },
  { id: 7, emoji: '🌍', title: 'No Spam or Promotion', body: 'Do not use Ryple to promote products, services, or external links without consent. Spam accounts will be permanently banned.' },
];

export const GuidelinesPage = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="bg-[#fcf8ff] text-[#1b1b24] min-h-screen pb-24">
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-white/85 backdrop-blur-xl shadow-[0_2px_20px_rgba(84,66,221,0.06)] z-50 border-b border-[#c7c4d2]/20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e4dfff]/50 text-[#5442dd] active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold font-['Outfit'] text-[#5442dd]">Community Guidelines</h1>
        <div className="w-10" />
      </header>

      <main className="pt-24 px-5 max-w-2xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-white">
          <h2 className="font-bold text-xl font-['Outfit']">Our Community Standards</h2>
          <p className="text-sm text-white/85 mt-2 leading-relaxed">
            These guidelines help make Ryple a kind and safe place for genuine connections. By using Ryple, you agree to follow them.
          </p>
        </div>

        <div className="space-y-2">
          {RULES.map(rule => (
            <div
              key={rule.id}
              className="bg-white rounded-2xl border border-[#c7c4d2]/20 shadow-[0_2px_8px_rgba(84,66,221,0.04)] overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpanded(expanded === rule.id ? null : rule.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rule.emoji}</span>
                  <span className="font-semibold font-['Outfit'] text-[#1b1b24]">{rule.title}</span>
                </div>
                {expanded === rule.id
                  ? <ChevronUp size={18} className="text-[#5442dd] flex-shrink-0" />
                  : <ChevronDown size={18} className="text-[#a09eb8] flex-shrink-0" />
                }
              </button>
              {expanded === rule.id && (
                <div className="px-4 pb-4">
                  <div className="h-px bg-[#c7c4d2]/20 mb-3" />
                  <p className="text-sm text-[#787586] leading-relaxed">{rule.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-[#a09eb8] px-4 pb-4">
          Last updated August 2026. Violation of these guidelines may result in account suspension or permanent ban.
        </p>
      </main>
    </div>
  );
};

export default GuidelinesPage;
