"""
구조화된 로깅 모듈.

setup_logging(): 앱 시작 시 1회 호출
get_logger(name): 모듈별 logger 반환 팩토리
"""

import logging
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path

from app.config import settings

_LOG_FORMAT = "%(asctime)s | %(levelname)-5s | %(name)-12s | %(message)s"


def setup_logging() -> None:
    """콘솔 + 파일(자정 로테이션) 핸들러를 루트 로거에 등록합니다."""
    log_dir = Path("logs")
    log_dir.mkdir(parents=True, exist_ok=True)

    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    formatter = logging.Formatter(_LOG_FORMAT)

    # 콘솔 핸들러
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    # 파일 핸들러 (자정 로테이션, 최대 100개 보관)
    file_handler = TimedRotatingFileHandler(
        filename=log_dir / "aipath.log",
        when="midnight",
        interval=1,
        backupCount=100,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    file_handler.suffix = "%Y-%m-%d"

    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)


def get_logger(name: str) -> logging.Logger:
    """모듈별 logger를 반환합니다."""
    return logging.getLogger(name)
