'use client';

import { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { submitChatFeedback } from '@/lib/chat';
import { cn } from '@/lib/cn';

type FeedbackState = 'idle' | 'UP' | 'DOWN' | 'thanks';

interface MessageFeedbackProps {
  messageId: string;
  className?: string;
}

export default function MessageFeedback({ messageId, className }: MessageFeedbackProps) {
  const [state, setState] = useState<FeedbackState>('idle');
  const [submitting, setSubmitting] = useState(false);

  const isLocked = state === 'thanks' || state === 'UP' || state === 'DOWN';

  const handleRate = async (rating: 'UP' | 'DOWN') => {
    if (isLocked || submitting) return;
    setSubmitting(true);
    try {
      await submitChatFeedback(messageId, rating);
      setState('thanks');
    } catch {
      setState('idle');
    } finally {
      setSubmitting(false);
    }
  };

  if (state === 'thanks') {
    return (
      <p className={cn('text-caption text-navy-400 mt-2.5', className)}>
        Thanks for your feedback
      </p>
    );
  }

  return (
    <div className={cn('flex items-center gap-1.5 mt-2.5', className)}>
      <button
        type="button"
        onClick={() => handleRate('UP')}
        disabled={submitting || isLocked}
        aria-label="Helpful answer"
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          state === 'UP'
            ? 'bg-success-50 text-success-600'
            : 'text-navy-400 hover:bg-brand-muted hover:text-brand-accent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40',
          'disabled:opacity-50',
        )}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => handleRate('DOWN')}
        disabled={submitting || isLocked}
        aria-label="Not helpful"
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          state === 'DOWN'
            ? 'bg-danger-50 text-danger-600'
            : 'text-navy-400 hover:bg-brand-muted hover:text-navy-600',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40',
          'disabled:opacity-50',
        )}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
