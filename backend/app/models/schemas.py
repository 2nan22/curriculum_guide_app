"""
API 요청/응답 스키마 정의.

Pydantic v2 모델을 사용해 데이터 검증 및 직렬화를 처리합니다.
모든 공개 API의 입출력 타입은 이 모듈에 정의합니다.
"""

from pydantic import BaseModel, Field
from typing import Literal


# ── 요청 모델 ────────────────────────────────────────

class RoadmapRequest(BaseModel):
    """로드맵 생성 요청 파라미터."""

    role: Literal[
        "Frontend", "Backend", "AI/ML", "DevOps", "Mobile", "Data Engineering"
    ] = Field(..., description="학습자가 선택한 직무")

    level: Literal["Junior", "Mid", "Senior"] = Field(
        ..., description="학습자의 현재 숙련도"
    )

    use_guideline: bool = Field(
        default=True,
        description="커리큘럼 가이드라인 주입 여부 (RAG Lite)",
    )


# ── 응답 모델 ────────────────────────────────────────

class HealthResponse(BaseModel):
    """헬스체크 응답."""

    status: str = "ok"
    provider: str
    model: str
