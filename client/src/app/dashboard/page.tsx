'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Upload,
} from 'lucide-react';
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
import { useAuthUser } from '@/hooks/useAuthUser';
import { fetchReadinessAttempts, fetchReadinessOverview } from '@/lib/assessments';
import { fetchOverviewStats } from '@/lib/stats';
import { AttemptSummary, ReadinessOverview } from '@/types/assessment';
import { OverviewStats } from '@/types/stats';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { MotionPage, MotionDiv } from '@/components/ui/motion';
import { cn } from '@/lib/cn';
import { readinessStatusBadge, readinessStatusLabel } from '@/lib/tokens';

const READY_COLOR = '#10b981';
const AT_RISK_COLOR = '#f59e0b';

const QUICK_ACTIONS = [
  {
    href: '/dashboard/knowledge-base',
    title: 'Upload SOP',
    description: 'Add training documents to your knowledge base',
    icon: Upload,
    color: 'bg-brand-muted text-brand-accent',
  },
  {
    href: '/dashboard/knowledge-base',
    title: 'Generate assessment',
    description: 'Create a competency quiz from any document',
    icon: GraduationCap,
    color: 'bg-navy-100 text-navy-700',
  },
  {
    href: '/dashboard/readiness',
    title: 'View readiness',
    description: 'See full learner insights and attempt history',
    icon: ShieldCheck,
    color: 'bg-success-50 text-success-600',
  },
];

const PREVIEW_ATTEMPTS = 5;

