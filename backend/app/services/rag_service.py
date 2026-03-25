"""
RAG Lite 서비스.

curriculum_guideline.json 파일을 로드하여 LLM 프롬프트에
커리큘럼 컨텍스트를 주입합니다.
"""

import json
from functools import lru_cache
from pathlib import Path

from app.utils.logger import get_logger

logger = get_logger("rag_service")


@lru_cache(maxsize=1)
def load_guideline(data_dir: str) -> dict:
    """curriculum_guideline.json을 로드하고 결과를 프로세스 단위로 캐싱합니다.

    Args:
        data_dir: JSON 파일이 위치한 디렉터리 경로

    Returns:
        파싱된 가이드라인 dict (파일 없으면 빈 dict)
    """
    path = Path(data_dir) / "curriculum_guideline.json"
    if not path.exists():
        logger.warning("load_guideline: 파일 없음, 빈 guideline 반환: %s", path)
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        logger.info("load_guideline: 파일 로드 성공: %s (%d개 role)", path, len(data))
        return data
    except Exception as exc:
        logger.error("load_guideline: 파일 읽기 실패: %s", exc)
        return {}


def get_keywords(guideline: dict, role: str, level: str) -> list[str]:
    """직무/레벨에 해당하는 키워드 목록을 반환합니다.

    Args:
        guideline: load_guideline()으로 로드한 전체 가이드라인 dict
        role:      직무명 (예: 'Backend')
        level:     숙련도 ('Junior' | 'Mid' | 'Senior')

    Returns:
        키워드 문자열 리스트 (해당 항목 없으면 빈 리스트)
    """
    keywords = guideline.get(role, {}).get(level, [])
    logger.debug("get_keywords: role=%s level=%s → %d개 키워드", role, level, len(keywords))
    return keywords


def inject_context(prompt: str, keywords: list[str]) -> str:
    """키워드를 기존 프롬프트에 구조적으로 주입합니다.

    이미 build_user_prompt()에서 가이드라인이 주입되는 경우와 달리,
    이 함수는 완성된 프롬프트에 키워드를 추가로 붙이는 용도입니다.

    Args:
        prompt:   기존 프롬프트 문자열
        keywords: 주입할 키워드 목록

    Returns:
        키워드가 주입된 프롬프트 문자열
    """
    if not keywords:
        return prompt
    context = "\n반드시 포함할 핵심 키워드:\n" + "\n".join(
        f"  - {kw}" for kw in keywords
    )
    return prompt + context
