/**
 * Backup and Recovery Service for Phase 4B.4
 * Handles data backup, recovery, and system resilience
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'schema' | 'data';
  size: number;
  recordCount: number;
  checksum: string;
  description?: string;
}

export interface BackupOptions {
  includeArticles?: boolean;
  includeCrawlJobs?: boolean;
  includeKeywords?: boolean;
  includeSearchHistory?: boolean;
  includeSystemConfig?: boolean;
  compression?: boolean;
  encryption?: boolean;
}

export interface RecoveryResult {
  success: boolean;
  recordsRestored: number;
  errors: string[];
  warnings: string[];
  duration: number;
}

export class BackupRecoveryService {
  private readonly backupDir: string;

  constructor(
    private prisma: PrismaClient,
    backupDir: string = './backups'
  ) {
    this.backupDir = backupDir;
    this.ensureBackupDirectory();
  }

  /**
   * Create full database backup
   */
  async createFullBackup(description?: string): Promise<BackupMetadata> {
    const timestamp = new Date();
    const backupId = `full_${timestamp.toISOString().replace(/[:.]/g, '-')}`;

    try {
      console.log(`Starting full backup: ${backupId}`);

      // Backup all tables
      const [articles, crawlTargets, crawlJobs, keywords, searchHistory, systemConfig] =
        await Promise.all([
          this.prisma.article.findMany(),
          this.prisma.crawlTarget.findMany(),
          this.prisma.crawlJob.findMany(),
          this.prisma.keyword.findMany(),
          this.prisma.searchHistory.findMany(),
          this.prisma.systemConfig.findMany()
        ]);

      const backupData = {
        metadata: {
          id: backupId,
          timestamp,
          type: 'full' as const,
          description,
          prismaVersion: '5.x',
          schemaHash: await this.generateSchemaHash()
        },
        data: {
          articles,
          crawlTargets,
          crawlJobs,
          keywords,
          searchHistory,
          systemConfig
        }
      };

      const backupContent = JSON.stringify(backupData, null, 2);
      const backupPath = join(this.backupDir, `${backupId}.json`);
      writeFileSync(backupPath, backupContent);

      const checksum = await this.calculateChecksum(backupContent);
      const recordCount = Object.values(backupData.data).reduce(
        (total, records) => total + (Array.isArray(records) ? records.length : 0), 0
      );

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'full',
        size: Buffer.byteLength(backupContent, 'utf8'),
        recordCount,
        checksum,
        description
      };

      // Save metadata
      await this.saveBackupMetadata(metadata);

      console.log(`Full backup completed: ${backupId} (${recordCount} records)`);
      return metadata;

    } catch (error) {
      console.error('Full backup failed:', error);
      throw new Error(`Full backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create incremental backup (only changed data since last backup)
   */
  async createIncrementalBackup(
    sinceTimestamp: Date,
    description?: string
  ): Promise<BackupMetadata> {
    const timestamp = new Date();
    const backupId = `incremental_${timestamp.toISOString().replace(/[:.]/g, '-')}`;

    try {
      console.log(`Starting incremental backup: ${backupId}`);

      // Get only records modified since the specified timestamp
      const [articles, crawlJobs, keywords, searchHistory] = await Promise.all([
        this.prisma.article.findMany({
          where: { updatedAt: { gt: sinceTimestamp } }
        }),
        this.prisma.crawlJob.findMany({
          where: { updatedAt: { gt: sinceTimestamp } }
        }),
        this.prisma.keyword.findMany({
          where: { updatedAt: { gt: sinceTimestamp } }
        }),
        this.prisma.searchHistory.findMany({
          where: { createdAt: { gt: sinceTimestamp } }
        })
      ]);

      const backupData = {
        metadata: {
          id: backupId,
          timestamp,
          type: 'incremental' as const,
          sinceTimestamp,
          description
        },
        data: {
          articles,
          crawlJobs,
          keywords,
          searchHistory
        }
      };

      const backupContent = JSON.stringify(backupData, null, 2);
      const backupPath = join(this.backupDir, `${backupId}.json`);
      writeFileSync(backupPath, backupContent);

      const checksum = await this.calculateChecksum(backupContent);
      const recordCount = Object.values(backupData.data).reduce(
        (total, records) => total + (Array.isArray(records) ? records.length : 0), 0
      );

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'incremental',
        size: Buffer.byteLength(backupContent, 'utf8'),
        recordCount,
        checksum,
        description
      };

      await this.saveBackupMetadata(metadata);

      console.log(`Incremental backup completed: ${backupId} (${recordCount} records)`);
      return metadata;

    } catch (error) {
      console.error('Incremental backup failed:', error);
      throw new Error(`Incremental backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore data from backup
   */
  async restoreFromBackup(backupId: string, options: {
    overwriteExisting?: boolean;
    skipTables?: string[];
    verifyData?: boolean;
  } = {}): Promise<RecoveryResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let recordsRestored = 0;

    try {
      console.log(`Starting restore from backup: ${backupId}`);

      const backupPath = join(this.backupDir, `${backupId}.json`);
      if (!existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupId}`);
      }

      const backupContent = readFileSync(backupPath, 'utf8');
      const backupData = JSON.parse(backupContent);

      // Verify backup integrity
      const calculatedChecksum = await this.calculateChecksum(backupContent);
      const metadata = await this.getBackupMetadata(backupId);

      if (metadata && metadata.checksum !== calculatedChecksum) {
        warnings.push('Backup checksum mismatch - data may be corrupted');
      }

      // Restore data using transactions
      await this.prisma.$transaction(async (tx) => {
        const { skipTables = [] } = options;

        // Restore articles
        if (!skipTables.includes('articles') && backupData.data.articles) {
          for (const article of backupData.data.articles) {
            try {
              if (options.overwriteExisting) {
                await tx.article.upsert({
                  where: { id: article.id },
                  update: article,
                  create: article
                });
              } else {
                await tx.article.create({ data: article });
              }
              recordsRestored++;
            } catch (error) {
              errors.push(`Failed to restore article ${article.id}: ${error}`);
            }
          }
        }

        // Restore crawl targets
        if (!skipTables.includes('crawlTargets') && backupData.data.crawlTargets) {
          for (const target of backupData.data.crawlTargets) {
            try {
              if (options.overwriteExisting) {
                await tx.crawlTarget.upsert({
                  where: { id: target.id },
                  update: target,
                  create: target
                });
              } else {
                await tx.crawlTarget.create({ data: target });
              }
              recordsRestored++;
            } catch (error) {
              errors.push(`Failed to restore crawl target ${target.id}: ${error}`);
            }
          }
        }

        // Restore crawl jobs
        if (!skipTables.includes('crawlJobs') && backupData.data.crawlJobs) {
          for (const job of backupData.data.crawlJobs) {
            try {
              if (options.overwriteExisting) {
                await tx.crawlJob.upsert({
                  where: { id: job.id },
                  update: job,
                  create: job
                });
              } else {
                await tx.crawlJob.create({ data: job });
              }
              recordsRestored++;
            } catch (error) {
              errors.push(`Failed to restore crawl job ${job.id}: ${error}`);
            }
          }
        }

        // Restore keywords
        if (!skipTables.includes('keywords') && backupData.data.keywords) {
          for (const keyword of backupData.data.keywords) {
            try {
              if (options.overwriteExisting) {
                await tx.keyword.upsert({
                  where: { id: keyword.id },
                  update: keyword,
                  create: keyword
                });
              } else {
                await tx.keyword.create({ data: keyword });
              }
              recordsRestored++;
            } catch (error) {
              errors.push(`Failed to restore keyword ${keyword.id}: ${error}`);
            }
          }
        }

        // Restore system config
        if (!skipTables.includes('systemConfig') && backupData.data.systemConfig) {
          for (const config of backupData.data.systemConfig) {
            try {
              await tx.systemConfig.upsert({
                where: { id: config.id },
                update: config,
                create: config
              });
              recordsRestored++;
            } catch (error) {
              errors.push(`Failed to restore system config ${config.id}: ${error}`);
            }
          }
        }
      });

      const duration = Date.now() - startTime;
      console.log(`Restore completed: ${recordsRestored} records in ${duration}ms`);

      return {
        success: errors.length === 0,
        recordsRestored,
        errors,
        warnings,
        duration
      };

    } catch (error) {
      console.error('Restore failed:', error);
      return {
        success: false,
        recordsRestored,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
        warnings,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const backups = await this.prisma.systemConfig.findMany({
        where: {
          key: { startsWith: 'backup_metadata_' }
        },
        orderBy: { updatedAt: 'desc' }
      });

      return backups.map(config => JSON.parse(config.value));

    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  /**
   * Delete old backups
   */
  async cleanupOldBackups(retentionDays: number = 30): Promise<{
    deleted: number;
    errors: string[];
  }> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let deleted = 0;
    const errors: string[] = [];

    try {
      const backups = await this.listBackups();

      for (const backup of backups) {
        if (backup.timestamp < cutoffDate) {
          try {
            // Delete backup file
            const backupPath = join(this.backupDir, `${backup.id}.json`);
            if (existsSync(backupPath)) {
              await this.deleteBackupFile(backupPath);
            }

            // Delete metadata
            await this.prisma.systemConfig.delete({
              where: { key: `backup_metadata_${backup.id}` }
            });

            deleted++;
            console.log(`Deleted old backup: ${backup.id}`);

          } catch (error) {
            errors.push(`Failed to delete backup ${backup.id}: ${error}`);
          }
        }
      }

      return { deleted, errors };

    } catch (error) {
      console.error('Backup cleanup failed:', error);
      return { deleted, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const backupPath = join(this.backupDir, `${backupId}.json`);
      if (!existsSync(backupPath)) {
        issues.push('Backup file not found');
        return { isValid: false, issues };
      }

      const backupContent = readFileSync(backupPath, 'utf8');
      const calculatedChecksum = await this.calculateChecksum(backupContent);

      const metadata = await this.getBackupMetadata(backupId);
      if (!metadata) {
        issues.push('Backup metadata not found');
        return { isValid: false, issues };
      }

      if (metadata.checksum !== calculatedChecksum) {
        issues.push('Checksum verification failed');
      }

      try {
        const backupData = JSON.parse(backupContent);
        if (!backupData.metadata || !backupData.data) {
          issues.push('Invalid backup structure');
        }
      } catch (error) {
        issues.push('Backup file is corrupted (invalid JSON)');
      }

      return { isValid: issues.length === 0, issues };

    } catch (error) {
      issues.push(`Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, issues };
    }
  }

  /**
   * Create backup schedule configuration
   */
  async scheduleBackups(config: {
    fullBackupInterval: 'daily' | 'weekly' | 'monthly';
    incrementalInterval: 'hourly' | 'daily';
    retentionDays: number;
    enabled: boolean;
  }): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { key: 'backup_schedule' },
      update: { value: JSON.stringify(config) },
      create: {
        key: 'backup_schedule',
        value: JSON.stringify(config),
        description: 'Automated backup schedule configuration'
      }
    });
  }

  // Private helper methods

  private ensureBackupDirectory(): void {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private async calculateChecksum(content: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async generateSchemaHash(): Promise<string> {
    // This would typically read the Prisma schema file and generate a hash
    // For now, return a placeholder
    return 'schema_hash_placeholder';
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { key: `backup_metadata_${metadata.id}` },
      update: { value: JSON.stringify(metadata) },
      create: {
        key: `backup_metadata_${metadata.id}`,
        value: JSON.stringify(metadata),
        description: `Backup metadata for ${metadata.id}`
      }
    });
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const config = await this.prisma.systemConfig.findUnique({
        where: { key: `backup_metadata_${backupId}` }
      });
      return config ? JSON.parse(config.value) : null;
    } catch (error) {
      console.error('Error retrieving backup metadata:', error);
      return null;
    }
  }

  private async deleteBackupFile(filePath: string): Promise<void> {
    const fs = await import('fs');
    await fs.promises.unlink(filePath);
  }
}