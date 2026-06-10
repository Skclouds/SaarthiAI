import cors, { CorsOptions } from 'cors';

const LOCAL_DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '');
}

/** Read allowed admin origins from env on each call — never baked in at import time. */
export function getAdminAllowedOrigins(): string[] {
  const origins = new Set<string>();
  const clientUrl = process.env.CLIENT_URL?.trim();

  if (clientUrl) {
    origins.add(normalizeOrigin(clientUrl));
  }

  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (isDevelopment) {
    for (const local of LOCAL_DEV_ORIGINS) {
      origins.add(local);
    }
  }

  return [...origins];
}

function isAdminOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }
  const normalized = normalizeOrigin(origin);
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
