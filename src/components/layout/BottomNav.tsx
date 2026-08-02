import { NavLink } from 'react-router';
import { MessageSquare, Users, Bell, User } from 'lucide-react';
import { NotificationBadge } from '@/features/notifications/components/NotificationBadge';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const navItems = [
    { to: '/dashboard', label: 'Home', icon: MessageSquare },
    { to: '/friends', label: 'Friends', icon: Users },
    { to: '/notifications', label: 'Alerts', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-safe bg-surface/90 backdrop-blur-xl z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(109,94,247,0.08)] border-t border-outline-variant/20">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-200 rounded-xl',
              isActive
                ? 'bg-primary-container text-on-primary-container scale-105'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            )
          }
        >
          {({ isActive }) => {
            const Icon = item.icon;
            return (
              <>
                <div className="relative">
                  <Icon
                    size={24}
                    className={cn(
                      'transition-all duration-200',
                      isActive ? 'fill-current' : 'fill-transparent'
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  {item.to === '/notifications' && <NotificationBadge />}
                </div>
                <span className="text-[11px] font-semibold mt-1 tracking-wide">
                  {item.label}
                </span>
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
};
