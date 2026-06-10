'use client';

import { AlertTriangle, Bot, Ticket, User } from 'lucide-react';
import ChatMarkdown from '@/components/chat/ChatMarkdown';
import { TimelineItem } from '@/types/conversation';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ConversationTranscriptProps {
  timeline: TimelineItem[];
}

export default function ConversationTranscript({ timeline }: ConversationTranscriptProps) {
  if (timeline.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-12">No messages in this conversation.</p>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((item) => {
        if (item.type === 'message') {
          const isUser = item.role === 'USER';
          return (
            <div key={`msg-${item.id}`} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser ? 'bg-slate-200' : 'bg-indigo-100'
                }`}
              >
                {isUser ? (
                  <User className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </div>
              <div className={`max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                <div
                  className={`inline-block rounded-2xl px-4 py-3 text-sm text-left ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-sm'
                  }`}
                >
                  {isUser ? (
                    <p>{item.content}</p>
                  ) : (
                    <ChatMarkdown content={item.content} />
                  )}
                  {item.unanswered && (
                    <p className="mt-2 text-xs text-amber-600 font-medium">Unanswered — KB miss</p>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 px-1">
                  {formatTime(item.createdAt)}
                  {item.responseTimeMs != null && ` · ${item.responseTimeMs}ms`}
                </p>
              </div>
            </div>
          );
        }

        if (item.type === 'escalation') {
          return (
            <div key={`esc-${item.id}`} className="flex justify-center">
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 max-w-md w-full">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-amber-800">Escalation triggered</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Priority: <span className="font-medium">{item.priority}</span>
                  </p>
                  <p className="text-xs text-amber-600 mt-1 truncate">
                    Triggers: {item.matchedTriggers.join(', ')}
                  </p>
                  <p className="text-[10px] text-amber-500 mt-1">{formatTime(item.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={`tkt-${item.id}`} className="flex justify-center">
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 max-w-md w-full">
              <Ticket className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-orange-800">Ticket created</p>
                <p className="text-xs text-orange-700 mt-0.5">
                  {item.priority} · {item.status.replace('_', ' ')}
                </p>
                <p className="text-xs text-orange-600 mt-1 line-clamp-2">{item.query}</p>
                <p className="text-[10px] text-orange-500 mt-1">{formatTime(item.createdAt)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
