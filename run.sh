#!/usr/bin/env bash
# AI Path — Docker 관리 스크립트 (Linux / macOS)
#
# 사용법:
#   ./run.sh <env> <command> [options]
#
# env:
#   dev   — Vite 개발 서버 (핫리로드, 포트 5173)
#   prod  — Nginx 정적 빌드 (포트 80)
#
# command:
#   up      컨테이너 시작 (백그라운드)
#   down    컨테이너 중지 및 제거
#   build   이미지 빌드만 수행
#   restart 재시작 (down → up)
#   ps      실행 중인 컨테이너 목록
#   logs    로그 스트리밍 (-f)
#   shell   백엔드 컨테이너 bash 접속
#
# 예시:
#   ./run.sh dev up
#   ./run.sh dev up --build
#   ./run.sh prod up --build
#   ./run.sh dev logs
#   ./run.sh dev down

set -euo pipefail

ENV="${1:-}"
CMD="${2:-}"
shift 2 2>/dev/null || true   # 나머지 인자를 docker compose에 전달
EXTRA_ARGS="$*"

# ── 색상 출력 ─────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[aipath]${NC} $*"; }
ok()    { echo -e "${GREEN}[aipath]${NC} $*"; }
warn()  { echo -e "${YELLOW}[aipath]${NC} $*"; }
error() { echo -e "${RED}[aipath] ERROR:${NC} $*" >&2; }

# ── 도움말 ────────────────────────────────────────────
usage() {
  echo ""
  echo "  사용법: ./run.sh <env> <command> [options]"
  echo ""
  echo "  env     : dev | prod"
  echo "  command : up | down | build | restart | ps | logs | shell"
  echo ""
  echo "  예시:"
  echo "    ./run.sh dev up            # 개발 환경 시작"
  echo "    ./run.sh dev up --build    # 빌드 후 시작"
  echo "    ./run.sh prod up --build   # 프로덕션 빌드 후 시작"
  echo "    ./run.sh dev logs          # 로그 확인"
  echo "    ./run.sh dev down          # 중지"
  echo ""
  exit 1
}

# ── 입력 검증 ─────────────────────────────────────────
[[ -z "$ENV" || -z "$CMD" ]] && { error "env와 command를 입력하세요."; usage; }
[[ "$ENV" != "dev" && "$ENV" != "prod" ]] && { error "env는 'dev' 또는 'prod'여야 합니다."; usage; }

PROFILE_FLAG="--profile $ENV"
DC="docker compose $PROFILE_FLAG"

# ── 명령 실행 ─────────────────────────────────────────
case "$CMD" in
  up)
    info "[$ENV] 컨테이너 시작..."
    $DC up -d $EXTRA_ARGS
    ok "[$ENV] 시작 완료!"
    if [[ "$ENV" == "dev" ]]; then
      info "  프론트엔드 → http://localhost:5173"
    else
      info "  프론트엔드 → http://localhost:80"
    fi
    info "  백엔드 API  → http://localhost:8000"
    ;;
  down)
    info "[$ENV] 컨테이너 중지 및 제거..."
    $DC down $EXTRA_ARGS
    ok "[$ENV] 중지 완료."
    ;;
  build)
    info "[$ENV] 이미지 빌드..."
    $DC build $EXTRA_ARGS
    ok "[$ENV] 빌드 완료."
    ;;
  restart)
    info "[$ENV] 재시작..."
    $DC down
    $DC up -d --build
    ok "[$ENV] 재시작 완료!"
    ;;
  ps)
    $DC ps
    ;;
  logs)
    info "[$ENV] 로그 스트리밍 (Ctrl+C로 종료)"
    $DC logs -f $EXTRA_ARGS
    ;;
  shell)
    info "[백엔드] bash 접속..."
    docker exec -it aipath-backend bash
    ;;
  *)
    error "알 수 없는 command: '$CMD'"
    usage
    ;;
esac
