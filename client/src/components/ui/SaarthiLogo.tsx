import { LOGO_ALT, LOGO_SRC } from '@/lib/brand';
import { cn } from '@/lib/cn';

type SaarthiLogoVariant = 'full' | 'icon';

interface SaarthiLogoProps {
  variant?: SaarthiLogoVariant;
  /** Display width in px. Height follows aspect ratio for `full`, square for `icon`. */
  size?: number;
  className?: string;
  rounded?: 'none' | 'lg' | 'xl' | '2xl' | 'full';
  priority?: boolean;
}

const ROUNDED: Record<NonNullable<SaarthiLogoProps['rounded']>, string> = {
  none: 'rounded-none',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export default function SaarthiLogo({
  variant = 'full',
  size,
  className,
  rounded = variant === 'icon' ? 'xl' : 'none',
  priority = false,
}: SaarthiLogoProps) {
  if (variant === 'full') {
    const width = size ?? 200;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static public asset; must work without image optimizer
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        width={width}
        height={Math.round(width * 1.12)}
        className={cn('h-auto max-w-full', className)}
        style={{ width }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
      />
    );
  }

  const iconSize = size ?? 36;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-white',
        ROUNDED[rounded],
        className,
      )}
      style={{ width: iconSize, height: iconSize }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public asset */}
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        width={iconSize}
        height={iconSize}
        className="w-full h-full object-cover"
        style={{ objectPosition: '50% 8%' }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
      />
    </div>
  );
}
