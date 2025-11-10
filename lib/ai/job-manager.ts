import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AnalysisType = 'KEYWORD_EXTRACTION' | 'TOPIC_CLASSIFICATION' | 'SENTIMENT_ANALYSIS' | 'SUMMARY_GENERATION' | 'QUIZ_GENERATION';
export type AnalysisStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface CreateJobOptions {
  type: AnalysisType;
  inputContent: string;
  articleId?: string;
  priority?: number;
  model?: string;
  maxRetries?: number;
}

interface UpdateJobOptions {
  status?: AnalysisStatus;
  result?: string;
  errorMessage?: string;
  tokenUsage?: number;
  processingTime?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export class AIJobManager {
  async createJob(options: CreateJobOptions) {
    const job = await prisma.aIAnalysisJob.create({
      data: {
        type: options.type,
        inputContent: options.inputContent,
        articleId: options.articleId,
        priority: options.priority || 0,
        model: options.model || 'gpt-4',
        maxRetries: options.maxRetries || 3,
        status: 'PENDING'
      }
    });

    return job;
  }

  async updateJob(jobId: string, updates: UpdateJobOptions) {
    const job = await prisma.aIAnalysisJob.update({
      where: { id: jobId },
      data: updates
    });

    return job;
  }

  async getJob(jobId: string) {
    const job = await prisma.aIAnalysisJob.findUnique({
      where: { id: jobId }
    });

    return job;
  }

  async listJobs(filters?: {
    type?: AnalysisType;
    status?: AnalysisStatus;
    articleId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.articleId) {
      where.articleId = filters.articleId;
    }

    const jobs = await prisma.aIAnalysisJob.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    });

    return jobs;
  }

  async deleteJob(jobId: string) {
    await prisma.aIAnalysisJob.delete({
      where: { id: jobId }
    });
  }

  async getNextPendingJob(): Promise<any | null> {
    const job = await prisma.aIAnalysisJob.findFirst({
      where: {
        status: 'PENDING',
        retryCount: {
          lt: prisma.aIAnalysisJob.fields.maxRetries
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return job;
  }

  async markJobInProgress(jobId: string) {
    return this.updateJob(jobId, {
      status: 'IN_PROGRESS',
      startedAt: new Date()
    });
  }

  async markJobCompleted(jobId: string, result: string, tokenUsage?: number, processingTime?: number) {
    return this.updateJob(jobId, {
      status: 'COMPLETED',
      result,
      tokenUsage,
      processingTime,
      completedAt: new Date()
    });
  }

  async markJobFailed(jobId: string, errorMessage: string) {
    const job = await this.getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    const retryCount = job.retryCount + 1;
    const status: AnalysisStatus = retryCount < job.maxRetries ? 'PENDING' : 'FAILED';

    return this.updateJob(jobId, {
      status,
      errorMessage,
      retryCount,
      completedAt: status === 'FAILED' ? new Date() : undefined
    });
  }

  async getJobStats() {
    const [total, pending, inProgress, completed, failed] = await Promise.all([
      prisma.aIAnalysisJob.count(),
      prisma.aIAnalysisJob.count({ where: { status: 'PENDING' } }),
      prisma.aIAnalysisJob.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.aIAnalysisJob.count({ where: { status: 'COMPLETED' } }),
      prisma.aIAnalysisJob.count({ where: { status: 'FAILED' } })
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      failed
    };
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}

export const jobManager = new AIJobManager();
