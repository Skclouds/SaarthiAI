import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as documentService from '../services/document.service';

export async function upload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    if (!req.file) {
      next(new AppError('No file uploaded', 400));
      return;
    }

    const fileType = documentService.resolveFileType(
      req.file.mimetype,
      req.file.originalname,
    );

    if (!fileType) {
      next(new AppError('Unsupported file type. Allowed: PDF, DOCX, TXT, MD', 400));
      return;
    }

    const document = await documentService.createAndIngestDocument(
      req.user.businessId,
      req.file.originalname,
      fileType,
      req.file.buffer,
    );

    res.status(201).json({ document });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const documents = await documentService.listDocuments(req.user.businessId);
    res.json({ documents });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    await documentService.deleteDocument(String(req.params.id), req.user.businessId);
    res.json({ message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
}

export async function reindex(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    const document = await documentService.reindexDocument(
      String(req.params.id),
      req.user.businessId,
    );
    res.json({ document });
  } catch (err) {
    next(err);
  }
}
