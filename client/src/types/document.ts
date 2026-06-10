export type DocumentStatus = 'PROCESSING' | 'READY' | 'FAILED';

export interface KnowledgeDocument {
  id: string;
  filename: string;
  fileType: string;
  status: DocumentStatus;
  createdAt: string;
}
