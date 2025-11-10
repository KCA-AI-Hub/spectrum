import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '../lib/generated/prisma';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

const newsSources = [
  {
    name: '네이버 뉴스',
    url: 'https://news.naver.com',
    type: 'news',
    category: '종합',
    description: '대한민국 대표 포털 네이버의 뉴스 서비스',
    isActive: true,
  },
  {
    name: '다음 뉴스',
    url: 'https://news.daum.net',
    type: 'news',
    category: '종합',
    description: '다음 포털의 뉴스 서비스',
    isActive: true,
  },
  {
    name: '연합뉴스',
    url: 'https://www.yna.co.kr',
    type: 'news',
    category: '통신사',
    description: '대한민국 대표 뉴스 통신사',
    isActive: true,
  },
  {
    name: 'KBS 뉴스',
    url: 'https://news.kbs.co.kr',
    type: 'news',
    category: '방송',
    description: '한국방송공사 뉴스',
    isActive: true,
  },
  {
    name: 'MBC 뉴스',
    url: 'https://imnews.imbc.com',
    type: 'news',
    category: '방송',
    description: '문화방송 뉴스',
    isActive: true,
  },
  {
    name: 'SBS 뉴스',
    url: 'https://news.sbs.co.kr',
    type: 'news',
    category: '방송',
    description: 'SBS 뉴스',
    isActive: true,
  },
  {
    name: '조선일보',
    url: 'https://www.chosun.com',
    type: 'news',
    category: '신문',
    description: '조선일보',
    isActive: true,
  },
  {
    name: '중앙일보',
    url: 'https://www.joongang.co.kr',
    type: 'news',
    category: '신문',
    description: '중앙일보',
    isActive: true,
  },
  {
    name: '동아일보',
    url: 'https://www.donga.com',
    type: 'news',
    category: '신문',
    description: '동아일보',
    isActive: true,
  },
  {
    name: '한겨레',
    url: 'https://www.hani.co.kr',
    type: 'news',
    category: '신문',
    description: '한겨레신문',
    isActive: true,
  },
  {
    name: '경향신문',
    url: 'https://www.khan.co.kr',
    type: 'news',
    category: '신문',
    description: '경향신문',
    isActive: true,
  },
  {
    name: '한국경제',
    url: 'https://www.hankyung.com',
    type: 'news',
    category: '경제',
    description: '한국경제신문',
    isActive: true,
  },
  {
    name: '매일경제',
    url: 'https://www.mk.co.kr',
    type: 'news',
    category: '경제',
    description: '매일경제신문',
    isActive: true,
  },
  {
    name: '서울경제',
    url: 'https://www.sedaily.com',
    type: 'news',
    category: '경제',
    description: '서울경제신문',
    isActive: true,
  },
  {
    name: 'IT조선',
    url: 'https://it.chosun.com',
    type: 'news',
    category: 'IT/과학',
    description: 'IT 전문 뉴스',
    isActive: true,
  },
  {
    name: '전자신문',
    url: 'https://www.etnews.com',
    type: 'news',
    category: 'IT/과학',
    description: '전자신문 - ICT 전문 뉴스',
    isActive: true,
  },
];

async function main() {
  console.log('Starting to seed news sources...');

  for (const source of newsSources) {
    try {
      // Check if already exists
      const existing = await prisma.crawlTarget.findUnique({
        where: { url: source.url },
      });

      if (existing) {
        console.log(`Skipping ${source.name} - already exists`);
        continue;
      }

      // Create new source
      const created = await prisma.crawlTarget.create({
        data: source,
      });

      console.log(`Created: ${created.name} (${created.id})`);
    } catch (error) {
      console.error(`Error creating ${source.name}:`, error);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
