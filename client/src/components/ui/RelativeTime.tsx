'use client';

import { useEffect, useState } from 'react';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

interface RelativeTimeProps {
  iso: string;
  className?: string;
}

/** Stable placeholder on server/first paint; relative label after mount. */
export default function RelativeTime({ iso, className }: RelativeTimeProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatRelativeTime(iso));

    const interval = setInterval(() => {
      setLabel(formatRelativeTime(iso));
    }, 60_000);

    return () => clearInterval(interval);
  }, [iso]);

  return <span className={className}>{label ?? '\u00a0'}</span>;
}
