'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, BarChart3, BookOpen, Bot, ThumbsUp } from 'lucide-react';
import { EMPTY_ANALYTICS, fetchAnalytics } from '@/lib/stats';
import { AnalyticsResult } from '@/types/stats';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton, SkeletonStatGrid } from '@/components/ui/Skeleton';
import { MotionPage } from '@/components/ui/motion';
import { defaultAnalyticsFromDate, localDateString } from '@/lib/formatRelativeTime';
import RelativeTime from '@/components/ui/RelativeTime';

function hasAnalyticsData(data: AnalyticsResult): boolean {
  return (
    data.timeSeries.length > 0 ||
    data.kbMetrics.mostReferencedDocuments.length > 0 ||
    data.kbMetrics.failedQueriesCount > 0 ||
    data.kbMetrics.unansweredQuestions.length > 0 ||
    data.thumbsUp + data.thumbsDown > 0
  );
}

export default function AnalyticsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsResult>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [partialLoad, setPartialLoad] = useState(false);

  useEffect(() => {
    setFrom(defaultAnalyticsFromDate());
    setTo(localDateString());
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!from || !to) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setLoadError(null);
    setPartialLoad(false);

    try {
      const data = await fetchAnalytics(from, to);
      setAnalytics(data);
      if (!hasAnalyticsData(data)) {
        setPartialLoad(true);
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { error?: string } };
        message?: string;
      };
      const status = axiosErr.response?.status;
      const message =
        axiosErr.response?.data?.error ?? axiosErr.message ?? 'Could not reach analytics service';
      setLoadError(status ? `${status}: ${message}` : message);
      setAnalytics(EMPTY_ANALYTICS);
      setPartialLoad(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [from, to]);

  useEffect(() => {
    if (from && to) {
      load();
    }
  }, [from, to, load]);

  const citedDocuments = analytics.kbMetrics.mostReferencedDocuments.length;

  return (
    <MotionPage className="dashboard-page">
      <PageHeader
        icon={BarChart3}
        title="Analytics"
        description="Readiness performance and competency insights."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
              className="input-base w-auto"
            />
            <span className="text-caption text-slate-400">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
              className="input-base w-auto"
            />
            <Button variant="secondary" size="sm" onClick={() => load(true)} loading={refreshing} aria-label="Refresh analytics" />
          </div>
        }
      />

      {loadError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50/80 px-4 py-3">
          <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-body font-medium text-warning-800">Some analytics could not be loaded</p>
            <p className="text-caption text-warning-700 mt-0.5">{loadError}</p>
            <p className="text-caption text-warning-600 mt-1">
              Showing available metrics with empty values where data is missing.
            </p>
          </div>
        </div>
      )}

      {!loadError && partialLoad && !loading && (
        <div className="mb-6 rounded-xl border border-border/60 bg-surface-muted/60 px-4 py-3">
          <p className="text-caption text-navy-500">
            No activity recorded in this date range yet. Metrics will populate as learners use assessments and the AI mentor.
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <SkeletonStatGrid count={4} />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Mentor resolution rate"
              value={`${analytics.resolutionRate}%`}
              icon={BarChart3}
              variant="success"
            />
            <StatCard
              label="At-risk escalation rate"
              value={`${analytics.escalationRate}%`}
              icon={BarChart3}
              variant="warning"
            />
            <StatCard
              label="Knowledge gaps"
              value={analytics.kbMetrics.failedQueriesCount}
              icon={BookOpen}
              variant="warning"
              animate={false}
            />
            <StatCard
              label="SOP documents cited"
              value={citedDocuments}
              icon={BookOpen}
              variant="accent"
              animate={false}
            />
          </div>

          <div className="dashboard-card p-5">
            <h2 className="text-section-title text-foreground mb-1">
              Most referenced training documents
            </h2>
            <p className="text-caption text-slate-500 mb-4">
              SOPs and materials cited in mentor responses ({analytics.kbMetrics.failedQueriesCount}{' '}
              knowledge gaps in range)
            </p>
            <div className="h-64">
              {analytics.kbMetrics.mostReferencedDocuments.length === 0 ? (
                <EmptyState
                  title="No source citations yet"
                  description="Mentor conversations with KB-backed answers will populate this chart."
                  className="border-0 shadow-none py-8"
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.kbMetrics.mostReferencedDocuments}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis
                      type="category"
                      dataKey="filename"
                      tick={{ fontSize: 10 }}
                      stroke="#94a3b8"
                      width={120}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name="References" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="dashboard-card p-5">
            <h2 className="text-section-title text-foreground mb-4">
              Unanswered learner questions
              <span className="ml-2 text-caption font-normal text-slate-500">
                (low similarity — no KB match)
              </span>
            </h2>
            {analytics.kbMetrics.unansweredQuestions.length === 0 ? (
              <p className="text-body text-slate-400 py-6 text-center">
                No unanswered questions in this date range.
              </p>
            ) : (
              <div className="divide-y divide-border-muted max-h-80 overflow-y-auto">
                {analytics.kbMetrics.unansweredQuestions.map((q, i) => (
                  <div key={i} className="py-3.5 first:pt-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-body font-medium text-foreground">{q.customerName}</p>
                      <span className="text-caption text-slate-400 whitespace-nowrap">
                        <RelativeTime iso={q.createdAt} />
                      </span>
                    </div>
                    <p className="text-body text-slate-600">{q.question}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-brand-accent" />
              <h2 className="text-section-title text-navy-900">AI Mentor activity</h2>
              <span className="text-caption text-navy-400">Response quality and volume</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <StatCard
                label="Avg response time"
                value={`${analytics.avgResponseTimeMs.toLocaleString('en-US')} ms`}
                icon={Bot}
                variant="navy"
                animate={false}
              />
              <StatCard
                label="Mentor answer accuracy"
                value={`${analytics.csat}%`}
                icon={ThumbsUp}
                variant="success"
                trend={`↑ ${analytics.thumbsUp}  ↓ ${analytics.thumbsDown}`}
              />
            </div>

            <div className="space-y-6">
              <div className="dashboard-card p-5">
                <h3 className="text-section-title text-foreground mb-4">Mentor response time</h3>
                <div className="h-64">
                  {analytics.timeSeries.length === 0 ? (
                    <p className="text-body text-slate-400 py-16 text-center">
                      No mentor activity in this date range.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="ms" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="avgResponseTimeMs"
                          name="Avg response (ms)"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="dashboard-card p-5">
                <h3 className="text-section-title text-foreground mb-4">Mentor answer accuracy over time</h3>
                <div className="h-64">
                  {analytics.timeSeries.length === 0 ? (
                    <p className="text-body text-slate-400 py-16 text-center">
                      No feedback recorded in this date range.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" domain={[0, 100]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="csat"
                          name="Accuracy %"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="dashboard-card p-5">
                <h3 className="text-section-title text-foreground mb-4">
                  Resolution vs at-risk escalation
                </h3>
                <div className="h-64">
                  {analytics.timeSeries.length === 0 ? (
                    <p className="text-body text-slate-400 py-16 text-center">
                      No resolution data in this date range.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="resolutionRate"
                          name="Resolution %"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="escalationRate"
                          name="At-risk escalation %"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MotionPage>
  );
}
