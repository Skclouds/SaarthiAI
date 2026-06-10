import { Pinecone } from '@pinecone-database/pinecone';
import { env } from '../config/env';

const pinecone = new Pinecone({ apiKey: env.pineconeApiKey });

interface VectorMetadata {
  businessId: string;
  documentId: string;
  chunkIndex: number;
  text: string;
}

interface UpsertVector {
  id: string;
  values: number[];
  metadata: VectorMetadata;
}

function getIndex() {
  return pinecone.index(env.pineconeIndex);
}

const METADATA_TEXT_LIMIT = 1000;

function truncateForMetadata(text: string): string {
  if (text.length <= METADATA_TEXT_LIMIT) return text;
  return text.slice(0, METADATA_TEXT_LIMIT) + '…';
}

export async function upsertVectors(
  businessId: string,
  vectors: UpsertVector[],
): Promise<void> {
  if (vectors.length === 0) return;

  const index = getIndex();
  const namespace = index.namespace(businessId);

  console.log('[Pinecone] Upsert:', {
    index: env.pineconeIndex,
    namespace: businessId,
    vectorCount: vectors.length,
    vectorDimensions: vectors[0]?.values.length,
  });
  const BATCH_SIZE = 100;

  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE).map((v) => ({
      id: v.id,
      values: v.values,
      metadata: {
        ...v.metadata,
        text: truncateForMetadata(v.metadata.text),
      },
    }));
    await namespace.upsert(batch);
  }
}

export interface QueryMatch {
  score: number;
  metadata: VectorMetadata;
}

export async function queryVectors(
  businessId: string,
  vector: number[],
  topK: number,
): Promise<QueryMatch[]> {
  const index = getIndex();
  const namespace = index.namespace(businessId);

  console.log('[Pinecone] Query:', {
    index: env.pineconeIndex,
    namespace: businessId,
    topK,
    queryVectorLength: vector.length,
  });

  const response = await namespace.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return (response.matches ?? []).map((match) => ({
    score: match.score ?? 0,
    metadata: match.metadata as unknown as VectorMetadata,
  }));
}

export async function deleteVectors(businessId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const index = getIndex();
  const namespace = index.namespace(businessId);
  const BATCH_SIZE = 1000;

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    await namespace.deleteMany(batch);
  }
}
