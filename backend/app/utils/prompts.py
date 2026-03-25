"""
LLM 프롬프트 빌더.

레벨별 톤앤매너를 반영한 시스템/사용자 프롬프트를 생성합니다.
"""

# 레벨별 톤앤매너 지시
_LEVEL_TONE: dict[str, str] = {
    "Junior": (
        "친근하고 이해하기 쉬운 언어를 사용하세요. "
        "기초 개념과 실습 중심으로 설명하고, 초보자가 막히지 않도록 단계별로 접근하세요."
    ),
    "Mid": (
        "실무 중심의 언어를 사용하세요. "
        "실제 업무 현장에서 바로 적용할 수 있는 기술과 패턴을 중심으로 설명하세요."
    ),
    "Senior": (
        "전문가 수준의 언어를 사용하세요. "
        "시스템 설계, 아키텍처, 트레이드오프 분석 등 깊은 수준의 기술적 내용을 다루세요."
    ),
}

_JSON_SCHEMA = """{
  "root": {
    "id": "root",
    "label": "<직무명>",
    "children": [
      {
        "id": "branch_1",
        "label": "<대분류>",
        "children": [
          {
            "id": "leaf_1_1",
            "label": "<세부 기술>",
            "description": "<한 줄 설명>",
            "estimatedWeeks": <숫자>
          }
        ]
      }
    ]
  }
}"""


def build_system_prompt(level: str) -> str:
    """레벨별 톤앤매너를 포함한 시스템 프롬프트를 반환합니다.

    Args:
        level: 숙련도 ('Junior' | 'Mid' | 'Senior')

    Returns:
        완성된 시스템 프롬프트 문자열
    """
    tone = _LEVEL_TONE.get(level, _LEVEL_TONE["Mid"])
    return (
        "당신은 IT 커리큘럼 전문가입니다.\n"
        "주어진 직무(Role)와 숙련도(Level)에 맞는 학습 로드맵을 JSON 형식으로만 반환하세요.\n"
        "마크다운, 설명, 코드블록 없이 순수 JSON만 출력하세요.\n\n"
        f"레벨 안내 스타일: {tone}\n\n"
        f"출력 스키마:\n{_JSON_SCHEMA}\n\n"
        "규칙:\n"
        "- 대분류(branch) 3~5개, 각 대분류당 세부 기술(leaf) 2~4개\n"
        f"- {level} 수준에 맞는 깊이와 난이도로 작성\n"
        "- 한국어로 작성"
    )


def build_node_detail_prompt(node_label: str, role: str, level: str) -> tuple[str, str]:
    """노드 상세 정보(학습 미션 + 핵심 개념) 생성 프롬프트를 반환합니다.

    Returns:
        (system_prompt, user_prompt) 튜플
    """
    tone = _LEVEL_TONE.get(level, _LEVEL_TONE["Mid"])
    system = (
        "당신은 IT 교육 전문가입니다.\n"
        "주어진 기술 항목에 대한 학습 미션과 핵심 개념을 JSON으로만 반환하세요.\n"
        "마크다운, 설명, 코드블록 없이 순수 JSON만 출력하세요.\n\n"
        f"레벨 안내 스타일: {tone}\n\n"
        '출력 스키마: {"missions": ["미션1", "미션2", ...], "concepts": ["개념1", "개념2", ...]}\n\n'
        "규칙:\n"
        f"- missions: {level} 수준에 맞는 실천 과제 3~5개\n"
        "- concepts: 핵심 개념 키워드 5개 (짧은 명사구)\n"
        "- 한국어로 작성"
    )
    user = f"직무: {role}\n숙련도: {level}\n기술 항목: {node_label}\n\n학습 미션과 핵심 개념 JSON을 생성하세요."
    return system, user


def build_quiz_prompt(node_label: str, role: str, level: str) -> tuple[str, str]:
    """OX/객관식 퀴즈 3문제 생성 프롬프트를 반환합니다.

    Returns:
        (system_prompt, user_prompt) 튜플
    """
    tone = _LEVEL_TONE.get(level, _LEVEL_TONE["Mid"])
    schema = (
        '{"questions": ['
        '{"type": "ox", "question": "질문", "options": [{"text": "O", "correct": true}, {"text": "X", "correct": false}], "explanation": "해설"},'
        '{"type": "multiple", "question": "질문", "options": [{"text": "선택1", "correct": true}, {"text": "선택2", "correct": false}, {"text": "선택3", "correct": false}, {"text": "선택4", "correct": false}], "explanation": "해설"}'
        "]}"
    )
    system = (
        "당신은 IT 교육 퀴즈 출제 전문가입니다.\n"
        "주어진 기술 항목에 대한 퀴즈를 JSON으로만 반환하세요.\n"
        "마크다운, 설명, 코드블록 없이 순수 JSON만 출력하세요.\n\n"
        f"레벨 안내 스타일: {tone}\n\n"
        f"출력 스키마: {schema}\n\n"
        "규칙:\n"
        "- OX 문제 1개, 객관식(4지선다) 2개, 총 3문제\n"
        f"- {level} 수준에 맞는 난이도\n"
        "- 각 문제에 친절한 해설 포함\n"
        "- 한국어로 작성"
    )
    user = f"직무: {role}\n숙련도: {level}\n기술 항목: {node_label}\n\n퀴즈 3문제를 JSON으로 생성하세요."
    return system, user


def build_chat_system_prompt(node_label: str, role: str, level: str) -> str:
    """AI 튜터 채팅 시스템 프롬프트를 반환합니다."""
    tone = _LEVEL_TONE.get(level, _LEVEL_TONE["Mid"])
    return (
        f"당신은 {role} 분야의 AI 튜터입니다.\n"
        f"현재 학습자는 '{node_label}' 항목을 학습 중이며, 숙련도는 {level}입니다.\n"
        f"답변 스타일: {tone}\n\n"
        "규칙:\n"
        "- 항상 현재 학습 중인 기술 항목과 연관지어 답변하세요\n"
        "- 학습자의 수준에 맞는 예시와 설명을 제공하세요\n"
        "- 격려하고 동기부여하는 톤을 유지하세요\n"
        "- 한국어로 답변하세요"
    )


def build_user_prompt(role: str, level: str, guideline: dict) -> str:
    """가이드라인 키워드를 포함한 사용자 프롬프트를 반환합니다.

    Args:
        role: 직무명 (예: 'Backend', 'Frontend')
        level: 숙련도 ('Junior' | 'Mid' | 'Senior')
        guideline: curriculum_guideline.json 전체 dict (없으면 빈 dict)

    Returns:
        완성된 사용자 프롬프트 문자열
    """
    prompt = f"직무: {role}\n숙련도: {level}\n"
    keywords: list[str] = guideline.get(role, {}).get(level, [])
    if keywords:
        prompt += "\n반드시 포함할 핵심 키워드:\n"
        prompt += "\n".join(f"  - {kw}" for kw in keywords)
        prompt += "\n"
    prompt += "\n위 조건에 맞는 학습 로드맵 JSON을 생성하세요."
    return prompt
