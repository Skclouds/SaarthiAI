'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import GoogleIcon from '@/components/auth/GoogleIcon';
import { useGoogleGsiScript } from '@/hooks/useGoogleGsiScript';
import api from '@/lib/api';
import { setAuth } from '@/lib/auth';
import { AuthResponse } from '@/types/auth';
import { cn } from '@/lib/cn';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const buttonClassName = cn(
  'w-full flex items-center justify-center gap-2.5',
  'px-4 py-3 rounded-xl border border-border bg-surface',
  'text-body font-medium text-navy-800',
  'transition-all duration-200',
  'hover:bg-surface-muted hover:border-navy-200 hover:shadow-soft',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 focus-visible:border-brand-accent',
  'disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none',
);

function GoogleSignInButtonImpl() {
  const router = useRouter();
  const scriptReady = useGoogleGsiScript();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gsiReady, setGsiReady] = useState(false);

  const visibleButtonRef = useRef<HTMLButtonElement>(null);
  const hiddenGoogleRef = useRef<HTMLDivElement>(null);

  const handleCredential = useCallback(
    async (credential: string) => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.post<AuthResponse>('/auth/google', { credential });
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
    },
    [router],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !scriptReady) return;

    const gsi = window.google?.accounts?.id;
    if (!gsi) return;

    gsi.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (credentialResponse) => {
        if (!credentialResponse?.credential) {
          setError('Google sign-in was cancelled or failed.');
          return;
        }
        handleCredential(credentialResponse.credential);
      },
    });
  }, [scriptReady, handleCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !scriptReady || !hiddenGoogleRef.current) return;

    const gsi = window.google?.accounts?.id;
    if (!gsi) return;

    const container = visibleButtonRef.current;
    const hidden = hiddenGoogleRef.current;
    if (!container || !hidden) return;

    const renderHiddenButton = () => {
      const width = Math.max(Math.round(container.getBoundingClientRect().width), 280);
      hidden.innerHTML = '';
      gsi.renderButton(hidden, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width,
      });
      setGsiReady(true);
    };

    renderHiddenButton();

    const observer = new ResizeObserver(renderHiddenButton);
    observer.observe(container);

    return () => observer.disconnect();
  }, [scriptReady]);

  const handleClick = () => {
    if (loading || !gsiReady) return;
    setError('');
    const googleBtn = hiddenGoogleRef.current?.querySelector('[role="button"]') as HTMLElement | null;
    googleBtn?.click();
  };

  return (
    <div className="relative w-full space-y-2">
      <button
        ref={visibleButtonRef}
        type="button"
        onClick={handleClick}
        disabled={loading || !gsiReady}
        className={buttonClassName}
        aria-label="Continue with Google"
      >
        {loading ? (
          <>
            <Loader2 className="w-[18px] h-[18px] animate-spin text-navy-500" aria-hidden />
            <span>Signing in with Google…</span>
          </>
        ) : (
          <>
            <GoogleIcon className="shrink-0" />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div
        ref={hiddenGoogleRef}
        className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none"
        aria-hidden
      />

      {error && (
        <p className="text-caption text-danger-600 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function GoogleSignInButton() {
  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return <GoogleSignInButtonImpl />;
}
