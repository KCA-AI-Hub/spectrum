# 03. 스크래핑 시스템 UI 구현

## 개요
웹 스크래핑 기능을 위한 포괄적인 사용자 인터페이스를 구현합니다. 키워드 기반 검색, 결과 표시, 소스 관리 등 스크래핑과 관련된 모든 UI 컴포넌트를 shadcn/ui를 활용하여 정적으로 완성합니다.

## 목표
- 직관적인 키워드 입력 및 검색 설정 인터페이스
- 다양한 형태의 결과 표시 옵션 (테이블, 카드뷰)
- 뉴스 소스 관리 및 모니터링 UI
- 반응형 및 접근성을 고려한 UI/UX

## 체크리스트

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
- [ ] 사이드바에 "뉴스 스크래핑" 메뉴 항목 UI 추가
  - [x] 스크래핑 (`/admin/scraping`) 메뉴 항목
  - [x] 뉴스 소스 관리 (`/admin/scraping/sources`) 메뉴 항목

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

## 완료 조건
- 모든 스크래핑 관련 UI 컴포넌트가 정적으로 구현됨
- 테이블 뷰와 카드 뷰가 완성되고 전환 가능
- 뉴스 소스 관리 페이지 UI가 완성됨
- 반응형 디자인과 접근성 기준을 충족
- 모든 모달과 다이얼로그가 구현됨

## 다음 단계
이 단계 완료 후 `04-scraping-backend.md`로 진행하여 스크래핑 시스템의 백엔드 기능을 구현합니다.