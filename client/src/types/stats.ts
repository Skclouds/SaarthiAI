export interface OverviewStats {
  totalConversations: number;
  openTickets: number;
  resolvedTickets: number;
  escalatedTickets: number;
  aiResolutionRate: number;
  csat: number;
  thumbsUp: number;
  thumbsDown: number;
}

export interface AnalyticsTimePoint {
  date: string;
  avgResponseTimeMs: number;
  resolutionRate: number;
  escalationRate: number;
  conversationCount: number;
  csat: number;
  thumbsUp: number;
  thumbsDown: number;
}

export interface ReferencedDocument {
  documentId: string;
  filename: string;
  count: number;
}

export interface UnansweredQuestion {
  conversationId: string;
  customerName: string;
  question: string;
  createdAt: string;
}

export interface AnalyticsResult {
  avgResponseTimeMs: number;
  resolutionRate: number;
  escalationRate: number;
  csat: number;
  thumbsUp: number;
  thumbsDown: number;
  timeSeries: AnalyticsTimePoint[];
  kbMetrics: {
    mostReferencedDocuments: ReferencedDocument[];
    failedQueriesCount: number;
    unansweredQuestions: UnansweredQuestion[];
  };
}
