'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { isAuthenticated, setAuth } from '@/lib/auth';
import { AuthResponse } from '@/types/auth';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [businessName, setBusinessName] = useState('');
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
      const { data } = await api.post<AuthResponse>('/auth/register', {
        businessName,
        email,
        password,
      });
      setAuth(data.token, data.user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Start your free workspace"
      subtitle="Set up your business and launch AI support in minutes"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-brand-accent hover:text-primary-600 font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="businessName" className="block text-section-title text-navy-700 mb-2">
            Company name
          </label>
          <input
            id="businessName"
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="input-base"
            placeholder="Acme Corp"
          />
        </div>

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
          <label htmlFor="password" className="block text-section-title text-navy-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base"
            placeholder="Min. 8 characters"
          />
        </div>

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating workspace…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
