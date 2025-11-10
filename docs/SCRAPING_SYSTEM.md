# 스크래핑 시스템 사용 가이드

## 개요

Spectrum 프로젝트의 뉴스 스크래핑 시스템은 Firecrawl API를 사용하여 웹에서 뉴스 기사를 자동으로 수집합니다.

## 시스템 구성

### 1. API Layer (`/api/scraping/execute`)
- **POST**: 스크래핑 작업 시작
- **GET**: 작업 상태 조회
- **PATCH**: 작업 재처리

### 2. Orchestrator Service (`lib/services/scraping-orchestrator.ts`)
- 스크래핑 작업 관리
- 진행 상태 추적
- 데이터 처리 및 저장

### 3. Firecrawl Integration (`lib/api/firecrawl.ts`)
- Firecrawl API 클라이언트
- 뉴스 검색 및 스크래핑
- 배치 스크래핑 처리

### 4. UI Components
- **/admin/crawling/jobs**: 스크래핑 작업 생성 및 실행
- **/admin/crawling/search**: 키워드 검색 (고급 기능)
- **/admin/crawling/history**: 검색 기록

## 사용 방법

### 웹 UI에서 스크래핑 실행

1. **Admin 대시보드 접속**
   ```
   http://localhost:3000/admin/crawling
   ```

2. **"스크래핑 작업" 카드 클릭**

3. **키워드 입력**
   - 검색할 키워드 입력
   - 여러 키워드 추가 가능
   - 예: "인공지능", "AI", "기술"

4. **설정 조정**
   - 최대 수집 기사 수: 5~50개
   - 관련도 임계값: 0~50%

5. **"스크래핑 시작" 버튼 클릭**

6. **결과 확인**
   - 완료 후 통계 확인
   - "수집된 기사 확인" 버튼으로 이동

### API로 직접 호출

```typescript
const response = await fetch('/api/scraping/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keywords: ['인공지능', 'AI', '기술'],
    maxArticles: 20,
    relevanceThreshold: 10,
    enableAutoBackup: false
  })
});

const result = await response.json();
console.log('Job ID:', result.result.jobId);
console.log('Status:', result.result.status);
console.log('Statistics:', result.result.statistics);
```

### 스크립트로 실행

```bash
# 단순 스크래핑
npx tsx scripts/run-scraping.ts

# 커스텀 스크립트 작성
import { PrismaClient } from '../lib/generated/prisma';
import { ScrapingOrchestratorService } from '../lib/services/scraping-orchestrator';

const prisma = new PrismaClient();
const orchestrator = new ScrapingOrchestratorService(prisma);

const result = await orchestrator.executeScrapingJob({
  crawlJobId: 'job-id',
  keywords: ['키워드1', '키워드2'],
  options: {
    maxArticles: 20,
    relevanceThreshold: 10
  }
});
```

## 설정

### 환경 변수

`.env.local` 파일에 다음 설정 필요:

```env
# Firecrawl API 키
FIRECRAWL_API_KEY="fc-your-api-key-here"

# 데이터베이스 (SQLite)
DATABASE_URL="file:./dev.db"
```

### Firecrawl API 키 발급

1. https://www.firecrawl.dev/ 접속
2. 계정 생성 및 로그인
3. API 키 발급
4. `.env.local`에 추가

## 데이터 구조

### CrawlTarget (뉴스 소스)
```typescript
{
  id: string
  name: string           // 소스 이름
  url: string            // 소스 URL
  type: string           // news, rss, social
  category: string       // 카테고리
  isActive: boolean      // 활성화 상태
}
```

### CrawlJob (크롤링 작업)
```typescript
{
  id: string
  targetId: string       // CrawlTarget ID
  status: CrawlStatus    // PENDING, RUNNING, COMPLETED, FAILED
  startedAt: DateTime
  completedAt: DateTime
  totalItems: number
  processedItems: number
}
```

### Article (수집된 기사)
```typescript
{
  id: string
  crawlJobId: string     // CrawlJob ID
  title: string          // 제목
  content: string        // 내용
  url: string            // 원문 URL
  author: string         // 작성자
  publishedAt: DateTime  // 발행일
  relevanceScore: number // 관련도 점수
  keywordTags: string    // 매칭된 키워드
}
```

## 트러블슈팅

### 1. "FIRECRAWL_API_KEY is not configured" 오류
**원인**: Firecrawl API 키가 설정되지 않음

**해결**:
```bash
# .env.local 파일 확인
cat .env.local | grep FIRECRAWL_API_KEY

# 키가 없거나 플레이스홀더인 경우
# .env.local 파일 수정하여 실제 API 키 입력
```

### 2. "All scraping engines failed" 오류
**원인**: Firecrawl이 특정 URL을 스크래핑하지 못함

**해결**:
- URL이 유효한지 확인
- URL이 차단되지 않았는지 확인
- 다른 뉴스 소스 시도

### 3. 기사가 수집되지 않음
**원인**: 키워드가 너무 특정적이거나 검색 결과가 없음

**해결**:
- 더 일반적인 키워드 사용
- 여러 관련 키워드 추가
- maxArticles 증가

### 4. 중복 기사가 많음
**원인**: 같은 뉴스가 여러 소스에서 수집됨

**정상**: 시스템이 자동으로 중복 제거
- `statistics.duplicateCount`에서 확인 가능

## 성능 최적화

### 권장 설정
- **maxArticles**: 20-30 (빠른 테스트용), 50-100 (실제 사용)
- **relevanceThreshold**: 10-20% (품질 유지)
- **batchSize**: 5-10 (기본값)

### 병렬 처리
여러 작업을 동시에 실행할 수 있지만, Firecrawl API 제한에 주의:
- Free tier: 제한적
- Pro tier: 더 높은 속도

## 모니터링

### 작업 상태 확인
```typescript
const response = await fetch(`/api/scraping/execute?jobId=${jobId}`);
const { status } = await response.json();

console.log('Status:', status.status);
console.log('Progress:', status.progress + '%');
console.log('Processed:', status.processedItems);
```

### 통계 조회
```typescript
const response = await fetch('/api/scraping/execute?action=metrics');
const { metrics } = await response.json();

console.log('Total Articles:', metrics.totalArticles);
console.log('Success Rate:', metrics.successRate + '%');
console.log('Articles/Hour:', metrics.articlesPerHour);
```

## 다음 단계

1. **데이터 분석**: 수집된 기사를 AI로 분석
2. **요약 생성**: 기사 요약 자동 생성
3. **동영상 생성**: 요약을 바탕으로 숏폼 동영상 제작
4. **스케줄링**: 정기적인 자동 스크래핑

자세한 내용은 프로젝트 문서를 참조하세요.
