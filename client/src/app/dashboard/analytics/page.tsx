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
import { BarChart3, ThumbsUp } from 'lucide-react';
import { fetchAnalytics } from '@/lib/stats';
import { AnalyticsResult } from '@/types/stats';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton, SkeletonStatGrid } from '@/components/ui/Skeleton';
import { MotionPage } from '@/components/ui/motion';
import { defaultAnalyticsFromDate, localDateString } from '@/lib/formatRelativeTime';
import RelativeTime from '@/components/ui/RelativeTime';

export default function AnalyticsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setFrom(defaultAnalyticsFromDate());
    setTo(localDateString());
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!from || !to) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await fetchAnalytics(from, to);
      setAnalytics(data);
    } catch {
      setAnalytics(null);
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

  return (
    <MotionPage className="dashboard-page">
      <PageHeader
        icon={BarChart3}
        title="Analytics"
        description="Performance insights and knowledge base metrics."
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

      {loading ? (
        <div className="space-y-6">
          <SkeletonStatGrid count={4} />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !analytics ? (
        <EmptyState
          icon={BarChart3}
          title="Failed to load analytics"
          description="Check your connection and try refreshing the page."
          action={{ label: 'Retry', onClick: () => load() }}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Avg response time"
              value={`${analytics.avgResponseTimeMs.toLocaleString('en-US')} ms`}
              icon={BarChart3}
              variant="accent"
              animate={false}
            />
            <StatCard
              label="Resolution rate"
              value={`${analytics.resolutionRate}%`}
              icon={BarChart3}
              variant="success"
            />
            <StatCard
              label="Escalation rate"
              value={`${analytics.escalationRate}%`}
              icon={BarChart3}
              variant="warning"
            />
            <StatCard
              label="Answer accuracy (CSAT)"
              value={`${analytics.csat}%`}
              icon={ThumbsUp}
              variant="success"
              trend={`↑ ${analytics.thumbsUp}  ↓ ${analytics.thumbsDown}`}
            />
          </div>

          <div className="dashboard-card p-5">
            <h2 className="text-section-title text-foreground mb-4">Response time over time</h2>
            <div className="h-64">
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
            </div>
          </div>

          <div className="dashboard-card p-5">
            <h2 className="text-section-title text-foreground mb-4">Answer accuracy (CSAT) over time</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="csat"
                    name="CSAT %"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card p-5">
            <h2 className="text-section-title text-foreground mb-4">
              Resolution vs escalation rate
            </h2>
            <div className="h-64">
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
                    name="Escalation %"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card p-5">
            <h2 className="text-section-title text-foreground mb-1">
              Most referenced documents
            </h2>
            <p className="text-caption text-slate-500 mb-4">
              KB documents cited in AI responses ({analytics.kbMetrics.failedQueriesCount} failed
              queries in range)
            </p>
            <div className="h-64">
              {analytics.kbMetrics.mostReferencedDocuments.length === 0 ? (
                <EmptyState
                  title="No source citations yet"
                  description="Chat with KB-backed answers to populate this chart."
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
              Unanswered questions
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
        </div>
      )}
    </MotionPage>
  );
}
