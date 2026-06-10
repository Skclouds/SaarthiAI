'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getToken } from '@/lib/auth';
import { fetchNotifications } from '@/lib/notifications';
import { Notification } from '@/types/notification';

const POLL_INTERVAL_MS = 15_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchingRef = useRef(false);

  const refresh = useCallback(async (silent = true) => {
    if (!getToken()) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (!silent) setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      if (!silent) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const startPolling = () => {
      refresh(true);
      intervalRef.current = setInterval(() => {
        if (getToken()) {
          refresh(true);
        }
      }, POLL_INTERVAL_MS);
    };

    if (typeof requestIdleCallback !== 'undefined') {
      const idleId = requestIdleCallback(startPolling, { timeout: 2000 });
      return () => {
        cancelIdleCallback(idleId);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    const timeoutId = setTimeout(startPolling, 100);
    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const setLocalRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const setLocalAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    setLocalRead,
    setLocalAllRead,
  };
}
