'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Plus, Ticket as TicketIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import CreateTicketModal from '@/components/tickets/CreateTicketModal';
import TicketDetail from '@/components/tickets/TicketDetail';
import { createTicket, fetchTicket, fetchTickets, updateTicketStatus } from '@/lib/tickets';
import { Ticket, TicketPriority, TicketStatus } from '@/types/ticket';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { MotionPage } from '@/components/ui/motion';
import DataTable, {
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import { ticketPriorityBadge, ticketStatusBadge, formatStatusLabel } from '@/lib/tokens';
import ClientDate from '@/components/ui/ClientDate';
import { cn } from '@/lib/cn';

const ALL_STATUSES: Array<TicketStatus | ''> = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const ALL_PRIORITIES: Array<TicketPriority | ''> = ['', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];
const KANBAN_COLUMNS: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const COLUMN_STYLES: Record<TicketStatus, string> = {
  OPEN: 'border-brand-accent/20 bg-brand-muted/30',
  IN_PROGRESS: 'border-warning-200 bg-warning-50/30',
  RESOLVED: 'border-success-200 bg-success-50/30',
  CLOSED: 'border-navy-200 bg-navy-50/30',
};

export default function TicketsPage() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState<'table' | 'kanban'>('table');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await fetchTickets({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setTickets(data);
    } catch {
      if (!silent) setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;

    const match = tickets.find((t) => t.id === id);
    if (match) {
      setSelected(match);
      return;
    }

    fetchTicket(id)
      .then(setSelected)
      .catch(() => {});
  }, [searchParams, tickets]);

  const handleStatusChange = async (status: TicketStatus) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const updated = await updateTicketStatus(selected.id, status);
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } finally {
      setUpdating(false);
    }
  };

  const handleCreate = async (data: {
    customerName: string;
    email: string;
    query: string;
    priority: TicketPriority;
  }) => {
    const ticket = await createTicket(data);
    setTickets((prev) => [ticket, ...prev]);
  };

  return (
    <MotionPage className="dashboard-page">
      <PageHeader
        icon={TicketIcon}
        title="Ticket management"
        description="Track, prioritize, and resolve customer support requests."
        actions={
          <>
            <div className="flex rounded-xl border border-border p-1 bg-surface-muted/50">
              <button
                type="button"
                onClick={() => setView('table')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-medium transition-colors',
                  view === 'table' ? 'bg-surface shadow-soft text-navy-900' : 'text-navy-500 hover:text-navy-700',
                )}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
              <button
                type="button"
                onClick={() => setView('kanban')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-medium transition-colors',
                  view === 'kanban' ? 'bg-surface shadow-soft text-navy-900' : 'text-navy-500 hover:text-navy-700',
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Board
              </button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => load(true)} loading={refreshing}>
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              New ticket
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
          aria-label="Filter by status"
          className="input-base w-auto min-w-[150px]"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s || 'all'} value={s}>
              {s ? formatStatusLabel(s) : 'All statuses'}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | '')}
          aria-label="Filter by priority"
          className="input-base w-auto min-w-[150px]"
        >
          {ALL_PRIORITIES.map((p) => (
            <option key={p || 'all'} value={p}>
              {p ? formatStatusLabel(p) : 'All priorities'}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets yet"
          description="Create a ticket manually or wait for escalations from chat conversations."
          action={{ label: 'Create ticket', onClick: () => setShowCreate(true) }}
        />
      ) : view === 'table' ? (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>Customer</DataTableHeaderCell>
            <DataTableHeaderCell className="hidden md:table-cell">Query</DataTableHeaderCell>
            <DataTableHeaderCell>Priority</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell className="hidden sm:table-cell">Created</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {tickets.map((ticket) => (
              <DataTableRow
                key={ticket.id}
                onClick={() => setSelected(ticket)}
                selected={selected?.id === ticket.id}
              >
                <DataTableCell>
                  <p className="font-medium text-navy-900">{ticket.customerName}</p>
                  <p className="text-caption text-navy-500">{ticket.email}</p>
                </DataTableCell>
                <DataTableCell className="hidden md:table-cell text-navy-600 max-w-xs truncate">
                  {ticket.query}
                </DataTableCell>
                <DataTableCell>
                  <Badge className={ticketPriorityBadge[ticket.priority]}>
                    {formatStatusLabel(ticket.priority)}
                  </Badge>
                </DataTableCell>
                <DataTableCell>
                  <Badge className={ticketStatusBadge[ticket.status]}>
                    {formatStatusLabel(ticket.status)}
                  </Badge>
                </DataTableCell>
                <DataTableCell className="hidden sm:table-cell text-navy-500 whitespace-nowrap">
                  <ClientDate iso={ticket.createdAt} />
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {KANBAN_COLUMNS.map((status) => {
            const columnTickets = tickets.filter((t) => t.status === status);
            return (
              <div
                key={status}
                className={cn('rounded-2xl border flex flex-col min-h-[320px]', COLUMN_STYLES[status])}
              >
                <div className="px-4 py-3.5 border-b border-border/50 flex items-center justify-between">
                  <span className="text-section-title text-navy-800">{formatStatusLabel(status)}</span>
                  <span className="text-caption text-navy-500 bg-surface/80 px-2 py-0.5 rounded-lg">
                    {columnTickets.length}
                  </span>
                </div>
                <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[520px]">
                  {columnTickets.length === 0 ? (
                    <p className="text-caption text-navy-400 text-center py-8">No tickets</p>
                  ) : (
                    columnTickets.map((ticket, i) => (
                      <motion.button
                        key={ticket.id}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ y: -2 }}
                        onClick={() => setSelected(ticket)}
                        className="w-full text-left dashboard-card !shadow-soft p-4 hover:border-brand-accent/25 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-body font-medium text-navy-900 truncate">{ticket.customerName}</p>
                          <Badge className={cn(ticketPriorityBadge[ticket.priority], 'shrink-0 text-[10px]')}>
                            {ticket.priority}
                          </Badge>
                        </div>
                        <p className="text-caption text-navy-600 line-clamp-2">{ticket.query}</p>
                        <p className="text-[11px] text-navy-400 mt-2">
                          <ClientDate iso={ticket.createdAt} />
                        </p>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <TicketDetail
          ticket={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      )}

      {showCreate && (
        <CreateTicketModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </MotionPage>
  );
}
