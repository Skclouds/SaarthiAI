'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  Gauge,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  fetchReadinessAttempts,
  fetchReadinessOverview,
} from '@/lib/assessments';
import { AttemptSummary, ReadinessOverview } from '@/types/assessment';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton, SkeletonStatGrid } from '@/components/ui/Skeleton';
import { MotionPage } from '@/components/ui/motion';
import ClientDate from '@/components/ui/ClientDate';
import DataTable, {
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import { readinessStatusBadge, readinessStatusLabel } from '@/lib/tokens';

const READY_COLOR = '#10b981';
const AT_RISK_COLOR = '#f59e0b';

export default function ReadinessDashboardPage() {
  const [overview, setOverview] = useState<ReadinessOverview | null>(null);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [ov, at] = await Promise.all([
        fetchReadinessOverview(),
        fetchReadinessAttempts(),
      ]);
      setOverview(ov);
      setAttempts(at);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = overview
    ? [
        { name: 'Ready', value: overview.readyCount, fill: READY_COLOR },
        { name: 'At risk', value: overview.atRiskCount, fill: AT_RISK_COLOR },
      ]
    : [];

  const hasChartData = overview ? overview.readyCount + overview.atRiskCount > 0 : false;

  return (
    <MotionPage className="dashboard-page">
      <PageHeader
        icon={ShieldCheck}
        title="Human readiness"
        description="Track learner competency and training readiness across your team."
        actions={
          <Button variant="secondary" size="sm" onClick={() => load(true)} loading={refreshing}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <SkeletonStatGrid count={4} />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : error || !overview ? (
        <EmptyState
          icon={ShieldCheck}
          title="Failed to load readiness data"
          description="Check your connection and try refreshing the page."
          action={{ label: 'Retry', onClick: () => load() }}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Learners assessed"
              value={overview.learnersAssessed}
              icon={Users}
              variant="accent"
            />
            <StatCard
              label="Ready"
              value={overview.readyCount}
              icon={ShieldCheck}
              variant="success"
            />
            <StatCard
              label="At risk"
              value={overview.atRiskCount}
              icon={AlertTriangle}
              variant="warning"
            />
            <StatCard
              label="Avg competency"
              value={`${overview.avgCompetency}%`}
              icon={Gauge}
              variant="navy"
            />
          </div>

          <div className="dashboard-card p-5">
            <h2 className="text-section-title text-foreground mb-4">Ready vs at risk</h2>
            <div className="h-64">
              {!hasChartData ? (
                <EmptyState
                  title="No assessment attempts yet"
                  description="Share a learner link to start collecting readiness data."
                  className="border-0 shadow-none py-8"
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                    <Bar dataKey="value" name="Learners" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-section-title text-foreground mb-4">Recent attempts</h2>
            {attempts.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No attempts yet"
                description="Learner results will appear here once assessments are submitted."
              />
            ) : (
              <DataTable>
                <DataTableHead>
                  <DataTableHeaderCell>Learner</DataTableHeaderCell>
                  <DataTableHeaderCell align="right">Score</DataTableHeaderCell>
                  <DataTableHeaderCell>Status</DataTableHeaderCell>
                  <DataTableHeaderCell className="hidden md:table-cell">Weak topics</DataTableHeaderCell>
                  <DataTableHeaderCell className="hidden sm:table-cell">Date</DataTableHeaderCell>
                </DataTableHead>
                <DataTableBody>
                  {attempts.map((a) => (
                    <DataTableRow key={a.id}>
                      <DataTableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-navy-900 truncate max-w-[180px]">
                            {a.learnerName}
                          </p>
                          <p className="text-caption text-slate-500 truncate max-w-[180px]">
                            {a.learnerEmail}
                          </p>
                        </div>
                      </DataTableCell>
                      <DataTableCell align="right" className="tabular-nums font-medium text-navy-800">
                        {a.score}%
                      </DataTableCell>
                      <DataTableCell>
                        <Badge className={readinessStatusBadge[a.status]}>
                          {readinessStatusLabel[a.status]}
                        </Badge>
                      </DataTableCell>
                      <DataTableCell className="hidden md:table-cell">
                        {a.gaps.length === 0 ? (
                          <span className="text-caption text-slate-400">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[260px]">
                            {a.gaps.map((gap) => (
                              <span
                                key={gap}
                                className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-warning-50 text-warning-700 border border-warning-100"
                              >
                                {gap}
                              </span>
                            ))}
                          </div>
                        )}
                      </DataTableCell>
                      <DataTableCell className="hidden sm:table-cell text-slate-500 whitespace-nowrap">
                        <ClientDate iso={a.createdAt} format="datetime" />
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            )}
          </div>
        </div>
      )}
    </MotionPage>
  );
}
