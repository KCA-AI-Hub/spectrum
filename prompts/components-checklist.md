# Spectrum 관리자 UI 컴포넌트 체크리스트

## 🧩 shadcn/ui 기반 컴포넌트 목록

### 1. 레이아웃 컴포넌트

#### 1.1 기본 레이아웃
- [ ] **AdminLayout** - 관리자 메인 레이아웃
  - [ ] 사이드바 네비게이션
  - [ ] 헤더 (사용자 정보, 알림, 로그아웃)
  - [ ] 메인 콘텐츠 영역
  - [ ] 브레드크럼 네비게이션

- [ ] **Sidebar** - 좌측 네비게이션
  - [ ] 로고 및 브랜딩
  - [ ] 메뉴 아이템 (접기/펼치기)
  - [ ] 활성 상태 표시
  - [ ] 권한별 메뉴 필터링

- [ ] **Header** - 상단 헤더
  - [ ] 알림 드롭다운
  - [ ] 사용자 프로필 드롭다운
  - [ ] 검색 기능
  - [ ] 다크모드 토글

#### 1.2 컨테이너 컴포넌트
- [ ] **DashboardContainer** - 대시보드 컨테이너
- [ ] **PageContainer** - 페이지별 컨테이너
- [ ] **WidgetContainer** - 위젯 컨테이너

### 2. 대시보드 컴포넌트

#### 2.1 통계 위젯
- [ ] **StatCard** - 통계 카드
  - [ ] 아이콘, 제목, 수치, 변화율
  - [ ] 색상 테마 (성공/경고/오류)
  - [ ] 로딩 스켈레톤

- [ ] **MetricChart** - 메트릭 차트
  - [ ] 라인 차트 (시간별 추이)
  - [ ] 바 차트 (카테고리별 비교)
  - [ ] 도넛 차트 (비율 표시)
  - [ ] 실시간 데이터 업데이트

- [ ] **ProgressWidget** - 진행률 위젯
  - [ ] 원형 프로그레스
  - [ ] 선형 프로그레스
  - [ ] 다단계 프로그레스

#### 2.2 상태 모니터링
- [ ] **SystemStatus** - 시스템 상태
  - [ ] 서버 상태 인디케이터
  - [ ] CPU/메모리 사용률
  - [ ] 네트워크 상태

- [ ] **ServiceHealth** - 서비스 헬스체크
  - [ ] API 상태 모니터링
  - [ ] 데이터베이스 연결 상태
  - [ ] 외부 서비스 연동 상태

### 3. 크롤링 관리 컴포넌트

#### 3.1 소스 관리
- [ ] **CrawlSourceManager** - 크롤링 소스 관리
  - [ ] 소스 목록 테이블
  - [ ] 소스 추가/편집 폼
  - [ ] 소스 상태 토글
  - [ ] 벌크 작업 (일괄 활성화/비활성화)

- [ ] **SourceForm** - 소스 등록/편집 폼
  - [ ] URL 입력 및 검증
  - [ ] 카테고리 선택
  - [ ] 크롤링 주기 설정
  - [ ] 키워드 필터 설정

- [ ] **SourceTestDialog** - 소스 테스트 다이얼로그
  - [ ] 실시간 크롤링 테스트
  - [ ] 수집 데이터 미리보기
  - [ ] 오류 메시지 표시

#### 3.2 스케줄 관리
- [ ] **CrawlScheduler** - 크롤링 스케줄러
  - [ ] 캘린더 뷰
  - [ ] 작업 큐 상태
  - [ ] 우선순위 설정

- [ ] **JobQueue** - 작업 큐 모니터링
  - [ ] 대기 중인 작업 목록
  - [ ] 실행 중인 작업 상태
  - [ ] 완료/실패 작업 통계

#### 3.3 데이터 모니터링
- [ ] **CrawlMonitor** - 크롤링 모니터링
  - [ ] 실시간 로그 스트림
  - [ ] 성공률 차트
  - [ ] 오류 분석 차트

- [ ] **DataQualityPanel** - 데이터 품질 패널
  - [ ] 중복 데이터 감지
  - [ ] 스팸 필터링 결과
  - [ ] 데이터 정규화 상태

### 4. 콘텐츠 관리 컴포넌트

#### 4.1 문서 요약 관리
- [ ] **SummaryManager** - 요약 관리
  - [ ] 요약 목록 테이블
  - [ ] 요약 품질 점수
  - [ ] 요약 편집/재생성

- [ ] **SummaryEditor** - 요약 편집기
  - [ ] 원문/요약 비교 뷰
  - [ ] 편집 도구
  - [ ] 저장/되돌리기

- [ ] **QualityMetrics** - 품질 지표
  - [ ] 일치도 점수 차트
  - [ ] 사용자 만족도 통계
  - [ ] 품질 트렌드 분석

#### 4.2 동영상 관리
- [ ] **VideoManager** - 동영상 관리
  - [ ] 비디오 그리드 뷰
  - [ ] 필터 및 검색
  - [ ] 벌크 작업 (삭제, 태그 추가)

- [ ] **VideoPlayer** - 비디오 플레이어
  - [ ] 재생/일시정지 컨트롤
  - [ ] 볼륨 조절
  - [ ] 전체화면 모드

- [ ] **VideoGenerator** - 비디오 생성 도구
  - [ ] 텍스트 입력
  - [ ] 스타일 선택
  - [ ] 생성 진행률 표시

### 5. 사용자 관리 컴포넌트

#### 5.1 계정 관리
- [ ] **UserManager** - 사용자 관리
  - [ ] 사용자 목록 테이블
  - [ ] 검색 및 필터링
  - [ ] 계정 상태 관리

- [ ] **UserForm** - 사용자 등록/편집 폼
  - [ ] 기본 정보 입력
  - [ ] 부서/직급 선택
  - [ ] 권한 설정

- [ ] **BulkUserActions** - 일괄 사용자 작업
  - [ ] 선택된 사용자 일괄 편집
  - [ ] CSV 가져오기/내보내기
  - [ ] 일괄 권한 변경

#### 5.2 권한 관리
- [ ] **RoleManager** - 역할 관리
  - [ ] 역할 목록
  - [ ] 권한 매트릭스
  - [ ] 역할 생성/편집

- [ ] **PermissionMatrix** - 권한 매트릭스
  - [ ] 기능별 권한 표시
  - [ ] 역할별 권한 할당
  - [ ] 시각적 권한 맵

#### 5.3 활동 분석
- [ ] **UserAnalytics** - 사용자 분석
  - [ ] 활동 통계 차트
  - [ ] 학습 패턴 분석
  - [ ] 퀴즈 성과 통계

- [ ] **ActivityLog** - 활동 로그
  - [ ] 로그 테이블
  - [ ] 시간별 필터링
  - [ ] 사용자별 필터링

### 6. 시스템 관리 컴포넌트

#### 6.1 모니터링
- [ ] **SystemMonitor** - 시스템 모니터링
  - [ ] 리소스 사용률 차트
  - [ ] 성능 메트릭 대시보드
  - [ ] 알림 패널

- [ ] **AlertPanel** - 알림 패널
  - [ ] 활성 알림 목록
  - [ ] 알림 심각도 표시
  - [ ] 알림 해제/확인

#### 6.2 설정 관리
- [ ] **ConfigManager** - 설정 관리
  - [ ] 설정 카테고리
  - [ ] 동적 폼 렌더링
  - [ ] 설정 백업/복원

- [ ] **APIConfigPanel** - API 설정 패널
  - [ ] API 키 관리
  - [ ] 연결 테스트
  - [ ] 사용량 모니터링

### 7. 공통 UI 컴포넌트

#### 7.1 폼 컴포넌트
- [x] **DynamicForm** - 동적 폼 생성기
- [x] **FormSection** - 폼 섹션 컨테이너
- [x] **FieldGroup** - 필드 그룹 래퍼

#### 7.2 데이터 표시
- [x] **DataTable** - 고급 데이터 테이블
  - [x] 정렬, 필터링, 페이징
  - [x] 행 선택 (단일/다중)
  - [x] 컬럼 숨김/표시
  - [x] 인라인 편집

- [x] **SearchFilter** - 검색 및 필터
  - [x] 고급 검색 옵션
  - [x] 다중 필터 조합
  - [x] 저장된 필터

#### 7.3 피드백 컴포넌트
- [x] **LoadingState** - 로딩 상태
  - [x] 스켈레톤 로더
  - [x] 스피너
  - [x] 진행률 바

- [x] **EmptyState** - 빈 상태
  - [x] 일러스트레이션
  - [x] 액션 버튼
  - [x] 도움말 텍스트

- [x] **ErrorBoundary** - 오류 경계
  - [x] 오류 메시지 표시
  - [x] 새로고침 버튼
  - [x] 오류 리포팅

#### 7.4 유틸리티 컴포넌트
- [x] **ConfirmDialog** - 확인 다이얼로그
- [x] **NotificationCenter** - 알림 센터
- [x] **HelpTooltip** - 도움말 툴팁
- [x] **ShortcutHelper** - 키보드 단축키 도움말

## 📦 shadcn/ui 컴포넌트 의존성

### 설치 필요한 shadcn/ui 컴포넌트
- [x] **기본 컴포넌트**
  ```bash
  npx shadcn@latest add button
  npx shadcn@latest add input
  npx shadcn@latest add label
  npx shadcn@latest add textarea
  npx shadcn@latest add select
  npx shadcn@latest add checkbox
  npx shadcn@latest add radio-group
  npx shadcn@latest add switch
  ```

- [x] **레이아웃 컴포넌트**
  ```bash
  npx shadcn@latest add card
  npx shadcn@latest add separator
  npx shadcn@latest add sheet
  npx shadcn@latest add tabs
  npx shadcn@latest add accordion
  ```

- [x] **오버레이 컴포넌트**
  ```bash
  npx shadcn@latest add dialog
  npx shadcn@latest add dropdown-menu
  npx shadcn@latest add popover
  npx shadcn@latest add tooltip
  npx shadcn@latest add alert-dialog
  ```

- [x] **피드백 컴포넌트**
  ```bash
  npx shadcn@latest add alert
  npx shadcn@latest add sonner
  npx shadcn@latest add progress
  npx shadcn@latest add skeleton
  npx shadcn@latest add badge
  ```

- [x] **데이터 표시**
  ```bash
  npx shadcn@latest add table
  npx shadcn@latest add avatar
  npx shadcn@latest add calendar
  npx shadcn@latest add command
  ```

- [x] **네비게이션**
  ```bash
  npx shadcn@latest add breadcrumb
  npx shadcn@latest add navigation-menu
  npx shadcn@latest add pagination
  ```

- [x] **추가 설치된 컴포넌트**
  ```bash
  npx shadcn@latest add collapsible
  npx shadcn@latest add scroll-area
  ```

## 🎨 추가 필요한 라이브러리

### 차트 및 시각화
- [x] **Recharts** - 차트 라이브러리
  ```bash
  npm install recharts
  ```

### 날짜 및 시간
- [x] **date-fns** - 날짜 유틸리티
  ```bash
  npm install date-fns
  ```

### 폼 관리
- [x] **React Hook Form** - 폼 상태 관리
  ```bash
  npm install react-hook-form @hookform/resolvers
  ```

- [x] **Zod** - 스키마 검증
  ```bash
  npm install zod
  ```

### 상태 관리
- [ ] **Zustand** - 전역 상태 관리
  ```bash
  npm install zustand
  ```

### 실시간 통신
- [ ] **Socket.io Client** - 웹소켓 통신
  ```bash
  npm install socket.io-client
  ```

### 테이블 고급 기능
- [x] **TanStack Table** - 고급 테이블 기능
  ```bash
  npm install @tanstack/react-table
  ```

### 파일 업로드
- [x] **React Dropzone** - 파일 드래그앤드롭
  ```bash
  npm install react-dropzone
  ```

## 🚀 개발 우선순위

### Phase 1: 기본 레이아웃 및 네비게이션 (Week 1)
1. AdminLayout, Sidebar, Header 구현
2. 기본 라우팅 설정
3. 권한별 메뉴 필터링

### Phase 2: 대시보드 및 모니터링 (Week 2)
1. 메인 대시보드 구현
2. 통계 위젯 및 차트 컴포넌트
3. 실시간 데이터 연동

### Phase 3: 크롤링 관리 (Week 3)
1. 크롤링 소스 관리 컴포넌트
2. 스케줄러 및 모니터링 컴포넌트
3. 데이터 품질 관리 도구

### Phase 4: 콘텐츠 및 사용자 관리 (Week 4)
1. 콘텐츠 관리 컴포넌트
2. 사용자 관리 컴포넌트
3. 권한 관리 시스템

이 체크리스트는 개발 진행에 따라 지속적으로 업데이트하며, 각 컴포넌트의 완성도와 테스트 상태를 추적하는 데 사용됩니다.