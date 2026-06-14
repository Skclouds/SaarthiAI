'use client';

import { useState } from 'react';
import { BookOpen, GraduationCap, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { deleteDocument, reindexDocument } from '@/lib/documents';
import { generateAssessment } from '@/lib/assessments';
import { KnowledgeDocument } from '@/types/document';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import DataTable, {
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import { documentStatusBadge, formatStatusLabel } from '@/lib/tokens';
import ClientDate from '@/components/ui/ClientDate';
import { cn } from '@/lib/cn';

function formatType(fileType: string): string {
  return fileType.toUpperCase();
}

interface DocumentTableProps {
  documents: KnowledgeDocument[];
  onChange: () => void;
  onUpdate: (doc: KnowledgeDocument) => void;
  onRemove: (id: string) => void;
}

export default function DocumentTable({
  documents,
  onChange,
  onUpdate,
  onRemove,
}: DocumentTableProps) {
  const [actionId, setActionId] = useState<string | null>(null);
  const toast = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document and all its indexed chunks?')) return;
    setActionId(id);
    try {
      await deleteDocument(id);
      onRemove(id);
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setActionId(null);
    }
  };

  const handleReindex = async (id: string) => {
    setActionId(id);
    try {
      const doc = await reindexDocument(id);
      onUpdate(doc);
      onChange();
      toast.success('Document re-indexed');
    } catch {
      toast.error('Failed to re-index document');
    } finally {
      setActionId(null);
    }
  };

  const handleGenerate = async (id: string) => {
    setActionId(id);
    try {
      await generateAssessment(id);
      toast.success('Assessment generated — view it on the Assessments page');
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to generate assessment';
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No documents yet"
        description="Upload your first file to train SaarthiAI on your business knowledge."
      />
    );
  }

  return (
    <DataTable>
      <DataTableHead>
        <DataTableHeaderCell>Name</DataTableHeaderCell>
        <DataTableHeaderCell className="hidden sm:table-cell">Type</DataTableHeaderCell>
        <DataTableHeaderCell>Status</DataTableHeaderCell>
        <DataTableHeaderCell className="hidden md:table-cell">Uploaded</DataTableHeaderCell>
        <DataTableHeaderCell align="right">Actions</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {documents.map((doc) => {
          const busy = actionId === doc.id;
          return (
            <DataTableRow key={doc.id}>
              <DataTableCell className="font-medium max-w-[200px] truncate">
                {doc.filename}
              </DataTableCell>
              <DataTableCell className="hidden sm:table-cell text-slate-500">
                {formatType(doc.fileType)}
              </DataTableCell>
              <DataTableCell>
                <Badge className={documentStatusBadge[doc.status]}>
                  {doc.status === 'PROCESSING' && (
                    <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
                  )}
                  {formatStatusLabel(doc.status)}
                </Badge>
              </DataTableCell>
              <DataTableCell className="hidden md:table-cell text-slate-500 whitespace-nowrap">
                <ClientDate iso={doc.createdAt} format="datetime" />
              </DataTableCell>
              <DataTableCell align="right">
                <div className="flex items-center justify-end gap-1">
                  {doc.status === 'READY' && (
                    <button
                      type="button"
                      onClick={() => handleGenerate(doc.id)}
                      disabled={busy}
                      title="Generate assessment"
                      aria-label={`Generate assessment from ${doc.filename}`}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-caption font-medium',
                        'text-brand-deep bg-brand-muted hover:bg-brand-accent/15',
                        'disabled:opacity-40 disabled:pointer-events-none motion-safe-transition',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50',
                      )}
                    >
                      {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <GraduationCap className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Generate assessment</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleReindex(doc.id)}
                    disabled={busy || doc.status === 'PROCESSING'}
                    title="Re-index"
                    aria-label={`Re-index ${doc.filename}`}
                    className={cn(
                      'p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50',
                      'disabled:opacity-40 disabled:pointer-events-none motion-safe-transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    )}
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    disabled={busy}
                    title="Delete"
                    aria-label={`Delete ${doc.filename}`}
                    className={cn(
                      'p-2 rounded-lg text-slate-500 hover:text-danger-600 hover:bg-danger-50',
                      'disabled:opacity-40 motion-safe-transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTableBody>
    </DataTable>
  );
}
