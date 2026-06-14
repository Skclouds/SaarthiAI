/** Patterns that attempt to break out of RAG context delimiters or override instructions. */
const INJECTION_PATTERNS = [
  /---\s*END\s+CONTEXT\s*---/gi,
  /---\s*CONTEXT\s*---/gi,
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /you\s+are\s+now\s+/gi,
  /system\s*:\s*/gi,
  /reveal\s+(all\s+)?(internal|company|confidential)/gi,
  /show\s+(all\s+)?(internal|company|confidential)/gi,
];

const MAX_CHUNK_CHARS = 4000;

/**
 * Sanitize untrusted text from uploaded documents before embedding in LLM prompts.
 */
export function sanitizeRagChunk(text: string): string {
  let sanitized = text.slice(0, MAX_CHUNK_CHARS);
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[filtered]');
  }
  return sanitized.trim();
}

export function formatRagContext(chunks: string[]): string {
  return chunks
    .map((chunk, i) => `<source index="${i + 1}">\n${sanitizeRagChunk(chunk)}\n</source>`)
    .join('\n\n');
}
