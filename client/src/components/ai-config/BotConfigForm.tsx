'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import ConfigPreview from './ConfigPreview';
import { fetchBotConfig, updateBotConfig } from '@/lib/bot-config';
import {
  BotConfig,
  BotPersonality,
  EscalationPriority,
  EscalationRule,
} from '@/types/bot-config';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

const PERSONALITIES: BotPersonality[] = ['Professional', 'Friendly', 'Technical'];
const PRIORITIES: EscalationPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

const emptyRule = (): EscalationRule => ({ trigger: '', priority: 'MEDIUM' });

export default function BotConfigForm() {
  const [config, setConfig] = useState<Omit<BotConfig, 'updatedAt'>>({
    botName: 'SaarthiAI',
    welcomeMessage: 'Hello! How can I help you today?',
    personality: 'Friendly',
    escalationRules: [],
    suggestedQuestions: ['Track my order', 'Pricing', 'Refund policy', 'Contact support'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, toast]);

  useEffect(() => {
    if (message) toast.success(message);
  }, [message, toast]);

  useEffect(() => {
    fetchBotConfig()
      .then((data) => {
        setConfig({
          botName: data.botName,
          welcomeMessage: data.welcomeMessage,
          personality: data.personality,
          escalationRules: data.escalationRules,
          suggestedQuestions: data.suggestedQuestions,
        });
      })
      .catch(() => setError('Failed to load configuration'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await updateBotConfig(config);
      setMessage('Configuration saved successfully');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to save configuration';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const updateRule = (index: number, field: keyof EscalationRule, value: string) => {
    setConfig((prev) => ({
      ...prev,
      escalationRules: prev.escalationRules.map((r, i) =>
        i === index ? { ...r, [field]: value } : r,
      ),
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-section-title text-slate-700 mb-1.5">Bot name</label>
          <input
            type="text"
            required
            value={config.botName}
            onChange={(e) => setConfig((p) => ({ ...p, botName: e.target.value }))}
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-section-title text-slate-700 mb-1.5">Welcome message</label>
          <textarea
            required
            rows={3}
            value={config.welcomeMessage}
            onChange={(e) => setConfig((p) => ({ ...p, welcomeMessage: e.target.value }))}
            className="input-base resize-none"
          />
        </div>

        <div>
          <label className="block text-section-title text-slate-700 mb-1.5">Personality</label>
          <div className="grid grid-cols-3 gap-2">
            {PERSONALITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, personality: p }))}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-body font-medium border motion-safe-transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  config.personality === p
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-surface text-slate-600 border-border hover:border-primary-300',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-section-title text-slate-700 mb-1.5">
            Suggested questions
          </label>
          <textarea
            rows={4}
            value={config.suggestedQuestions.join('\n')}
            onChange={(e) =>
              setConfig((p) => ({
                ...p,
                suggestedQuestions: e.target.value.split('\n').filter(Boolean),
              }))
            }
            placeholder="One question per line"
            className="input-base resize-none"
          />
          <p className="text-caption text-slate-500 mt-1">One question per line</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-section-title text-slate-700">Escalation rules</label>
            <button
              type="button"
              onClick={() =>
                setConfig((p) => ({
                  ...p,
                  escalationRules: [...p.escalationRules, emptyRule()],
                }))
              }
              className="flex items-center gap-1 text-caption text-primary-600 hover:text-primary-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              <Plus className="w-3.5 h-3.5" /> Add rule
            </button>
          </div>

          {config.escalationRules.length === 0 ? (
            <p className="text-body text-slate-400 py-6 text-center border border-dashed border-border rounded-xl bg-surface-muted/30">
              No escalation rules yet
            </p>
          ) : (
            <div className="space-y-3">
              {config.escalationRules.map((rule, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Trigger phrase"
                    value={rule.trigger}
                    onChange={(e) => updateRule(i, 'trigger', e.target.value)}
                    className="input-base flex-1"
                  />
                  <select
                    value={rule.priority}
                    onChange={(e) => updateRule(i, 'priority', e.target.value)}
                    className="input-base w-auto"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((p) => ({
                        ...p,
                        escalationRules: p.escalationRules.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="p-2 text-slate-400 hover:text-danger-600 rounded-lg hover:bg-danger-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save configuration'
          )}
        </Button>
      </form>

      <ConfigPreview config={config} />
    </div>
  );
}
