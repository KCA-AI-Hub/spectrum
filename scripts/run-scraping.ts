import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient, CrawlStatus } from '../lib/generated/prisma';
import { ScrapingOrchestratorService } from '../lib/services/scraping-orchestrator';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Starting News Scraping ===\n');

  // Get first active news source
  const sources = await prisma.crawlTarget.findMany({
    where: { isActive: true },
    take: 3, // Start with just 3 sources for testing
  });

  if (sources.length === 0) {
    console.log('No active news sources found.');
    return;
  }

  console.log(`Found ${sources.length} active sources to scrape:`);
  sources.forEach((source) => {
    console.log(`  - ${source.name} (${source.url})`);
  });
  console.log('');

  // Define test keywords
  const keywords = [
    '인공지능',
    'AI',
    '기술',
  ];

  console.log(`Keywords: ${keywords.join(', ')}\n`);

  // Create crawl jobs for each source
  for (const source of sources) {
    console.log(`\nProcessing: ${source.name}...`);

    try {
      // Create crawl job
      const job = await prisma.crawlJob.create({
        data: {
          targetId: source.id,
          status: CrawlStatus.PENDING,
        },
      });

      console.log(`  Created job: ${job.id}`);

      // Execute scraping
      const orchestrator = new ScrapingOrchestratorService(prisma);

      const result = await orchestrator.executeScrapingJob({
        crawlJobId: job.id,
        keywords,
        sources: [source.url],
        options: {
          maxArticles: 10, // Limit to 10 articles per source for testing
          relevanceThreshold: 5,
          enableAutoBackup: false,
          batchSize: 5,
        },
      });

      console.log(`  Status: ${result.status}`);
      console.log(`  Statistics:`);
      console.log(`    - Total items: ${result.statistics.totalItems}`);
      console.log(`    - Processed: ${result.statistics.processedItems}`);
      console.log(`    - Saved: ${result.statistics.savedItems}`);
      console.log(`    - Duplicates: ${result.statistics.duplicateCount}`);
      console.log(`    - Failures: ${result.statistics.failureCount}`);

      if (result.warnings.length > 0) {
        console.log(`  Warnings:`);
        result.warnings.forEach((w) => console.log(`    - ${w}`));
      }

      if (result.errors.length > 0) {
        console.log(`  Errors:`);
        result.errors.forEach((e) => console.log(`    - ${e}`));
      }

    } catch (error) {
      console.error(`  Error processing ${source.name}:`, error);
    }
  }

  // Show final statistics
  console.log('\n\n=== Final Statistics ===\n');

  const totalArticles = await prisma.article.count();
  const totalJobs = await prisma.crawlJob.count();
  const completedJobs = await prisma.crawlJob.count({
    where: { status: CrawlStatus.COMPLETED },
  });

  console.log(`Total Articles: ${totalArticles}`);
  console.log(`Total Jobs: ${totalJobs}`);
  console.log(`Completed Jobs: ${completedJobs}`);

  if (totalArticles > 0) {
    console.log('\n=== Sample Articles ===\n');
    const sampleArticles = await prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        crawlJob: {
          include: {
            target: true,
          },
        },
      },
    });

    sampleArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.crawlJob.target.name}`);
      console.log(`   URL: ${article.url}`);
      console.log(`   Relevance Score: ${article.relevanceScore || 'N/A'}`);
      console.log('');
    });
  }

  console.log('\nScraping completed!\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
