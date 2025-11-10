import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LogUsageOptions {
  operation: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
  responseTime?: number;
  status: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export class UsageTracker {
  private readonly COST_PER_1K_TOKENS: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 }
  };

  async logUsage(options: LogUsageOptions) {
    const cost = options.cost || this.calculateCost(
      options.model,
      options.promptTokens,
      options.completionTokens
    );

    const log = await prisma.aIUsageLog.create({
      data: {
        operation: options.operation,
        model: options.model,
        promptTokens: options.promptTokens,
        completionTokens: options.completionTokens,
        totalTokens: options.totalTokens,
        cost,
        responseTime: options.responseTime,
        status: options.status,
        errorMessage: options.errorMessage,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null
      }
    });

    return log;
  }

  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = this.COST_PER_1K_TOKENS[model] || this.COST_PER_1K_TOKENS['gpt-4'];

    const promptCost = (promptTokens / 1000) * pricing.prompt;
    const completionCost = (completionTokens / 1000) * pricing.completion;

    return promptCost + completionCost;
  }

  async getUsageStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    operation?: string;
    model?: string;
  }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters?.operation) {
      where.operation = filters.operation;
    }

    if (filters?.model) {
      where.model = filters.model;
    }

    const logs = await prisma.aIUsageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const avgResponseTime = logs.length > 0
      ? logs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / logs.length
      : 0;

    const successCount = logs.filter(log => log.status === 'success').length;
    const failureCount = logs.filter(log => log.status === 'error').length;

    return {
      totalRequests: logs.length,
      successCount,
      failureCount,
      totalTokens,
      totalCost,
      avgResponseTime,
      logs: logs.slice(0, 100)
    };
  }

  async getUsageByModel() {
    const logs = await prisma.aIUsageLog.findMany();

    const byModel: Record<string, {
      requests: number;
      tokens: number;
      cost: number;
    }> = {};

    logs.forEach(log => {
      if (!byModel[log.model]) {
        byModel[log.model] = {
          requests: 0,
          tokens: 0,
          cost: 0
        };
      }

      byModel[log.model].requests++;
      byModel[log.model].tokens += log.totalTokens;
      byModel[log.model].cost += log.cost || 0;
    });

    return byModel;
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}

export const usageTracker = new UsageTracker();
