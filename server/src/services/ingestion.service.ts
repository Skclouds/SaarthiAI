import path from 'path';
import fs from 'fs/promises';
import { Types } from 'mongoose';
import { Chunk, DocumentModel } from '../models';
import { splitText } from './chunking.service';
import { embedTexts } from './embedding.service';
import * as parsingService from './parsing.service';
import * as pineconeService from './pinecone.service';

export function getDocumentFilePath(
  businessId: string,
  documentId: string,
  fileType: string,
): string {
  const ext = fileType === 'md' ? '.md' : `.${fileType}`;
  return path.join(businessId, `${documentId}${ext}`);
}

export async function removeDocumentChunks(
  businessId: string,
  documentId: string,
): Promise<void> {
  const chunks = await Chunk.find({
    businessId: new Types.ObjectId(businessId),
    documentId: new Types.ObjectId(documentId),
  });

  const pineconeIds = chunks.map((c) => c.pineconeId);
  await pineconeService.deleteVectors(businessId, pineconeIds);
  await Chunk.deleteMany({
    businessId: new Types.ObjectId(businessId),
    documentId: new Types.ObjectId(documentId),
  });
}

export async function runIngestionPipeline(
  businessId: string,
  documentId: string,
  filePath: string,
  fileType: string,
): Promise<void> {
  const businessObjectId = new Types.ObjectId(businessId);
  const documentObjectId = new Types.ObjectId(documentId);

  try {
    await DocumentModel.findOneAndUpdate(
      { _id: documentObjectId, businessId: businessObjectId },
      { status: 'PROCESSING' },
    );
    await removeDocumentChunks(businessId, documentId);

    const text = await parsingService.parseFile(filePath, fileType);
    const textChunks = splitText(text);

    if (textChunks.length === 0) {
      throw new Error('No content to index after parsing');
    }

    console.log(`[Ingestion] Document ${documentId}: ${textChunks.length} chunk(s) from ${text.length} chars`);
    textChunks.forEach((chunk, i) => {
      console.log(`  chunk ${i}: ${chunk.length} chars, preview: "${chunk.slice(0, 80).replace(/\n/g, ' ')}…"`);
    });

    const embeddings = await embedTexts(textChunks);

    const vectors = textChunks.map((content, index) => ({
      id: `${documentId}-${index}`,
      values: embeddings[index],
      metadata: {
        businessId,
        documentId,
        chunkIndex: index,
        text: content,
      },
    }));

    await pineconeService.upsertVectors(businessId, vectors);
    console.log(`[Ingestion] Upserted ${vectors.length} vectors for document ${documentId} (chunkIndex 0–${vectors.length - 1})`);

    await Chunk.insertMany(
      textChunks.map((content, index) => ({
        businessId: new Types.ObjectId(businessId),
        documentId: new Types.ObjectId(documentId),
        content,
        pineconeId: `${documentId}-${index}`,
      })),
    );

    await DocumentModel.findOneAndUpdate(
      { _id: documentObjectId, businessId: businessObjectId },
      { status: 'READY' },
    );
  } catch (err) {
    console.error(`Ingestion failed for document ${documentId}:`, err);
    await DocumentModel.findOneAndUpdate(
      { _id: documentObjectId, businessId: businessObjectId },
      { status: 'FAILED' },
    );
  }
}

export async function deleteStoredFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be removed
  }
}
