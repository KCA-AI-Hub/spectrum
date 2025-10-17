# Spectrum POC 구현 체크리스트

## 📋 프로젝트 개요
웹크롤링 기반 콘텐츠 분석 및 숏폼 동영상 제작 플랫폼 POC 개발

---

## 🚀 Phase 1: 프로젝트 기반 구축

### 1.1 기본 환경 설정
- [x] Next.js 15.5.3 프로젝트 초기 설정 (Turbopack 포함)
- [x] TypeScript 설정 및 타입 정의
- [x] ESLint 설정
- [x] 환경변수 관리 (.env 파일)
- [x] Git 저장소 설정 및 .gitignore

### 1.2 데이터베이스 구성
- [x] SQLite 데이터베이스 파일 생성 및 설정
- [x] Prisma ORM과 SQLite 연동 설정
- [x] SQLite 스키마 정의 및 테이블 구조 설계
- [x] SQLite 마이그레이션 스크립트 작성
- [x] SQLite 시드 데이터 생성 스크립트

### 1.3 외부 API 연동 준비
- [x] Firecrawl API 키 설정 및 환경변수 구성
- [x] OpenAI API 키 설정 및 환경변수 구성
- [x] API 클라이언트 기본 구조 설정

### 1.4 추가된 최신 기술 스택 (현재 구현됨)
- [x] React 19 및 Next.js 15 호환성 확인
- [x] Turbopack 빌드 최적화 설정
- [x] 추가된 UI 컴포넌트 라이브러리 설정
  - [x] @tanstack/react-table (데이터 테이블)
  - [x] react-dropzone (파일 업로드)
  - [x] sonner (토스트 알림)
  - [x] recharts (차트/시각화)
  - [x] React Hook Form + Zod (폼 처리)
  - [x] date-fns, react-day-picker (날짜 처리)

---

## 🎨 Phase 2: UI/UX 기반 구축

### 2.1 디자인 시스템 구축
- [x] Tailwind CSS v4 설정 및 커스텀 테마
- [x] shadcn/ui 컴포넌트 라이브러리 설정 (new-york 스타일)
- [x] 다크/라이트 모드 지원 (next-themes)
- [x] 아이콘 라이브러리 설정 (Lucide React)
- [x] 글꼴 및 타이포그래피 설정

### 2.2 공통 컴포넌트 개발
- [x] Layout 컴포넌트 (Header, Sidebar) - 관리자 레이아웃 구현
- [x] Navigation 컴포넌트 - 사이드바 네비게이션 (1레벨 구조)
- [x] 로딩 스피너 및 스켈레톤 컴포넌트
- [x] 에러 처리 컴포넌트
- [x] 알림 및 토스트 메시지 시스템 (Sonner)
- [x] 모달 및 다이얼로그 컴포넌트 (Radix UI)

### 2.3 상태 관리 시스템
- [x] React Context 또는 Zustand 설정 (Providers 구현: theme, real-time, dashboard-settings)
- [x] 전역 상태 구조 설계
- [x] API 상태 관리 (로딩, 에러, 성공)
- [x] 사용자 설정 상태 관리

---

## 🏠 Phase 3: 메인 대시보드 UI 구현

### 3.1 대시보드 UI 레이아웃 설계
- [x] 반응형 대시보드 레이아웃 구성 - 관리자 페이지 기본 구조
- [x] 카드 기반 위젯 시스템 UI 컴포넌트 구현
- [x] 그리드 시스템 및 반응형 배치 (Tailwind CSS)
- [x] 헤더 및 사이드바 네비게이션 UI 완성

### 3.2 대시보드 위젯 UI 개발
- [x] 시스템 상태 개요 위젯 UI 구현
- [x] 최근 크롤링 결과 위젯 UI 구현
- [x] 콘텐츠 생성 통계 위젯 UI 구현
- [x] 빠른 작업 실행 버튼 UI 구현
- [x] 최근 활동 피드 위젯 UI 구현
- [x] 차트 및 데이터 시각화 UI (Recharts 활용)

