'use client';

import { AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { Ticket, TicketStatus } from '@/types/ticket';
import Badge from '@/components/ui/Badge';
import { MotionOverlay, MotionModal } from '@/components/ui/motion';
import { ticketPriorityBadge, ticketStatusBadge, formatStatusLabel } from '@/lib/tokens';
import { cn } from '@/lib/cn';

const STATUS_OPTIONS: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange: (status: TicketStatus) => Promise<void>;
  updating: boolean;
}

export default function TicketDetail({ ticket, onClose, onStatusChange, updating }: TicketDetailProps) {
  return (
    <AnimatePresence>
      <MotionOverlay onClose={onClose}>
        <MotionModal className="bg-surface rounded-3xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-muted sticky top-0 bg-surface z-10">
            <h2 className="text-section-title text-navy-900">Ticket details</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl text-navy-400 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge className={ticketPriorityBadge[ticket.priority]}>{formatStatusLabel(ticket.priority)}</Badge>
              <Badge className={ticketStatusBadge[ticket.status]}>{formatStatusLabel(ticket.status)}</Badge>
            </div>

            <div>
              <p className="text-caption font-medium text-navy-500 mb-1">Customer</p>
              <p className="text-body text-navy-900">{ticket.customerName}</p>
              <p className="text-body text-navy-500">{ticket.email}</p>
            </div>

            <div>
              <p className="text-caption font-medium text-navy-500 mb-1">Query</p>
              <p className="text-body text-navy-700 bg-surface-muted rounded-2xl p-4 border border-border-muted leading-relaxed">
                {ticket.query}
              </p>
            </div>

            <div>
              <p className="text-caption font-medium text-navy-500 mb-1">Created</p>
              <p className="text-body text-navy-600">{new Date(ticket.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <p className="text-caption font-medium text-navy-500 mb-3">Update status</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatusChange(status)}
                    disabled={updating || ticket.status === status}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-caption font-medium border transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
                      'disabled:opacity-50',
                      ticket.status === status
                        ? 'bg-brand-accent text-white border-brand-accent shadow-soft'
                        : 'bg-surface text-navy-600 border-border hover:border-brand-accent/30',
                    )}
                  >
                    {updating && ticket.status !== status ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                    ) : (
                      formatStatusLabel(status)
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </MotionModal>
      </MotionOverlay>
    </AnimatePresence>
  );
}