export default function DashboardPage() {
  const user = useAuthUser();
  const [overview, setOverview] = useState<ReadinessOverview | null>(null);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [supportStats, setSupportStats] = useState<OverviewStats | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(true);
  const [supportLoading, setSupportLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchReadinessOverview(), fetchReadinessAttempts()])
      .then(([ov, at]) => {
        setOverview(ov);
        setAttempts(at);
      })
      .catch(() => {
        setOverview(null);
        setAttempts([]);
      })
      .finally(() => setReadinessLoading(false));
  }, []);

  useEffect(() => {
    fetchOverviewStats()
      .then(setSupportStats)
      .catch(() => setSupportStats(null))
      .finally(() => setSupportLoading(false));
  }, []);

  const pendingRetraining = useMemo(
    () => attempts.filter((a) => a.status !== 'READY' && a.gaps.length > 0).length,
    [attempts],
  );

  const readinessRate = useMemo(() => {
    if (!overview || overview.learnersAssessed === 0) return 0;
    return Math.round((overview.readyCount / overview.learnersAssessed) * 100);
  }, [overview]);

  const chartData = overview
    ? [
        { name: 'Ready', value: overview.readyCount, fill: READY_COLOR },
        { name: 'At risk', value: overview.atRiskCount, fill: AT_RISK_COLOR },
      ]
    : [];

  const hasChartData = overview ? overview.readyCount + overview.atRiskCount > 0 : false;
  const previewAttempts = attempts.slice(0, PREVIEW_ATTEMPTS);

  return (
    <MotionPage className="dashboard-page">
      <MotionDiv className="mb-10">
        <p className="text-caption font-medium text-brand-accent uppercase tracking-wider mb-2">
          From Knowledge to Readiness.
        </p>
        <h1 className="text-display text-navy-900 text-balance">
          Good to see you{user?.businessName ? `, ${user.businessName}` : ''}
        </h1>
        <p className="text-body text-navy-500 mt-2 max-w-2xl">
          Turn knowledge into measurable readiness — train, assess, and prove competency in one place.
        </p>
      </MotionDiv>

      {readinessLoading ? (
        <Skeleton className="h-44 w-full rounded-2xl mb-6" />
      ) : (
        <MotionDiv className="dashboard-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 via-transparent to-success-500/5" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <p className="text-caption font-semibold uppercase tracking-wider text-brand-accent mb-2">
                Overall readiness
              </p>
              <div className="flex items-end gap-3">
                <p className="text-5xl font-semibold text-navy-900 tabular-nums">
                  {overview ? `${readinessRate}%` : '—'}
                </p>
                <p className="text-body text-navy-500 pb-2">
                  {overview?.learnersAssessed
                    ? `${overview.learnersAssessed} learner${overview.learnersAssessed === 1 ? '' : 's'} assessed`
                    : 'No assessments yet'}
                </p>
              </div>
              <p className="text-caption text-navy-500 mt-2 max-w-lg">
                Compliance status:{' '}
                <span
                  className={cn(
                    'font-semibold',
                    readinessRate >= 80 ? 'text-success-600' : readinessRate >= 50 ? 'text-warning-600' : 'text-navy-600',
                  )}
                >
                  {overview && overview.learnersAssessed > 0
                    ? readinessRate >= 80
                      ? 'On track'
                      : readinessRate >= 50
                        ? 'Needs attention'
                        : 'At risk'
                    : 'Pending data'}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 w-full lg:w-auto">
              {[
                { label: 'People ready', value: overview?.readyCount ?? '—' },
                { label: 'Need attention', value: overview?.atRiskCount ?? '—' },
                { label: 'High risk', value: overview ? pendingRetraining : '—' },
                { label: 'Avg competency', value: overview ? `${overview.avgCompetency}%` : '—' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/60 bg-surface/80 px-3 py-2.5 min-w-[7rem]"
                >
                  <p className="text-[11px] text-navy-500 uppercase tracking-wide">{label}</p>
                  <p className="text-xl font-semibold text-navy-900 tabular-nums mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionDiv>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <MotionDiv className="dashboard-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-section-title text-navy-900">Readiness trend</h2>
              <p className="text-caption text-navy-500">Learner competency distribution</p>
            </div>
            <Link
              href="/dashboard/readiness"
              className="text-caption text-brand-accent hover:text-primary-600 font-medium flex items-center gap-1"
            >
              Full insights <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {readinessLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : !hasChartData ? (
            <div className="text-center py-10">
              <p className="text-body text-navy-500">No assessment attempts yet</p>
              <p className="text-caption text-navy-400 mt-1">
                Generate an assessment and share the learner link to start tracking readiness.
              </p>
              <Link
                href="/dashboard/assessments"
                className="inline-flex items-center gap-1 mt-4 text-caption text-brand-accent hover:text-primary-600 font-medium"
              >
                Go to assessments <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="h-48">
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
            </div>
          )}
        </MotionDiv>

        <MotionDiv className="dashboard-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-section-title text-navy-900">Recent actions</h2>
              <p className="text-caption text-navy-500">Latest learner assessment results</p>
            </div>
            <Link
              href="/dashboard/readiness"
              className="text-caption text-brand-accent hover:text-primary-600 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {readinessLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : previewAttempts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-body text-navy-500">No attempts yet</p>
              <p className="text-caption text-navy-400 mt-1">
                Results appear here once learners complete assessments.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {previewAttempts.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-body font-medium text-navy-900 truncate">{a.learnerName}</p>
                    <p className="text-caption text-navy-400 truncate">{a.learnerEmail}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-body font-semibold tabular-nums text-navy-800">{a.score}%</span>
                    <Badge className={readinessStatusBadge[a.status]}>
                      {readinessStatusLabel[a.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </MotionDiv>
      </div>

      <MotionDiv className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-section-title text-navy-900">Support activity</h2>
          <span className="text-caption text-navy-400">AI mentor &amp; task volume</span>
        </div>

        {supportLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Conversations',
                value: supportStats?.totalConversations ?? '—',
                icon: MessageSquare,
              },
              {
                label: 'AI resolution',
                value: supportStats ? `${supportStats.aiResolutionRate}%` : '—',
                icon: Sparkles,
              },
              {
                label: 'Answer accuracy',
                value: supportStats ? `${supportStats.csat}%` : '—',
                icon: ThumbsUp,
              },
              {
                label: 'Open tasks',
                value: supportStats?.openTickets ?? '—',
                icon: BookOpen,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl bg-surface-muted/60 border border-border/60 p-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-navy-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-navy-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-caption text-navy-500">{label}</p>
                  <p className="text-lg font-semibold text-navy-900 tabular-nums">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </MotionDiv>

      <MotionDiv>
        <h2 className="text-section-title text-navy-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {QUICK_ACTIONS.map(({ href, title, description, icon: Icon, color }) => (
            <Link
              key={title}
              href={href}
              prefetch
              className={cn(
                'dashboard-card group p-6 transition-[border-color,box-shadow,opacity] duration-150',
                'hover:border-brand-accent/30 hover:shadow-card active:opacity-90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
              )}
            >
              <div className="flex items-start justify-between">
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <ArrowRight className="w-4 h-4 text-navy-300 group-hover:text-brand-accent transition-colors" />
              </div>
              <h3 className="text-section-title text-navy-900 mt-4">{title}</h3>
              <p className="text-caption text-navy-500 mt-1">{description}</p>
            </Link>
          ))}
        </div>
      </MotionDiv>
    </MotionPage>
  );
}
