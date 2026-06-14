'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import SaarthiLogo from '@/components/ui/SaarthiLogo';
import ChatMarkdown from './ChatMarkdown';
import MessageFeedback from './MessageFeedback';
import { fetchPublicBotConfig, fetchSuggestedQuestions, sendChatMessage } from '@/lib/chat';
import { ChatMessage, SourceDocument } from '@/types/chat';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { springTransition } from '@/components/ui/motion';
import { cn } from '@/lib/cn';

interface ChatWidgetProps {
  businessId: string;
  customerName?: string;
  customerEmail?: string;
}

export default function ChatWidget({
  businessId,
  customerName = 'Guest',
  customerEmail = 'guest@example.com',
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [botName, setBotName] = useState('Saarthi AI');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }, [messages, loading, reduced]);

  const loadConfig = useCallback(async () => {
    try {
      const [config, questions] = await Promise.all([
        fetchPublicBotConfig(businessId),
        fetchSuggestedQuestions(businessId),
      ]);
      setBotName(config.botName);
      setWelcomeMessage(config.welcomeMessage);
      setSuggestedQuestions(questions);
      setInitialized(true);
    } catch {
      setBotName('Saarthi AI');
      setWelcomeMessage('Ask a question about your training materials — answers are grounded in your knowledge base.');
      setSuggestedQuestions([]);
      setInitialized(true);
    }
  }, [businessId]);

  useEffect(() => {
    if (open && !initialized) {
      loadConfig();
    }
  }, [open, initialized, loadConfig]);

  useEffect(() => {
    if (open && !loading) {
      inputRef.current?.focus();
    }
  }, [open, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput('');

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'USER', content: trimmed },
    ]);
    setLoading(true);

    try {
      const response = await sendChatMessage({
        businessId,
        conversationId,
        customerName,
        customerEmail,
        message: trimmed,
      });

      setConversationId(response.conversationId);
      setSources(response.sources);
      setMessages((prev) => [
        ...prev,
        {
          id: response.message.id,
          role: 'ASSISTANT',
          content: response.message.content,
          unanswered: response.message.unanswered,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'ASSISTANT',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            initial={false}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduced ? undefined : { scale: 0, opacity: 0 }}
            whileHover={reduced ? undefined : { scale: 1.06 }}
            whileTap={reduced ? undefined : { scale: 0.95 }}
            transition={springTransition}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-deep to-brand-accent text-white shadow-glow-lg flex items-center justify-center"
            aria-label="Open Ask Saarthi"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={reduced ? false : { opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            transition={springTransition}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[min(640px,calc(100vh-3rem))] flex flex-col bg-surface rounded-3xl shadow-elevated border border-border/60 overflow-hidden"
            role="dialog"
            aria-label="Ask Saarthi chat"
          >
            <div className="relative shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-brand-deep to-brand-accent" />
              <div className="relative flex items-center justify-between px-5 py-4 text-white">
                <div className="flex items-center gap-3 min-w-0">
                  <SaarthiLogo
                    variant="icon"
                    size={40}
                    rounded="full"
                    className="border border-white/20 shadow-soft shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-body truncate">{botName}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <p className="text-caption text-white/70 truncate">Ask Saarthi · RAG assistant</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 shrink-0"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-5 py-5 space-y-5 bg-gradient-to-b from-background to-surface-muted/30"
              aria-live="polite"
              aria-relevant="additions"
            >
              {welcomeMessage && messages.length === 0 && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-brand-accent" />
                  </div>
                  <div className="bg-surface rounded-2xl rounded-tl-md px-4 py-3.5 shadow-soft border border-border/60 max-w-[88%]">
                    <p className="text-body text-navy-700 leading-relaxed">{welcomeMessage}</p>
                  </div>
                </motion.div>
              )}

              {messages.length === 0 && !welcomeMessage && initialized && (
                <div className="text-center py-8 px-4">
                  <p className="text-body text-navy-500">Ask a question about your SOPs or training materials.</p>
                  <p className="text-caption text-navy-400 mt-1">Answers are grounded in your knowledge base.</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : i * 0.02 }}
                  className={cn('flex gap-3', msg.role === 'USER' ? 'flex-row-reverse' : '')}
                >
                  {msg.role === 'ASSISTANT' && (
                    <SaarthiLogo
                      variant="icon"
                      size={32}
                      rounded="full"
                      className="mt-0.5 border border-border/60 shrink-0"
                    />
                  )}
                  <div
                    className={cn(
                      'max-w-[88%] rounded-2xl px-4 py-3.5 text-body',
                      msg.role === 'USER'
                        ? 'bg-gradient-to-br from-brand-deep to-brand-accent text-white rounded-tr-md shadow-glow'
                        : 'bg-surface text-navy-700 shadow-soft border border-border/60 rounded-tl-md',
                    )}
                  >
                    {msg.role === 'ASSISTANT' ? (
                      <ChatMarkdown content={msg.content} />
                    ) : (
                      <p className="leading-relaxed">{msg.content}</p>
                    )}
                    {msg.unanswered && (
                      <p className="mt-2.5 text-caption text-warning-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500" />
                        Not found in knowledge base — routed for follow-up
                      </p>
                    )}
                    {msg.role === 'ASSISTANT' &&
                      !msg.id.startsWith('user-') &&
                      !msg.id.startsWith('err-') &&
                      !msg.id.startsWith('error-') && (
                        <MessageFeedback messageId={msg.id} businessId={businessId} />
                      )}
                  </div>
                </motion.div>
              ))}

              {sources.length > 0 && messages.length > 0 && !loading && (
                <div className="chat-source-card mx-1 rounded-xl border border-border/60 bg-surface/80 px-4 py-3">
                  <p className="text-caption font-semibold text-navy-500 uppercase tracking-wide mb-2">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((s) => (
                      <span
                        key={s.documentId}
                        className="text-caption px-2.5 py-1 bg-brand-muted text-brand-deep rounded-lg border border-brand-accent/15 font-medium"
                      >
                        {s.filename}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex gap-3" aria-busy="true" aria-label="Saarthi is thinking">
                  <SaarthiLogo
                    variant="icon"
                    size={32}
                    rounded="full"
                    className="shrink-0 border border-border/60"
                  />
                  <div className="bg-surface rounded-2xl rounded-tl-md px-5 py-4 shadow-soft border border-border/60">
                    <div className="flex gap-1.5">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-2 h-2 bg-brand-accent/40 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length === 0 && suggestedQuestions.length > 0 && (
              <div className="px-5 pb-3 flex flex-wrap gap-2 shrink-0 border-t border-border/40 pt-3 bg-surface/50">
                {suggestedQuestions.map((q) => (
                  <motion.button
                    key={q}
                    type="button"
                    whileHover={reduced ? undefined : { scale: 1.02 }}
                    whileTap={reduced ? undefined : { scale: 0.98 }}
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                    className="text-caption px-3.5 py-2 rounded-xl border border-brand-accent/20 text-brand-deep bg-brand-muted/50 hover:bg-brand-muted hover:border-brand-accent/40 transition-colors disabled:opacity-50 font-medium"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="px-5 py-4 border-t border-border/60 bg-surface shrink-0"
            >
              <div className="flex items-end gap-2.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Saarthi anything…"
                  disabled={loading}
                  autoComplete="off"
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-border bg-background text-body text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent disabled:opacity-50 transition-all"
                />
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-brand-deep to-brand-accent text-white disabled:opacity-40 shadow-soft transition-opacity shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              <p className="text-[11px] text-navy-400 mt-2 text-center">
                Grounded in your organization&apos;s knowledge base
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
