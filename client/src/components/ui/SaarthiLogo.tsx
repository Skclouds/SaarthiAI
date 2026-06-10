import Image from 'next/image';
import { cn } from '@/lib/cn';

const ALT = 'SaarthiAI logo';

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
      <Image
        src="/logo.png"
        alt={ALT}
        width={width}
        height={Math.round(width * 1.12)}
        className={cn('h-auto max-w-full', className)}
        style={{ width }}
        priority={priority}
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
      <Image
        src="/logo.png"
        alt={ALT}
        fill
        sizes={`${iconSize}px`}
        className="object-cover"
        style={{ objectPosition: '50% 8%' }}
        priority={priority}
      />
    </div>
  );
}
