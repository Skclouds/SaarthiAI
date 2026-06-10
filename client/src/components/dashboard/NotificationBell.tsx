'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Bell, CheckCheck, MessageSquare, Ticket } from 'lucide-react';
import { markAllNotificationsRead, markNotificationRead } from '@/lib/notifications';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationType } from '@/types/notification';
import { cn } from '@/lib/cn';

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof MessageSquare; iconClass: string; bgClass: string }
> = {
  NEW_CONVERSATION: {
    icon: MessageSquare,
    iconClass: 'text-brand-accent',
    bgClass: 'bg-brand-muted',
  },
  NEW_TICKET: {
    icon: Ticket,
    iconClass: 'text-warning-600',
    bgClass: 'bg-warning-50',
  },
  ESCALATION: {
    icon: AlertTriangle,
    iconClass: 'text-danger-600',
    bgClass: 'bg-danger-50',
  },
};

export default function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, loading, setLocalRead, setLocalAllRead, refresh } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      refresh(true);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setLocalAllRead();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id);
        setLocalRead(notification.id);
      } catch {
        /* navigate anyway */
      }
    }
    setOpen(false);
    router.push(notification.link);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        className={cn(
          'p-2.5 rounded-xl text-navy-500 hover:bg-surface-muted relative',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
          open && 'bg-surface-muted',
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-border/80 bg-surface shadow-elevated z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-muted bg-surface-muted/40">
            <div>
              <p className="text-body font-semibold text-navy-900">Notifications</p>
              {unreadCount > 0 && (
                <p className="text-caption text-navy-400">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-caption font-medium text-brand-accent hover:text-brand-deep transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-caption text-navy-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                <p className="text-body font-medium text-navy-600">All caught up</p>
                <p className="text-caption text-navy-400 mt-1">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-muted">
                {notifications.map((notification) => {
                  const config = TYPE_CONFIG[notification.type];
                  const Icon = config.icon;
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-muted/60',
                          !notification.read && 'bg-brand-muted/30',
                        )}
                      >
                        <div
                          className={cn(
                            'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                            config.bgClass,
                          )}
                        >
                          <Icon className={cn('w-4 h-4', config.iconClass)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                'text-body truncate',
                                notification.read
                                  ? 'font-medium text-navy-600'
                                  : 'font-semibold text-navy-900',
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-brand-accent mt-1.5" />
                            )}
                          </div>
                          <p className="text-caption text-navy-500 truncate mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-caption text-navy-400 mt-1">
                            {formatRelative(notification.createdAt)}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
