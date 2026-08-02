import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  fullScreen?: boolean;
  className?: string;
  size?: number;
}

export const Loader = ({ fullScreen = false, className, size = 48 }: LoaderProps) => {
  const loaderIcon = <Sparkles className={cn("animate-spin text-primary", className)} size={size} />;
  
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {loaderIcon}
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center p-4">
      {loaderIcon}
    </div>
  );
};
