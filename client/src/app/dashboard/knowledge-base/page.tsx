'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import DocumentTable from '@/components/knowledge-base/DocumentTable';
import DocumentUpload from '@/components/knowledge-base/DocumentUpload';
import { fetchDocuments } from '@/lib/documents';
import { KnowledgeDocument } from '@/types/document';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { MotionPage } from '@/components/ui/motion';

const POLL_INTERVAL_MS = 3000;

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDocuments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch {
      if (!silent) setDocuments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const hasProcessing = documents.some((d) => d.status === 'PROCESSING');

  useEffect(() => {
    if (!hasProcessing) return;

    const interval = setInterval(() => loadDocuments(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasProcessing, loadDocuments]);

  const handleUploaded = (doc: KnowledgeDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const handleUpdate = (doc: KnowledgeDocument) => {
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
  };

  const handleRemove = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <MotionPage className="dashboard-page">
      <PageHeader
        icon={BookOpen}
        title="Knowledge base"
        description="Upload documents to power your AI assistant with business-specific knowledge."
        actions={
          <Button variant="secondary" size="sm" onClick={() => loadDocuments(true)} loading={refreshing}>
            Refresh
          </Button>
        }
      />

      <DocumentUpload onUploaded={handleUploaded} />

      {hasProcessing && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 text-body text-warning-700 bg-warning-50 border border-warning-100 rounded-xl px-4 py-2.5"
        >
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
          Processing documents — status updates automatically.
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : (
        <DocumentTable
          documents={documents}
          onChange={() => loadDocuments(true)}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      )}
    </MotionPage>
  );
}
