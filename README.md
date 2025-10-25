# 🔐 TAEIN's Repository - 사용자 인증 & 계정 관리

## 🎯 담당 영역
**Taein**이 개발할 사용자 인증 시스템 및 계정 관리 기능

## 📋 개발해야 할 파일들 (✅ = 실제 코드 포함, ⏳ = Placeholder)

### 백엔드 (✅ 실제 코드)
- `backend/taein/index.ts` - 인증 관련 API 엔드포인트
- `backend/middleware/auth.ts` - JWT 인증 미들웨어

### 프론트엔드 (✅ 실제 코드)  
- `client/src/components/login.tsx` - 로그인 컴포넌트
- `client/src/components/signup-modal.tsx` - 회원가입 모달
- `client/src/components/welcome-screen.tsx` - 웰컴 화면
- `client/src/contexts/UserContext.tsx` - 사용자 상태 관리
- `client/src/services/authService.ts` - 인증 API 서비스

### Placeholder 파일들 (⏳ 다른 개발자가 구현)
- `backend/hyun/index.ts` - Hyun의 태스크 관리 API
- `backend/gisuck/index.ts` - Gisuck의 AI 스케줄링 API  
- `backend/sangmin/index.ts` - Sangmin의 홈화면 API
- `client/src/components/task-board.tsx` - Hyun의 태스크 보드
- `client/src/components/leaderboard.tsx` - Hyun의 리더보드
- `client/src/components/schedule-customization.tsx` - Gisuck의 스케줄 커스터마이징
- `client/src/components/role-model-selection.tsx` - Gisuck의 롤모델 선택
- `client/src/components/brand-showcase.tsx` - Sangmin의 브랜드 쇼케이스
- `client/src/services/userService.ts` - Hyun의 사용자 서비스
- `client/src/services/scheduleService.ts` - Gisuck의 스케줄 서비스
- `client/src/services/apiService.ts` - Sangmin의 범용 API 서비스

## 🚀 실행 방법

### 1. 의존성 설치
```bash
# 백엔드
cd backend
npm install

# 프론트엔드  
cd client
npm install
```

### 2. 환경 설정
`backend/.env` 파일 생성:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. 개발 서버 실행
```bash
# 백엔드 (터미널 1)
cd backend
npm run dev

# 프론트엔드 (터미널 2)
cd client  
npm run dev
```

## 🔧 개발 가이드

### API 엔드포인트 (실제 구현 필요)
- `POST /api/taein/signup` - 회원가입
- `POST /api/taein/signin` - 로그인  
- `GET /api/taein/test` - API 테스트

### 주요 컴포넌트 (실제 구현 필요)
- **Login**: 이메일/비밀번호 로그인 폼
- **SignupModal**: 회원가입 모달 창
- **WelcomeScreen**: 앱 시작 화면
- **UserContext**: 전역 사용자 상태 관리

### 중요 사항
- JWT 토큰 기반 인증 구현
- Supabase와 연동하여 사용자 데이터 관리
- 보안을 고려한 비밀번호 처리
- 반응형 UI 구현

## 📌 Git Push 방법
```bash
git init
git add .
git commit -m "feat: implement user authentication system"
git remote add origin [YOUR_REPO_URL]
git push -u origin main
```

## ⚠️ 주의사항
- Placeholder 파일들은 수정하지 말 것 (다른 개발자가 교체할 예정)
- 환경 변수는 `.env` 파일에서 관리
- 코드 스타일 일관성 유지
- 커밋 메시지는 conventional commits 형식 사용

---

**이 레포지토리를 다른 3명의 레포지토리와 합치면 완전한 롤모델 기반 생산성 챌린지 앱이 됩니다! 🎉**
