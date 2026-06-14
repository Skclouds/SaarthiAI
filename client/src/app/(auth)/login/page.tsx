'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AuthDivider from '@/components/auth/AuthDivider';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { isAuthenticated, setAuth } from '@/lib/auth';
import { AuthResponse } from '@/types/auth';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      setAuth(data.token, data.user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; code?: string; message?: string };
      const message =
        axiosErr.response?.data?.error ||
        (axiosErr.code === 'ERR_NETWORK' || !axiosErr.response
          ? 'Unable to reach the server. Ensure the backend is running on port 5000.'
          : 'Login failed. Please try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Sign in to your Saarthi AI workspace"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-accent hover:text-primary-600 font-medium">
            Create one
          </Link>
        </>
      }
    >
      <GoogleSignInButton />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-section-title text-navy-700 mb-2">
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-section-title text-navy-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-caption text-brand-accent hover:text-primary-600">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
