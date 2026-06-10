'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Loader2, Upload, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { uploadDocument } from '@/lib/documents';
import { KnowledgeDocument } from '@/types/document';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';

const ACCEPTED = '.pdf,.docx,.txt,.md';
const MAX_MB = 10;

interface DocumentUploadProps {
  onUploaded: (doc: KnowledgeDocument) => void;
}

export default function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, toast]);

  const handleFile = useCallback(
    async (file: File) => {
      setError('');
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`File exceeds ${MAX_MB}MB limit`);
        return;
      }
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['pdf', 'docx', 'txt', 'md'].includes(ext)) {
        setError('Only PDF, DOCX, TXT, and MD files are allowed');
        return;
      }
      setUploading(true);
      setProgress(0);
      try {
        const doc = await uploadDocument(file, setProgress);
        onUploaded(doc);
        toast.success(`${file.name} uploaded successfully`);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Upload failed. Please try again.';
        setError(message);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onUploaded, toast],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!uploading) inputRef.current?.click();
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 focus-visible:ring-offset-2',
          uploading && 'pointer-events-none opacity-70',
          dragging
            ? 'border-brand-accent bg-brand-muted/60 shadow-glow'
            : 'border-border bg-surface hover:border-brand-accent/40 hover:bg-brand-muted/20 hover:shadow-soft',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-brand-accent animate-spin mx-auto" aria-hidden />
            <p className="text-body font-medium text-navy-700">Uploading… {progress}%</p>
            <div className="max-w-xs mx-auto h-2 bg-surface-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-deep to-brand-accent rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-muted to-brand-accent/10 flex items-center justify-center mx-auto mb-4 shadow-soft">
              <Upload className="w-7 h-7 text-brand-accent" aria-hidden />
            </div>
            <p className="text-section-title text-navy-900">Drop files to train your AI</p>
            <p className="text-body text-navy-500 mt-2">
              or <span className="text-brand-accent font-medium">browse</span> to upload
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-caption text-navy-400">
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> PDF, DOCX, TXT, MD</span>
              <span>·</span>
              <span>Max {MAX_MB}MB</span>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-full bg-brand-muted text-caption text-brand-deep font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Powers RAG responses instantly
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
