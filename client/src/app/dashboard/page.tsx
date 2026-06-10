'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  BarChart3,
  Bot,
  MessageSquare,
  Sparkles,
  Ticket,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';
import { getUser } from '@/lib/auth';
import { fetchOverviewStats } from '@/lib/stats';
import { OverviewStats } from '@/types/stats';
import StatCard from '@/components/ui/StatCard';
import { SkeletonStatGrid } from '@/components/ui/Skeleton';
import { MotionPage, MotionDiv } from '@/components/ui/motion';
import { cn } from '@/lib/cn';

const STAT_CARDS = [
  { key: 'totalConversations' as const, label: 'Conversations', icon: MessageSquare, variant: 'accent' as const, format: (v: number) => v.toString() },
  { key: 'openTickets' as const, label: 'Open tickets', icon: Ticket, variant: 'navy' as const, format: (v: number) => v.toString() },
  { key: 'resolvedTickets' as const, label: 'Resolved', icon: TrendingUp, variant: 'success' as const, format: (v: number) => v.toString() },
  { key: 'escalatedTickets' as const, label: 'Escalated', icon: AlertTriangle, variant: 'warning' as const, format: (v: number) => v.toString() },
  { key: 'aiResolutionRate' as const, label: 'AI resolution', icon: Sparkles, variant: 'accent' as const, format: (v: number) => `${v}%` },
  { key: 'csat' as const, label: 'Answer accuracy (CSAT)', icon: ThumbsUp, variant: 'success' as const, format: (v: number) => `${v}%` },
];

const QUICK_LINKS = [
  { href: '/dashboard/knowledge-base', title: 'Knowledge base', description: 'Train your AI on company docs', icon: BookOpen, color: 'bg-brand-muted text-brand-accent' },
  { href: '/dashboard/tickets', title: 'Ticket queue', description: 'Resolve and prioritize issues', icon: Ticket, color: 'bg-navy-100 text-navy-700' },
  { href: '/dashboard/analytics', title: 'Analytics', description: 'Executive performance reports', icon: BarChart3, color: 'bg-success-50 text-success-600' },
];

export default function DashboardPage() {
  const user = getUser();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MotionPage className="dashboard-page">
      <MotionDiv className="mb-10">
        <p className="text-caption font-medium text-brand-accent uppercase tracking-wider mb-2">Overview</p>
        <h1 className="text-display text-navy-900 text-balance">
          Good to see you{user?.businessName ? `, ${user.businessName}` : ''}
        </h1>
        <p className="text-body text-navy-500 mt-2 max-w-2xl">
          Monitor AI performance, track support volume, and keep customers happy — all in one place.
        </p>
      </MotionDiv>

      {loading ? (
        <SkeletonStatGrid count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
          {STAT_CARDS.map(({ key, label, icon, variant, format }, i) => (
            <StatCard
              key={key}
              index={i}
              label={label}
              icon={icon}
              variant={variant}
              value={stats ? format(stats[key]) : '—'}
              loading={!stats}
              trend={
                key === 'csat' && stats
                  ? `↑ ${stats.thumbsUp}  ↓ ${stats.thumbsDown}`
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        {/* AI Performance */}
        <MotionDiv className="xl:col-span-2 dashboard-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-muted flex items-center justify-center">
                <Bot className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <h2 className="text-section-title text-navy-900">AI performance</h2>
                <p className="text-caption text-navy-500">How your assistant is handling volume</p>
              </div>
            </div>
            <Link href="/dashboard/analytics" className="text-caption text-brand-accent hover:text-primary-600 font-medium flex items-center gap-1">
              View analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Resolution rate', value: stats ? `${stats.aiResolutionRate}%` : '—', sub: 'Handled without escalation' },
              { label: 'Total conversations', value: stats?.totalConversations ?? '—', sub: 'All-time volume' },
              { label: 'Open tickets', value: stats?.openTickets ?? '—', sub: 'Needs human attention' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-surface-muted/60 border border-border/60 p-5">
                <p className="text-caption text-navy-500 mb-1">{item.label}</p>
                <p className="text-2xl font-semibold text-navy-900 tabular-nums">{item.value}</p>
                <p className="text-caption text-navy-400 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 h-2 rounded-full bg-surface-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-deep to-brand-accent transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${stats?.aiResolutionRate ?? 0}%` }}
            />
          </div>
          <p className="text-caption text-navy-400 mt-2">AI resolution progress</p>
        </MotionDiv>

        {/* Activity feed */}
        <MotionDiv className="dashboard-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-navy-600" />
            </div>
            <div>
              <h2 className="text-section-title text-navy-900">Recent activity</h2>
              <p className="text-caption text-navy-500">Live support signals</p>
            </div>
          </div>

          <div className="space-y-4">
            {stats && stats.totalConversations > 0 ? (
              <>
                <ActivityItem
                  icon={MessageSquare}
                  title={`${stats.totalConversations} conversations`}
                  desc="Total customer interactions recorded"
                  color="text-brand-accent bg-brand-muted"
                />
                {stats.escalatedTickets > 0 && (
                  <ActivityItem
                    icon={AlertTriangle}
                    title={`${stats.escalatedTickets} escalations`}
                    desc="Routed for human follow-up"
                    color="text-warning-600 bg-warning-50"
                  />
                )}
                {stats.resolvedTickets > 0 && (
                  <ActivityItem
                    icon={TrendingUp}
                    title={`${stats.resolvedTickets} resolved`}
                    desc="Tickets closed successfully"
                    color="text-success-600 bg-success-50"
                  />
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-body text-navy-500">No activity yet</p>
                <p className="text-caption text-navy-400 mt-1">
                  Conversations appear when customers use your chat widget
                </p>
                <Link
                  href="/dashboard/install"
                  className="inline-flex items-center gap-1 mt-4 text-caption text-brand-accent hover:text-primary-600 font-medium"
                >
                  Install widget <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </MotionDiv>
      </div>

      <MotionDiv>
        <h2 className="text-section-title text-navy-900 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {QUICK_LINKS.map(({ href, title, description, icon: Icon, color }) => (
            <Link
              key={href}
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

function ActivityItem({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
}) {
  const [bg, text] = color.split(' ').filter((c) => c.startsWith('bg-') || c.startsWith('text-'));
  return (
    <div className="flex items-start gap-3">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', bg)}>
        <Icon className={cn('w-4 h-4', text)} />
      </div>
      <div className="min-w-0">
        <p className="text-body font-medium text-navy-900">{title}</p>
        <p className="text-caption text-navy-500">{desc}</p>
      </div>
    </div>
  );
}
