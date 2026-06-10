'use client';

import { useEffect, useState } from 'react';

type ClientDateFormat = 'date' | 'datetime';

interface ClientDateProps {
  iso: string;
  format?: ClientDateFormat;
  className?: string;
}

/** Stable placeholder on server/first paint; formatted date after mount. */
export default function ClientDate({ iso, format = 'date', className }: ClientDateProps) {
  const [label, setLabel] = useState('\u00a0');

  useEffect(() => {
    const date = new Date(iso);
    if (format === 'datetime') {
      setLabel(
        date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    } else {
      setLabel(
        date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      );
    }
  }, [iso, format]);

  return <span className={className}>{label}</span>;
}
