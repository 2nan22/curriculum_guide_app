"""
FastAPI 앱 진입점.

라우터 등록, CORS 설정, 헬스체크 엔드포인트를 구성합니다.
"""

import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.schemas import HealthResponse
from app.routers import roadmap, node, chat
from app.services.llm_service import get_llm_provider
from app.utils.logger import get_logger, setup_logging

setup_logging()
logger = get_logger("main")

app = FastAPI(
    title="AI Path API",
    description="LLM 기반 개인화 커리큘럼 로드맵 생성 서비스",
    version="1.0.0",
)

logger.info(
    "AI Path API starting — provider=%s model=%s env=%s",
    settings.llm_provider,
    settings.ollama_model if settings.llm_provider == "ollama" else settings.upstage_model,
    settings.app_env,
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


# ── HTTP 미들웨어 — 요청/응답 자동 로깅 ──────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("%s %s", request.method, request.url.path)
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.error("처리되지 않은 예외: %s %s", request.method, request.url.path, exc_info=True)
        raise
    elapsed_ms = int((time.perf_counter() - start) * 1000)
    logger.info("%s %s → %s (%dms)", request.method, request.url.path, response.status_code, elapsed_ms)
    return response


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
