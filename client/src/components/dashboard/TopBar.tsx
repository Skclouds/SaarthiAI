'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Menu, Search } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { clearAuth, getUser } from '@/lib/auth';
import { cn } from '@/lib/cn';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  const initials = user?.businessName
    ?.split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'SA';

  return (
    <header className="h-16 glass-nav flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className={cn(
            'lg:hidden p-2 rounded-xl text-navy-500 hover:bg-surface-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
          )}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" aria-hidden />
            <input
              type="search"
              placeholder="Search dashboard…"
              aria-label="Search dashboard"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border/80 bg-surface-muted/50 text-body text-navy-700 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:bg-surface transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell />

        <div className="hidden sm:block text-right min-w-0 max-w-[160px]">
          <p className="text-body font-medium text-navy-900 truncate">{user?.businessName}</p>
          <p className="text-caption text-navy-400 truncate">{user?.email}</p>
        </div>

        <div
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-deep to-brand-accent text-white text-caption font-semibold flex items-center justify-center shadow-soft"
          aria-hidden
        >
          {initials}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-body font-medium text-navy-600',
            'hover:text-navy-900 hover:bg-surface-muted rounded-xl transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
          )}
        >
          <LogOut className="w-4 h-4" aria-hidden />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
