/** Target chunk size in characters (user spec: ~500–800). */
export const CHUNK_SIZE_CHARS = 700;
/** Overlap between consecutive chunks in characters. */
export const CHUNK_OVERLAP_CHARS = 100;

const BREAK_SEPARATORS = ['\n\n', '\n', '. ', ' ', ''];

/**
 * Find the best break point within [start, end) searching backward from end.
 * Prefers paragraph > line > sentence > word boundaries.
 */
function findBreakPoint(text: string, start: number, end: number): number {
  const minBreak = start + Math.floor(CHUNK_SIZE_CHARS * 0.5);
  const slice = text.slice(start, end);

  for (const sep of BREAK_SEPARATORS) {
    if (!sep) continue;
    const idx = slice.lastIndexOf(sep);
    if (idx >= minBreak - start) {
      return start + idx + sep.length;
    }
  }

  return end;
}

/**
 * Split text into overlapping chunks of ~500–800 characters.
 * Uses a sliding window with semantic break points (paragraphs, sentences, words).
 */
export function splitText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  if (normalized.length <= CHUNK_SIZE_CHARS) {
    return [normalized];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const hardEnd = Math.min(start + CHUNK_SIZE_CHARS, normalized.length);
    const chunkEnd =
      hardEnd < normalized.length ? findBreakPoint(normalized, start, hardEnd) : hardEnd;

    const chunk = normalized.slice(start, chunkEnd).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (chunkEnd >= normalized.length) break;

    const nextStart = chunkEnd - CHUNK_OVERLAP_CHARS;
    start = nextStart > start ? nextStart : chunkEnd;
  }

  return chunks;
}
