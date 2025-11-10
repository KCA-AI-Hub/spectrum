# Spectrum 뉴스 검색 시스템 설정 가이드

## 완료된 설정

### 1. 데이터베이스 설정 ✅
- SQLite 데이터베이스 생성 완료 (`dev.db`)
- 8개의 마이그레이션 적용 완료:
  - 기본 스키마 (Article, CrawlJob, CrawlTarget 등)
  - 키워드 검색 테이블
  - 뉴스 소스 필드 추가
  - AI 분석 테이블
  - 비디오 시스템 테이블
  - 오디오 트랙 모델
  - 비디오 프롬프트 템플릿
  - 비디오 라이브러리 기능

### 2. 의존성 패키지 ✅
- npm install 완료
- Prisma Client 생성 완료

### 3. 환경 변수 파일 ✅
- `.env` 파일 생성 (Prisma용)
- `.env.local` 파일 생성 (Next.js용)

---

## 필수 설정 사항

### API 키 설정 필요 🔑

`.env.local` 파일에서 다음 값들을 실제 API 키로 교체해야 합니다:

```bash
# Firecrawl API (뉴스 스크래핑용)
# https://www.firecrawl.dev/ 에서 API 키 발급
FIRECRAWL_API_KEY="your_firecrawl_api_key_here"  # ⚠️ 필수 변경

# OpenAI API (AI 분석용 - 선택사항)
# https://platform.openai.com/api-keys 에서 API 키 발급
OPENAI_API_KEY="your_openai_api_key_here"  # AI 기능 사용 시 필요
```

---

## 테스트 방법

### 1. 개발 서버 시작

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

### 2. 뉴스 검색 기능 테스트

#### 방법 1: 크롤링 검색 페이지 (완전 통합 완료)
**URL**: http://localhost:3000/admin/crawling/search

**주요 기능**:
- ✅ 키워드 입력 및 태그 관리
- ✅ 뉴스 소스 선택
- ✅ 실시간 스크래핑 진행 상태
- ✅ 기사 결과 필터링/정렬
- ✅ 기사 상세보기 모달
- ✅ 키워드 하이라이팅
- ✅ 고급 설정 (최대 기사 수, 관련도 임계값)

#### 방법 2: 기존 검색 페이지 (부분 구현)
**URL**: http://localhost:3000/admin/search

**상태**: 더미 데이터 표시 (실제 API 미연결)

### 3. 뉴스 소스 관리

**URL**: http://localhost:3000/admin/crawling/sources

**기능**:
- 뉴스 소스 추가/수정/삭제
- 소스 상태 실시간 모니터링
- URL 유효성 검증
- 커스텀 헤더 설정

### 4. 크롤링 대시보드

**URL**: http://localhost:3000/admin/crawling

**기능**:
- 실시간 크롤링 통계
- 최근 작업 현황
- 시스템 메트릭

---

## 테스트 시나리오

### 시나리오 1: 기본 뉴스 검색

1. http://localhost:3000/admin/crawling/search 접속
2. 키워드 입력 (예: "AI", "기술")
3. "검색 시작" 버튼 클릭
4. 진행 상태 모니터링
5. 결과 확인 및 필터링

### 시나리오 2: 뉴스 소스 추가

1. http://localhost:3000/admin/crawling/sources 접속
2. "소스 추가" 버튼 클릭
3. 다음 정보 입력:
   - 이름: 테스트 뉴스
   - URL: https://news.example.com
   - 카테고리: IT
4. "연결 테스트" 버튼으로 URL 확인
5. 저장

### 시나리오 3: 고급 검색

1. 크롤링 검색 페이지에서 "고급 설정" 클릭
2. 최대 기사 수 조정 (예: 100개)
3. 관련도 임계값 조정 (예: 20%)
4. 특정 소스 선택
5. 검색 실행

---

## API 키 없이 테스트하기

Firecrawl API 키가 없는 경우:

1. **데이터베이스 직접 확인**:
   ```bash
   npx prisma studio
   ```
   브라우저에서 http://localhost:5555 접속하여 데이터 확인

2. **API 엔드포인트 직접 테스트**:
   - GET http://localhost:3000/api/articles - 기사 목록
   - GET http://localhost:3000/api/news-sources - 뉴스 소스 목록
   - GET http://localhost:3000/api/keywords - 키워드 목록

3. **UI만 테스트**:
   - 검색 페이지에서 UI 요소 확인
   - 필터/정렬 기능 테스트
   - 모달 및 대화상자 확인

---

## 문제 해결

### 1. "FIRECRAWL_API_KEY is not configured" 오류
- `.env.local` 파일에 실제 API 키 입력
- 개발 서버 재시작

### 2. 데이터베이스 오류
```bash
npx prisma migrate reset  # 데이터베이스 초기화
npx prisma generate       # Prisma Client 재생성
```

### 3. 포트 이미 사용 중
```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

### 4. 모듈을 찾을 수 없음
```bash
npm install           # 의존성 재설치
npx prisma generate   # Prisma Client 재생성
```

---

## 프로젝트 구조

### 주요 페이지
- `/admin/crawling/search` - 메인 뉴스 검색 (완전 통합)
- `/admin/crawling/sources` - 뉴스 소스 관리
- `/admin/crawling/history` - 검색 기록
- `/admin/crawling/favorites` - 즐겨찾기 키워드
- `/admin/crawling` - 크롤링 대시보드

### API 엔드포인트
- `/api/articles` - 기사 CRUD
- `/api/news-sources` - 뉴스 소스 관리
- `/api/keywords` - 키워드 관리
- `/api/search-history` - 검색 기록

### 커스텀 훅
- `useScraping()` - 스크래핑 작업 관리
- `useArticles()` - 기사 목록 조회
- `useScrapingMetrics()` - 시스템 메트릭

---

## 다음 단계

1. ✅ 기본 설정 완료
2. 🔑 API 키 설정 (.env.local)
3. 🚀 개발 서버 실행 (npm run dev)
4. 🧪 테스트 시나리오 실행
5. 📊 데이터 확인 (Prisma Studio)

---

## 참고 문서

- **통합 상황**: `INTEGRATION_SUMMARY.md`
- **구현 완료**: `IMPLEMENTATION_COMPLETE.md`
- **프롬프트 가이드**: `prompts/05-scraping-integration.md`
- **Prisma 스키마**: `prisma/schema.prisma`

---

## 현재 통합 상태

### ✅ 완전 통합 완료 (74%)
- 스크래핑 메인 페이지 (83%)
- 스크래핑 결과 표시 (100%)
- 뉴스 소스 관리 (100%)
- 상세보기 모달 (83%)
- 실시간 업데이트 (100%)
- 관리 페이지 (100%)

### ⏳ 진행 중/예정
- 성능 최적화
- 통합 테스트
- 검색 통계 차트
- 데이터 캐싱

---

**준비 완료! 이제 `npm run dev`로 서버를 시작하고 테스트하세요.**