### 3.3 대시보드 인터랙션 및 기본 기능
- [x] 위젯 호버 및 클릭 상태 UI 구현
- [x] 위젯 순서 변경 드래그 앤 드롭 UI
- [x] 대시보드 커스터마이징 옵션 UI
- [x] 로딩 스켈레톤 및 빈 상태 UI
- [x] 반응형 모바일 대시보드 UI

---

## 🕷️ Phase 4A: 스크래핑 시스템 UI 구현

**※ UI 우선 개발: 정적 UI 컴포넌트 및 레이아웃 구현**
- shadcn/ui 컴포넌트를 활용한 스크래핑 관련 UI 구현
- 사용자 인터페이스 및 사용자 경험 중심의 화면 구성
- 백엔드 연동 없이 정적 데이터로 UI 완성

### 4A.1 필요한 shadcn UI 컴포넌트 설치
- [x] shadcn UI 컴포넌트 설치 (`npx shadcn@latest add input form button card badge dialog table dropdown-menu checkbox calendar select popover alert-dialog progress scroll-area`)

### 4A.2 스크래핑 메인 페이지 UI 구현
- [x] 키워드 입력 및 관리 설정 인터페이스 (shadcn Input + Form 활용)
- [x] 고급 필터링 옵션 UI: 날짜 범위, 출처, 카테고리 (shadcn Select, Calendar, DateRangePicker)
- [x] 스크래핑 실행 버튼 및 진행 상태 UI (Progress, Spinner)
- [x] 스크래핑 기록 드롭다운 UI (최근 키워드)
- [x] 빠른 필터 버튼들 UI

### 4A.3 스크래핑 결과 표시 UI 구현
- [x] 뷰 모드 전환 버튼 UI (테이블 뷰 ↔ 카드 뷰)
- [x] 스크래핑 결과 통계 표시 UI (총 개수, 시간)
- [x] 테이블 뷰 UI 구현 (shadcn Table + TanStack React Table)
  - [x] 제목, 출처, 날짜, 관련도 점수 컬럼 UI
  - [x] 정렬, 필터링, 페이지네이션 UI
  - [x] 행 선택 체크박스 UI
- [x] 카드 뷰 UI 구현 (shadcn Card Grid)
  - [x] 기사 썸네일 플레이스홀더
  - [x] 제목, 요약, 출처, 날짜 표시 UI
  - [x] 관련도 점수 Badge UI
  - [x] 카테고리 Tags UI (shadcn Badge)

### 4A.4 뉴스 소스 관리 페이지 UI 구현
- [x] 뉴스 소스 등록/편집 폼 UI (shadcn Input + Form)
- [x] 등록된 소스 목록 테이블 UI (TanStack React Table)
- [x] 소스 상태 모니터링 위젯 UI (활성/비활성, 상태 표시)
- [x] 소스별 설정 관리 UI (빈도, 키워드 필터)
- [x] 소스 카테고리 분류 UI (드롭다운, 태그)

### 4A.5 상세보기 및 모달 UI 구현
- [x] 뉴스 상세보기 Modal UI (shadcn Dialog)
  - [x] 전체 기사 내용 표시 레이아웃
  - [x] 키워드 하이라이팅 UI 스타일
  - [x] 원본 링크, 공유 버튼 UI
  - [x] 즐겨찾기 토글 버튼 UI
- [x] 스크래핑 설정 Modal UI
- [x] 확인 다이얼로그 UI (삭제, 수정 등)

### 4A.6 사이드바 및 네비게이션 UI 개선
- [x] 즐겨찾기 키워드 목록 카드 UI (shadcn Card)
- [x] 인기 검색어 위젯 UI
- [x] 검색 통계 차트 UI (Recharts)
- [x] 사이드바에 "뉴스 스크래핑" 메뉴 항목 UI 추가
  - [x] 스크래핑 (`/admin/scraping`) 메뉴 항목
  - [x] 뉴스 소스 관리 (`/admin/crawling/sources`) 메뉴 항목

