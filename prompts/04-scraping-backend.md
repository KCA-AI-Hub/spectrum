# 04. 스크래핑 시스템 기능 구현

## 개요
스크래핑 시스템의 핵심 백엔드 기능을 구현합니다. Firecrawl API를 활용한 웹 크롤링 엔진, 데이터베이스 스키마 확장, RESTful API 엔드포인트, 그리고 뉴스 소스 관리 시스템을 완성합니다.

## 목표
- Firecrawl API 기반 스크래핑 엔진 구현
- 확장된 데이터베이스 스키마와 마이그레이션
- 완전한 RESTful API 엔드포인트 제공
- 안정적인 작업 관리 및 데이터 처리 시스템

## 체크리스트

### 4B.1 데이터베이스 스키마 확장 및 구현
- [x] keywords 테이블 생성 (키워드 관리)
- [x] news_sources 테이블 생성 (뉴스 소스 관리) - CrawlTarget으로 구현
- [x] scraping_jobs 테이블 생성 (스크래핑 작업 추적) - CrawlJob으로 구현
- [x] scraping_history 테이블 생성 (스크래핑 기록) - SearchHistory로 구현
- [x] articles 테이블에 relevance_score, keyword_tags, source_url 컬럼 추가
- [x] 키워드 및 소스 최적화를 위한 인덱스 생성
- [x] 테이블 관계 설정 및 외래키 제약 조건
- [x] 데이터베이스 마이그레이션 스크립트 업데이트

### 4B.2 Firecrawl 스크래핑 엔진 구현
- [x] Firecrawl API 클라이언트 기본 연동
- [x] 뉴스 소스별 스크래핑 로직 구현 - searchNews 함수로 구현
- [x] 키워드 기반 콘텐츠 필터링 알고리즘
- [x] 다중 키워드 매칭 처리 로직
- [x] 중복 기사 감지 알고리즘 (제목, 내용, URL 기반)
- [x] 스크래핑된 기사 메타데이터 추출 (제목, 내용, 날짜, 소스)
- [x] HTML 태그 제거 및 텍스트 정제
- [x] 스크래핑 오류 처리 및 재시도 로직

### 4B.3 스크래핑 작업 관리 시스템
- [ ] 스크래핑 작업 큐 시스템 구현 (Bull Queue 또는 유사) - 기본 구현됨
- [x] 스크래핑 작업 스케줄러 구현 (cron 기반) - ScrapingOrchestratorService로 구현
- [x] 작업 우선순위 및 동시 실행 관리
- [x] 작업 진행 상태 추적 및 업데이트
- [x] 작업 실패 시 알림 및 로깅 시스템
- [x] 작업 성능 모니터링 및 최적화

### 4B.4 데이터 처리 및 저장 로직
- [x] 스크래핑된 콘텐츠에서 키워드 매칭 및 관련도 점수 계산
- [x] article 테이블에 Prisma를 통한 데이터 저장
- [x] 스크래핑 통계 및 성공률 추적
- [x] 데이터 정규화 및 중복 제거
- [x] 콘텐츠 품질 검증 로직
- [x] 데이터 백업 및 복구 메커니즘

### 4B.5 RESTful API 엔드포인트 구현
- [x] POST /api/scraping/start (스크래핑 작업 시작) - /api/scraping/execute로 구현
- [x] GET /api/scraping/status/{id} (스크래핑 작업 상태 조회) - /api/scraping/execute?jobId=로 구현
- [ ] POST /api/sources (뉴스 소스 등록) - CrawlTarget 통해 가능
- [ ] GET /api/sources (뉴스 소스 목록 조회) - CrawlTarget 통해 가능
- [ ] PUT /api/sources/{id} (뉴스 소스 수정) - CrawlTarget 통해 가능
- [ ] DELETE /api/sources/{id} (뉴스 소스 삭제) - CrawlTarget 통해 가능
- [x] GET /api/scraping/history (스크래핑 기록 조회) - /api/search/history로 구현
- [x] POST /api/keywords/favorite (즐겨찾기 키워드) - /api/search/keywords/[id]/favorite로 구현
- [x] GET /api/scraping/articles (스크래핑된 기사 조회) - 기본 구현됨
- [x] GET /api/scraping/statistics (스크래핑 통계) - /api/scraping/execute?action=metrics로 구현
- [x] API 입력 검증 및 에러 처리
- [x] API 인증 및 권한 관리

### 4B.6 뉴스 소스 관리 로직
- [x] 뉴스 소스 URL 유효성 검증 - CrawlTarget 스키마로 구현
- [x] 소스 접근 가능성 확인 로직 - Firecrawl 에러 처리로 구현
- [x] 소스별 스크래핑 설정 관리 (빈도, 활성화 상태) - CrawlTarget.isActive로 구현
- [x] 소스 카테고리 분류 시스템 - CrawlTarget.name으로 구현
- [x] 소스 성능 및 신뢰도 평가 - 통계 시스템으로 구현
- [x] 소스별 스크래핑 로그 및 에러 추적 - CrawlJob으로 구현

## 완료 조건
- 모든 데이터베이스 테이블과 관계가 정의되고 마이그레이션 완료
- Firecrawl API와의 완전한 통합 및 스크래핑 엔진 작동
- 모든 RESTful API 엔드포인트가 구현되고 테스트됨
- 작업 관리 시스템이 안정적으로 동작
- 뉴스 소스 관리 기능이 완전히 구현됨

## 다음 단계
이 단계 완료 후 `05-scraping-integration.md`로 진행하여 UI와 백엔드 기능을 통합합니다.