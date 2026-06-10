import {
  Skeleton,
  SkeletonList,
  SkeletonStatGrid,
  SkeletonTable,
} from '@/components/ui/Skeleton';

function PageHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

export function DashboardOverviewLoading() {
  return (
    <div className="dashboard-page" aria-busy="true" aria-label="Loading dashboard">
      <PageHeaderSkeleton />
      <SkeletonStatGrid count={6} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">
        <Skeleton className="xl:col-span-2 h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardTableLoading() {
  return (
    <div className="dashboard-page" aria-busy="true" aria-label="Loading page">
      <PageHeaderSkeleton />
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}

export function DashboardListLoading() {
  return (
    <div className="dashboard-page" aria-busy="true" aria-label="Loading page">
      <PageHeaderSkeleton />
      <SkeletonList rows={8} />
    </div>
  );
}

export function DashboardAnalyticsLoading() {
  return (
    <div className="dashboard-page" aria-busy="true" aria-label="Loading analytics">
      <PageHeaderSkeleton />
      <SkeletonStatGrid count={4} />
      <div className="space-y-6 mt-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardConversationsLoading() {
  return (
    <div className="flex-1 flex flex-col px-6 lg:px-8 pt-6 lg:pt-8 pb-4" aria-busy="true" aria-label="Loading conversations">
      <PageHeaderSkeleton />
      <Skeleton className="h-10 w-full max-w-lg mb-4 rounded-xl" />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[400px]">
        <SkeletonList rows={6} />
        <Skeleton className="h-full min-h-[320px] rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardEscalationsLoading() {
  return (
    <div className="dashboard-page" aria-busy="true" aria-label="Loading escalations">
      <PageHeaderSkeleton />
      <SkeletonStatGrid count={4} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardFormLoading() {
  return (
    <div className="dashboard-page max-w-3xl" aria-busy="true" aria-label="Loading page">
      <PageHeaderSkeleton />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export function DashboardAiConfigLoading() {
  return (
    <div className="dashboard-page" aria-busy="true" aria-label="Loading AI settings">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton className="h-[520px] rounded-xl" />
        <Skeleton className="h-[520px] rounded-xl" />
      </div>
    </div>
  );
}
