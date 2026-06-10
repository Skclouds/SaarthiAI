import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-slate-200/70 motion-safe:animate-pulse motion-reduce:animate-none',
        className,
      )}
      aria-hidden
    />
  );
}

export function SkeletonStatGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4" aria-label="Loading stats">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="dashboard-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="dashboard-card overflow-hidden" aria-label="Loading table">
      <div className="border-b border-border-muted bg-surface-muted/60 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border-muted">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="px-4 py-3.5 flex gap-4">
            {Array.from({ length: cols }).map((_, col) => (
              <Skeleton key={col} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 6 }: { rows?: number }) {
  return (
    <div className="dashboard-card divide-y divide-border-muted" aria-label="Loading list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3.5 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboardShell() {
  return (
    <div className="min-h-screen flex bg-background">
      <Skeleton className="hidden lg:block w-64 shrink-0 rounded-none h-screen" />
      <div className="flex-1 flex flex-col min-w-0">
        <Skeleton className="h-16 rounded-none shrink-0" />
        <div className="dashboard-page space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <SkeletonStatGrid count={5} />
        </div>
      </div>
    </div>
  );
}
