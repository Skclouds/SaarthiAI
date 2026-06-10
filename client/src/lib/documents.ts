import api from './api';
import { KnowledgeDocument } from '@/types/document';

export async function fetchDocuments(): Promise<KnowledgeDocument[]> {
  const { data } = await api.get<{ documents: KnowledgeDocument[] }>('/documents');
  return data.documents;
}

export async function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<KnowledgeDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<{ document: KnowledgeDocument }>(
    '/documents/upload',
    formData,
    {
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress?.(Math.round((event.loaded * 100) / event.total));
        }
      },
    },
  );

  return data.document;
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export async function reindexDocument(id: string): Promise<KnowledgeDocument> {
  const { data } = await api.post<{ document: KnowledgeDocument }>(
    `/documents/${id}/reindex`,
  );
  return data.document;
}
