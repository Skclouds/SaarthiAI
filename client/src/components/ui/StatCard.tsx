'use client';

import { LucideIcon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useCountUp } from '@/hooks/useCountUp';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type StatVariant = 'accent' | 'navy' | 'success' | 'warning' | 'danger';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: StatVariant;
  animate?: boolean;
  loading?: boolean;
  trend?: string;
  index?: number;
}

const VARIANT_STYLES: Record<StatVariant, { iconBg: string; iconColor: string; valueColor: string; accent: string }> = {
  accent: {
    iconBg: 'bg-brand-muted',
    iconColor: 'text-brand-accent',
    valueColor: 'text-navy-900',
    accent: 'from-brand-accent/10 to-transparent',
  },
  navy: {
    iconBg: 'bg-navy-100',
    iconColor: 'text-navy-700',
    valueColor: 'text-navy-900',
    accent: 'from-navy-200/50 to-transparent',
  },
  success: {
    iconBg: 'bg-success-50',
    iconColor: 'text-success-600',
    valueColor: 'text-success-700',
    accent: 'from-success-500/10 to-transparent',
  },
  warning: {
    iconBg: 'bg-warning-50',
    iconColor: 'text-warning-600',
    valueColor: 'text-warning-700',
    accent: 'from-warning-500/10 to-transparent',
  },
  danger: {
    iconBg: 'bg-danger-50',
    iconColor: 'text-danger-600',
    valueColor: 'text-danger-700',
    accent: 'from-danger-500/10 to-transparent',
  },
};

function parseNumericValue(value: string | number) {
  if (typeof value === 'number') return { numeric: value, suffix: '', prefix: '' };
  const match = value.match(/^([^0-9-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], numeric: parseFloat(match[2]), suffix: match[3] };
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'accent',
  animate = true,
  loading = false,
  trend,
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];
  const reduced = usePrefersReducedMotion();
  const parsed = parseNumericValue(value);
  const count = useCountUp(parsed?.numeric ?? 0, {
    enabled: animate && !loading && parsed !== null && !reduced,
    duration: 400,
  });

  const displayValue = (() => {
    if (loading || value === '—') return '—';
    if (!animate || !parsed) return value;
    const formatted = parsed.suffix === '%' ? count.toString() : count.toLocaleString();
    return `${parsed.prefix}${formatted}${parsed.suffix}`;
  })();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      whileHover={reduced ? undefined : { opacity: 0.95 }}
      className={cn(
        'dashboard-card relative overflow-hidden p-6 group',
        'hover:border-brand-accent/20 transition-colors duration-150',
        'transform-gpu',
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', styles.accent)} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <span className="text-caption font-medium text-navy-500 uppercase tracking-wide">{label}</span>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', styles.iconBg)}>
            <Icon className={cn('w-5 h-5', styles.iconColor)} aria-hidden />
          </div>
        </div>
        <p className={cn('text-3xl font-semibold tracking-tight tabular-nums', styles.valueColor)}>
          {displayValue}
        </p>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-caption text-success-600">
            <TrendingUp className="w-3.5 h-3.5" />
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}
