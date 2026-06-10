'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import { AuthUser } from '@/types/auth';

/** Returns null on server and on the client's first render; then reads localStorage. */
export function useAuthUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return user;
}
