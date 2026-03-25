"""
노드 상세 정보 및 퀴즈 API 라우터.

엔드포인트:
    POST /api/node/detail  - 학습 미션 + 핵심 개념 생성 (인메모리 캐시)
    POST /api/node/quiz    - OX/객관식 퀴즈 3문제 생성
"""

import json

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    NodeDetailRequest,
    NodeDetailResponse,
    QuizRequest,
    QuizResponse,
)
from app.services.llm_service import get_llm_provider
from app.utils.logger import get_logger
from app.utils.parser import extract_json
from app.utils.prompts import build_node_detail_prompt, build_quiz_prompt

router = APIRouter(prefix="/api/node", tags=["node"])
logger = get_logger("node")

# 인메모리 캐시: {role}_{level}_{node_label} → 응답 dict
_detail_cache: dict[str, dict] = {}
_quiz_cache: dict[str, dict] = {}


def _cache_key(node_label: str, role: str, level: str) -> str:
    return f"{role}_{level}_{node_label}"


# ── 엔드포인트 ────────────────────────────────────────


@router.post("/detail", response_model=NodeDetailResponse)
async def get_node_detail(body: NodeDetailRequest) -> NodeDetailResponse:
    """
    노드의 학습 미션과 핵심 개념을 LLM으로 생성합니다.
    동일 노드 재요청 시 캐시에서 즉시 반환합니다.
    """
    logger.info("[detail] 요청: node=%s role=%s level=%s", body.node_label, body.role, body.level)
    key = _cache_key(body.node_label, body.role, body.level)

    if key in _detail_cache:
        logger.info("[detail] 캐시 HIT: key=%s", key)
        return NodeDetailResponse(**_detail_cache[key])

    logger.info("[detail] 캐시 MISS → LLM 호출")
    system, user = build_node_detail_prompt(body.node_label, body.role, body.level)

    try:
        provider = get_llm_provider()
        raw = await provider.generate(system, user)
    except Exception as exc:
        logger.error("[detail] LLM 호출 실패: %s", exc, exc_info=True)
        raise HTTPException(status_code=503, detail=str(exc))

    try:
        data = extract_json(raw)
        missions = data.get("missions", [])
        concepts = data.get("concepts", [])
        if not isinstance(missions, list) or not isinstance(concepts, list):
            raise ValueError("invalid shape")
        logger.info("[detail] LLM 응답 파싱 성공, 캐시 저장")
    except Exception as exc:
        logger.warning("[detail] 파싱 실패 → 기본값 반환: %s", exc)
        missions = [
            f"{body.node_label} 기본 개념 이해 및 공식 문서 학습",
            f"{body.node_label} 핵심 기능 실습 예제 구현",
            "실무 적용 사례 분석 및 코드 리뷰",
        ]
        concepts = [body.node_label, "기초 개념", "실습", "문서", "적용"]

    result = {"missions": missions, "concepts": concepts}
    _detail_cache[key] = result
    return NodeDetailResponse(**result)


@router.post("/quiz", response_model=QuizResponse)
async def get_node_quiz(body: QuizRequest) -> QuizResponse:
    """
    노드에 대한 OX/객관식 퀴즈 3문제를 생성합니다.
    """
    logger.info("[quiz] 요청: node=%s role=%s level=%s", body.node_label, body.role, body.level)
    key = _cache_key(body.node_label, body.role, body.level)

    if key in _quiz_cache:
        logger.info("[quiz] 캐시 HIT: key=%s", key)
        return QuizResponse(**_quiz_cache[key])

    logger.info("[quiz] 캐시 MISS → LLM 호출")
    system, user = build_quiz_prompt(body.node_label, body.role, body.level)

    try:
        provider = get_llm_provider()
        raw = await provider.generate(system, user)
    except Exception as exc:
        logger.error("[quiz] LLM 호출 실패: %s", exc, exc_info=True)
        raise HTTPException(status_code=503, detail=str(exc))

    try:
        data = extract_json(raw)
        questions = data.get("questions", [])
        if not isinstance(questions, list) or len(questions) == 0:
            raise ValueError("invalid shape")
    except Exception as exc:
        logger.warning("[quiz] 파싱 실패 → 기본 퀴즈 반환: %s", exc)
        questions = [
            {
                "type": "ox",
                "question": f"{body.node_label}은(는) {body.role} 개발에서 핵심 기술이다.",
                "options": [{"text": "O", "correct": True}, {"text": "X", "correct": False}],
                "explanation": f"{body.node_label}은 {body.role} 분야의 중요한 기술입니다.",
            },
            {
                "type": "multiple",
                "question": f"{body.node_label}에 대한 설명으로 가장 적절한 것은?",
                "options": [
                    {"text": f"{body.node_label}의 핵심 목적에 맞는 설명", "correct": True},
                    {"text": "관련 없는 설명 1", "correct": False},
                    {"text": "관련 없는 설명 2", "correct": False},
                    {"text": "관련 없는 설명 3", "correct": False},
                ],
                "explanation": f"{body.node_label}의 주요 특징과 사용 목적을 이해하는 것이 중요합니다.",
            },
            {
                "type": "multiple",
                "question": f"{body.node_label} 학습 시 가장 먼저 익혀야 할 개념은?",
                "options": [
                    {"text": "기본 문법과 핵심 개념", "correct": True},
                    {"text": "고급 최적화 기법", "correct": False},
                    {"text": "레거시 버전 특징", "correct": False},
                    {"text": "타 언어와의 비교", "correct": False},
                ],
                "explanation": "기초부터 차근차근 학습하는 것이 효율적입니다.",
            },
        ]

    result = {"questions": questions}
    _quiz_cache[key] = result
    return QuizResponse(**result)
