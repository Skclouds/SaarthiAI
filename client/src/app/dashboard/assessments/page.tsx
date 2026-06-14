'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, GraduationCap } from 'lucide-react';
import { fetchAssessments } from '@/lib/assessments';
import { Assessment } from '@/types/assessment';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { MotionPage } from '@/components/ui/motion';
import { useToast } from '@/components/ui/Toast';
import DataTable, {
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import ClientDate from '@/components/ui/ClientDate';
import { cn } from '@/lib/cn';

function learnerLink(id: string): string {
  if (typeof window === 'undefined') return `/assess/${id}`;
  return `${window.location.origin}/assess/${id}`;
}

export default function AssessmentsPage() {
  const toast = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setLoadError(false);
    try {
      const data = await fetchAssessments();
      setAssessments(data);
    } catch {
      setLoadError(true);
      if (!silent) setAssessments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCopy = async (id: string) => {
    const link = learnerLink(id);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      toast.success('Learner link copied to clipboard');
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <MotionPage className="dashboard-page">
      <PageHeader
        icon={GraduationCap}
        title="Readiness assessments"
        description="Share assessments with learners and track who's ready. Generate new ones from the Knowledge base."
        actions={
          <Button variant="secondary" size="sm" onClick={() => load(true)} loading={refreshing}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <SkeletonTable rows={5} cols={4} />
      ) : loadError ? (
        <EmptyState
          icon={GraduationCap}
          title="Could not load assessments"
          description="Check your connection and try again."
          action={{ label: 'Retry', onClick: () => load() }}
        />
      ) : assessments.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No assessments yet"
          description="Go to the Knowledge base and click “Generate assessment” on a ready document to create one."
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableHeaderCell>Title</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Questions</DataTableHeaderCell>
            <DataTableHeaderCell className="hidden md:table-cell">Created</DataTableHeaderCell>
            <DataTableHeaderCell align="right">Learner link</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {assessments.map((a) => {
              const copied = copiedId === a.id;
              return (
                <DataTableRow key={a.id}>
                  <DataTableCell className="font-medium max-w-[280px] truncate">
                    {a.title}
                  </DataTableCell>
                  <DataTableCell align="right" className="tabular-nums text-slate-600">
                    {a.questionCount}
                  </DataTableCell>
                  <DataTableCell className="hidden md:table-cell text-slate-500 whitespace-nowrap">
                    <ClientDate iso={a.createdAt} format="datetime" />
                  </DataTableCell>
                  <DataTableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(a.id)}
                        title="Copy learner link"
                        aria-label={`Copy learner link for ${a.title}`}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-caption font-medium',
                          'text-brand-deep bg-brand-muted hover:bg-brand-accent/15 motion-safe-transition',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
                        )}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-success-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copied ? 'Copied' : 'Copy link'}
                      </button>
                      <a
                        href={learnerLink(a.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open learner page"
                        aria-label={`Open learner page for ${a.title}`}
                        className={cn(
                          'p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 motion-safe-transition',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                        )}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
      )}
    </MotionPage>
  );
}
