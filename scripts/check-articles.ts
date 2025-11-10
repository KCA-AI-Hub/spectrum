import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '../lib/generated/prisma';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    include: {
      crawlJob: {
        include: {
          target: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log('\n=== Article Data Check ===\n');
  console.log(`Total articles in database: ${await prisma.article.count()}\n`);

  if (articles.length === 0) {
    console.log('No articles found in database.\n');
    return;
  }

  console.log('Latest 10 articles:\n');

  for (const article of articles) {
    console.log(`[${article.status}] ${article.title}`);
    console.log(`  URL: ${article.url}`);
    console.log(`  Source: ${article.crawlJob?.target?.name || 'Unknown'}`);
    console.log(`  Author: ${article.author || 'N/A'}`);
    console.log(`  Published: ${article.publishedAt || 'N/A'}`);
    console.log(`  Content preview: ${article.content.substring(0, 100)}...`);
    console.log(`  Created: ${article.createdAt}`);

    // Check if it looks like dummy data
    const isDummy =
      article.title.includes('테스트') ||
      article.title.includes('샘플') ||
      article.title.includes('더미') ||
      article.title.includes('example') ||
      article.title.includes('test') ||
      article.url.includes('example.com') ||
      article.url.includes('test.com') ||
      article.content.includes('Lorem ipsum');

    if (isDummy) {
      console.log('  ⚠️  APPEARS TO BE DUMMY DATA');
    }

    console.log('');
  }

  // Check crawl jobs
  const jobs = await prisma.crawlJob.findMany({
    include: {
      target: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log('\n=== Crawl Jobs ===\n');
  console.log(`Total crawl jobs: ${await prisma.crawlJob.count()}\n`);

  for (const job of jobs) {
    console.log(`[${job.status}] ${job.target.name}`);
    console.log(`  Target: ${job.target.url}`);
    console.log(`  Items: ${job.processedItems}/${job.totalItems}`);
    console.log(`  Started: ${job.startedAt || 'N/A'}`);
    console.log(`  Completed: ${job.completedAt || 'N/A'}`);
    if (job.errorMessage) {
      console.log(`  Error: ${job.errorMessage}`);
    }
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
