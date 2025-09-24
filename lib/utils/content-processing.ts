/**
 * Content processing utilities for Phase 4.3 implementation
 * Handles text cleaning, duplicate detection, and relevance scoring
 */

export interface ProcessedContent {
  cleanText: string;
  title: string;
  summary: string;
  keywords: string[];
  wordCount: number;
}

export interface SimilarityResult {
  isSimilar: boolean;
  score: number;
  reason: string;
}

/**
 * Remove HTML tags and clean text content
 */
export function cleanHtmlText(htmlContent: string): string {
  if (!htmlContent) return '';

  // Remove HTML tags
  let cleanText = htmlContent.replace(/<[^>]*>/g, ' ');

  // Remove multiple whitespace characters
  cleanText = cleanText.replace(/\s+/g, ' ');

  // Remove special characters and normalize
  cleanText = cleanText
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .trim();

  return cleanText;
}

/**
 * Extract title from markdown or HTML content
 */
export function extractTitle(content: string): string {
  if (!content) return 'Untitled';

  // Try to find markdown h1 title
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return cleanHtmlText(h1Match[1].trim());
  }

  // Try to find HTML h1 title
  const htmlH1Match = content.match(/<h1[^>]*>(.+?)<\/h1>/i);
  if (htmlH1Match) {
    return cleanHtmlText(htmlH1Match[1].trim());
  }

  // Try to find title tag
  const titleMatch = content.match(/<title[^>]*>(.+?)<\/title>/i);
  if (titleMatch) {
    return cleanHtmlText(titleMatch[1].trim());
  }

  // Extract first line as fallback
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length > 0 && firstLine.length < 200) {
    return cleanHtmlText(firstLine);
  }

  return 'Untitled';
}

/**
 * Generate content summary
 */
export function generateSummary(content: string, maxLength: number = 300): string {
  const cleanText = cleanHtmlText(content);

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  // Find sentence boundaries near the maxLength
  const sentences = cleanText.split(/[.!?]+/);
  let summary = '';

  for (const sentence of sentences) {
    if ((summary + sentence).length > maxLength) {
      break;
    }
    summary += sentence + '.';
  }

  return summary.trim() || cleanText.substring(0, maxLength) + '...';
}

/**
 * Extract keywords from content
 */
export function extractKeywordsFromContent(content: string, searchKeywords: string[] = []): string[] {
  const cleanText = cleanHtmlText(content.toLowerCase());
  const words = cleanText.match(/\b\w{3,}\b/g) || [];

  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Filter common stop words
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'shall', 'can', 'this', 'that', 'these', 'those', 'a', 'an', 'it', 'he', 'she',
    'we', 'you', 'they', 'them', 'their', 'there', 'here', 'where', 'when', 'why',
    'how', 'what', 'which', 'who', 'whom', 'whose'
  ]);

  // Get top keywords
  const keywords = Object.entries(wordCount)
    .filter(([word, count]) => !stopWords.has(word) && count > 1 && word.length > 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  // Include original search keywords if they appear in content
  const additionalKeywords = searchKeywords.filter(keyword =>
    cleanText.includes(keyword.toLowerCase())
  );

  return [...new Set([...additionalKeywords, ...keywords])];
}

/**
 * Calculate content similarity using basic text comparison
 */
export function calculateContentSimilarity(content1: string, content2: string): SimilarityResult {
  if (!content1 || !content2) {
    return { isSimilar: false, score: 0, reason: 'Empty content' };
  }

  const clean1 = cleanHtmlText(content1.toLowerCase());
  const clean2 = cleanHtmlText(content2.toLowerCase());

  // Check for exact duplicate
  if (clean1 === clean2) {
    return { isSimilar: true, score: 1.0, reason: 'Exact duplicate' };
  }

  // Check title similarity
  const title1 = extractTitle(content1).toLowerCase();
  const title2 = extractTitle(content2).toLowerCase();

  if (title1 && title2 && title1 === title2) {
    return { isSimilar: true, score: 0.95, reason: 'Same title' };
  }

  // Calculate Jaccard similarity using words
  const words1 = new Set(clean1.match(/\b\w{3,}\b/g) || []);
  const words2 = new Set(clean2.match(/\b\w{3,}\b/g) || []);

  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  const jaccardScore = intersection.size / union.size;

  // Check for similar titles with fuzzy matching
  const titleSimilarity = calculateStringSimilarity(title1, title2);

  if (titleSimilarity > 0.8) {
    return { isSimilar: true, score: titleSimilarity, reason: 'Similar title' };
  }

  // Consider similar if Jaccard similarity is high
  if (jaccardScore > 0.6) {
    return { isSimilar: true, score: jaccardScore, reason: 'High content similarity' };
  }

  return { isSimilar: false, score: jaccardScore, reason: 'Different content' };
}

/**
 * Calculate string similarity using simple edit distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate enhanced relevance score
 */
export function calculateRelevanceScore(
  content: string,
  title: string,
  keywords: string[],
  url?: string
): number {
  if (!content || keywords.length === 0) return 0;

  const cleanContent = cleanHtmlText(content.toLowerCase());
  const cleanTitle = title.toLowerCase();
  let score = 0;

  // Base score from keyword matches in content
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    const contentMatches = (cleanContent.match(new RegExp(lowerKeyword, 'g')) || []).length;
    const titleMatches = (cleanTitle.match(new RegExp(lowerKeyword, 'g')) || []).length;

    // Title matches are more valuable
    score += titleMatches * 25;
    score += contentMatches * 5;

    // Bonus for exact phrase matches
    if (cleanContent.includes(lowerKeyword)) {
      score += 10;
    }

    // Bonus for keyword in title
    if (cleanTitle.includes(lowerKeyword)) {
      score += 20;
    }
  }

  // Content quality factors
  const wordCount = cleanContent.split(/\s+/).length;

  // Bonus for reasonable content length
  if (wordCount > 100 && wordCount < 10000) {
    score += 10;
  }

  // Bonus for having a proper title
  if (title && title !== 'Untitled' && title.length > 10) {
    score += 5;
  }

  // URL quality bonus (prefer news sources)
  if (url) {
    if (url.includes('news') || url.includes('article')) {
      score += 5;
    }
  }

  // Normalize to 0-100 range
  return Math.min(100, Math.max(0, score));
}

/**
 * Process and clean content for storage
 */
export function processContentForStorage(
  rawContent: string,
  metadata: Record<string, unknown> = {},
  searchKeywords: string[] = []
): ProcessedContent {
  const cleanText = cleanHtmlText(rawContent);
  const title = extractTitle(rawContent);
  const summary = generateSummary(cleanText);
  const keywords = extractKeywordsFromContent(rawContent, searchKeywords);
  const wordCount = cleanText.split(/\s+/).length;

  return {
    cleanText,
    title,
    summary,
    keywords,
    wordCount
  };
}