

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
}

/**
 * Small stat card for displaying live stats during matching.
 */
export const StatsCard = ({ icon, label, value }: StatsCardProps) => {
  return (
    <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2 shadow-[0_2px_8px_rgba(109,94,247,0.04)]">
      <span className="text-base">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-on-surface truncate">{value}</p>
        <p className="text-[10px] text-on-surface-variant truncate">{label}</p>
      </div>
    </div>
  );
};
