"""
앱 전역 설정 모듈.

pydantic-settings를 사용해 .env 파일 및 환경변수를 타입-안전하게 로드합니다.
새로운 설정 항목은 Settings 클래스에 필드를 추가하면 자동으로 주입됩니다.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """앱 설정. .env 파일 또는 환경변수로 오버라이드 가능."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # 앱 기본 설정
    app_env: str = "development"
    log_level: str = "INFO"

    # LLM 프로바이더 선택
    llm_provider: str = "ollama"  # 'ollama' | 'upstage'

    # Ollama 설정
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "llama3.1:8b"

    # Upstage 설정
    upstage_api_key: str = ""
    upstage_model: str = "solar-pro"

    # 데이터 경로 (Docker 볼륨 마운트 기준)
    data_dir: str = "/app/data"


@lru_cache
def get_settings() -> Settings:
    """싱글턴 Settings 인스턴스 반환. 의존성 주입에 사용."""
    return Settings()


settings = get_settings()
