"""
AI 튜터 채팅 API 라우터.

엔드포인트:
    POST /api/chat/stream  - 노드 컨텍스트 인식 SSE 스트리밍 채팅
"""

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.models.schemas import ChatRequest
from app.services.llm_service import get_llm_provider
from app.utils.logger import get_logger
from app.utils.prompts import build_chat_system_prompt

router = APIRouter(prefix="/api/chat", tags=["chat"])
logger = get_logger("chat")


@router.post("/stream")
async def chat_stream(body: ChatRequest) -> StreamingResponse:
    """
    노드 컨텍스트를 system message에 주입한 SSE 스트리밍 채팅.
    프론트엔드에서 fetch + ReadableStream으로 수신합니다.
    """
    ctx = body.node_context
    logger.info(
        "[chat/stream] 스트리밍 시작: node=%s role=%s level=%s, 메시지 수=%d",
        ctx.label, ctx.role, ctx.level, len(body.messages),
    )
    system = build_chat_system_prompt(ctx.label, ctx.role, ctx.level)

    messages = [{"role": m.role, "content": m.content} for m in body.messages]

    async def event_generator():
        try:
            provider = get_llm_provider()
            async for token in provider.generate_stream(system, messages[-1]["content"] if messages else ""):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
            logger.info("[chat/stream] 스트리밍 완료")
        except Exception as exc:
            logger.error("[chat/stream] 스트리밍 오류: %s", exc)
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
