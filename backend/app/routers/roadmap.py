"""
로드맵 생성 API 라우터.

엔드포인트:
    POST /api/roadmap/generate        - 완성된 JSON 반환
    POST /api/roadmap/generate/stream - SSE 스트리밍 반환
"""

import json
import time

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import settings
from app.models.schemas import RoadmapRequest
from app.services.llm_service import get_llm_provider
from app.services.rag_service import load_guideline
from app.utils.logger import get_logger
from app.utils.parser import extract_json, fallback_roadmap, validate_roadmap
from app.utils.prompts import build_system_prompt, build_user_prompt

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])
logger = get_logger("roadmap")


# ── 엔드포인트 ────────────────────────────────────────


@router.post("/generate")
async def generate_roadmap(body: RoadmapRequest) -> dict:
    """
    로드맵 JSON을 생성해 반환합니다.

    RAG Lite: use_guideline=True 시 curriculum_guideline.json 키워드를
    프롬프트에 주입해 일관성을 높입니다.
    LLM 응답 파싱 실패 시 fallback_roadmap을 반환합니다.
    """
    logger.info("[generate] 요청 수신: role=%s level=%s use_guideline=%s", body.role, body.level, body.use_guideline)

    guideline = load_guideline(settings.data_dir) if body.use_guideline else {}
    system = build_system_prompt(body.level)
    user = build_user_prompt(body.role, body.level, guideline)

    provider = get_llm_provider()
    logger.info("[generate] LLM 호출 시작: provider=%s", type(provider).__name__)
    start = time.perf_counter()
    try:
        raw = await provider.generate(system, user)
    except Exception as exc:
        logger.error("[generate] LLM 호출 실패: %s", exc, exc_info=True)
        raise HTTPException(status_code=503, detail=str(exc))

    elapsed_ms = int((time.perf_counter() - start) * 1000)
    logger.info("[generate] LLM 응답 수신: %dms, 길이=%d자", elapsed_ms, len(raw))

    try:
        data = extract_json(raw)
    except Exception as exc:
        logger.warning("[generate] JSON 파싱 실패 → fallback 반환: %s", exc)
        return fallback_roadmap(body.role, body.level)

    logger.info("[generate] JSON 파싱 성공")

    if not validate_roadmap(data):
        logger.warning("[generate] 로드맵 검증 실패 → fallback 반환")
        return fallback_roadmap(body.role, body.level)

    return data


@router.post("/generate/stream")
async def generate_roadmap_stream(body: RoadmapRequest) -> StreamingResponse:
    """
    로드맵 JSON을 SSE(Server-Sent Events)로 스트리밍합니다.
    프론트엔드에서 fetch + ReadableStream으로 수신합니다.
    """
    logger.info("[generate/stream] 스트리밍 시작: role=%s level=%s", body.role, body.level)

    guideline = load_guideline(settings.data_dir) if body.use_guideline else {}
    system = build_system_prompt(body.level)
    user = build_user_prompt(body.role, body.level, guideline)

    async def event_generator():
        try:
            provider = get_llm_provider()
            async for token in provider.generate_stream(system, user):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
            logger.info("[generate/stream] 스트리밍 완료")
        except Exception as exc:
            logger.error("[generate/stream] 스트리밍 오류: %s", exc)
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