### 4A.7 관리 페이지 UI 구현
- [x] 검색 기록 관리 페이지 UI (`/admin/search/history`)
  - [x] 검색 기록 테이블 UI (날짜, 키워드, 결과 수)
  - [x] 검색 기록 삭제 버튼 UI
  - [x] 검색 트렌드 그래프 UI
- [x] 즐겨찾기 관리 페이지 UI (`/admin/search/favorites`)
  - [x] 즐겨찾기 키워드 카드 뷰 UI
  - [x] 키워드 추가/편집/삭제 UI
  - [x] 태그 시스템 UI

### 4A.8 반응형 및 접근성 UI 최적화
- [x] 모바일 반응형 레이아웃 (Tailwind responsive classes)
- [x] 키보드 네비게이션 지원 UI (Tab, Enter 키)
- [x] 스크린 리더 접근성 (ARIA 레이블)
- [x] 다크모드 지원 확인
- [x] 로딩 상태 및 프로그레스 UI (Progress 컴포넌트)
- [x] 빈 상태 및 에러 상태 UI

---

## 🔧 Phase 4B: 스크래핑 시스템 기능 구현

**※ 백엔드 기능 개발: 데이터베이스, API, 비즈니스 로직 구현**
- Firecrawl API 연동 및 스크래핑 엔진 구현
- 데이터베이스 스키마 및 데이터 처리 로직 구현
- RESTful API 엔드포인트 개발

### 4B.1 데이터베이스 스키마 확장 및 구현
- [x] keywords 테이블 생성 (키워드 관리)
- [x] crawl_targets 테이블 생성 (크롤링 소스 관리 - news_sources 역할)
- [x] crawl_jobs 테이블 생성 (크롤링 작업 추적 - scraping_jobs 역할)
- [x] search_history 테이블 생성 (검색 기록 추적)
- [x] articles 테이블에 relevance_score, keyword_tags, source_url 컬럼 추가
- [x] 키워드 및 소스 최적화를 위한 인덱스 생성
- [x] 테이블 관계 설정 및 외래키 제약 조건
- [x] 데이터베이스 마이그레이션 스크립트 업데이트 (Prisma schema 완성)

### 4B.2 Firecrawl 스크래핑 엔진 구현
- [x] Firecrawl API 클라이언트 기본 연동
- [x] 뉴스 소스별 스크래핑 로직 구현 (Crawl Queue 시스템)
- [x] 키워드 기반 콘텐츠 필터링 알고리즘 (relevance_threshold 구현)
- [x] 다중 키워드 매칭 처리 로직
- [x] 중복 기사 감지 알고리즘 (제목, 내용, URL 기반 - data-processing.ts)
- [x] 스크래핑된 기사 메타데이터 추출 (제목, 내용, 날짜, 소스)
- [x] HTML 태그 제거 및 텍스트 정제
- [x] 스크래핑 오류 처리 및 재시도 로직 (exponential backoff)

### 4B.3 스크래핑 작업 관리 시스템
- [x] 스크래핑 작업 큐 시스템 구현 (crawl-queue.ts)
- [x] 작업 우선순위 및 동시 실행 관리 (priority-based queue)
- [x] 작업 진행 상태 추적 및 업데이트 (CrawlJob status: PENDING, RUNNING, COMPLETED, FAILED)
- [x] 작업 실패 시 재시도 로직 (자동 재시도 with exponential backoff)
- [x] 작업 성능 모니터링 및 최적화 (시스템 상태 메트릭 추적)
- [ ] 스크래핑 작업 스케줄러 구현 (cron 기반) - 미구현

### 4B.4 데이터 처리 및 저장 로직
- [x] 스크래핑된 콘텐츠에서 키워드 매칭 및 관련도 점수 계산 (data-processing.ts)
- [x] article 테이블에 Prisma를 통한 데이터 저장
- [x] 스크래핑 통계 및 성공률 추적
- [x] 데이터 정규화 및 중복 제거 (normalizeExistingData 구현)
- [x] 콘텐츠 품질 검증 로직 (content-processing.ts)
- [x] 데이터 백업 및 복구 메커니즘 (backup-recovery.ts)

