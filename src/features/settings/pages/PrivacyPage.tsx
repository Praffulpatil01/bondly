import { useNavigate } from 'react-router';
import { ArrowLeft, Eye, MessageCircle, Users, Globe, Clock } from 'lucide-react';
import { useState } from 'react';

interface ToggleRowProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  enabled: boolean;
  onToggle: () => void;
}

const ToggleRow = ({ label, description, icon, iconBg, enabled, onToggle }: ToggleRowProps) => (
  <div className="flex items-center justify-between p-4 hover:bg-[#f6f2ff]/60 transition-colors cursor-pointer" onClick={onToggle}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-base font-medium text-[#1b1b24]">{label}</p>
        <p className="text-xs text-[#787586] mt-0.5">{description}</p>
      </div>
    </div>
    <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 flex-shrink-0 ${enabled ? 'bg-[#5442dd]' : 'bg-[#c7c4d2]'}`}>
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  </div>
);

export const PrivacyPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    allowMessagesFromStrangers: false,
    showProfileToMatches: true,
    publicProfile: false,
    showLastSeen: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-[#fcf8ff] text-[#1b1b24] min-h-screen pb-24">
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-white/85 backdrop-blur-xl shadow-[0_2px_20px_rgba(84,66,221,0.06)] z-50 border-b border-[#c7c4d2]/20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e4dfff]/50 text-[#5442dd] active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold font-['Outfit'] text-[#5442dd]">Privacy & Visibility</h1>
        <div className="w-10" />
      </header>

      <main className="pt-24 px-5 max-w-2xl mx-auto space-y-6">
        <p className="text-sm text-[#787586] px-1">Control who can see your information and interact with you.</p>

        <div className="bg-white rounded-2xl overflow-hidden border border-[#c7c4d2]/20 shadow-[0_4px_20px_rgba(84,66,221,0.04)] divide-y divide-[#c7c4d2]/10">
          <ToggleRow
            label="Show Online Status"
            description="Let friends see when you're active"
            icon={<Eye size={18} className="text-purple-600" />}
            iconBg="bg-purple-50"
            enabled={settings.showOnlineStatus}
            onToggle={() => toggle('showOnlineStatus')}
          />
          <ToggleRow
            label="Messages from Strangers"
            description="Allow non-friends to message you"
            icon={<MessageCircle size={18} className="text-blue-600" />}
            iconBg="bg-blue-50"
            enabled={settings.allowMessagesFromStrangers}
            onToggle={() => toggle('allowMessagesFromStrangers')}
          />
          <ToggleRow
            label="Show Profile to Matches"
            description="Display profile during anonymous chats"
            icon={<Users size={18} className="text-indigo-600" />}
            iconBg="bg-indigo-50"
            enabled={settings.showProfileToMatches}
            onToggle={() => toggle('showProfileToMatches')}
          />
          <ToggleRow
            label="Public Profile"
            description="Anyone can find and view your profile"
            icon={<Globe size={18} className="text-green-600" />}
            iconBg="bg-green-50"
            enabled={settings.publicProfile}
            onToggle={() => toggle('publicProfile')}
          />
          <ToggleRow
            label="Show Last Seen"
            description="Display when you were last active"
            icon={<Clock size={18} className="text-orange-600" />}
            iconBg="bg-orange-50"
            enabled={settings.showLastSeen}
            onToggle={() => toggle('showLastSeen')}
          />
        </div>

        <p className="text-xs text-center text-[#a09eb8] px-4">
          These preferences are saved locally. Full cloud sync coming soon.
        </p>
      </main>
    </div>
  );
};

export default PrivacyPage;
