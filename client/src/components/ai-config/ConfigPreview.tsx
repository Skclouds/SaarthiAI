'use client';

import { Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { BotConfig } from '@/types/bot-config';
import { cn } from '@/lib/cn';

interface ConfigPreviewProps {
  config: Omit<BotConfig, 'updatedAt'>;
}

const PERSONALITY_COLORS = {
  Professional: 'bg-navy-100 text-navy-700',
  Friendly: 'bg-success-50 text-success-700',
  Technical: 'bg-brand-muted text-brand-deep',
};

export default function ConfigPreview({ config }: ConfigPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="dashboard-card overflow-hidden sticky top-24"
    >
      <div className="px-5 py-4 border-b border-border-muted bg-gradient-to-r from-brand-muted/50 to-transparent flex items-center justify-between">
        <p className="text-section-title text-navy-700">Live preview</p>
        <span className="flex items-center gap-1 text-caption text-brand-accent font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Real-time
        </span>
      </div>

      <div className="p-5">
        <div className="rounded-2xl border border-border/80 overflow-hidden shadow-card max-w-sm mx-auto">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-brand-deep to-brand-accent" />
            <div className="relative flex items-center gap-3 px-4 py-3.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-body">{config.botName || 'Saarthi AI'}</p>
                <p className="text-caption text-white/70">Online · AI assistant</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-b from-background to-surface-muted/40 space-y-3 min-h-[220px]">
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-muted flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-brand-accent" />
              </div>
              <div className="bg-surface rounded-2xl rounded-tl-md px-3.5 py-2.5 text-caption text-navy-700 border border-border/60 shadow-soft max-w-[85%] leading-relaxed">
                {config.welcomeMessage || 'Hello! How can I help you today?'}
              </div>
            </div>

            {config.suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pl-9">
                {config.suggestedQuestions.slice(0, 3).map((q) => (
                  <span
                    key={q}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-brand-muted/60 border border-brand-accent/15 text-brand-deep font-medium"
                  >
                    {q}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="px-3 py-2.5 border-t border-border-muted bg-surface flex gap-2">
            <div className="flex-1 h-9 rounded-xl bg-background border border-border" />
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-deep to-brand-accent flex items-center justify-center">
              <div className="w-3 h-3 border-r-2 border-t-2 border-white rotate-45 translate-x-[-1px]" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="text-caption text-navy-500">Personality</span>
          <span
            className={cn(
              'text-caption px-2.5 py-1 rounded-full font-medium',
              PERSONALITY_COLORS[config.personality],
            )}
          >
            {config.personality}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
