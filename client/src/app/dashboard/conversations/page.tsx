'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ChevronLeft,
  MessageSquare,
  Search,
  Ticket,
} from 'lucide-react';
import ConversationTranscript from '@/components/conversations/ConversationTranscript';
import {
  fetchConversationDetail,
  fetchConversations,
  searchConversations,
} from '@/lib/conversations';
import { ConversationDetail, ConversationListItem, ConversationPagination } from '@/types/conversation';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { MotionPage } from '@/components/ui/motion';

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [pagination, setPagination] = useState<ConversationPagination | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const result = activeSearch
          ? await searchConversations(activeSearch, page)
          : await fetchConversations(page);
        setConversations(result.conversations);
        setPagination(result.pagination);
      } catch {
        if (!silent) {
          setConversations([]);
          setPagination(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, activeSearch],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setSelectedId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    fetchConversationDetail(selectedId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery.trim());
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setPage(1);
  };

  const showDetail = selectedId !== null;

  return (
    <MotionPage className="flex-1 flex flex-col h-[calc(100vh-4rem)] lg:h-auto lg:min-h-0">
      <div className="px-6 lg:px-8 pt-6 lg:pt-8 pb-4 shrink-0">
        <PageHeader
          icon={MessageSquare}
          title="Conversations"
          description="Search and review customer chat history."
          actions={
            <Button variant="secondary" size="sm" onClick={() => load(true)} loading={refreshing}>
              Refresh
            </Button>
          }
        />

        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 max-w-lg">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search message content…"
              className="input-base pl-9"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
          {activeSearch && (
            <Button type="button" variant="secondary" size="sm" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </form>
      </div>

      <div className="flex-1 flex min-h-0 px-6 lg:px-8 pb-6 lg:pb-8 gap-4">
        <div
          className={cn(
            'flex-col w-full lg:w-96 shrink-0 dashboard-card overflow-hidden',
            showDetail ? 'hidden lg:flex' : 'flex',
          )}
        >
          {loading ? (
            <SkeletonList rows={8} />
          ) : conversations.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={activeSearch ? 'No conversations match your search' : 'No conversations yet'}
              description={
                activeSearch
                  ? 'Try a different search term or clear the filter.'
                  : 'Conversations appear here when customers chat via your widget or demo page.'
              }
              action={activeSearch ? { label: 'Clear search', onClick: clearSearch } : undefined}
              className="border-0 shadow-none rounded-none h-full"
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto divide-y divide-border-muted">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 motion-safe-transition',
                      'hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
                      selectedId === conv.id && 'bg-primary-50/70',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-body font-medium text-foreground truncate">
                          {conv.customerName}
                        </p>
                        <p className="text-caption text-slate-500 truncate">{conv.customerEmail}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                        {formatRelative(conv.lastActivity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-caption text-slate-500">
                        {conv.messageCount} msg{conv.messageCount !== 1 ? 's' : ''}
                      </span>
                      {conv.escalated && (
                        <Badge className="bg-warning-50 text-warning-700 border-warning-100 text-[10px] py-0">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Escalated
                        </Badge>
                      )}
                      {conv.linkedTicket && (
                        <Badge className="bg-orange-50 text-orange-700 border-orange-100 text-[10px] py-0">
                          <Ticket className="w-2.5 h-2.5" />
                          {conv.linkedTicket.priority}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-muted bg-surface-muted/40 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="text-caption text-primary-600 hover:text-primary-700 disabled:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
                  >
                    Previous
                  </button>
                  <span className="text-caption text-slate-500">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= pagination.totalPages}
                    className="text-caption text-primary-600 hover:text-primary-700 disabled:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div
          className={cn(
            'flex-col flex-1 dashboard-card overflow-hidden min-w-0',
            showDetail ? 'flex' : 'hidden lg:flex',
          )}
        >
          {!selectedId ? (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the list to view the full transcript and timeline."
              className="border-0 shadow-none rounded-none h-full"
            />
          ) : detailLoading ? (
            <SkeletonList rows={6} />
          ) : detail ? (
            <>
              <div className="px-4 py-3 border-b border-border-muted bg-surface-muted/40 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Back to list"
                    className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-foreground">{detail.customerName}</p>
                    <p className="text-caption text-slate-500">{detail.customerEmail}</p>
                  </div>
                  {detail.escalated && (
                    <Badge className="ml-auto bg-warning-50 text-warning-700 border-warning-100">
                      Escalated
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-surface-muted/30">
                <ConversationTranscript timeline={detail.timeline} />
              </div>
            </>
          ) : (
            <EmptyState
              title="Failed to load conversation"
              description="Try selecting the conversation again or refresh the page."
              className="border-0 shadow-none rounded-none h-full"
            />
          )}
        </div>
      </div>
    </MotionPage>
  );
}
