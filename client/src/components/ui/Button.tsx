'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'navy';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-accent text-white hover:bg-primary-600 shadow-soft hover:shadow-glow border border-transparent',
  navy:
    'bg-navy-900 text-white hover:bg-navy-800 border border-transparent shadow-soft',
  secondary:
    'bg-surface text-navy-700 border border-border hover:bg-surface-muted hover:border-navy-200',
  ghost: 'bg-transparent text-navy-600 hover:bg-surface-muted hover:text-navy-900 border border-transparent',
  danger:
    'bg-danger-50 text-danger-700 border border-danger-100 hover:bg-danger-100',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2 text-caption gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-body gap-2 rounded-xl',
  lg: 'px-6 py-3 text-body gap-2 rounded-xl',
};

type MotionButtonProps = ButtonProps & HTMLMotionProps<'button'>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled,
      loading = false,
      children,
      ...props
    },
    ref,
  ) => {
    const reduced = usePrefersReducedMotion();
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        whileTap={reduced || isDisabled ? undefined : { scale: 0.97, opacity: 0.9 }}
        transition={{ duration: 0.1 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:opacity-90 transform-gpu',
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...(props as MotionButtonProps)}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
