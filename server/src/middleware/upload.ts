import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { env } from '../config/env';
import { AppError } from './errorHandler';

const storage = multer.memoryStorage();

const BLOCKED_EXTENSIONS = /\.(exe|bat|cmd|com|msi|js|jsx|ts|tsx|sh|php|py|rb|jar|dll|scr|vbs|ps1|html|htm)$/i;

const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (BLOCKED_EXTENSIONS.test(file.originalname)) {
      cb(new Error('File type not allowed'));
      return;
    }

    const allowedMime = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ].includes(file.mimetype);

    const allowedExt = /\.(pdf|docx|txt|md)$/i.test(file.originalname);

    if (allowedMime && allowedExt) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, TXT, and MD files are allowed'));
    }
  },
});

export function handleUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new AppError('File too large. Maximum size is 10MB', 400));
        return;
      }
      next(new AppError(err.message, 400));
      return;
    }
    if (err) {
      next(new AppError(err.message, 400));
      return;
    }
    next();
  });
}
