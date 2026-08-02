import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, ArrowRight, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { AuthLayout } from '../components/AuthLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { AuthService } from '@/firebase/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GOOGLE_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2vrO2bRT6QGvuuV8EtPtssblvaWFz1pCNB9JuYuvYoU3gR-b8Bqj3nVGiKdEuSu92IEADqpB6DdW9nii-AEeXMum5qa1Lcu_RWhJpej08ze7Y68DhwPkZSvuMDM-oVCgKuOvCqLJZK3Hp0t6FJMg6WdGUsKy-q1m2Vsmg8oZkBTC_t2VP14qfYjfge6d7EbMXsIxn9UYdJ-_Q4KfLk0IUawsuRE4Io1BqFohwxEPdbCGYpwBhRE18Yg';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      await AuthService.login(data.email, data.password);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await AuthService.loginWithGoogle();
      toast.success('Successfully logged in with Google!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      try {
        await AuthService.login('demo@bondly.app', 'password123');
      } catch (err: any) {
        console.log('Demo account login failed, attempting signup...', err);
        if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
           console.warn('Firebase API key not configured. Using Local Demo Session mode.');
        } else {
          try {
            await AuthService.signup('demo@bondly.app', 'password123', 'Demo User');
          } catch (signupErr) {
             console.warn('Firebase signup error, falling back to local demo user:', signupErr);
          }
        }
      }
      
      // Store local demo profile so pages accept the dev user even if Firebase fails
      localStorage.setItem('bondly_demo_user', JSON.stringify({
        uid: 'demo-user-123',
        email: 'demo@bondly.app',
        nickname: 'Alex',
        interests: ['Music', 'Gaming', 'Technology'],
        language: 'English',
        completedOnboarding: true
      }));

      toast.success('Successfully logged in with Demo Account!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Demo Login Error:', error);
      toast.error(error?.message || 'Failed to login with Demo Account.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthLayout>
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(109,94,247,0.08)] mb-4 transition-transform hover:scale-105">
          <Users className="text-white" size={40} />
        </div>
        <h1 className="text-3xl font-bold font-['Outfit'] text-on-surface tracking-tight">
          Welcome to Bondly
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm">
          Connect, share, and grow together.
        </p>
      </div>

      {/* Auth Card */}
      <Card className="w-full">
        <CardContent className="pt-8">
          {/* Social Auth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 mb-6 rounded-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <img alt="Google Logo" className="w-5 h-5" src={GOOGLE_LOGO} />
            Continue with Google
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-widest">
              or
            </span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="px-1 text-xs">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                icon={<Mail size={20} />}
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-error text-xs px-1 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between px-1">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline transition-all">
                  Forgot?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={20} />}
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-error text-xs px-1 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-14 mt-6 rounded-full gap-2 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
            
            {/* DEMO LOGIN - DEVELOPMENT ONLY */}
            {import.meta.env.DEV && (
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 mt-3 rounded-full gap-2 text-base border-primary text-primary hover:bg-primary-container"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Demo Login (Dev Only)
              </Button>
            )}
          </form>

          {/* Toggle link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline focus:outline-none transition-all ml-1">
                Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};
