# Spectrum 관리자 UI 데모

이 폴더는 `prompts/admin-ui-plan.md`를 기반으로 구현된 Spectrum 관리자 대시보드의 데모 페이지입니다.

## 📁 구조

```
components/demo/
├── layout/              # 관리자 레이아웃 컴포넌트
│   ├── admin-layout.tsx # 메인 관리자 레이아웃
│   ├── sidebar.tsx      # 사이드바 네비게이션
│   └── header.tsx       # 상단 헤더
├── widgets/             # 대시보드 위젯들
│   ├── stat-card.tsx    # 통계 카드 위젯
│   ├── metric-chart.tsx # 차트 위젯 (Recharts 기반)
│   └── system-monitor.tsx # 시스템 모니터링 위젯
├── pages/              # 데모 페이지들
│   └── main-dashboard.tsx # 메인 대시보드 페이지
├── demo-example.tsx    # 데모 사용 예제
└── README.md          # 이 파일
```

## 🎨 구현된 기능

### 1. 관리자 레이아웃
- **AdminLayout**: 전체 관리자 페이지 레이아웃
- **Sidebar**: 접이식 사이드바 네비게이션
- **Header**: 검색, 알림, 사용자 메뉴가 포함된 헤더

### 2. 대시보드 위젯
- **StatCard**: 통계 데이터 표시 카드
- **MetricChart**: 다양한 차트 (Line, Bar, Area, Pie)
- **SystemMonitor**: 실시간 시스템 리소스 모니터링

### 3. 메인 대시보드
- 시스템 현황 카드들 (크롤링, 동영상 생성, 활성 사용자, 시스템 리소스)
- 빠른 액션 버튼들 (긴급 크롤링, 알림 발송, 사용자 관리, 작업 스케줄)
- 실시간 차트 및 그래프
- 최근 활동 목록
- 시스템 모니터링 패널
- 알림 및 이슈 관리

## 🚀 사용 방법

### 1. 전체 데모 페이지 사용
```tsx
import { AdminDashboardDemo } from '@/components/demo'

export default function AdminPage() {
  return <AdminDashboardDemo />
}
```

### 2. 개별 컴포넌트 사용
```tsx
import { AdminLayout, MainDashboard } from '@/components/demo'
import { NotificationProvider } from '@/components/common'

export default function CustomAdminPage() {
  return (
    <NotificationProvider>
      <AdminLayout title="커스텀 페이지">
        <div>내용</div>
      </AdminLayout>
    </NotificationProvider>
  )
}
```

### 3. 위젯만 사용
```tsx
import {
  CrawlingStatusCard,
  SystemMonitor,
  CrawlingSuccessChart
} from '@/components/demo/widgets'

export default function CustomDashboard() {
  return (
    <div className="grid gap-6">
      <CrawlingStatusCard />
      <CrawlingSuccessChart />
      <SystemMonitor />
    </div>
  )
}
```

## 📊 포함된 데모 데이터

### 통계 카드
- 크롤링 상태 (24/26 활성)
- 동영상 생성 (156개)
- 활성 사용자 (89명)
- 시스템 리소스 (87% CPU)

### 차트 데이터
- 24시간 크롤링 성공률 차트
- 월별 콘텐츠 생성 통계
- 카테고리별 분포 (뉴스, 기술, 경제, 스포츠, 기타)
- 실시간 사용자 활동

### 시스템 메트릭
- CPU, 메모리, 디스크, 네트워크 사용률
- 서비스 상태 (API, 데이터베이스, 크롤러, AI 처리)

## 🎯 admin-ui-plan.md 대응 기능

### ✅ 구현된 기능
- [x] 메인 대시보드 레이아웃
- [x] 실시간 시스템 현황 표시
- [x] 크롤링 관리 네비게이션
- [x] 콘텐츠 관리 메뉴
- [x] 사용자 관리 인터페이스
- [x] 시스템 모니터링 위젯
- [x] 알림 센터
- [x] 다크모드 지원
- [x] 반응형 디자인

### 🔄 향후 확장 가능한 기능
- [ ] 실제 API 연동
- [ ] 실시간 웹소켓 데이터
- [ ] 상세 페이지 구현 (크롤링 관리, 사용자 관리 등)
- [ ] 권한 기반 메뉴 필터링
- [ ] 커스터마이징 가능한 대시보드

## 🛠️ 기술 스택

- **React 19** + **TypeScript**
- **shadcn/ui** 컴포넌트 라이브러리
- **Tailwind CSS** 스타일링
- **Recharts** 차트 라이브러리
- **Lucide React** 아이콘
- **date-fns** 날짜 유틸리티

## 🎨 디자인 시스템

- **색상**: shadcn/ui 기본 색상 팔레트
- **타이포그래피**: Geist 폰트
- **컴포넌트**: shadcn/ui 디자인 토큰
- **반응형**: Tailwind CSS 브레이크포인트
- **다크모드**: CSS 변수 기반 테마 시스템

이 데모는 실제 관리자 대시보드 개발의 기초 템플릿으로 사용할 수 있으며, 필요에 따라 기능을 확장하거나 커스터마이징할 수 있습니다.