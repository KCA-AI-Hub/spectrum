# Spectrum API Documentation

## Phase 4.2 구현: 키워드 검색 시스템 API

이 문서는 Phase 4.2에서 구현된 키워드 기반 뉴스 검색 시스템의 API 엔드포인트들을 설명합니다.

### 구현된 API 엔드포인트

#### 1. 키워드 기반 뉴스 검색
**POST** `/api/search/news`

네이버 뉴스를 크롤링하여 키워드 기반 뉴스 검색을 수행합니다.

**Request Body:**
```json
{
  "keywords": ["AI", "인공지능"],
  "dateRange": {
    "from": "2024-01-01",
    "to": "2024-12-31"
  },
  "sources": ["naver"],
  "category": "technology",
  "sortBy": "relevance",
  "limit": 50,
  "async": false
}
```

**Response (동기 모드):**
```json
{
  "success": true,
  "mode": "sync",
  "data": {
    "searchId": "search_id_here",
    "results": [...],
    "totalResults": 25,
    "searchTime": 5.2,
    "keywords": ["AI", "인공지능"],
    "filters": {...}
  }
}
```

**Response (비동기 모드):**
```json
{
  "success": true,
  "mode": "async",
  "data": {
    "searchId": "search_id_here",
    "taskId": "task_id_here",
    "status": "PENDING",
    "message": "Crawling task has been queued..."
  }
}
```

#### 2. 검색 상태 조회
**GET** `/api/search/news?searchId={searchId}&taskId={taskId}`

검색 작업의 상태와 결과를 조회합니다.

#### 3. 검색 기록 관리
**GET** `/api/search/history`
- 검색 기록 목록 조회
- Query Parameters: `limit`, `offset`, `status`

**DELETE** `/api/search/history?id={historyId}`
- 특정 검색 기록 삭제

#### 4. 키워드 관리
**GET** `/api/search/keywords`
- 키워드 목록 조회
- Query Parameters: `limit`, `offset`, `search`, `favorites`

**POST** `/api/search/keywords`
- 키워드 생성/업데이트

**DELETE** `/api/search/keywords?id={keywordId}`
- 키워드 삭제

#### 5. 키워드 즐겨찾기
**POST** `/api/search/keywords/{id}/favorite`
- 키워드 즐겨찾기 상태 토글

#### 6. 검색어 자동완성
**GET** `/api/search/suggestions?q={query}&limit={limit}`
- 검색어 자동완성 및 제안

#### 7. 크롤링 상태 추적
**GET** `/api/crawl/status/{jobId}`
- 크롤링 작업 상태 조회

**DELETE** `/api/crawl/status/{jobId}`
- 크롤링 작업 취소

#### 8. 크롤링 큐 관리
**GET** `/api/crawl/queue`
- 크롤링 큐 상태 조회

### 핵심 기능

#### 1. 크롤링 작업 큐 시스템
- 우선순위 기반 작업 처리
- 자동 재시도 및 지수 백오프
- 동기/비동기 모드 지원

#### 2. Firecrawl API 통합
- 네이버 뉴스 검색 결과 크롤링
- 마크다운 형태로 콘텐츠 추출
- 메타데이터 자동 추출

#### 3. 키워드 관리 시스템
- 키워드별 사용 빈도 추적
- 즐겨찾기 시스템
- 자동완성 지원

#### 4. 검색 기록 추적
- 모든 검색 활동 기록
- 검색 시간 및 결과 수 추적
- 검색 필터 보존

#### 5. 에러 처리 및 재시도
- 자동 재시도 로직 (최대 3회)
- 지수 백오프 지연
- 상세한 에러 메시지

### 데이터베이스 스키마 확장

다음 테이블들이 추가되었습니다:

1. **Keyword** - 키워드 관리
2. **SearchHistory** - 검색 기록
3. **SearchResult** - 검색 결과와 기사 연결
4. **Article** 테이블에 필드 추가:
   - `relevanceScore` - 키워드 관련도 점수
   - `keywordTags` - 키워드 태그
   - `searchRank` - 검색 결과 순위

### 환경 변수 설정

`.env` 파일에 다음 설정이 필요합니다:

```
DATABASE_URL="file:./dev.db"
FIRECRAWL_API_KEY="your_firecrawl_api_key"
OPENAI_API_KEY="your_openai_api_key"
```

### 사용 예제

#### JavaScript/TypeScript 클라이언트:

```typescript
// 동기 검색
const response = await fetch('/api/search/news', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keywords: ['AI', '인공지능'],
    limit: 20,
    sortBy: 'relevance'
  })
});

// 비동기 검색
const asyncResponse = await fetch('/api/search/news', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keywords: ['블록체인'],
    async: true,
    limit: 50
  })
});

// 상태 확인
const status = await fetch(`/api/search/news?searchId=${searchId}`);
```

### 다음 단계

Phase 4.3에서는 다음 기능들이 추가될 예정입니다:

1. 검색 결과 중복 제거 알고리즘
2. 고급 관련도 점수 계산
3. 추가 뉴스 소스 지원 (구글 뉴스 등)
4. 실시간 검색 결과 스트리밍
5. 검색 트렌드 분석