'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export const slidePanel = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
};

const instant = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
};

export const springTransition = { type: 'spring' as const, stiffness: 380, damping: 32 };
export const smoothTransition = { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const };

export function useMotionProps<T extends { initial?: object; animate?: object; exit?: object }>(
  props: T,
): T {
  const reduced = usePrefersReducedMotion();
  if (!reduced) return props;
  return { ...props, initial: instant.initial, animate: instant.animate, exit: instant.exit };
}

interface MotionDivProps {
  variant?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slidePanel';
  delay?: number;
  className?: string;
  children?: React.ReactNode;
}

export function MotionDiv({ children, className }: MotionDivProps) {
  return <div className={className}>{children}</div>;
}

/** Instant page shell — no enter animation so navigation feels immediate. */
export function MotionPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function MotionOverlay({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-navy-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

export function MotionModal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, scale: 0.98, y: 8 }}
      transition={springTransition}
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { motion, AnimatePresence };
