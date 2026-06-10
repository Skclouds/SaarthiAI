'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { SkeletonDashboardShell } from '@/components/ui/Skeleton';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(
    () => typeof window !== 'undefined' && isAuthenticated(),
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <SkeletonDashboardShell />;
  }

  return <>{children}</>;
}
