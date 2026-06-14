import { NextFunction, Request, Response } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

function isCastError(err: Error): boolean {
  return err.name === 'CastError' || err.name === 'BSONError';
}

function isCorsError(err: Error): boolean {
  return err.message.startsWith('CORS:');
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const entityTooLarge =
    'type' in err && (err as { type?: string }).type === 'entity.too.large';
  if (entityTooLarge) {
    res.status(413).json({ error: 'Request body too large' });
    return;
  }

  if (isCastError(err)) {
    res.status(400).json({ error: 'Invalid id or malformed request' });
    return;
  }

  if (isCorsError(err)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  console.error('Unhandled error:', err);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  res.status(500).json({
    error: isProduction ? 'Internal server error' : err.message || 'Internal server error',
  });
}
