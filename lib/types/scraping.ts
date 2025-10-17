// Scraping system types

export type ScrapingStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ScrapingProgress {
  totalSources: number;
  completedSources: number;
  totalArticles: number;
  processedArticles: number;
  failedArticles: number;
  currentSource?: string;
  progress: number;
  status: ScrapingStatus;
  startTime?: Date;
  endTime?: Date;
  estimatedTimeRemaining?: number;
}

export interface ScrapingJobRequest {
  keywords: string[];
  sources?: string[];
  maxArticles?: number;
  relevanceThreshold?: number;
  enableAutoBackup?: boolean;
  batchSize?: number;
}

export interface ScrapingJobResult {
  jobId: string;
  status: ScrapingStatus;
  totalArticles: number;
  processedArticles: number;
  failedArticles: number;
  articles: ScrapedArticle[];
  duration?: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface ScrapedArticle {
  id: string;
  title: string;
  content: string;
  url: string;
  author?: string;
  publishedAt?: Date;
  extractedAt: Date;
  imageUrl?: string;
  sourceName: string;
  sourceUrl: string;
  relevanceScore?: number;
  keywordMatches: string[];
  tags?: string[];
  status: 'raw' | 'processed' | 'analyzed' | 'failed';
}

export interface ArticleFilter {
  keywords?: string[];
  sources?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  minRelevance?: number;
  status?: string[];
  sortBy?: 'date' | 'relevance' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface ArticleListResponse {
  articles: ScrapedArticle[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface KeywordSuggestion {
  keyword: string;
  count: number;
  lastUsed?: Date;
  isFavorite: boolean;
  category?: string;
}

export interface SearchHistory {
  id: string;
  keywords: string[];
  resultCount: number;
  searchTime: number;
  filters?: ArticleFilter;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface ScrapingMetrics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalArticles: number;
  averageJobTime: number;
  successRate: number;
  articlesPerHour: number;
  activeSources: number;
  totalSources: number;
}
