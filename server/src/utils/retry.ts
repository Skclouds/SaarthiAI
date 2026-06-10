import { GoogleGenerativeAIFetchError } from '@google/generative-ai';

const MAX_RETRIES = 6;
const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 60_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRateLimitError(err: unknown): boolean {
  if (err instanceof GoogleGenerativeAIFetchError) {
    return err.status === 429;
  }
  const status = (err as { status?: number })?.status;
  return status === 429;
}

export function isRetryableError(err: unknown): boolean {
  if (err instanceof GoogleGenerativeAIFetchError) {
    return err.status === 429 || err.status === 503;
  }
  const status = (err as { status?: number })?.status;
  return status === 429 || status === 503;
}

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err) || attempt === MAX_RETRIES) {
        throw err;
      }

      const baseDelay = INITIAL_DELAY_MS * 2 ** attempt;
      const delay = Math.min(baseDelay + Math.random() * 500, MAX_DELAY_MS);
      console.warn(
        `Gemini API rate limited (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${Math.round(delay)}ms…`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}
