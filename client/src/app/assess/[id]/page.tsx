'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import SaarthiLogo from '@/components/ui/SaarthiLogo';
import Button from '@/components/ui/Button';
import {
  fetchPublicAssessment,
  submitAssessment,
} from '@/lib/assessments';
import {
  PublicAssessment,
  ReadinessStatus,
  SubmitResult,
} from '@/types/assessment';
import { readinessStatusLabel } from '@/lib/tokens';
import { cn } from '@/lib/cn';

type Phase = 'intro' | 'quiz' | 'results';

const STATUS_THEME: Record<
  ReadinessStatus,
  { icon: typeof ShieldCheck; ring: string; text: string; bg: string; note: string }
> = {
  READY: {
    icon: ShieldCheck,
    ring: 'border-success-200 bg-success-50',
    text: 'text-success-700',
    bg: 'bg-success-100',
    note: 'Great work — this learner is ready.',
  },
  PARTIALLY_READY: {
    icon: ShieldAlert,
    ring: 'border-warning-200 bg-warning-50',
    text: 'text-warning-700',
    bg: 'bg-warning-100',
    note: 'Some gaps remain. Retraining has been auto-assigned.',
  },
  NOT_READY: {
    icon: AlertTriangle,
    ring: 'border-danger-200 bg-danger-50',
    text: 'text-danger-700',
    bg: 'bg-danger-100',
    note: 'Significant gaps found. Retraining has been auto-assigned.',
  },
};

export default function AssessPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [assessment, setAssessment] = useState<PublicAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [phase, setPhase] = useState<Phase>('intro');
  const [learnerName, setLearnerName] = useState('');
  const [learnerEmail, setLearnerEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchPublicAssessment(id);
        if (active) setAssessment(data);
      } catch (err) {
        if (active) {
          const message =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'This assessment could not be loaded. The link may be invalid.';
          setLoadError(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const totalQuestions = assessment?.questions.length ?? 0;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const firstUnansweredIndex = useMemo(() => {
    if (!assessment) return -1;
    return assessment.questions.findIndex((q) => answers[q.qid] === undefined);
  }, [assessment, answers]);

  const handleStart = () => {
    setSubmitError('');
    if (!learnerName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(learnerEmail)) {
      setSubmitError('Please enter your name and a valid email.');
      return;
    }
    setPhase('quiz');
  };

  const handleSelect = (qid: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: index }));
  };

  const handleSubmit = async () => {
    if (!assessment || !allAnswered) {
      setSubmitError('Please answer all questions before submitting.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        learnerName: learnerName.trim(),
        learnerEmail: learnerEmail.trim(),
        answers: assessment.questions.map((q) => ({
          qid: q.qid,
          selectedIndex: answers[q.qid],
        })),
      };
      const res = await submitAssessment(id, payload);
      setResult(res);
      setPhase('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Something went wrong submitting your answers. Please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-brand-muted/20 to-background">
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <SaarthiLogo variant="icon" size={36} rounded="xl" />
          <div className="min-w-0">
            <p className="font-semibold text-navy-900 leading-tight truncate">Saarthi AI</p>
            <p className="text-caption text-navy-500 leading-tight">Readiness assessment</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-navy-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-accent" />
            Loading assessment…
          </div>
        ) : loadError ? (
          <div className="dashboard-card text-center px-8 py-16">
            <div className="w-14 h-14 rounded-2xl bg-danger-50 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-danger-600" />
            </div>
            <h1 className="text-section-title text-navy-900">Assessment unavailable</h1>
            <p className="text-body text-navy-500 mt-2 max-w-sm mx-auto">{loadError}</p>
          </div>
        ) : phase === 'results' && result ? (
          <ResultsScreen result={result} learnerName={learnerName} />
        ) : phase === 'intro' ? (
          <IntroScreen
            title={assessment?.title ?? 'Readiness assessment'}
            questionCount={totalQuestions}
            learnerName={learnerName}
            learnerEmail={learnerEmail}
            onName={setLearnerName}
            onEmail={setLearnerEmail}
            onStart={handleStart}
            error={submitError}
          />
        ) : (
          assessment && (
            <QuizScreen
              assessment={assessment}
              answers={answers}
              answeredCount={answeredCount}
              allAnswered={allAnswered}
              firstUnansweredIndex={firstUnansweredIndex}
              submitting={submitting}
              error={submitError}
              onSelect={handleSelect}
              onSubmit={handleSubmit}
            />
          )
        )}
      </main>
    </div>
  );
}

function IntroScreen({
  title,
  questionCount,
  learnerName,
  learnerEmail,
  onName,
  onEmail,
  onStart,
  error,
}: {
  title: string;
  questionCount: number;
  learnerName: string;
  learnerEmail: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onStart: () => void;
  error: string;
}) {
  return (
    <div className="dashboard-card p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-muted flex items-center justify-center shrink-0 shadow-soft">
          <GraduationCap className="w-6 h-6 text-brand-accent" />
        </div>
        <div>
          <h1 className="text-page-title text-navy-900">{title}</h1>
          <p className="text-body text-navy-500 mt-0.5">
            {questionCount} question{questionCount === 1 ? '' : 's'} · multiple choice
          </p>
        </div>
      </div>

      <p className="text-body text-navy-600 mb-6 leading-relaxed">
        Enter your details to begin. Your results help your team understand training readiness.
      </p>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onStart();
        }}
      >
        <div>
          <label htmlFor="learnerName" className="block text-section-title text-navy-700 mb-2">
            Full name
          </label>
          <input
            id="learnerName"
            type="text"
            required
            value={learnerName}
            onChange={(e) => onName(e.target.value)}
            className="input-base"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="learnerEmail" className="block text-section-title text-navy-700 mb-2">
            Email
          </label>
          <input
            id="learnerEmail"
            type="email"
            required
            value={learnerEmail}
            onChange={(e) => onEmail(e.target.value)}
            className="input-base"
            placeholder="jane@company.com"
          />
        </div>

        {error && (
          <p className="text-caption text-danger-600" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full">
          Start assessment
        </Button>
      </form>
    </div>
  );
}

