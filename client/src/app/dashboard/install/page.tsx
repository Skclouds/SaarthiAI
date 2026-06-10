'use client';

import { useEffect, useState } from 'react';
import { Check, Code, Copy } from 'lucide-react';
import { getUser } from '@/lib/auth';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { MotionPage } from '@/components/ui/motion';

const PLACEHOLDER_SNIPPET = `<script
  src="https://YOUR_DOMAIN/widget.js"
  data-business-id="YOUR_BUSINESS_ID"
  data-api-url="http://localhost:5000"
></script>`;

function buildSnippet(widgetOrigin: string, businessId: string, apiUrl: string): string {
  return `<script
  src="${widgetOrigin}/widget.js"
  data-business-id="${businessId}"
  data-api-url="${apiUrl}"
></script>`;
}

export default function InstallPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const toast = useToast();
  const [snippet, setSnippet] = useState(PLACEHOLDER_SNIPPET);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = getUser();
    const businessId = user?.businessId ?? 'YOUR_BUSINESS_ID';
    const widgetOrigin = window.location.origin;
    setSnippet(buildSnippet(widgetOrigin, businessId, apiUrl));
  }, [apiUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success('Snippet copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MotionPage className="dashboard-page max-w-3xl">
      <PageHeader
        icon={Code}
        title="Install widget"
        description="Embed the SaarthiAI chat on any website with a single script tag."
      />

      <div className="dashboard-card p-6 space-y-6">
        <div>
          <h2 className="text-section-title text-foreground mb-2">How to embed</h2>
          <p className="text-body text-slate-600">
            Paste this snippet before the closing{' '}
            <code className="text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded text-caption">
              &lt;/body&gt;
            </code>{' '}
            tag on any HTML page. No React or build tools required on the host site.
          </p>
        </div>

        <div className="relative">
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-sm overflow-x-auto leading-relaxed shadow-soft">
            <code>{snippet}</code>
          </pre>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            className={cn(
              'absolute top-3 right-3 bg-slate-700 text-white border-slate-600',
              'hover:bg-slate-600 hover:text-white',
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy
              </>
            )}
          </Button>
        </div>

        <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 text-body text-primary-900 space-y-2">
          <p>
            <strong className="font-medium">data-business-id</strong> — your unique business identifier (pre-filled above).
          </p>
          <p>
            <strong className="font-medium">data-api-url</strong> — your SaarthiAI API URL ({apiUrl}).
          </p>
          <p className="text-primary-700 text-caption">
            In production, set <code className="bg-primary-100/60 px-1 rounded">NEXT_PUBLIC_API_URL</code> on Vercel to your Render API URL.
          </p>
        </div>
      </div>
    </MotionPage>
  );
}
