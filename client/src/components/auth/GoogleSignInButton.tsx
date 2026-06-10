'use client';

import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';
import { AuthResponse } from '@/types/auth';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post<AuthResponse>('/auth/google', {
        credential: response.credential,
      });
      setAuth(data.token, data.user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Google sign-in failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-3 text-body text-navy-500">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          Signing in with Google…
        </div>
      ) : (
        <div className="flex justify-center w-full overflow-hidden rounded-xl [&>div]:!w-full [&_iframe]:!w-full">
          <GoogleLogin
            text="continue_with"
            theme="outline"
            size="large"
            shape="rectangular"
            width={400}
            onSuccess={handleSuccess}
            onError={() => setError('Google sign-in was cancelled or failed.')}
          />
        </div>
      )}
      {error && (
        <p className="text-caption text-danger-600 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
