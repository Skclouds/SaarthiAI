import { Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

function requestPath(req: Request): string {
  return req.originalUrl.split('?')[0];
}

/** POST /auth/login or POST /auth/register only. */
export function isAuthCredentialPost(req: Request): boolean {
  if (req.method !== 'POST') return false;
  const path = requestPath(req);
  return path === '/auth/login' || path === '/auth/register';
}

/** POST /auth/google */
export function isGoogleAuthPost(req: Request): boolean {
  return req.method === 'POST' && requestPath(req) === '/auth/google';
}

/** POST /chat/feedback */
export function isChatFeedbackPost(req: Request): boolean {
  return req.method === 'POST' && requestPath(req) === '/chat/feedback';
}

/** POST /chat or POST /assessments/:id/submit only. */
export function isPublicAiPost(req: Request): boolean {
  if (req.method !== 'POST') return false;
  const path = requestPath(req);
  if (path === '/chat' || path === '/chat/') return true;
  return /^\/assessments\/[^/]+\/submit$/.test(path);
}

/** Brute-force protection for credential endpoints. */
const authStrictLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  skip: (req) => !isAuthCredentialPost(req),
});

const googleAuthLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Please try again later.' },
  skip: (req) => !isGoogleAuthPost(req),
});

const feedbackLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many feedback submissions. Please try again later.' },
  skip: (req) => !isChatFeedbackPost(req),
});

/** Abuse protection for public AI endpoints (Gemini cost control). */
const publicAiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
  skip: (req) => !isPublicAiPost(req),
});

/**
 * Applies strict rate limits only to sensitive public POST endpoints.
 * All authenticated dashboard GET traffic (and everything else) is untouched.
 */
export function selectiveRateLimit(req: Request, res: Response, next: NextFunction): void {
  if (isAuthCredentialPost(req)) {
    authStrictLimiter(req, res, next);
    return;
  }
  if (isGoogleAuthPost(req)) {
    googleAuthLimiter(req, res, next);
    return;
  }
  if (isChatFeedbackPost(req)) {
    feedbackLimiter(req, res, next);
    return;
  }
  if (isPublicAiPost(req)) {
    publicAiLimiter(req, res, next);
    return;
  }
  next();
}
