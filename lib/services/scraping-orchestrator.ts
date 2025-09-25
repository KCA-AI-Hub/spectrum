/**
 * Scraping Orchestrator Service - Phase 4B.4 Integration Layer
 * Coordinates all data processing, storage, and quality verification operations
 */

import { PrismaClient, CrawlJob, CrawlStatus } from '../generated/prisma';
import { DataProcessingService, type ScrapedContentData, type ProcessingStats } from './data-processing';
import { BackupRecoveryService } from './backup-recovery';
import { searchNews } from '../api/firecrawl';

export interface ScrapingJobConfig {
  crawlJobId: string;
  keywords: string[];
  sources?: string[];
  options?: {
    maxArticles?: number;
    relevanceThreshold?: number;
    enableAutoBackup?: boolean;
    batchSize?: number;
  };
}

export interface ScrapingJobResult {
  jobId: string;
  status: CrawlStatus;
  statistics: ProcessingStats;
  errors: string[];
  warnings: string[];
  startTime: Date;
  endTime?: Date;
  backupId?: string;
}

export class ScrapingOrchestratorService {
  private dataProcessingService: DataProcessingService;
  private backupService: BackupRecoveryService;

  constructor(private prisma: PrismaClient) {
    this.dataProcessingService = new DataProcessingService(prisma);
    this.backupService = new BackupRecoveryService(prisma);
  }

  /**
   * Execute complete scraping and processing workflow
   */
  async executeScrapingJob(config: ScrapingJobConfig): Promise<ScrapingJobResult> {
    const startTime = new Date();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      console.log(`Starting scraping job: ${config.crawlJobId}`);

      // Update job status to RUNNING
      await this.updateJobStatus(config.crawlJobId, CrawlStatus.RUNNING, startTime);

      // Step 1: Search and scrape content
      const scrapedContent = await this.searchAndScrapeContent(config);
      if (scrapedContent.length === 0) {
        warnings.push('No content found for the specified keywords');
      }

      // Step 2: Process scraped content in batches
      const batchSize = config.options?.batchSize || 10;
      const statistics = await this.dataProcessingService.batchProcessScrapedContent(scrapedContent);

      // Step 3: Filter by relevance threshold if specified
      if (config.options?.relevanceThreshold) {
        await this.filterByRelevanceThreshold(config.crawlJobId, config.options.relevanceThreshold);
      }

      // Step 4: Create backup if enabled
      let backupId: string | undefined;
      if (config.options?.enableAutoBackup) {
        try {
          const backup = await this.backupService.createIncrementalBackup(
            startTime,
            `Auto backup for scraping job ${config.crawlJobId}`
          );
          backupId = backup.id;
        } catch (backupError) {
          warnings.push(`Backup failed: ${backupError instanceof Error ? backupError.message : 'Unknown error'}`);
        }
      }

      // Step 5: Update job completion
      const endTime = new Date();
      await this.updateJobStatus(config.crawlJobId, CrawlStatus.COMPLETED, startTime, endTime);
      await this.updateJobStatistics(config.crawlJobId, statistics);

      console.log(`Scraping job completed: ${config.crawlJobId}`);

      return {
        jobId: config.crawlJobId,
        status: CrawlStatus.COMPLETED,
        statistics,
        errors,
        warnings,
        startTime,
        endTime,
        backupId
      };

    } catch (error) {
      console.error(`Scraping job failed: ${config.crawlJobId}`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      // Update job status to FAILED
      await this.updateJobStatus(
        config.crawlJobId,
        CrawlStatus.FAILED,
        startTime,
        new Date(),
        errorMessage
      );

      return {
        jobId: config.crawlJobId,
        status: CrawlStatus.FAILED,
        statistics: {
          totalProcessed: 0,
          successCount: 0,
          duplicateCount: 0,
          lowQualityCount: 0,
          errorCount: 1,
          averageRelevanceScore: 0,
          processingTime: Date.now() - startTime.getTime()
        },
        errors,
        warnings,
        startTime
      };
    }
  }

