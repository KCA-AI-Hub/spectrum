import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '../lib/generated/prisma';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
  const sources = await prisma.crawlTarget.findMany({
    orderBy: { category: 'asc' },
  });

  console.log('\n=== Registered News Sources ===\n');

  const groupedByCategory = sources.reduce((acc, source) => {
    if (!acc[source.category]) {
      acc[source.category] = [];
    }
    acc[source.category].push(source);
    return acc;
  }, {} as Record<string, typeof sources>);

  for (const [category, categorySources] of Object.entries(groupedByCategory)) {
    console.log(`\n[${category}]`);
    for (const source of categorySources) {
      const status = source.isActive ? '✓' : '✗';
      console.log(`  ${status} ${source.name} - ${source.url}`);
    }
  }

  console.log(`\n\nTotal: ${sources.length} news sources\n`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
