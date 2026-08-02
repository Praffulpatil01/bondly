import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, UserPlus, Users, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

import { AuthLayout } from '../components/AuthLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { AuthService } from '@/firebase/auth';

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signupSchema>;

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setIsLoading(true);
      await AuthService.signup(data.email, data.password, data.fullName);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account.');
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
          Create Account
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm">
          Join Bondly and start connecting.
        </p>
      </div>

      {/* Auth Card */}
      <Card className="w-full">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="px-1 text-xs">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Doe"
                icon={<User size={20} />}
                disabled={isLoading}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-error text-xs px-1 mt-1">{errors.fullName.message}</p>
              )}
            </div>

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
              <Label htmlFor="password" className="px-1 text-xs">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                icon={<Lock size={20} />}
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-error text-xs px-1 mt-1">{errors.password.message}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="px-1 text-xs">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                icon={<Lock size={20} />}
                disabled={isLoading}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-error text-xs px-1 mt-1">{errors.confirmPassword.message}</p>
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
                  Create Account
                  <UserPlus size={20} />
                </>
              )}
            </Button>
          </form>

          {/* Toggle link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline focus:outline-none transition-all ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};
