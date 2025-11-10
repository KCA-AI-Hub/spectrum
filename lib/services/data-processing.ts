/**
 * Data Processing Service for Phase 4B.4
 * Handles scraped content processing, storage, and quality verification
 */

import { PrismaClient, Article, ArticleStatus } from '@prisma/client';
import {
  processContentForStorage,
  calculateRelevanceScore,
  calculateContentSimilarity,
  type ProcessedContent
} from '../utils/content-processing';

export interface ScrapedContentData {
  url: string;
  title?: string;
  content: string;
  metadata?: Record<string, unknown>;
  crawlJobId: string;
  searchKeywords?: string[];
  author?: string;
  publishedAt?: Date;
  imageUrl?: string;
}

export interface ProcessingResult {
  success: boolean;
  articleId?: string;
  isDuplicate?: boolean;
  relevanceScore?: number;
  error?: string;
  warnings?: string[];
}

export interface ProcessingStats {
  totalProcessed: number;
  successCount: number;
  duplicateCount: number;
  lowQualityCount: number;
  errorCount: number;
  averageRelevanceScore: number;
  processingTime: number;
}

export class DataProcessingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Process scraped content and store in database
   */
  async processScrapedContent(data: ScrapedContentData): Promise<ProcessingResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // Step 1: Process and clean content
      const processed = processContentForStorage(
        data.content,
        data.metadata || {},
        data.searchKeywords || []
      );

      // Step 2: Check for duplicates
      const duplicateCheck = await this.checkForDuplicates(data.url, processed.cleanText, processed.title, data.crawlJobId);
      if (duplicateCheck.isDuplicate) {
        return {
          success: false,
          isDuplicate: true,
          error: `Duplicate content detected: ${duplicateCheck.reason}`
        };
      }

      // Step 3: Calculate relevance score
      const relevanceScore = calculateRelevanceScore(
        processed.cleanText,
        processed.title,
        data.searchKeywords || [],
        data.url
      );

      // Step 4: Verify content quality
      const qualityCheck = this.verifyContentQuality(processed, relevanceScore);
      if (!qualityCheck.isValid) {
        warnings.push(...qualityCheck.warnings);
        if (qualityCheck.shouldReject) {
          return {
            success: false,
            error: `Content quality below threshold: ${qualityCheck.warnings.join(', ')}`
          };
        }
      }

      // Step 5: Store in database
      const article = await this.storeArticle(data, processed, relevanceScore);

      // Step 6: Update processing statistics
      await this.updateProcessingStats(data.crawlJobId, true, relevanceScore, Date.now() - startTime);

      return {
        success: true,
        articleId: article.id,
        relevanceScore,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      console.error('Error processing scraped content:', error);

      // Update error statistics
      await this.updateProcessingStats(data.crawlJobId, false, 0, Date.now() - startTime);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error'
      };
    }
  }

  /**
   * Check for duplicate content within same crawl job
   */
  private async checkForDuplicates(
    url: string,
    content: string,
    title: string,
    crawlJobId?: string
  ): Promise<{ isDuplicate: boolean; reason?: string; existingArticleId?: string }> {

    // Only check for exact URL match within the same crawl job
    // This allows the same article from different searches
    if (crawlJobId) {
      const existingInJob = await this.prisma.article.findFirst({
        where: {
          url,
          crawlJobId
        },
        select: { id: true, title: true }
      });

      if (existingInJob) {
        return {
          isDuplicate: true,
          reason: 'Same URL already exists in this crawl job',
          existingArticleId: existingInJob.id
        };
      }
    }

    // Also check for exact URL match globally (to avoid storing same URL multiple times)
    const existingByUrl = await this.prisma.article.findUnique({
      where: { url },
      select: { id: true, title: true, createdAt: true }
    });

    if (existingByUrl) {
      // If article is older than 30 days, allow it to be re-scraped
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (existingByUrl.createdAt < thirtyDaysAgo) {
        console.log(`Article URL exists but is old (${existingByUrl.createdAt}), allowing re-scrape`);
        return { isDuplicate: false };
      }

      return {
        isDuplicate: true,
        reason: 'Same URL already exists',
        existingArticleId: existingByUrl.id
      };
    }

    // Removed content similarity check for better performance
    // You can re-enable it if needed for specific use cases

    return { isDuplicate: false };
  }

  /**
   * Verify content quality
   */
  private verifyContentQuality(
    processed: ProcessedContent,
    relevanceScore: number
  ): { isValid: boolean; shouldReject: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let shouldReject = false;

    // Check minimum content length
    if (processed.wordCount < 50) {
      warnings.push('Content too short (< 50 words)');
      shouldReject = true;
    }

    // Check maximum content length
    if (processed.wordCount > 20000) {
      warnings.push('Content very long (> 20,000 words)');
    }

    // Check title quality
    if (!processed.title || processed.title === 'Untitled' || processed.title.length < 10) {
      warnings.push('Poor title quality');
    }

    // Check relevance score
    if (relevanceScore < 10) {
      warnings.push('Low relevance score');
      shouldReject = true;
    }

    // Check for meaningful keywords
    if (processed.keywords.length === 0) {
      warnings.push('No keywords extracted');
    }

    // Check content-to-noise ratio
    const cleanTextRatio = processed.cleanText.length / processed.cleanText.replace(/\s+/g, '').length;
    if (cleanTextRatio > 3) {
      warnings.push('High noise-to-content ratio');
    }

    return {
      isValid: warnings.length === 0,
      shouldReject,
      warnings
    };
  }

  /**
   * Store article in database
   */
  private async storeArticle(
    data: ScrapedContentData,
    processed: ProcessedContent,
    relevanceScore: number
  ): Promise<Article> {

    const keywordTags = JSON.stringify(processed.keywords);

    return await this.prisma.article.create({
      data: {
        crawlJobId: data.crawlJobId,
        title: processed.title,
        content: processed.cleanText,
        url: data.url,
        author: data.author,
        publishedAt: data.publishedAt,
        imageUrl: data.imageUrl,
        relevanceScore,
        keywordTags,
        tags: data.metadata ? JSON.stringify(data.metadata) : null,
        status: ArticleStatus.PROCESSED
      }
    });
  }

  /**
   * Batch process multiple scraped contents
   */
  async batchProcessScrapedContent(dataList: ScrapedContentData[]): Promise<ProcessingStats> {
    const startTime = Date.now();
    let successCount = 0;
    let duplicateCount = 0;
    let lowQualityCount = 0;
    let errorCount = 0;
    let totalRelevanceScore = 0;

    // Process in chunks to avoid overwhelming the database
    const chunkSize = 10;
    for (let i = 0; i < dataList.length; i += chunkSize) {
      const chunk = dataList.slice(i, i + chunkSize);

      const results = await Promise.allSettled(
        chunk.map(data => this.processScrapedContent(data))
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const processResult = result.value;
          if (processResult.success) {
            successCount++;
            totalRelevanceScore += processResult.relevanceScore || 0;
          } else if (processResult.isDuplicate) {
            duplicateCount++;
          } else if (processResult.error?.includes('quality below threshold')) {
            lowQualityCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
          console.error('Batch processing error:', result.reason);
        }
      }
    }

    const totalProcessed = dataList.length;
    const processingTime = Date.now() - startTime;
    const averageRelevanceScore = successCount > 0 ? totalRelevanceScore / successCount : 0;

    return {
      totalProcessed,
      successCount,
      duplicateCount,
      lowQualityCount,
      errorCount,
      averageRelevanceScore,
      processingTime
    };
  }

  /**
   * Update processing statistics for a crawl job
   */
  private async updateProcessingStats(
    crawlJobId: string,
    success: boolean,
    relevanceScore: number,
    processingTime: number
  ): Promise<void> {
    try {
      const crawlJob = await this.prisma.crawlJob.findUnique({
        where: { id: crawlJobId }
      });

      if (!crawlJob) return;

      if (success) {
        await this.prisma.crawlJob.update({
          where: { id: crawlJobId },
          data: {
            processedItems: { increment: 1 }
          }
        });
      }

      // Store detailed statistics in system config for monitoring
      const statsKey = `crawl_stats_${crawlJobId}`;
      const existingStats = await this.prisma.systemConfig.findUnique({
        where: { key: statsKey }
      });

      const currentStats = existingStats ? JSON.parse(existingStats.value) : {
        successCount: 0,
        errorCount: 0,
        totalRelevanceScore: 0,
        totalProcessingTime: 0
      };

      if (success) {
        currentStats.successCount++;
        currentStats.totalRelevanceScore += relevanceScore;
      } else {
        currentStats.errorCount++;
      }
      currentStats.totalProcessingTime += processingTime;

      await this.prisma.systemConfig.upsert({
        where: { key: statsKey },
        update: { value: JSON.stringify(currentStats) },
        create: {
          key: statsKey,
          value: JSON.stringify(currentStats),
          description: `Processing statistics for crawl job ${crawlJobId}`
        }
      });

    } catch (error) {
      console.error('Error updating processing stats:', error);
    }
  }

  /**
   * Get processing statistics for a crawl job
   */
  async getProcessingStats(crawlJobId: string): Promise<ProcessingStats | null> {
    try {
      const statsKey = `crawl_stats_${crawlJobId}`;
      const statsConfig = await this.prisma.systemConfig.findUnique({
        where: { key: statsKey }
      });

      if (!statsConfig) return null;

      const stats = JSON.parse(statsConfig.value);
      const totalProcessed = stats.successCount + stats.errorCount;
      const averageRelevanceScore = stats.successCount > 0
        ? stats.totalRelevanceScore / stats.successCount
        : 0;

      return {
        totalProcessed,
        successCount: stats.successCount,
        duplicateCount: 0, // Not tracked in this storage format
        lowQualityCount: 0, // Not tracked in this storage format
        errorCount: stats.errorCount,
        averageRelevanceScore,
        processingTime: stats.totalProcessingTime
      };

    } catch (error) {
      console.error('Error retrieving processing stats:', error);
      return null;
    }
  }

  /**
   * Normalize and clean up existing data
   */
  async normalizeExistingData(batchSize: number = 100): Promise<{
    processed: number;
    updated: number;
    errors: number;
  }> {
    let processed = 0;
    let updated = 0;
    let errors = 0;
    let offset = 0;

    while (true) {
      // Get batch of articles that need normalization
      const articles = await this.prisma.article.findMany({
        where: {
          OR: [
            { relevanceScore: null },
            { keywordTags: null },
            { status: ArticleStatus.RAW }
          ]
        },
        take: batchSize,
        skip: offset,
        orderBy: { createdAt: 'asc' }
      });

      if (articles.length === 0) break;

      for (const article of articles) {
        try {
          const processedContent = processContentForStorage(article.content);
          const relevanceScore = calculateRelevanceScore(
            processedContent.cleanText,
            processedContent.title,
            processedContent.keywords,
            article.url
          );

          await this.prisma.article.update({
            where: { id: article.id },
            data: {
              title: processedContent.title,
              content: processedContent.cleanText,
              relevanceScore,
              keywordTags: JSON.stringify(processedContent.keywords),
              status: ArticleStatus.PROCESSED
            }
          });

          updated++;
        } catch (error) {
          console.error(`Error normalizing article ${article.id}:`, error);
          errors++;
        }
        processed++;
      }

      offset += articles.length;
    }

    return { processed, updated, errors };
  }
}