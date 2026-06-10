'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import ChatWidget from '@/components/chat/ChatWidget';
import SaarthiLogo from '@/components/ui/SaarthiLogo';
import { getUser } from '@/lib/auth';

function ChatDemoContent() {
  const searchParams = useSearchParams();
  const urlBusinessId = searchParams.get('businessId') || '';
  const [businessId, setBusinessId] = useState(urlBusinessId);
  const [customerName, setCustomerName] = useState('Demo User');
  const [customerEmail, setCustomerEmail] = useState('demo@example.com');

  useEffect(() => {
    const user = getUser();
    setBusinessId(urlBusinessId || user?.businessId || '');
    if (user) {
      setCustomerName(user.businessName || 'Demo User');
      setCustomerEmail(user.email || 'demo@example.com');
    }
  }, [urlBusinessId]);

  if (!businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md dashboard-card p-10">
          <div className="flex justify-center mb-5">
            <SaarthiLogo variant="full" size={160} priority />
          </div>
          <h1 className="text-page-title text-navy-900 mb-2">Chat demo</h1>
          <p className="text-body text-navy-500">
            Provide a <code className="text-brand-accent bg-brand-muted px-1.5 py-0.5 rounded">businessId</code> query
            parameter or log in to test the chat widget.
          </p>
          <p className="text-caption text-navy-400 mt-4">
            Example: /chat?businessId=your-business-id
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-brand-muted/20 to-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-deep/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="flex justify-center mb-8">
          <SaarthiLogo variant="full" size={220} priority />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-muted text-caption text-brand-deep font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Live AI assistant demo
          </div>
          <h1 className="text-display text-navy-900 mb-4">Customer support, reimagined</h1>
          <p className="text-body text-navy-500 max-w-xl mx-auto leading-relaxed">
            This page simulates a customer-facing website with the SaarthiAI widget embedded.
            Click the chat bubble to start a conversation.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
          {[
            { title: 'Ask about products', desc: 'Get instant answers from your knowledge base' },
            { title: 'Pricing & policies', desc: 'Accurate responses grounded in your docs' },
            { title: 'Human escalation', desc: 'Seamless handoff when AI needs help' },
          ].map((item) => (
            <div
              key={item.title}
              className="dashboard-card p-6 hover:border-brand-accent/25 hover:shadow-card transition-[border-color,box-shadow] duration-150"
            >
              <SaarthiLogo variant="icon" size={40} rounded="xl" className="mb-4" />
              <p className="text-section-title text-navy-900">{item.title}</p>
              <p className="text-caption text-navy-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <ChatWidget
        businessId={businessId}
        customerName={customerName}
        customerEmail={customerEmail}
      />
    </div>
  );
}

export default function ChatDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChatDemoContent />
    </Suspense>
  );
}
