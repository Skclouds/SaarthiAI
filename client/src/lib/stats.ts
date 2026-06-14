import api from './api';
import { getToken } from './auth';
import { AnalyticsResult, OverviewStats } from '@/types/stats';

export const EMPTY_ANALYTICS: AnalyticsResult = {
  avgResponseTimeMs: 0,
  resolutionRate: 0,
  escalationRate: 0,
  csat: 0,
  thumbsUp: 0,
  thumbsDown: 0,
  timeSeries: [],
  kbMetrics: {
    mostReferencedDocuments: [],
    failedQueriesCount: 0,
    unansweredQuestions: [],
  },
};

export async function fetchOverviewStats(): Promise<OverviewStats> {
  const { data } = await api.get<{ stats: OverviewStats }>('/stats/overview');
  return data.stats;
}

export async function fetchAnalytics(from?: string, to?: string): Promise<AnalyticsResult> {
  const params = { from, to };
  const token = getToken();
  const baseURL = api.defaults.baseURL ?? '';
  const requestUrl = `${baseURL}/analytics`;

  try {
    const { data } = await api.get<{ analytics: AnalyticsResult }>('/analytics', { params });
    return data.analytics ?? EMPTY_ANALYTICS;
  } catch (err: unknown) {
    const axiosErr = err as {
      response?: { status?: number; data?: { error?: string } };
      message?: string;
    };
    const status = axiosErr.response?.status ?? 'network';
    const message =
      axiosErr.response?.data?.error ?? axiosErr.message ?? 'Unknown error';

    console.error('[fetchAnalytics] request failed', {
      url: requestUrl,
      params,
      status,
      message,
      hasAuthHeader: Boolean(token),
      authHeaderPreview: token ? `Bearer ${token.slice(0, 12)}…` : null,
    });

    throw err;
  }
}
