"""
LLM 응답 JSON 파싱 & 검증 유틸.

LLM이 마크다운 코드블록이나 불필요한 텍스트를 포함해 반환할 때를 대비합니다.
"""

import json
import re


def extract_json(raw: str) -> dict:
    """마크다운 코드블록 제거 후 JSON 파싱합니다.

    Args:
        raw: LLM 원시 응답 문자열

    Returns:
        파싱된 dict

    Raises:
        ValueError: JSON 객체를 찾을 수 없는 경우
        json.JSONDecodeError: JSON 파싱 실패 시
    """
    # ```json ... ``` 또는 ``` ... ``` 블록 마커 제거
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).replace("```", "").strip()

    # 첫 번째 { ~ 마지막 } 범위만 추출
    start = cleaned.find("{")
    end = cleaned.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("응답에서 JSON 객체를 찾을 수 없습니다.")

    return json.loads(cleaned[start:end])


def validate_roadmap(data: dict) -> bool:
    """필수 필드(root.children) 존재 여부를 검증합니다.

    Args:
        data: 파싱된 로드맵 dict

    Returns:
        유효하면 True, 그렇지 않으면 False
    """
    try:
        children = data.get("root", {}).get("children", [])
        return isinstance(children, list) and len(children) > 0
    except Exception:
        return False


def fallback_roadmap(role: str, level: str) -> dict:
    """파싱/검증 실패 시 안전한 기본 로드맵을 반환합니다.

    Args:
        role: 직무명
        level: 숙련도

    Returns:
        최소한의 구조를 갖춘 fallback 로드맵 dict
    """
    return {
        "root": {
            "id": "root",
            "label": f"{role} — {level}",
            "children": [
                {
                    "id": "branch_1",
                    "label": "로드맵 생성 오류",
                    "children": [
                        {
                            "id": "leaf_1_1",
                            "label": "다시 시도해주세요",
                            "description": (
                                "LLM 응답 파싱에 실패했습니다. "
                                "잠시 후 다시 시도해주세요."
                            ),
                            "estimatedWeeks": 0,
                        }
                    ],
                }
            ],
        }
    }
