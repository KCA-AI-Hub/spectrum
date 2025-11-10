import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '../lib/generated/prisma';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Database Content Summary ===\n');

  const counts = {
    crawlTargets: await prisma.crawlTarget.count(),
    crawlJobs: await prisma.crawlJob.count(),
    articles: await prisma.article.count(),
    keywords: await prisma.keyword.count(),
    searchHistory: await prisma.searchHistory.count(),
    videos: await prisma.video.count(),
    summaries: await prisma.summary.count(),
    quizzes: await prisma.quiz.count(),
  };

  console.log('Table Counts:');
  console.log(`  CrawlTarget (News Sources): ${counts.crawlTargets}`);
  console.log(`  CrawlJob: ${counts.crawlJobs}`);
  console.log(`  Article: ${counts.articles}`);
  console.log(`  Keyword: ${counts.keywords}`);
  console.log(`  SearchHistory: ${counts.searchHistory}`);
  console.log(`  Video: ${counts.videos}`);
  console.log(`  Summary: ${counts.summaries}`);
  console.log(`  Quiz: ${counts.quizzes}`);

  // Check if there's any data at all
  if (counts.articles > 0) {
    console.log('\n=== Sample Articles ===\n');
    const articles = await prisma.article.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    for (const article of articles) {
      console.log(`Title: ${article.title}`);
      console.log(`URL: ${article.url}`);
      console.log(`Content Preview: ${article.content.substring(0, 150)}...`);
      console.log(`Published: ${article.publishedAt || 'N/A'}`);

      // Check if dummy
      const isDummy =
        article.title.toLowerCase().includes('test') ||
        article.title.includes('테스트') ||
        article.title.includes('샘플') ||
        article.title.includes('더미') ||
        article.url.includes('example.com') ||
        article.content.includes('Lorem ipsum');

      console.log(`Is Dummy Data: ${isDummy ? '⚠️  YES' : '✓ NO (Real data)'}`);
      console.log('');
    }
  } else {
    console.log('\n⚠️  No articles in database - Database appears empty');
  }

  if (counts.keywords > 0) {
    console.log('\n=== Keywords ===\n');
    const keywords = await prisma.keyword.findMany({
      take: 5,
      orderBy: { useCount: 'desc' },
    });
    keywords.forEach((k) => {
      console.log(`  - ${k.keyword} (used ${k.useCount} times)`);
    });
  }

  if (counts.searchHistory > 0) {
    console.log('\n=== Recent Searches ===\n');
    const searches = await prisma.searchHistory.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    searches.forEach((s) => {
      console.log(`  - "${s.searchQuery}" (${s.resultCount} results)`);
    });
  }

  console.log('\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
