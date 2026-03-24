FROM python:3.12-slim

WORKDIR /app

# 시스템 의존성 (healthcheck용 curl 포함)
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# 의존성 먼저 복사 (레이어 캐시 최적화)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# --reload: 소스 변경 시 자동 재시작 (dev 환경)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