  /**
   * Search and scrape content using Firecrawl
   */
  private async searchAndScrapeContent(config: ScrapingJobConfig): Promise<ScrapedContentData[]> {
    const scrapedContent: ScrapedContentData[] = [];
    const maxArticles = config.options?.maxArticles || 50;

    try {
      // Use Firecrawl to search for news articles
      const searchResult = await searchNews(config.keywords, {
        limit: maxArticles,
        scrapeContent: true
      });

      if (!searchResult.success || !searchResult.data) {
        throw new Error(`Search failed: ${searchResult.error}`);
      }

      // Convert Firecrawl results to ScrapedContentData format
      for (const item of searchResult.data) {
        if (item.url && item.content) {
          scrapedContent.push({
            url: item.url,
            title: item.title || 'Untitled',
            content: item.content,
            metadata: item.metadata || {},
            crawlJobId: config.crawlJobId,
            searchKeywords: config.keywords,
            author: item.metadata?.author,
            publishedAt: item.metadata?.publishedAt ? new Date(item.metadata.publishedAt) : undefined,
            imageUrl: item.metadata?.imageUrl
          });
        }
      }

      console.log(`Scraped ${scrapedContent.length} articles for job ${config.crawlJobId}`);
      return scrapedContent;

    } catch (error) {
      console.error('Error during content scraping:', error);
      throw error;
    }
  }

  /**
   * Filter articles by relevance threshold
   */
  private async filterByRelevanceThreshold(crawlJobId: string, threshold: number): Promise<void> {
    try {
      // Find articles with low relevance scores
      const lowRelevanceArticles = await this.prisma.article.findMany({
        where: {
          crawlJobId,
          relevanceScore: { lt: threshold }
        },
        select: { id: true }
      });

      if (lowRelevanceArticles.length > 0) {
        // Mark them as low quality rather than deleting
        await this.prisma.article.updateMany({
          where: {
            id: { in: lowRelevanceArticles.map(a => a.id) }
          },
          data: {
            status: 'FAILED' // Using FAILED status to indicate low quality
          }
        });

        console.log(`Filtered ${lowRelevanceArticles.length} low-relevance articles`);
      }

    } catch (error) {
      console.error('Error filtering by relevance threshold:', error);
    }
  }

