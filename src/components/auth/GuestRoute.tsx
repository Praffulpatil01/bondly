import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Sparkles } from 'lucide-react';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute prevents authenticated users from accessing login/register pages.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const demoUser = localStorage.getItem('bondly_demo_user');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (user || demoUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
