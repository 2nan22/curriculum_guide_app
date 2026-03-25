"""
FastAPI 앱 진입점.

라우터 등록, CORS 설정, 헬스체크 엔드포인트를 구성합니다.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.schemas import HealthResponse
from app.routers import roadmap, node, chat
from app.services.llm_service import get_llm_provider

app = FastAPI(
    title="AI Path API",
    description="LLM 기반 개인화 커리큘럼 로드맵 생성 서비스",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────
# dev 환경에서는 Vite dev server(5173)에서 오는 요청을 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 라우터 등록 ───────────────────────────────────────
app.include_router(roadmap.router)
app.include_router(node.router)
app.include_router(chat.router)


# ── 헬스체크 ──────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check() -> HealthResponse:
    """Docker healthcheck 및 프론트엔드 연결 확인용 엔드포인트."""
    provider = get_llm_provider()
    return HealthResponse(
        status="ok",
        provider=settings.llm_provider,
        model=getattr(provider, "_model", "unknown"),
    )
