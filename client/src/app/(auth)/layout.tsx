'use client';

import GoogleAuthProvider from '@/components/auth/GoogleAuthProvider';
import { ToastProvider } from '@/components/ui/Toast';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoogleAuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </GoogleAuthProvider>
  );
}
