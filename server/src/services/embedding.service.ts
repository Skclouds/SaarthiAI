import { EmbedContentRequest, TaskType } from '@google/generative-ai';
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, embeddingModel } from '../config/gemini';
import { withRetry } from '../utils/retry';

interface GeminiEmbedRequest extends EmbedContentRequest {
  outputDimensionality: number;
}

/** L2-normalize — required for gemini-embedding-001 when outputDimensionality < 3072. */
function l2Normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vector;
  return vector.map((v) => v / norm);
}

async function embedWithTask(text: string, taskType: TaskType): Promise<number[]> {
  const request: GeminiEmbedRequest = {
    content: { role: 'user', parts: [{ text }] },
    taskType,
    outputDimensionality: EMBEDDING_DIMENSIONS,
  };

  const result = await withRetry(() => embeddingModel.embedContent(request));
  return l2Normalize(result.embedding.values);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await embedWithTask(text, TaskType.RETRIEVAL_DOCUMENT));
  }
  return embeddings;
}

export async function embedQuery(query: string): Promise<number[]> {
  const vector = await embedWithTask(query, TaskType.RETRIEVAL_QUERY);

  console.log('[RAG] Query embedding:', {
    model: EMBEDDING_MODEL,
    outputDimensionality: EMBEDDING_DIMENSIONS,
    taskType: TaskType.RETRIEVAL_QUERY,
    queryVectorLength: vector.length,
  });

  return vector;
}