  /**
   * Update crawl job status
   */
  private async updateJobStatus(
    jobId: string,
    status: CrawlStatus,
    startedAt: Date,
    completedAt?: Date,
    errorMessage?: string
  ): Promise<void> {
    try {
      await this.prisma.crawlJob.update({
        where: { id: jobId },
        data: {
          status,
          startedAt,
          completedAt,
          errorMessage
        }
      });
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  }

  /**
   * Update job statistics
   */
  private async updateJobStatistics(jobId: string, statistics: ProcessingStats): Promise<void> {
    try {
      await this.prisma.crawlJob.update({
        where: { id: jobId },
        data: {
          totalItems: statistics.totalProcessed,
          processedItems: statistics.successCount
        }
      });
    } catch (error) {
      console.error('Error updating job statistics:', error);
    }
  }

  /**
   * Get comprehensive job status including processing statistics
   */
  async getJobStatus(jobId: string): Promise<{
    job: CrawlJob | null;
    statistics: ProcessingStats | null;
    articles: Array<{
      id: string;
      title: string;
      url: string;
      relevanceScore: number | null;
      status: string;
      createdAt: Date;
    }>;
  }> {
    try {
      const [job, statistics, articles] = await Promise.all([
        this.prisma.crawlJob.findUnique({
          where: { id: jobId },
          include: { target: true }
        }),
        this.dataProcessingService.getProcessingStats(jobId),
        this.prisma.article.findMany({
          where: { crawlJobId: jobId },
          select: {
            id: true,
            title: true,
            url: true,
            relevanceScore: true,
            status: true,
            createdAt: true
          },
          orderBy: { relevanceScore: 'desc' },
          take: 100
        })
      ]);

      return { job, statistics, articles };

    } catch (error) {
      console.error('Error getting job status:', error);
      throw error;
    }
  }

  /**
   * Reprocess failed or low-quality articles
   */
  async reprocessFailedArticles(jobId: string): Promise<{
    reprocessed: number;
    improved: number;
    stillFailed: number;
  }> {
    let reprocessed = 0;
    let improved = 0;
    let stillFailed = 0;

    try {
      // Get failed articles
      const failedArticles = await this.prisma.article.findMany({
        where: {
          crawlJobId: jobId,
          status: 'FAILED'
        }
      });

      for (const article of failedArticles) {
        try {
          // Reprocess the article
          const result = await this.dataProcessingService.processScrapedContent({
            url: article.url,
            title: article.title,
            content: article.content,
            crawlJobId: jobId,
            searchKeywords: article.keywordTags ? JSON.parse(article.keywordTags) : []
          });

          reprocessed++;

          if (result.success && result.relevanceScore && result.relevanceScore > 10) {
            improved++;
          } else {
            stillFailed++;
          }

        } catch (error) {
          console.error(`Error reprocessing article ${article.id}:`, error);
          stillFailed++;
        }
      }

      console.log(`Reprocessing completed: ${reprocessed} total, ${improved} improved, ${stillFailed} still failed`);

      return { reprocessed, improved, stillFailed };

    } catch (error) {
      console.error('Error during reprocessing:', error);
      throw error;
    }
  }

  /**
   * Get system health and performance metrics
   */
  async getSystemMetrics(): Promise<{
    totalArticles: number;
    processingSuccessRate: number;
    averageRelevanceScore: number;
    duplicateRate: number;
    systemLoad: {
      activeJobs: number;
      pendingJobs: number;
      failedJobs: number;
    };
    backupStatus: {
      totalBackups: number;
      lastBackupDate: Date | null;
      backupSize: number;
    };
  }> {
    try {
      const [
        totalArticles,
        avgRelevanceScore,
        duplicateCount,
        jobCounts,
        backups
      ] = await Promise.all([
        this.prisma.article.count(),
        this.prisma.article.aggregate({
          _avg: { relevanceScore: true }
        }),
        this.prisma.article.count({
          where: { status: 'FAILED' } // Using FAILED to represent duplicates
        }),
        this.prisma.crawlJob.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        this.backupService.listBackups()
      ]);

      const systemLoad = {
        activeJobs: jobCounts.find(j => j.status === 'RUNNING')?._count.status || 0,
        pendingJobs: jobCounts.find(j => j.status === 'PENDING')?._count.status || 0,
        failedJobs: jobCounts.find(j => j.status === 'FAILED')?._count.status || 0
      };

      const processedJobs = jobCounts.find(j => j.status === 'COMPLETED')?._count.status || 0;
      const totalJobs = jobCounts.reduce((sum, j) => sum + j._count.status, 0);
      const processingSuccessRate = totalJobs > 0 ? (processedJobs / totalJobs) * 100 : 0;

      const duplicateRate = totalArticles > 0 ? (duplicateCount / totalArticles) * 100 : 0;

      const backupStatus = {
        totalBackups: backups.length,
        lastBackupDate: backups.length > 0 ? backups[0].timestamp : null,
        backupSize: backups.reduce((sum, b) => sum + b.size, 0)
      };

      return {
        totalArticles,
        processingSuccessRate,
        averageRelevanceScore: avgRelevanceScore._avg.relevanceScore || 0,
        duplicateRate,
        systemLoad,
        backupStatus
      };

    } catch (error) {
      console.error('Error getting system metrics:', error);
      throw error;
    }
  }
}