export type ReadinessStatus = 'READY' | 'PARTIALLY_READY' | 'NOT_READY';

export interface Assessment {
  id: string;
  documentId: string;
  title: string;
  questionCount: number;
  createdAt: string;
}

export interface PublicQuestion {
  qid: string;
  text: string;
  options: string[];
  topic: string;
}

export interface PublicAssessment {
  id: string;
  title: string;
  questions: PublicQuestion[];
}

export interface PerTopic {
  topic: string;
  correct: number;
  total: number;
}

export interface SubmitAnswer {
  qid: string;
  selectedIndex: number;
}

export interface SubmitResult {
  score: number;
  status: ReadinessStatus;
  perTopic: PerTopic[];
  gaps: string[];
  retrainingAssigned: boolean;
}

export interface ReadinessOverview {
  learnersAssessed: number;
  readyCount: number;
  atRiskCount: number;
  avgCompetency: number;
}

export interface AttemptSummary {
  id: string;
  learnerName: string;
  learnerEmail: string;
  assessmentId: string;
  score: number;
  status: ReadinessStatus;
  gaps: string[];
  createdAt: string;
}
