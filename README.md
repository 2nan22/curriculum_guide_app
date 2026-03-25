# AI Path — 커리큘럼 로드맵 앱

직무(Role)와 숙련도(Level)를 선택하면 LLM이 맞춤형 학습 커리큘럼을 SVG 마인드맵으로 시각화해 줍니다.

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | Vite 6 · React 19 · Tailwind CSS v4 · Framer Motion · react-router-dom |
| 백엔드 | FastAPI (Python 3.12) · uvicorn |
| LLM | Ollama (로컬) / Upstage Solar (클라우드) 전환 지원 |
| 인프라 | Docker Compose |

## 빠른 시작

### 1. 환경변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 LLM 프로바이더 설정
```

### 2. Docker로 실행 (권장)

#### 개발 환경 (핫리로드)
```bash
docker compose up --build
```
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:8000

#### 프로덕션 환경 (Nginx 정적 빌드)
```bash
docker compose --profile prod up --build
```
- 프론트엔드: http://localhost:80
- 백엔드 API: http://localhost:8000

### 3. 로컬 개발 (Docker 없이)

```bash
# 백엔드
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 프론트엔드 (별도 터미널)
cd frontend
npm install
npm run dev
```

## LLM 프로바이더 설정

### Ollama (로컬, 무료)

1. [Ollama 설치](https://ollama.com)
2. 모델 다운로드:
   ```bash
   ollama pull llama3.1:8b
   ```
3. CORS를 허용하여 실행:
   ```bash
   # Windows
   set OLLAMA_ORIGINS=* && ollama serve

   # macOS / Linux
   OLLAMA_ORIGINS=* ollama serve
   ```
4. `.env` 설정:
   ```env
   LLM_PROVIDER=ollama
   OLLAMA_BASE_URL=http://host.docker.internal:11434
   OLLAMA_MODEL=llama3.1:8b
   ```

### Upstage Solar (클라우드)

1. [Upstage Console](https://console.upstage.ai)에서 API 키 발급
2. `.env` 설정:
   ```env
   LLM_PROVIDER=upstage
   UPSTAGE_API_KEY=your_api_key_here
   UPSTAGE_MODEL=solar-pro
   ```

## 주요 기능

- **마인드맵 시각화** — SVG 기반 트리 레이아웃, 마우스 휠 줌·드래그 팬
- **노드 상세 패널** — LLM 생성 학습 미션, 핵심 개념, 서적·강의 추천
- **AI 튜터 채팅** — 선택 노드 기반 SSE 스트리밍 Q&A
- **퀵 퀴즈** — 노드별 즉석 퀴즈 생성
- **진척도 저장** — localStorage 기반 자동 저장/복원 (`aipath_{role}_{level}`)
- **URL 라우팅** — `/roadmap?role=Backend&level=Mid` 형태의 딥링크 지원

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/roadmap/generate` | 로드맵 트리 생성 |
| POST | `/api/node/detail` | 노드 상세 정보 (미션·개념) |
| POST | `/api/node/quiz` | 퀵 퀴즈 생성 |
| POST | `/api/chat/stream` | AI 튜터 SSE 스트리밍 |
| GET | `/health` | 헬스체크 |
