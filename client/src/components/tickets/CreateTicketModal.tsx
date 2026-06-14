'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TicketPriority } from '@/types/ticket';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import { MotionOverlay, MotionModal } from '@/components/ui/motion';
import { cn } from '@/lib/cn';

const PRIORITIES: TicketPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

interface CreateTicketModalProps {
  onClose: () => void;
  onCreate: (data: {
    customerName: string;
    email: string;
    query: string;
    priority: TicketPriority;
  }) => Promise<void>;
}

export default function CreateTicketModal({ onClose, onCreate }: CreateTicketModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onCreate({ customerName, email, query, priority });
      toast.success('Task created');
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to create ticket';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <MotionOverlay onClose={onClose}>
        <MotionModal className="bg-surface rounded-3xl shadow-elevated w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-muted">
            <h2 className="text-section-title text-navy-900">Create training task</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                'p-2 rounded-xl text-navy-400 hover:bg-surface-muted hover:text-navy-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-section-title text-navy-700 mb-2">Learner name</label>
              <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-section-title text-navy-700 mb-2">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-section-title text-navy-700 mb-2">Query</label>
              <textarea required rows={3} value={query} onChange={(e) => setQuery(e.target.value)} className="input-base resize-none" />
            </div>
            <div>
              <label className="block text-section-title text-navy-700 mb-2">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)} className="input-base">
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Creating…' : 'Create task'}
            </Button>
          </form>
        </MotionModal>
      </MotionOverlay>
    </AnimatePresence>
  );
}
