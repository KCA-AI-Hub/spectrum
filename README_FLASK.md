# Flask 애플리케이션 - 전파 동향조사 브리핑

## 📁 프로젝트 구조

```
spectrum/
├── app.py                 # Flask 메인 애플리케이션
├── templates/            # HTML 템플릿
│   ├── base.html        # 기본 레이아웃
│   ├── login.html       # 로그인 페이지
│   ├── dashboard.html   # 메인 대시보드
│   └── video_player.html # 비디오 플레이어
├── static/              # 정적 파일
│   ├── css/
│   │   └── main.css    # 메인 스타일시트
│   └── js/
│       └── app.js      # 메인 JavaScript
├── requirements.txt     # Python 패키지 목록
└── .env.example        # 환경변수 예제
```

## 🚀 실행 방법

### 1. 가상환경 생성 및 활성화

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. 환경변수 설정

```bash
# .env.example을 .env로 복사
cp .env.example .env

# .env 파일 수정 (SECRET_KEY 변경)
```

### 4. Flask 애플리케이션 실행

```bash
python app.py
```

브라우저에서 http://127.0.0.1:5000 접속

## 🔐 데모 로그인 정보

- **사번**: 2024001
- **비밀번호**: password

## 📱 주요 페이지

### 1. 로그인 페이지 (`/login`)
- 사번과 비밀번호로 로그인
- 데모 로그인 버튼 제공
- 세션 기반 인증

### 2. 대시보드 (`/dashboard`)
- 전파 기술 동향 브리핑 목록
- 캐릭터 선택 기능
- 학습 진행 상황 표시

### 3. 비디오 플레이어 (`/video/<id>`)
- 브리핑 비디오 재생
- 챕터별 네비게이션
- 관련 자료 다운로드
- 학습 퀴즈

## 🎨 디자인 특징

- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **Glass Morphism**: 반투명 유리 효과
- **그라디언트**: 보라색-청록색 그라디언트
- **다크 테마**: 어두운 배경의 모던한 디자인
- **반응형**: 모바일/태블릿/데스크톱 대응

## 🔧 기술 스택

- **Backend**: Flask 3.0
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Authentication**: Flask Session
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Emoji

## 📝 API 엔드포인트

### 인증
- `POST /login` - 로그인
- `GET /logout` - 로그아웃

### API
- `POST /api/change-character` - 캐릭터 변경
- `GET /api/progress` - 학습 진행 상황

## 🚧 향후 개발 계획

- [ ] PostgreSQL 데이터베이스 연동
- [ ] 실제 비디오 스트리밍
- [ ] AI 챗봇 통합
- [ ] 퀴즈 시스템 구현
- [ ] 사용자 프로필 관리
- [ ] 관리자 대시보드
- [ ] 실시간 알림
- [ ] 다국어 지원

## 📌 참고사항

- 현재는 데모 버전으로 실제 데이터베이스 연동 없음
- 비디오 재생 기능은 UI만 구현됨
- 세션 기반 인증 (production에서는 JWT 권장)