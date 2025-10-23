export interface TextChunk {
  text: string;
  index: number;
  startChar: number;
  endChar: number;
}

export function chunkText(
  text: string,
  maxChunkSize: number = 4000,
  overlap: number = 200
): TextChunk[] {
  if (text.length <= maxChunkSize) {
    return [{
      text,
      index: 0,
      startChar: 0,
      endChar: text.length
    }];
  }

  const chunks: TextChunk[] = [];
  let startChar = 0;
  let index = 0;

  while (startChar < text.length) {
    let endChar = Math.min(startChar + maxChunkSize, text.length);

    if (endChar < text.length) {
      const lastPeriod = text.lastIndexOf('.', endChar);
      const lastNewline = text.lastIndexOf('\n', endChar);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > startChar + maxChunkSize / 2) {
        endChar = breakPoint + 1;
      }
    }

    chunks.push({
      text: text.substring(startChar, endChar),
      index,
      startChar,
      endChar
    });

    startChar = endChar - overlap;
    index++;
  }

  return chunks;
}

export function detectLanguage(text: string): 'ko' | 'en' | 'unknown' {
  const koreanChars = text.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g);
  const englishWords = text.match(/\b[a-zA-Z]+\b/g);

  const koreanCount = koreanChars ? koreanChars.length : 0;
  const englishCount = englishWords ? englishWords.length : 0;

  if (koreanCount === 0 && englishCount === 0) {
    return 'unknown';
  }

  return koreanCount > englishCount ? 'ko' : 'en';
}

export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s가-힣.,!?;:()\-]/g, '')
    .trim();
}

export function extractSentences(text: string): string[] {
  const koreanSentenceEndings = /([.!?])\s+/g;
  const sentences = text.split(koreanSentenceEndings).filter(s => s.trim().length > 0);

  const result: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const ending = sentences[i + 1] || '';
    result.push((sentence + ending).trim());
  }

  return result.filter(s => s.length > 0);
}

export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }

  return truncated + suffix;
}