### 4B.5 RESTful API 엔드포인트 구현
- [x] POST /api/search/news (뉴스 검색 및 스크래핑 작업 시작)
- [x] GET /api/crawl/status/{jobId} (크롤링 작업 상태 조회)
- [x] POST /api/crawl/queue (크롤링 큐에 작업 추가)
- [x] GET /api/crawl/queue (크롤링 큐 상태 조회)
- [x] POST /api/scraping/execute (스크래핑 오케스트레이터 실행)
- [x] POST /api/scraping/process (기사 처리 API)
- [x] POST /api/scraping/normalize (데이터 정규화 API)
- [x] GET /api/search/history (검색 기록 조회)
- [x] POST /api/search/keywords (키워드 관리)
- [x] POST /api/search/keywords/{id}/favorite (즐겨찾기 토글)
- [x] GET /api/search/suggestions (검색 제안)
- [x] GET /api/backup (백업 관리)
- [x] API 입력 검증 및 에러 처리
- [ ] API 인증 및 권한 관리 (미구현)

### 4B.6 뉴스 소스 관리 로직
- [x] 뉴스 소스 URL 유효성 검증 (crawl_targets 스키마)
- [x] 소스별 스크래핑 설정 관리 (빈도, 활성화 상태, 커스텀 헤더)
- [x] 소스 카테고리 분류 시스템 (SourceType enum)
- [x] 소스 성능 및 신뢰도 평가 (success_rate, last_crawled_at 추적)
- [x] 소스별 스크래핑 로그 및 에러 추적 (CrawlJob과 관계 설정)
- [ ] 소스 접근 가능성 확인 로직 (실시간 health check 미구현)

---

## 🔗 Phase 4C: UI-기능 통합 및 완성

**※ 프론트엔드-백엔드 통합: 실제 동작하는 시스템 완성**
- UI 컴포넌트와 API 엔드포인트 연결
- 실시간 상태 업데이트 및 사용자 피드백
- 전체 워크플로우 테스트 및 최적화

### 4C.1 스크래핑 메인 페이지 기능 통합
- [x] 키워드 입력 폼과 스크래핑 API 연결 (/admin/search 페이지)
- [x] 실시간 스크래핑 진행 상태 표시 구현 (SearchProgress 컴포넌트)
- [x] 스크래핑 결과 실시간 업데이트
- [x] 고급 필터링 옵션과 API 쿼리 파라미터 연동
- [x] 스크래핑 기록 드롭다운 데이터 연결
- [x] 에러 상태 처리 및 사용자 피드백 (toast notifications)

### 4C.2 스크래핑 결과 표시 기능 통합
- [x] 테이블 뷰와 데이터베이스 연동 (SearchResultsTable 컴포넌트)
- [x] 카드 뷰 데이터 바인딩 (SearchResultsCards 컴포넌트)
- [x] 정렬, 필터링, 페이지네이션 API 연결
- [x] 키워드 하이라이팅 로직 구현
- [x] 행 선택 및 일괄 작업 기능 구현
- [x] 페이지네이션 구현 (TanStack Table)
- [x] 결과 통계 실시간 업데이트

### 4C.3 뉴스 소스 관리 기능 통합
- [x] 뉴스 소스 등록/편집/삭제 폼과 API 연결 (/admin/crawling/sources)
- [x] 소스 목록 테이블 데이터 바인딩
- [x] 소스 상태 실시간 모니터링 구현
- [x] 소스별 설정 관리 기능 연동 (headers, type, active 상태)
- [x] 소스 카테고리 관리 기능 (SourceType 필터)
- [ ] 소스 검증 기능 구현 (URL health check - 미구현)

