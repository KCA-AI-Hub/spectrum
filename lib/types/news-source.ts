// News source types for scraping system

export type NewsSourceType = 'news' | 'rss' | 'social' | 'blog' | 'forum';
export type NewsSourceStatus = 'active' | 'inactive' | 'error' | 'pending';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: NewsSourceType;
  status: NewsSourceStatus;
  category: string;
  description?: string;
  headers?: Record<string, string>;
  enabled: boolean;

  // Statistics
  lastCrawl?: Date | string | null;
  itemsCollected: number;
  successRate: number;

  // Metadata
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewsSourceFormData {
  name: string;
  url: string;
  type: NewsSourceType;
  category: string;
  description?: string;
  headers?: string;
  enabled: boolean;
}

export interface NewsSourceCreateRequest {
  name: string;
  url: string;
  type: NewsSourceType;
  category: string;
  description?: string;
  headers?: Record<string, string>;
  enabled: boolean;
}

export interface NewsSourceUpdateRequest extends Partial<NewsSourceCreateRequest> {
  id: string;
}

export interface NewsSourceListResponse {
  sources: NewsSource[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NewsSourceValidationResult {
  valid: boolean;
  error?: string;
  statusCode?: number;
  responseTime?: number;
}
