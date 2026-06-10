'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Zap } from 'lucide-react';
import { MotionDiv } from '@/components/ui/motion';
import SaarthiLogo from '@/components/ui/SaarthiLogo';

interface AuthSplitLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const TRUST_ITEMS = [
  { icon: Sparkles, label: 'AI-powered responses' },
  { icon: Shield, label: 'Enterprise-grade security' },
  { icon: Zap, label: 'Deploy in minutes' },
];

export default function AuthSplitLayout({ title, subtitle, children, footer }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Hero panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 bg-mesh-auth" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-deep/80 via-navy-900 to-navy-900" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <MotionDiv delay={0}>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <SaarthiLogo variant="icon" size={44} rounded="2xl" className="shadow-glow" priority />
              <div>
                <p className="font-semibold text-lg tracking-tight">Saarthi AI</p>
                <p className="text-sm text-white/60">Customer support, reimagined</p>
              </div>
            </Link>
          </MotionDiv>

          <div className="space-y-8 max-w-lg">
            <MotionDiv delay={0.1}>
              <h1 className="text-display text-white leading-tight">
                Support that scales with your business
              </h1>
              <p className="text-lg text-white/70 mt-4 leading-relaxed">
                Train an AI on your knowledge base, embed a chat widget anywhere, and resolve
                tickets — all from one premium dashboard.
              </p>
            </MotionDiv>

            <MotionDiv delay={0.2} className="space-y-4">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
                    <Icon className="w-5 h-5 text-brand-light" />
                  </div>
                  <span className="text-white/80 font-medium">{label}</span>
                </div>
              ))}
            </MotionDiv>
          </div>

          <MotionDiv delay={0.3}>
            <div className="glass-panel !bg-white/5 !border-white/10 rounded-2xl p-5 max-w-md">
              <p className="text-sm text-white/90 leading-relaxed">
                &ldquo;Saarthi AI reduced our first-response time by 80% while keeping every answer
                grounded in our docs.&rdquo;
              </p>
              <p className="text-xs text-white/50 mt-3">— Support teams using AI-first workflows</p>
            </div>
          </MotionDiv>
        </div>

        {/* Decorative orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-accent/20 blur-3xl pointer-events-none motion-safe:animate-float motion-reduce:animate-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-brand-deep/30 blur-3xl pointer-events-none" />
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <MotionDiv variant="fadeUp" className="w-full max-w-[420px]">
          <div className="flex justify-center mb-8">
            <SaarthiLogo variant="full" size={200} priority />
          </div>

          <div className="mb-8">
            <h2 className="text-page-title text-navy-900">{title}</h2>
            <p className="text-body text-navy-500 mt-2">{subtitle}</p>
          </div>

          <div className="dashboard-card p-8 shadow-card">{children}</div>

          {footer && (
            <p className="text-center mt-8 text-body text-navy-500">{footer}</p>
          )}
        </MotionDiv>
      </div>
    </div>
  );
}
