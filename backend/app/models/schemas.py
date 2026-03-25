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


class NodeDetailRequest(BaseModel):
    """노드 상세 정보 요청 파라미터."""

    node_label: str = Field(..., description="노드 레이블 (기술명)")
    role: str = Field(..., description="학습자 직무")
    level: Literal["Junior", "Mid", "Senior"] = Field(..., description="학습자 숙련도")


class QuizRequest(BaseModel):
    """퀵 퀴즈 생성 요청 파라미터."""

    node_label: str = Field(..., description="노드 레이블 (기술명)")
    role: str = Field(..., description="학습자 직무")
    level: Literal["Junior", "Mid", "Senior"] = Field(..., description="학습자 숙련도")


class ChatMessage(BaseModel):
    """채팅 메시지."""

    role: Literal["user", "assistant"] = Field(..., description="메시지 역할")
    content: str = Field(..., description="메시지 내용")


class NodeContext(BaseModel):
    """현재 선택된 노드 컨텍스트."""

    label: str
    role: str
    level: str


class ChatRequest(BaseModel):
    """AI 튜터 채팅 요청 파라미터."""

    messages: list[ChatMessage] = Field(..., description="대화 히스토리")
    node_context: NodeContext = Field(..., description="현재 노드 컨텍스트")


# ── 응답 모델 ────────────────────────────────────────

class HealthResponse(BaseModel):
    """헬스체크 응답."""

    status: str = "ok"
    provider: str
    model: str


class NodeDetailResponse(BaseModel):
    """노드 상세 정보 응답."""

    missions: list[str]
    concepts: list[str]


class QuizOption(BaseModel):
    """퀴즈 선택지."""

    text: str
    correct: bool


class QuizQuestion(BaseModel):
    """퀴즈 문제."""

    type: Literal["ox", "multiple"]
    question: str
    options: list[QuizOption]
    explanation: str


class QuizResponse(BaseModel):
    """퀵 퀴즈 응답."""

    questions: list[QuizQuestion]
