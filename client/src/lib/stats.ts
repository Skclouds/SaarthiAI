import api from './api';
import { AnalyticsResult, OverviewStats } from '@/types/stats';

export async function fetchOverviewStats(): Promise<OverviewStats> {
  const { data } = await api.get<{ stats: OverviewStats }>('/stats/overview');
  return data.stats;
}

export async function fetchAnalytics(from?: string, to?: string): Promise<AnalyticsResult> {
  const { data } = await api.get<{ analytics: AnalyticsResult }>('/analytics', {
    params: { from, to },
  });
  return data.analytics;
}
