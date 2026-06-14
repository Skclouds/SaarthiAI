import { NextFunction, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '');
}

/** Any localhost port — Next.js may use 3001+ when 3000 is taken. */
function isLocalDevOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

/** Read allowed admin origins from env on each call — never baked in at import time. */
export function getAdminAllowedOrigins(): string[] {
  const origins = new Set<string>();
  const clientUrl = process.env.CLIENT_URL?.trim();

  if (clientUrl) {
    origins.add(normalizeOrigin(clientUrl));
  }

  return [...origins];
}

function isAdminOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }
  const normalized = normalizeOrigin(origin);
  if (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(normalized)) {
    return true;
  }
  return getAdminAllowedOrigins().some((allowed) => normalizeOrigin(allowed) === normalized);
}

const adminCorsOptions: CorsOptions = {
  origin(origin, callback) {
    if (isAdminOriginAllowed(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: origin not allowed: ${origin}`));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

/** Dashboard / admin API — CLIENT_URL in production; CLIENT_URL + localhost in development. */
export const adminCors = cors(adminCorsOptions);

/**
 * Public chat widget — any third-party origin.
 * Covers POST /chat, GET /chat/suggested-questions, GET /chat/config, POST /chat/feedback.
 */
export const publicChatCors = cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
});

export const adminPreflightCors = cors(adminCorsOptions);

export const publicChatPreflightCors = cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
});

export function isPublicAssessmentPath(path: string): boolean {
  return /\/public$/.test(path) || /\/submit$/.test(path);
}

/**
 * Assessment routes — public learner endpoints allow any origin; admin endpoints use CLIENT_URL.
 */
export function assessmentsCors(req: Request, res: Response, next: NextFunction): void {
  if (isPublicAssessmentPath(req.path)) {
    publicChatCors(req, res, next);
    return;
  }
  adminCors(req, res, next);
}

export function assessmentsPreflightCors(req: Request, res: Response, next: NextFunction): void {
  if (isPublicAssessmentPath(req.path)) {
    publicChatPreflightCors(req, res, next);
    return;
  }
  adminPreflightCors(req, res, next);
}
