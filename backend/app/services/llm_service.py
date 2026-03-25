"""
LLM 프로바이더 추상화 레이어.

새로운 LLM 백엔드 추가 시 BaseLLMProvider를 상속해 구현하면 됩니다.
프로바이더 전환은 .env의 LLM_PROVIDER 값만 변경하면 됩니다.

지원 프로바이더:
    - OllamaProvider : 로컬 Ollama 서버 (llama3.1, mistral 등)
    - UpstageProvider: Upstage Solar API (cloud)
"""

import time
from abc import ABC, abstractmethod
from datetime import datetime
from pathlib import Path
from typing import AsyncIterator
import json
import httpx

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger("llm_service")

_RESPONSE_DIR = Path("logs/responses")


def _save_response(provider_name: str, model: str, content: str) -> None:
    """LLM 응답을 logs/responses/{provider}_{yyyymmdd}_{hhmmss}.json 에 저장합니다."""
    try:
        _RESPONSE_DIR.mkdir(parents=True, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = _RESPONSE_DIR / f"{provider_name}_{ts}.json"
        filename.write_text(
            json.dumps({"provider": provider_name, "model": model, "timestamp": datetime.now().isoformat(), "response": content}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        logger.debug("응답 저장: %s", filename)
    except Exception as exc:
        logger.warning("응답 저장 실패: %s", exc)


class BaseLLMProvider(ABC):
    """모든 LLM 프로바이더가 구현해야 하는 인터페이스."""

    @abstractmethod
    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """
        완성된 응답 텍스트를 반환합니다.

        Args:
            system_prompt: LLM의 역할 및 출력 형식 지시
            user_prompt:   사용자의 실제 요청

        Returns:
            생성된 텍스트 전체
        """
        ...

    @abstractmethod
    async def generate_stream(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncIterator[str]:
        """
        응답 토큰을 청크 단위로 스트리밍합니다.

        Args:
            system_prompt: LLM의 역할 및 출력 형식 지시
            user_prompt:   사용자의 실제 요청

        Yields:
            텍스트 청크 (토큰 단위)
        """
        ...


class OllamaProvider(BaseLLMProvider):
    """
    로컬 Ollama 서버 프로바이더.

    사전 조건:
        1. Ollama 설치: https://ollama.ai/download
        2. CORS 허용 후 실행:
             Windows : set OLLAMA_ORIGINS=* && ollama serve
             macOS/Linux: OLLAMA_ORIGINS=* ollama serve
        3. 모델 다운로드: ollama pull llama3.1:8b
    """

    BASE_PATH = "/api/chat"

    def __init__(self) -> None:
        self._base_url = settings.ollama_base_url
        self._model = settings.ollama_model

    def _build_payload(
        self, system_prompt: str, user_prompt: str, *, stream: bool
    ) -> dict:
        return {
            "model": self._model,
            "stream": stream,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        logger.info("OllamaProvider.generate 시작: model=%s url=%s", self._model, self._base_url)
        start = time.perf_counter()
        payload = self._build_payload(system_prompt, user_prompt, stream=False)
        try:
            async with httpx.AsyncClient(timeout=settings.ollama_timeout) as client:
                response = await client.post(
                    f"{self._base_url}{self.BASE_PATH}", json=payload
                )
                response.raise_for_status()
                data = response.json()
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                logger.info("OllamaProvider.generate 완료: %dms", elapsed_ms)
                content = data["message"]["content"]
                _save_response("ollama", self._model, content)
                return content
        except Exception as exc:
            logger.error("OllamaProvider.generate 실패: %s", exc, exc_info=True)
            raise

    async def generate_stream(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncIterator[str]:
        logger.info("OllamaProvider.generate_stream 스트리밍 시작")
        payload = self._build_payload(system_prompt, user_prompt, stream=True)
        token_count = 0
        try:
            async with httpx.AsyncClient(timeout=settings.ollama_timeout) as client:
                async with client.stream(
                    "POST", f"{self._base_url}{self.BASE_PATH}", json=payload
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        chunk = json.loads(line)
                        if token := chunk.get("message", {}).get("content", ""):
                            token_count += 1
                            yield token
            logger.info("OllamaProvider.generate_stream 완료: 토큰 %d개", token_count)
        except Exception as exc:
            logger.error("OllamaProvider.generate_stream 오류: %s", exc)
            raise


class UpstageProvider(BaseLLMProvider):
    """
    Upstage Solar API 프로바이더.

    사전 조건:
        1. Upstage 계정 생성 및 API 키 발급: https://console.upstage.ai
        2. .env에 UPSTAGE_API_KEY 설정
    """

    BASE_URL = "https://api.upstage.ai/v1/solar"
    CHAT_PATH = "/chat/completions"

    def __init__(self) -> None:
        self._api_key = settings.upstage_api_key
        self._model = settings.upstage_model

    @property
    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

    def _build_payload(
        self, system_prompt: str, user_prompt: str, *, stream: bool
    ) -> dict:
        return {
            "model": self._model,
            "stream": stream,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        logger.info("UpstageProvider.generate 시작: model=%s url=%s", self._model, self.BASE_URL)
        start = time.perf_counter()
        payload = self._build_payload(system_prompt, user_prompt, stream=False)
        try:
            async with httpx.AsyncClient(timeout=settings.upstage_timeout) as client:
                response = await client.post(
                    f"{self.BASE_URL}{self.CHAT_PATH}",
                    json=payload,
                    headers=self._headers,
                )
                response.raise_for_status()
                data = response.json()
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                logger.info("UpstageProvider.generate 완료: %dms", elapsed_ms)
                content = data["choices"][0]["message"]["content"]
                _save_response("upstage", self._model, content)
                return content
        except Exception as exc:
            logger.error("UpstageProvider.generate 실패: %s", exc, exc_info=True)
            raise

    async def generate_stream(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncIterator[str]:
        logger.info("UpstageProvider.generate_stream 스트리밍 시작")
        payload = self._build_payload(system_prompt, user_prompt, stream=True)
        token_count = 0
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                async with client.stream(
                    "POST",
                    f"{self.BASE_URL}{self.CHAT_PATH}",
                    json=payload,
                    headers=self._headers,
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        raw = line[6:]
                        if raw == "[DONE]":
                            break
                        chunk = json.loads(raw)
                        if token := chunk["choices"][0]["delta"].get("content", ""):
                            token_count += 1
                            yield token
            logger.info("UpstageProvider.generate_stream 완료: 토큰 %d개", token_count)
        except Exception as exc:
            logger.error("UpstageProvider.generate_stream 오류: %s", exc)
            raise


def get_llm_provider() -> BaseLLMProvider:
    """
    설정에 따라 LLM 프로바이더 인스턴스를 반환하는 팩토리 함수.

    Returns:
        구성된 BaseLLMProvider 구현체

    Raises:
        ValueError: 지원하지 않는 프로바이더명 지정 시
    """
    provider_map: dict[str, type[BaseLLMProvider]] = {
        "ollama": OllamaProvider,
        "upstage": UpstageProvider,
    }
    provider_cls = provider_map.get(settings.llm_provider)
    if provider_cls is None:
        supported = ", ".join(provider_map.keys())
        logger.error("get_llm_provider: 알 수 없는 프로바이더 %s", settings.llm_provider)
        raise ValueError(
            f"알 수 없는 LLM 프로바이더: '{settings.llm_provider}'. "
            f"지원 목록: {supported}"
        )
    logger.info("get_llm_provider: provider=%s 선택", settings.llm_provider)
    return provider_cls()
