'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import SaarthiLogo from '@/components/ui/SaarthiLogo';
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  Code,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Ticket,
  AlertTriangle,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const navItems: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/knowledge-base', label: 'Knowledge base', icon: BookOpen },
  { href: '/dashboard/ai-config', label: 'AI settings', icon: Settings },
  { href: '/dashboard/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/dashboard/tickets', label: 'Tickets', icon: Ticket },
  { href: '/dashboard/escalations', label: 'Escalations', icon: AlertTriangle },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/install', label: 'Install widget', icon: Code },
];

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 min-h-dvh h-dvh bg-navy-900 text-white flex flex-col shrink-0',
          'lg:translate-x-0 lg:static lg:z-auto lg:self-stretch lg:min-h-dvh lg:h-auto overflow-hidden',
          'will-change-transform',
          collapsed ? 'w-20' : 'w-[260px]',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('flex items-center h-16 border-b border-white/10', collapsed ? 'justify-center px-2' : 'justify-between px-5')}>
          <div className={cn('flex items-center gap-3 min-w-0', collapsed && 'justify-center')}>
            <SaarthiLogo variant="icon" size={36} rounded="xl" className="shadow-glow" priority />
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">Saarthi AI</p>
                <p className="text-[11px] text-white/50 leading-tight truncate">Support platform</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto overflow-x-hidden" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            const pending = navigatingTo === href;
            return (
              <Link
                key={href}
                href={href}
                prefetch
                onClick={() => setNavigatingTo(href)}
                title={collapsed ? label : undefined}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl text-body font-medium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60',
                  'active:scale-[0.98] active:opacity-90 transition-[transform,opacity,background-color,color] duration-100',
                  collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5',
                  active
                    ? 'bg-brand-accent/20 text-white shadow-soft'
                    : 'text-white/60 hover:bg-white/10 hover:text-white',
                  pending && !active && 'bg-white/5 text-white/80',
                )}
              >
                {pending ? (
                  <Loader2 className="w-[18px] h-[18px] shrink-0 animate-spin text-brand-light" aria-hidden />
                ) : (
                  <Icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-brand-light' : '')} aria-hidden />
                )}
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={cn('border-t border-white/10 p-3', collapsed ? 'flex justify-center' : '')}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'hidden lg:flex items-center gap-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10',
              'active:scale-95 transition-transform duration-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60',
              collapsed ? 'p-3' : 'w-full px-3 py-2.5 text-caption',
            )}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform duration-150', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
