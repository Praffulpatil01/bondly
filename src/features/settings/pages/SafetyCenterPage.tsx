import { useNavigate } from 'react-router';
import { ArrowLeft, ShieldCheck, AlertTriangle, Eye, UserX, Flag, Lock } from 'lucide-react';

const SafetyCard = ({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: () => void }) => (
  <div
    onClick={action}
    className={`p-5 bg-white rounded-2xl border border-[#c7c4d2]/20 shadow-[0_2px_12px_rgba(84,66,221,0.04)] space-y-2 ${action ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''}`}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#e4dfff]/60 flex items-center justify-center text-[#5442dd]">
        {icon}
      </div>
      <h3 className="font-bold font-['Outfit'] text-[#1b1b24]">{title}</h3>
    </div>
    <p className="text-sm text-[#787586] leading-relaxed">{description}</p>
  </div>
);

export const SafetyCenterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#fcf8ff] text-[#1b1b24] min-h-screen pb-24">
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-5 h-16 bg-white/85 backdrop-blur-xl shadow-[0_2px_20px_rgba(84,66,221,0.06)] z-50 border-b border-[#c7c4d2]/20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#e4dfff]/50 text-[#5442dd] active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold font-['Outfit'] text-[#5442dd]">Safety Center</h1>
        <div className="w-10" />
      </header>

      <main className="pt-24 px-5 max-w-2xl mx-auto space-y-6">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-[#5442dd] to-[#7c6ef0] rounded-2xl p-6 text-white flex items-center gap-4">
          <ShieldCheck size={40} className="flex-shrink-0" />
          <div>
            <h2 className="font-bold text-lg font-['Outfit']">Your safety matters</h2>
            <p className="text-sm text-white/80 mt-1">Ryple is committed to creating a safe and respectful community for everyone.</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#5442dd] uppercase tracking-wider px-1">What you can do</h3>

          <SafetyCard
            icon={<UserX size={18} />}
            title="Block Someone"
            description="Blocking a user prevents them from messaging you or seeing your profile. You can manage blocked users in Settings → Connections."
            action={() => navigate('/settings/blocked-users')}
          />
          <SafetyCard
            icon={<Flag size={18} />}
            title="Report Harmful Behavior"
            description="If someone is harassing, threatening, or violating community standards, report them during or after a chat using the ⋮ menu."
          />
          <SafetyCard
            icon={<Eye size={18} />}
            title="Manage Your Visibility"
            description="Control who can see your profile, online status, and last seen. Adjust your Privacy settings anytime."
            action={() => navigate('/settings/privacy')}
          />
          <SafetyCard
            icon={<AlertTriangle size={18} />}
            title="Recognize Warning Signs"
            description="Be cautious of users who ask for personal information, money, or try to move the conversation off-platform quickly."
          />
          <SafetyCard
            icon={<Lock size={18} />}
            title="End-to-End Privacy"
            description="Your anonymous chats are never stored after the session ends. Permanent chats are only visible to you and your friend."
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            In case of immediate danger, always contact local emergency services (911 or your local equivalent).
          </p>
        </div>
      </main>
    </div>
  );
};

export default SafetyCenterPage;
