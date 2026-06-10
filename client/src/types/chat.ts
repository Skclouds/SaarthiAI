export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  unanswered?: boolean;
}

export interface SourceDocument {
  documentId: string;
  filename: string;
}

export interface ChatResponse {
  conversationId: string;
  message: {
    id: string;
    role: 'ASSISTANT';
    content: string;
    responseTimeMs: number;
    unanswered: boolean;
  };
  sources: SourceDocument[];
}

export interface PublicBotConfig {
  botName: string;
  welcomeMessage: string;
  personality: string;
}
