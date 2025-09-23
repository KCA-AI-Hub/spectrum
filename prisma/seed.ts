import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('시드 데이터 생성 중...')

  // 크롤링 대상 사이트 시드 데이터
  const crawlTargets = await prisma.crawlTarget.createMany({
    data: [
      {
        name: '네이버 뉴스 - IT/과학',
        url: 'https://news.naver.com/section/105',
        selector: '.sa_text',
        isActive: true,
      },
      {
        name: '네이버 뉴스 - 정치',
        url: 'https://news.naver.com/section/100',
        selector: '.sa_text',
        isActive: true,
      },
      {
        name: '네이버 뉴스 - 경제',
        url: 'https://news.naver.com/section/101',
        selector: '.sa_text',
        isActive: true,
      },
    ],
  })

  // 시스템 설정 시드 데이터
  const systemConfigs = await prisma.systemConfig.createMany({
    data: [
      {
        key: 'crawl_interval_minutes',
        value: '60',
        description: '크롤링 실행 간격 (분)',
      },
      {
        key: 'max_articles_per_crawl',
        value: '50',
        description: '크롤링당 최대 기사 수',
      },
      {
        key: 'ai_summary_model',
        value: 'gpt-4',
        description: '요약 생성에 사용할 AI 모델',
      },
      {
        key: 'video_generation_enabled',
        value: 'true',
        description: '동영상 생성 기능 활성화 여부',
      },
      {
        key: 'quiz_generation_enabled',
        value: 'true',
        description: '퀴즈 생성 기능 활성화 여부',
      },
    ],
  })

  console.log('시드 데이터 생성 완료!')
  console.log(`크롤링 대상: ${crawlTargets.count}개`)
  console.log(`시스템 설정: ${systemConfigs.count}개`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })