# Spectrum - 영상 생성 워크플로우 구현 플랜

## 목표 워크플로우

```
1. 키워드 입력
   ↓
2. FireCrawl API로 뉴스 스크래핑
   ↓
3. 스크래핑된 기사 목록 표시
   ↓
4. OpenAI API로 기사 요약
   ↓
5. OpenAI API로 1분 영상 프롬프트 생성
   ↓
6. fal.ai API로 영상 제작
   ↓
7. 영상 viewer 화면에서 결과 표시
```

---

## 현재 상태

### ✅ 구현 완료
- FireCrawl API 통합 (`lib/api/firecrawl.ts`)
- OpenAI API 통합 (`lib/api/openai.ts`)
  - 요약 생성 (`generateSummary`)
  - 키워드 추출 (`extractKeywords`)
  - 비디오 프롬프트 생성 (`generateVideoPrompt`)
- 데이터베이스 스키마 (Article, Summary, Video 모델)
- 검색 UI (`app/admin/search/page.tsx`)

### ⚠️ 미구현
- fal.ai API 통합 (현재 Mock Provider만 존재)
- 통합 워크플로우 API
- 영상 viewer 화면

---

## Phase 1: fal.ai API 통합

### 1.1 패키지 설치 및 환경 설정
```bash
npm install @fal-ai/serverless-client
```

`.env.local`에 추가:
```
FAL_API_KEY=your_fal_api_key_here
TEXT_TO_VIDEO_PROVIDER=falai
```

### 1.2 fal.ai API 래퍼 구현
**파일**: `lib/api/falai.ts` (신규)

**주요 함수**:
- `initializeFalClient()` - 클라이언트 초기화
- `generateVideo(prompt, options)` - 영상 생성 요청
- `checkJobStatus(jobId)` - 진행 상태 확인
- `downloadVideo(url, destinationPath)` - 영상 다운로드

**파라미터 설정**:
- duration: 60초 (1분)
- fps: 24 or 30
- resolution: 1080x1920 (세로) or 1920x1080 (가로)
- aspect_ratio: 9:16, 16:9, 1:1

### 1.3 FalAIProvider 클래스 구현
**파일**: `lib/video/text-to-video-api.ts` (수정)

**변경 사항**:
- `MockTextToVideoProvider` 삭제
- `FalAIProvider` 클래스 추가
- `TextToVideoProvider` 인터페이스 구현
- `initializeTextToVideoClient`에서 fal.ai 사용

---

## Phase 2: 통합 워크플로우 API

### 2.1 통합 워크플로우 API
**파일**: `app/api/workflow/keyword-to-video/route.ts` (신규)

**입력**:
```typescript
{
  keywords: string[]        // 검색 키워드
  dateRange?: {            // 선택 사항
    start: string
    end: string
  }
  videoSettings?: {        // 선택 사항
    duration: number       // 기본값: 60
    format: "VERTICAL" | "HORIZONTAL" | "SQUARE"
    style: "MODERN" | "CLASSIC" | "MINIMAL"
  }
}
```

**처리 단계**:
1. FireCrawl `searchNews`로 기사 스크래핑
2. 가장 관련성 높은 기사 선택 (1개)
3. OpenAI `generateSummary`로 요약
4. OpenAI `generateVideoPrompt`로 프롬프트 생성
5. fal.ai로 영상 생성
6. 데이터베이스에 모든 데이터 저장
7. 작업 ID 및 상태 반환

**응답**:
```typescript
{
  workflowId: string
  articleId: string
  summaryId: string
  videoId: string
  status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED"
  message: string
}
```

### 2.2 워크플로우 상태 확인 API
**파일**: `app/api/workflow/[id]/status/route.ts` (신규)

**응답**:
```typescript
{
  id: string
  status: "SCRAPING" | "SUMMARIZING" | "PROMPTING" | "GENERATING" | "COMPLETED" | "FAILED"
  progress: number        // 0-100
  currentStep: string
  estimatedTime: number   // 남은 시간 (초)
  error?: string
  result?: {
    videoUrl: string
    articleTitle: string
    summary: string
  }
}
```

---

## Phase 3: UI 구현

### 3.1 검색 페이지에 워크플로우 시작 버튼 추가
**파일**: `app/admin/search/page.tsx` (수정)

**추가 기능**:
- 검색 결과 테이블에 "영상 생성" 버튼 추가
- 버튼 클릭 시 워크플로우 API 호출
- 진행 상황 실시간 표시 (폴링)
- 완료 시 viewer 페이지로 이동

**UI 컴포넌트**:
- 영상 생성 버튼 (각 기사마다)
- 진행 상황 표시 모달
  - 현재 단계 표시
  - 진행률 바 (0-100%)
  - 예상 완료 시간
- Toast 알림 (성공/실패)

### 3.2 빠른 영상 생성 페이지
**파일**: `app/admin/videos/quick-create/page.tsx` (신규)

**주요 기능**:
- 키워드 입력 필드
- 선택 옵션: 날짜 범위, 영상 포맷, 스타일
- 영상 생성 시작 버튼
- 진행 상황 표시 (4단계: 검색 → 요약 → 프롬프트 → 영상 생성)
- 진행률 바 (0-100%)

### 3.3 영상 Viewer 페이지
**파일**: `app/admin/videos/[id]/view/page.tsx` (신규)

**주요 기능**:
- 영상 플레이어 (재생, 일시정지, 볼륨, 전체화면, 다운로드)
- 메타데이터 표시 (기사 제목/링크, 생성 일시, 키워드, 요약, 프롬프트)
- 액션 버튼 (다시 생성, 공유, 삭제)

### 3.4 영상 목록 페이지 개선
**파일**: `app/admin/videos/page.tsx` (수정)

**추가 기능**:
- 썸네일 표시 (첫 프레임)
- 원본 기사 링크
- 생성 상태 뱃지
- 필터링 (키워드, 날짜, 상태)
- "보기" 버튼 → viewer 페이지로 이동

---

## Phase 4: 진행 상황 실시간 업데이트

### 4.1 폴링 시스템
**파일**: `lib/hooks/use-workflow-status.ts` (신규)

**Hook 기능**:
```typescript
function useWorkflowStatus(workflowId: string) {
  // 2초마다 상태 확인 API 호출
  // 상태, 진행률, 현재 단계 반환
  // COMPLETED 또는 FAILED 시 폴링 중지
}
```

**사용 예시**:
```typescript
const { status, progress, currentStep, result } = useWorkflowStatus(workflowId)
```

---

## Phase 5: 비디오 파일 관리

### 5.1 파일 저장 구조
```
public/
  videos/
    originals/        # fal.ai에서 생성된 원본
      YYYY-MM-DD/
        video_[id]_[timestamp].mp4
    thumbnails/       # 썸네일 이미지
      YYYY-MM-DD/
        thumb_[id]_[timestamp].jpg
```

### 5.2 썸네일 자동 생성
- 영상 생성 완료 시 자동 실행
- ffmpeg로 첫 프레임 추출
- 해상도: 320x180 (16:9) 또는 180x320 (9:16)

---

## 구현 우선순위

### 🔴 Critical (1주차)
1. **fal.ai API 통합** (1-2일)
   - 패키지 설치 및 환경 설정
   - API 래퍼 구현
   - FalAIProvider 클래스 구현

2. **통합 워크플로우 API** (2-3일)
   - keyword-to-video 엔드포인트
   - 상태 확인 엔드포인트
   - 에러 처리

### 🟡 High Priority (2주차)
3. **검색 페이지 통합** (2일)
   - 영상 생성 버튼 추가
   - 진행 상황 모달

4. **빠른 영상 생성 페이지** (2일)
   - 간단한 입력 폼
   - 실시간 진행 상황

5. **영상 Viewer 페이지** (2일)
   - 영상 플레이어
   - 메타데이터 표시
   - 액션 버튼

### 🟢 Medium Priority (3주차)
6. **영상 목록 페이지 개선** (1일)
   - 썸네일 추가
   - 필터링 기능

7. **파일 관리 시스템** (1일)
   - 저장 구조 설정
   - 썸네일 생성

8. **진행 상황 실시간 업데이트** (1일)
   - 폴링 Hook 구현

---

## 예상 일정

- **Week 1**: fal.ai 통합 + 워크플로우 API
- **Week 2**: UI 구현 (검색 페이지, 빠른 생성, viewer)
- **Week 3**: 개선 및 최적화 (목록 페이지, 파일 관리, 폴링)

**총 예상 기간: 3주**

---

## 환경 변수 설정

`.env.local`에 추가:
```env
FAL_API_KEY=your_fal_api_key_here
TEXT_TO_VIDEO_PROVIDER=falai
```

---

## 다음 단계

1. Phase 1: fal.ai API 통합
2. Phase 2: 워크플로우 API 구현
3. Phase 3: UI 구현 (검색, 빠른 생성, viewer)
4. Phase 4: 실시간 업데이트
5. Phase 5: 파일 관리
