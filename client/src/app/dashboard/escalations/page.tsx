'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { fetchEscalatedTickets, fetchEscalationSummary } from '@/lib/tickets';
import { EscalationSummary, Ticket, TicketPriority } from '@/types/ticket';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import StatCard from '@/components/ui/StatCard';
import { Skeleton, SkeletonStatGrid } from '@/components/ui/Skeleton';
import { formatStatusLabel } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { MotionPage } from '@/components/ui/motion';

const COLUMNS: {
  priority: TicketPriority;
  label: string;
  borderColor: string;
  headerBg: string;
  variant: 'danger' | 'warning' | 'navy';
}[] = [
  {
    priority: 'URGENT',
    label: 'Urgent',
    borderColor: 'border-danger-200',
    headerBg: 'bg-danger-50 text-danger-800',
    variant: 'danger',
  },
  {
    priority: 'HIGH',
    label: 'High',
    borderColor: 'border-orange-200',
    headerBg: 'bg-orange-50 text-orange-800',
    variant: 'warning',
  },
  {
    priority: 'MEDIUM',
    label: 'Medium',
    borderColor: 'border-warning-200',
    headerBg: 'bg-warning-50 text-warning-800',
    variant: 'warning',
  },
  {
    priority: 'LOW',
    label: 'Low',
    borderColor: 'border-border',
    headerBg: 'bg-surface-muted text-slate-700',
    variant: 'navy',
  },
];

function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="p-3.5 rounded-xl bg-surface border border-border-muted shadow-soft hover:shadow-card motion-safe-transition">
      <p className="text-body font-medium text-foreground truncate">{ticket.customerName}</p>
      <p className="text-caption text-slate-500 truncate mb-2">{ticket.email}</p>
      <p className="text-caption text-slate-600 line-clamp-2">{ticket.query}</p>
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-muted">
        <span className="text-[11px] text-slate-400">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
        <Badge className="bg-primary-50 text-primary-700 border-primary-100 text-[10px] py-0">
          {formatStatusLabel(ticket.status)}
        </Badge>
      </div>
    </div>
  );
}

export default function EscalationsPage() {
  const [summary, setSummary] = useState<EscalationSummary | null>(null);
  const [tickets, setTickets] = useState<Record<TicketPriority, Ticket[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [summaryData, ticketsData] = await Promise.all([
        fetchEscalationSummary(),
        fetchEscalatedTickets(),
      ]);
      setSummary(summaryData);
      setTickets(ticketsData);
    } catch {
      setSummary(null);
      setTickets(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <MotionPage className="dashboard-page">
      <PageHeader
        icon={AlertTriangle}
        title="Escalations"
        description="Open tickets grouped by priority from chat escalation triggers."
        actions={
          <Button variant="secondary" size="sm" onClick={() => load(true)} loading={refreshing}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <SkeletonStatGrid count={4} />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      ) : !tickets ? (
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load escalations"
          description="Check your connection and try again."
          action={{ label: 'Retry', onClick: () => load() }}
        />
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {COLUMNS.map(({ priority, label, variant }) => (
                <StatCard
                  key={priority}
                  label={label}
                  value={summary[priority]}
                  icon={AlertTriangle}
                  variant={variant}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMNS.map(({ priority, label, borderColor, headerBg }) => (
              <div
                key={priority}
                className={cn(
                  'rounded-xl border bg-surface-muted/30 flex flex-col min-h-[300px]',
                  borderColor,
                )}
              >
                <div
                  className={cn(
                    'px-4 py-3 rounded-t-xl font-semibold text-body flex items-center justify-between',
                    headerBg,
                  )}
                >
                  <span>{label}</span>
                  <span className="text-caption font-normal opacity-70">
                    {tickets[priority].length}
                  </span>
                </div>
                <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[500px]">
                  {tickets[priority].length === 0 ? (
                    <p className="text-caption text-slate-400 text-center py-10">
                      No {label.toLowerCase()} tickets
                    </p>
                  ) : (
                    tickets[priority].map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </MotionPage>
  );
}
