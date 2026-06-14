import axios from 'axios';
import api from './api';
import {
  Assessment,
  AttemptSummary,
  PublicAssessment,
  ReadinessOverview,
  SubmitAnswer,
  SubmitResult,
} from '@/types/assessment';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/** Public axios instance — no auth header, no 401 redirect (used by learners who aren't logged in). */
const publicApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export async function generateAssessment(
  documentId: string,
  numQuestions = 8,
): Promise<Assessment> {
  const { data } = await api.post<{ assessment: Assessment }>('/assessments/generate', {
    documentId,
    numQuestions,
  });
  return data.assessment;
}

export async function fetchAssessments(): Promise<Assessment[]> {
  const { data } = await api.get<{ assessments: Assessment[] }>('/assessments');
  return data.assessments;
}

export async function fetchPublicAssessment(id: string): Promise<PublicAssessment> {
  const { data } = await publicApi.get<{ assessment: PublicAssessment }>(
    `/assessments/${id}/public`,
  );
  return data.assessment;
}

export async function submitAssessment(
  id: string,
  payload: { learnerName: string; learnerEmail: string; answers: SubmitAnswer[] },
): Promise<SubmitResult> {
  const { data } = await publicApi.post<SubmitResult>(`/assessments/${id}/submit`, payload);
  return data;
}

export async function fetchReadinessOverview(): Promise<ReadinessOverview> {
  const { data } = await api.get<ReadinessOverview>('/readiness/overview');
  return data;
}

export async function fetchReadinessAttempts(): Promise<AttemptSummary[]> {
  const { data } = await api.get<{ attempts: AttemptSummary[] }>('/readiness/attempts');
  return data.attempts;
}