### 4C.4 상세보기 및 모달 기능 구현
- [x] 뉴스 상세보기 Modal 데이터 연결 (NewsDetailModal 컴포넌트)
- [x] 키워드 하이라이팅 및 매칭 단어 강조 표시
- [x] 원본 링크 연결 및 공유 기능
- [x] 즐겨찾기 토글 기능 구현
- [ ] AI 분석 결과 표시 (향후 Phase 5 연동 준비)
- [x] 스크래핑 설정 Modal 기능 구현 (ScrapingSettingsModal)

### 4C.5 사이드바 및 네비게이션 기능 통합
- [x] 즐겨찾기 키워드 목록 실시간 업데이트 (/admin/search/favorites)
- [x] 인기 검색어 위젯 데이터 연결
- [x] 검색 통계 차트 실시간 데이터 연동 (Recharts)
- [x] 빠른 필터 버튼 기능 구현
- [x] 네비게이션 메뉴 활성 상태 관리 (AdminSidebar)

### 4C.6 관리 페이지 기능 완성
- [x] 검색 기록 관리 페이지 CRUD 기능 (/admin/search/history)
- [x] 즐겨찾기 관리 페이지 기능 완성 (/admin/search/favorites)
- [x] 검색 트렌드 분석 및 통계 기능 (Recharts 그래프)
- [ ] 데이터 내보내기 기능 (CSV, JSON) - 미구현
- [x] 일괄 삭제 및 관리 기능

### 4C.7 실시간 업데이트 및 알림 시스템
- [x] 실시간 데이터 업데이트 (RealTimeProvider 구현)
- [x] 스크래핑 진행 상황 실시간 모니터링 (SearchProgress)
- [x] 작업 완료 알림 (Sonner Toast)
- [x] 에러 발생 시 사용자 알림
- [x] 시스템 상태 실시간 표시 (Dashboard)
- [ ] WebSocket 또는 Server-Sent Events 구현 (폴링으로 대체 구현)

### 4C.8 성능 최적화 및 사용자 경험 개선
- [x] 컴포넌트 레벨 최적화 (React.memo, useMemo 사용)
- [x] 사용자 인터랙션 응답성 개선
- [x] 접근성 및 키보드 네비게이션 완성 (ARIA labels)
- [x] 모바일 반응형 디자인 구현
- [ ] API 응답 캐싱 구현 (미구현)
- [ ] 이미지 및 콘텐츠 지연 로딩 (부분 구현)

### 4C.9 통합 테스트 및 품질 보증
- [ ] 전체 스크래핑 워크플로우 E2E 테스트 (수동 테스트 완료, 자동화 미구현)
- [ ] API 통합 테스트 (미구현)
- [ ] UI 컴포넌트 인터랙션 테스트 (미구현)
- [ ] 성능 테스트 및 병목 지점 해결 (미구현)
- [ ] 에러 시나리오 테스트 및 처리 개선 (부분 구현)
- [ ] 브라우저 호환성 테스트 (미구현)

---

## 📝 Phase 5: AI 콘텐츠 분석 시스템 구현

### 5.1 콘텐츠 분석 API 구현
- [x] OpenAI API 클라이언트 구현 (lib/api/openai.ts 존재)
- [x] 텍스트 전처리 및 정제 로직 (content-processing.ts)
- [ ] AI 기반 키워드 추출 API (DB 스키마 준비 완료, API 미구현)
- [ ] 문서 주제 분류 API (미구현)
- [ ] 감정 분석 API (미구현)

### 5.2 요약 생성 시스템
- [ ] 다단계 요약 생성 로직 구현 (DB 스키마 준비 완료, 로직 미구현)
- [ ] 요약 품질 검증 시스템 (미구현)
- [x] 요약 결과 SQLite 저장 (Summary 테이블 준비 완료)
- [ ] 요약 버전 관리 기능 (미구현)

### 5.3 콘텐츠 관리 페이지 구현
- [x] 수집된 기사 목록 및 검색 인터페이스 (/admin/content UI 준비 완료)
- [x] 기사 상세 내용 보기 페이지 (NewsDetailModal)
- [ ] 요약 결과 확인 및 수정 기능 (UI 준비, 기능 미구현)
- [x] 콘텐츠 필터링 및 정렬 기능 (검색 페이지에서 구현)
- [x] 콘텐츠 상태 관리 (처리중, 완료, 오류) - UI 준비 완료

