import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from './use-api';
import type {
  ScrapingJobRequest,
  ScrapingJobResult,
  ScrapingProgress,
  ScrapedArticle,
  ArticleFilter,
  ArticleListResponse,
  ScrapingMetrics
} from '../types/scraping';

export function useScraping() {
  const [progress, setProgress] = useState<ScrapingProgress | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { execute, loading, error } = useApi<ScrapingJobResult>('scraping');

  const startScraping = useCallback(async (request: ScrapingJobRequest) => {
    try {
      const response = await fetch('/api/scraping/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start scraping');
      }

      const data = await response.json();
      const jobId = data.result?.jobId;

      if (jobId) {
        setCurrentJobId(jobId);
        startProgressMonitoring(jobId);
      }

      return data.result;
    } catch (err) {
      console.error('Scraping error:', err);
      throw err;
    }
  }, []);

  const startProgressMonitoring = useCallback((jobId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/scraping/execute?jobId=${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch progress');

        const data = await response.json();
        const status = data.status;

        if (status) {
          setProgress({
            totalSources: status.totalSources || 0,
            completedSources: status.completedSources || 0,
            totalArticles: status.totalArticles || 0,
            processedArticles: status.processedArticles || 0,
            failedArticles: status.failedArticles || 0,
            currentSource: status.currentSource,
            progress: status.progress || 0,
            status: status.status || 'idle',
            startTime: status.startedAt ? new Date(status.startedAt) : undefined,
            endTime: status.completedAt ? new Date(status.completedAt) : undefined
          });

          if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
            stopProgressMonitoring();
          }
        }
      } catch (error) {
        console.error('Progress polling error:', error);
      }
    };

    pollProgress();
    pollIntervalRef.current = setInterval(pollProgress, 2000);
  }, []);

  const stopProgressMonitoring = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const cancelJob = useCallback(async (jobId: string) => {
    try {
      const response = await fetch('/api/scraping/execute', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', jobId })
      });

      if (!response.ok) throw new Error('Failed to cancel job');

      stopProgressMonitoring();
      setProgress(null);
      setCurrentJobId(null);

      return await response.json();
    } catch (err) {
      console.error('Cancel job error:', err);
      throw err;
    }
  }, [stopProgressMonitoring]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    startScraping,
    cancelJob,
    progress,
    currentJobId,
    loading,
    error
  };
}

export function useArticles(filter?: ArticleFilter) {
  const [articles, setArticles] = useState<ScrapedArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (filter?.keywords?.length) {
        params.append('keywords', filter.keywords.join(','));
      }
      if (filter?.sources?.length) {
        params.append('sources', filter.sources.join(','));
      }
      if (filter?.minRelevance) {
        params.append('minRelevance', filter.minRelevance.toString());
      }
      if (filter?.sortBy) {
        params.append('sortBy', filter.sortBy);
      }
      if (filter?.sortOrder) {
        params.append('sortOrder', filter.sortOrder);
      }

      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error('Failed to fetch articles');

      const data: ArticleListResponse = await response.json();
      setArticles(data.articles);
      setTotal(data.total);
    } catch (err) {
      console.error('Fetch articles error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    total,
    page,
    pageSize,
    setPage,
    loading,
    error,
    refresh: fetchArticles
  };
}

export function useScrapingMetrics() {
  const [metrics, setMetrics] = useState<ScrapingMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/scraping/execute?action=metrics');
      if (!response.ok) throw new Error('Failed to fetch metrics');

      const data = await response.json();
      setMetrics(data.metrics);
    } catch (err) {
      console.error('Fetch metrics error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics
  };
}
