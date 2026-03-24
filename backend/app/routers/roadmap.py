"""
로드맵 생성 API 라우터.

엔드포인트:
    POST /api/roadmap/generate        - 완성된 JSON 반환
    POST /api/roadmap/generate/stream - SSE 스트리밍 반환
"""

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import settings
from app.models.schemas import RoadmapRequest
from app.services.llm_service import get_llm_provider

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

# ── 프롬프트 상수 ─────────────────────────────────────

SYSTEM_PROMPT = """당신은 IT 커리큘럼 전문가입니다.
주어진 직무(Role)와 숙련도(Level)에 맞는 학습 로드맵을 JSON 형식으로만 반환하세요.
마크다운, 설명, 코드블록 없이 순수 JSON만 출력하세요.

출력 스키마:
{{
  "root": {{
    "id": "root",
    "label": "<직무명>",
    "children": [
      {{
        "id": "branch_1",
        "label": "<대분류>",
        "children": [
          {{
            "id": "leaf_1_1",
            "label": "<세부 기술>",
            "description": "<한 줄 설명>",
            "estimatedWeeks": <숫자>
          }}
        ]
      }}
    ]
  }}
}}

규칙:
- 대분류(branch) 3~5개, 각 대분류당 세부 기술(leaf) 2~4개
- {level} 수준에 맞는 깊이와 난이도로 작성
- 한국어로 작성"""


def _build_user_prompt(role: str, level: str, guideline: dict | None) -> str:
    """사용자 프롬프트를 조립합니다."""
    prompt = f"직무: {role}\n숙련도: {level}\n"
    if guideline:
        keywords = guideline.get(role, {}).get(level, [])
        if keywords:
            prompt += f"\n반드시 포함할 핵심 키워드:\n" + "\n".join(
                f"  - {kw}" for kw in keywords
            )
    prompt += "\n\n위 조건에 맞는 학습 로드맵 JSON을 생성하세요."
    return prompt


def _load_guideline() -> dict:
    """커리큘럼 가이드라인 JSON을 로드합니다. 파일 없으면 빈 dict 반환."""
    path = Path(settings.data_dir) / "curriculum_guideline.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


# ── 엔드포인트 ────────────────────────────────────────

@router.post("/generate")
async def generate_roadmap(body: RoadmapRequest) -> dict:
    """
    로드맵 JSON을 생성해 반환합니다.

    RAG Lite: use_guideline=True 시 curriculum_guideline.json 키워드를
    프롬프트에 주입해 일관성을 높입니다.
    """
    guideline = _load_guideline() if body.use_guideline else {}
    system = SYSTEM_PROMPT.format(level=body.level)
    user = _build_user_prompt(body.role, body.level, guideline)

    try:
        provider = get_llm_provider()
        raw = await provider.generate(system, user)
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="LLM이 유효하지 않은 JSON을 반환했습니다. 재시도해주세요.",
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@router.post("/generate/stream")
async def generate_roadmap_stream(body: RoadmapRequest) -> StreamingResponse:
    """
    로드맵 JSON을 SSE(Server-Sent Events)로 스트리밍합니다.
    프론트엔드에서 EventSource 또는 fetch + ReadableStream으로 수신합니다.
    """
    guideline = _load_guideline() if body.use_guideline else {}
    system = SYSTEM_PROMPT.format(level=body.level)
    user = _build_user_prompt(body.role, body.level, guideline)

    async def event_generator():
        try:
            provider = get_llm_provider()
            async for token in provider.generate_stream(system, user):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