---

## 🎬 Phase 6: 동영상 생성 시스템 구현

### 6.1 동영상 생성 API 구현
- [ ] Text-to-Video API 엔드포인트 구현 (미구현)
- [ ] 동영상 생성 작업 큐 시스템 (미구현)
- [ ] 동영상 생성 상태 추적 API (미구현)
- [ ] 파일 업로드/다운로드 API (미구현)
- [x] 동영상 메타데이터 관리 API (Video 테이블 스키마 준비 완료)

### 6.2 동영상 생성 페이지 구현
- [ ] 동영상 생성 설정 인터페이스 (UI 일부 준비, /admin/content에 통합 예정)
- [ ] 요약문 → 프롬프트 변환 기능 (미구현)
- [ ] 생성 진행 상태 실시간 표시 (미구현)
- [ ] 동영상 미리보기 및 재생 기능 (미구현)
- [ ] 동영상 다운로드 및 공유 기능 (미구현)

### 6.3 동영상 관리 시스템
- [ ] 생성된 동영상 목록 관리 (UI 준비, 기능 미구현)
- [ ] 동영상 검색 및 필터링 (미구현)
- [ ] 동영상 태그 및 카테고리 시스템 (미구현)
- [ ] 동영상 파일 저장 및 관리 (미구현)
- [ ] 동영상 생성 이력 추적 (스키마 준비 완료)

---

## ❓ Phase 7: 퀴즈 시스템 구현

### 7.1 퀴즈 생성 API 구현
- [ ] AI 기반 문제 자동 생성 API (미구현)
- [ ] 문제 유형별 생성 로직 (객관식, 참/거짓, 빈칸) - 스키마 준비 완료
- [ ] 문제 품질 검증 시스템 (미구현)
- [ ] 문제 해설 자동 생성 기능 (미구현)
- [x] 퀴즈 데이터 SQLite 저장 (Quiz, Question, QuizAttempt, Answer 테이블 준비 완료)

### 7.2 퀴즈 실행 페이지 구현
- [ ] 퀴즈 생성 설정 인터페이스 (UI 준비 중, /admin/content에 통합 예정)
- [ ] 실시간 퀴즈 진행 화면 (미구현)
- [ ] 정답 확인 및 즉시 피드백 (미구현)
- [ ] 점수 계산 및 진행률 표시 (미구현)
- [ ] 퀴즈 결과 분석 화면 (미구현)

### 7.3 퀴즈 관리 시스템
- [ ] 생성된 퀴즈 문제 은행 관리 (UI 준비, 기능 미구현)
- [ ] 퀴즈 결과 통계 및 분석 (미구현)
- [ ] 학습 진도 추적 대시보드 (미구현)
- [ ] 문제 수정 및 편집 기능 (미구현)
- [ ] 퀴즈 카테고리 및 태그 관리 (미구현)

---

## 🔗 Phase 8: 시스템 통합 및 최적화

### 8.1 전체 워크플로우 통합
- [x] 크롤링 오케스트레이터 구현 (scraping-orchestrator.ts)
- [x] 작업 진행 상태 통합 관리 (CrawlJob 상태 추적)
- [x] 에러 복구 및 재시도 메커니즘 (exponential backoff)
- [x] 전체 시스템 모니터링 대시보드 (/admin 대시보드, /admin/system)
- [ ] 크롤링 → 분석 → 동영상 생성 자동화 파이프라인 (부분 구현, AI 연동 미완)
- [ ] 배치 작업 스케줄링 시스템 (cron/scheduler 미구현)

### 8.2 성능 최적화
- [x] 데이터베이스 쿼리 최적화 (Prisma 인덱스 설정)
- [x] 코드 스플리팅 및 번들 최적화 (Turbopack 활용)
- [ ] API 응답 캐싱 시스템 (미구현)
- [ ] 이미지 및 동영상 최적화 (미구현)
- [ ] 메모리 사용량 최적화 (미구현)