function QuizScreen({
  assessment,
  answers,
  answeredCount,
  allAnswered,
  firstUnansweredIndex,
  submitting,
  error,
  onSelect,
  onSubmit,
}: {
  assessment: PublicAssessment;
  answers: Record<string, number>;
  answeredCount: number;
  allAnswered: boolean;
  firstUnansweredIndex: number;
  submitting: boolean;
  error: string;
  onSelect: (qid: string, index: number) => void;
  onSubmit: () => void;
}) {
  const total = assessment.questions.length;
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-section-title text-navy-900 truncate pr-3">{assessment.title}</h1>
          <span className="text-caption text-navy-500 whitespace-nowrap tabular-nums">
            {answeredCount}/{total}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
          <div
            className="h-full bg-brand-accent transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-5">
        {assessment.questions.map((q, qi) => {
          const selected = answers[q.qid];
          return (
            <div key={q.qid} className="dashboard-card p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="shrink-0 w-7 h-7 rounded-lg bg-brand-muted text-brand-deep text-caption font-semibold flex items-center justify-center tabular-nums">
                  {qi + 1}
                </span>
                <div className="min-w-0">
                  <span className="text-caption font-medium text-brand-accent uppercase tracking-wide">
                    {q.topic}
                  </span>
                  <p className="text-body font-medium text-navy-900 mt-1 leading-relaxed">
                    {q.text}
                  </p>
                </div>
              </div>

              <div className="space-y-2 sm:pl-10">
                {q.options.map((option, oi) => {
                  const active = selected === oi;
                  return (
                    <label
                      key={oi}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer motion-safe-transition',
                        active
                          ? 'border-brand-accent bg-brand-muted/60 shadow-soft'
                          : 'border-border bg-surface hover:border-navy-200 hover:bg-surface-muted',
                      )}
                    >
                      <input
                        type="radio"
                        name={q.qid}
                        checked={active}
                        onChange={() => onSelect(q.qid, oi)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center motion-safe-transition',
                          active ? 'border-brand-accent' : 'border-navy-300',
                        )}
                      >
                        {active && <span className="w-2.5 h-2.5 rounded-full bg-brand-accent" />}
                      </span>
                      <span className="text-body text-navy-700">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-caption text-danger-600 mt-5 text-center" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-caption text-navy-500">
          {allAnswered
            ? 'All questions answered. Ready to submit.'
            : `Answer all questions to submit${
                firstUnansweredIndex >= 0 ? ` (next: Q${firstUnansweredIndex + 1})` : ''
              }.`}
        </p>
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          loading={submitting}
          disabled={!allAnswered || submitting}
          className="w-full sm:w-auto"
        >
          Submit assessment
        </Button>
      </div>
    </div>
  );
}

function ResultsScreen({
  result,
  learnerName,
}: {
  result: SubmitResult;
  learnerName: string;
}) {
  const theme = STATUS_THEME[result.status];
  const StatusIcon = theme.icon;

  return (
    <div className="space-y-6">
      <div className={cn('dashboard-card border-2 p-6 sm:p-10 text-center', theme.ring)}>
        <div
          className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5',
            theme.bg,
          )}
        >
          <StatusIcon className={cn('w-8 h-8', theme.text)} />
        </div>
        <p className="text-caption font-medium text-navy-500 uppercase tracking-wide">
          {learnerName ? `${learnerName}'s result` : 'Your result'}
        </p>
        <h1 className={cn('text-display mt-1', theme.text)}>
          {readinessStatusLabel[result.status]}
        </h1>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-5xl font-semibold tracking-tight text-navy-900 tabular-nums">
            {result.score}%
          </span>
          <span className="text-body text-navy-500 mt-3">competency</span>
        </div>
        <p className="text-body text-navy-600 mt-4 max-w-md mx-auto">{theme.note}</p>
      </div>

      {result.perTopic.length > 0 && (
        <div className="dashboard-card p-5 sm:p-6">
          <h2 className="text-section-title text-navy-900 mb-4">Topic breakdown</h2>
          <div className="space-y-3">
            {result.perTopic.map((t) => {
              const pct = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
              const weak = t.correct < t.total;
              return (
                <div key={t.topic}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body text-navy-700">{t.topic}</span>
                    <span className="text-caption text-navy-500 tabular-nums">
                      {t.correct}/{t.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                    <div
                      className={cn('h-full', weak ? 'bg-warning-500' : 'bg-success-500')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result.gaps.length > 0 && (
        <div className="dashboard-card p-5 sm:p-6">
          <h2 className="text-section-title text-navy-900 mb-1">Areas to improve</h2>
          <p className="text-caption text-navy-500 mb-4">Topics where one or more answers were missed.</p>
          <div className="flex flex-wrap gap-2">
            {result.gaps.map((gap) => (
              <span
                key={gap}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-caption font-medium bg-warning-50 text-warning-700 border border-warning-100"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.retrainingAssigned && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-primary-50 border border-primary-100 text-primary-700">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-body">
            Retraining has been automatically assigned for the weak topics above. Your team has been
            notified and will follow up.
          </p>
        </div>
      )}
    </div>
  );
}
