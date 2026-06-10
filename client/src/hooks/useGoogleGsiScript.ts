'use client';

import { useEffect, useState } from 'react';

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export function useGoogleGsiScript() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setReady(true);
      return;
    }

    const markReady = () => {
      if (window.google?.accounts?.id) {
        setReady(true);
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        markReady();
      } else {
        existing.addEventListener('load', markReady);
        return () => existing.removeEventListener('load', markReady);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      markReady();
    };
    document.head.appendChild(script);
  }, []);

  return ready;
}