### 8.3 사용자 경험 개선
- [x] 로딩 상태 및 진행률 표시 개선 (Progress, Spinner 컴포넌트)
- [x] 에러 메시지 및 사용자 피드백 (Sonner Toast)
- [x] 키보드 네비게이션 지원
- [x] 접근성 개선 (a11y) - ARIA labels
- [x] 모바일 반응형 최적화 (Tailwind responsive)
- [ ] 사용자 가이드 및 도움말 (미구현)

---

## 🧪 Phase 9: 테스트 및 품질 보증

### 9.1 테스트 환경 구축
- [ ] Jest 및 React Testing Library 설정 (미구현)
- [ ] Playwright E2E 테스트 환경 구성 (미구현)
- [ ] 테스트 데이터베이스 설정 (미구현)
- [ ] 모킹 시스템 구축 (API, 외부 서비스) - 미구현
- [ ] 테스트 커버리지 측정 도구 설정 (미구현)

### 9.2 단위 테스트 작성
- [ ] 유틸리티 함수 테스트 (미구현)
- [ ] API 라우트 테스트 (미구현)
- [ ] 컴포넌트 단위 테스트 (미구현)
- [ ] 데이터베이스 쿼리 테스트 (미구현)
- [ ] 비즈니스 로직 테스트 (미구현)

### 9.3 통합 테스트 및 E2E 테스트
- [ ] 크롤링 워크플로우 E2E 테스트 (수동 테스트 진행 중)
- [ ] 콘텐츠 분석 통합 테스트 (미구현)
- [ ] 동영상 생성 플로우 테스트 (미구현)
- [ ] 퀴즈 시스템 E2E 테스트 (미구현)
- [ ] 사용자 시나리오 기반 테스트 (미구현)

---

## 🚀 Phase 10: 배포 및 운영

### 10.1 배포 환경 구축
- [x] 프로덕션 빌드 설정 및 최적화 (Turbopack 설정 완료)
- [x] 환경별 설정 파일 분리 (dev, staging, prod) - .env 구조화
- [ ] Docker 컨테이너화 및 Docker Compose 설정 (미구현)
- [ ] CI/CD 파이프라인 구축 (GitHub Actions) - 미구현
- [ ] 배포 자동화 스크립트 작성 (미구현)

### 10.2 모니터링 및 로깅
- [x] 시스템 상태 모니터링 대시보드 구현 (/admin/system)
- [x] 에러 추적 및 사용자 알림 (Toast 시스템)
- [ ] 애플리케이션 로깅 시스템 구축 (부분 구현, 체계화 필요)
- [ ] 성능 모니터링 대시보드 (UI 준비, 실제 메트릭 연동 필요)
- [ ] API 사용량 및 응답시간 모니터링 (미구현)
- [ ] 데이터베이스 성능 모니터링 (미구현)

### 10.3 보안 및 백업
- [x] API 키 및 민감 정보 보안 관리 (.env 활용)
- [x] 데이터베이스 정기 백업 시스템 (backup-recovery.ts 구현)
- [x] 사용자 입력 검증 (Zod validation)
- [ ] HTTPS 및 보안 헤더 설정 (배포 시 적용 예정)
- [ ] XSS 방지 및 입력 sanitization (부분 구현)
- [ ] 레이트 리미팅 및 DDoS 방어 (미구현)
- [ ] 인증 및 권한 관리 시스템 (미구현)

### 10.4 문서화 및 유지보수
- [x] 프로젝트 구조 문서화 (CLAUDE.md)
- [x] 구현 계획 및 체크리스트 (implementation-checklist.md)
- [ ] API 문서 작성 (Swagger/OpenAPI) - 미구현
- [ ] 사용자 가이드 및 매뉴얼 작성 (미구현)
- [ ] 코드 문서화 및 주석 정리 (부분 구현)
- [ ] 배포 및 운영 가이드 작성 (미구현)
- [ ] 장애 대응 매뉴얼 작성 (미구현)