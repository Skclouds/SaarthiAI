import { LucideIcon } from 'lucide-react';
import { MotionDiv } from '@/components/ui/motion';
import { cn } from '@/lib/cn';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <MotionDiv
      variant="fadeIn"
      className={cn(
        'dashboard-card flex flex-col items-center justify-center text-center px-8 py-16',
        className,
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-muted flex items-center justify-center mb-5 shadow-soft">
          <Icon className="w-7 h-7 text-brand-accent" aria-hidden />
        </div>
      )}
      <p className="text-section-title text-navy-900">{title}</p>
      {description && (
        <p className="text-body text-navy-500 mt-2 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </MotionDiv>
  );
}
