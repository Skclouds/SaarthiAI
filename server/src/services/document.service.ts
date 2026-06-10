import path from 'path';
import fs from 'fs/promises';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { DocumentModel } from '../models';
import {
  deleteStoredFile,
  getDocumentFilePath,
  removeDocumentChunks,
  runIngestionPipeline,
} from './ingestion.service';

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'text/markdown': 'md',
};

const ALLOWED_EXTENSIONS: Record<string, string> = {
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.txt': 'txt',
  '.md': 'md',
};

export function resolveFileType(mimetype: string, originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  return ALLOWED_TYPES[mimetype] || ALLOWED_EXTENSIONS[ext] || '';
}

export interface DocumentListItem {
  id: string;
  filename: string;
  fileType: string;
  status: string;
  createdAt: Date;
}

export async function listDocuments(businessId: Types.ObjectId): Promise<DocumentListItem[]> {
  const docs = await DocumentModel.find({ businessId })
    .sort({ createdAt: -1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    filename: doc.filename,
    fileType: doc.fileType,
    status: doc.status,
    createdAt: doc.createdAt,
  }));
}

export async function getDocumentForBusiness(
  documentId: string,
  businessId: Types.ObjectId,
) {
  const doc = await DocumentModel.findOne({
    _id: new Types.ObjectId(documentId),
    businessId,
  });

  if (!doc) {
    throw new AppError('Document not found', 404);
  }

  return doc;
}

async function ensureUploadDir(businessId: string): Promise<string> {
  const dir = path.join(env.uploadDir, businessId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function createAndIngestDocument(
  businessId: Types.ObjectId,
  filename: string,
  fileType: string,
  fileBuffer: Buffer,
): Promise<DocumentListItem> {
  const doc = await DocumentModel.create({
    businessId,
    filename,
    fileType,
    status: 'PROCESSING',
  });

  const businessIdStr = businessId.toString();
  const documentId = doc._id.toString();
  const relativePath = getDocumentFilePath(businessIdStr, documentId, fileType);
  const dir = await ensureUploadDir(businessIdStr);
  const fullPath = path.join(dir, path.basename(relativePath));

  await fs.writeFile(fullPath, fileBuffer);

  runIngestionPipeline(businessIdStr, documentId, fullPath, fileType).catch((err) => {
    console.error('Background ingestion error:', err);
  });

  return {
    id: documentId,
    filename: doc.filename,
    fileType: doc.fileType,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

export async function deleteDocument(
  documentId: string,
  businessId: Types.ObjectId,
): Promise<void> {
  const doc = await getDocumentForBusiness(documentId, businessId);
  const businessIdStr = businessId.toString();

  await removeDocumentChunks(businessIdStr, documentId);

  const relativePath = getDocumentFilePath(businessIdStr, documentId, doc.fileType);
  const fullPath = path.join(env.uploadDir, relativePath);
  await deleteStoredFile(fullPath);

  await DocumentModel.deleteOne({ _id: doc._id });
}

export async function reindexDocument(
  documentId: string,
  businessId: Types.ObjectId,
): Promise<DocumentListItem> {
  const doc = await getDocumentForBusiness(documentId, businessId);
  const businessIdStr = businessId.toString();
  const relativePath = getDocumentFilePath(businessIdStr, documentId, doc.fileType);
  const fullPath = path.join(env.uploadDir, relativePath);

  try {
    await fs.access(fullPath);
  } catch {
    throw new AppError('Original file not found; cannot re-index', 404);
  }

  doc.status = 'PROCESSING';
  await doc.save();

  runIngestionPipeline(businessIdStr, documentId, fullPath, doc.fileType).catch((err) => {
    console.error('Background reindex error:', err);
  });

  return {
    id: doc._id.toString(),
    filename: doc.filename,
    fileType: doc.fileType,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
