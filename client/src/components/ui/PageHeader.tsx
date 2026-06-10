'use client';

import { LucideIcon } from 'lucide-react';
import { MotionDiv } from '@/components/ui/motion';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <MotionDiv className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8', className)}>
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-muted flex items-center justify-center shrink-0 shadow-soft">
            <Icon className="w-6 h-6 text-brand-accent" aria-hidden />
          </div>
          <div>
            <h1 className="text-page-title text-navy-900">{title}</h1>
            {description && (
              <p className="text-body text-navy-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
    </MotionDiv>
  );
}
