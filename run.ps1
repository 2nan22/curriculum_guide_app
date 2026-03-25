# AI Path — Docker 관리 스크립트 (Windows PowerShell)
#
# 사용법:
#   .\run.ps1 <env> <command> [options]
#
# env     : dev | prod
# command : up | down | build | restart | ps | logs | shell
#
# 예시:
#   .\run.ps1 dev up
#   .\run.ps1 dev up --build
#   .\run.ps1 prod up --build
#   .\run.ps1 dev logs
#   .\run.ps1 dev down
#
# 처음 실행 시 권한 오류가 나면:
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

param(
    [Parameter(Position=0)]
    [ValidateSet("dev","prod")]
    [string]$Env,

    [Parameter(Position=1)]
    [ValidateSet("up","down","build","restart","ps","logs","shell")]
    [string]$Cmd,

    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Extra
)

# ── 색상 출력 ─────────────────────────────────────────
function Info($msg)  { Write-Host "[aipath] $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "[aipath] $msg" -ForegroundColor Green }
function Err($msg)   { Write-Host "[aipath] ERROR: $msg" -ForegroundColor Red }

# ── 입력 검증 ─────────────────────────────────────────
if (-not $Env -or -not $Cmd) {
    Write-Host ""
    Write-Host "  사용법: .\run.ps1 <env> <command> [options]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  env     : dev | prod"
    Write-Host "  command : up | down | build | restart | ps | logs | shell"
    Write-Host ""
    Write-Host "  예시:"
    Write-Host "    .\run.ps1 dev up             개발 환경 시작"
    Write-Host "    .\run.ps1 dev up --build     빌드 후 시작"
    Write-Host "    .\run.ps1 prod up --build    프로덕션 빌드 후 시작"
    Write-Host "    .\run.ps1 dev logs           로그 확인"
    Write-Host "    .\run.ps1 dev down           중지"
    Write-Host ""
    exit 1
}

$ProfileFlag = "--profile $Env"

function Run-DC {
    param([string]$Args)
    $cmd = "docker compose $ProfileFlag $Args"
    if ($Extra) { $cmd += " " + ($Extra -join " ") }
    Write-Host "  > $cmd" -ForegroundColor DarkGray
    Invoke-Expression $cmd
    if ($LASTEXITCODE -ne 0) {
        Err "명령 실행 실패 (exit code $LASTEXITCODE)"
        exit $LASTEXITCODE
    }
}

# ── 명령 실행 ─────────────────────────────────────────
switch ($Cmd) {
    "up" {
        Info "[$Env] 컨테이너 시작..."
        Run-DC "up -d"
        Ok "[$Env] 시작 완료!"
        if ($Env -eq "dev")  { Info "  프론트엔드 → http://localhost:5173" }
        if ($Env -eq "prod") { Info "  프론트엔드 → http://localhost:80" }
        Info "  백엔드 API  → http://localhost:8000"
    }
    "down" {
        Info "[$Env] 컨테이너 중지 및 제거..."
        Run-DC "down"
        Ok "[$Env] 중지 완료."
    }
    "build" {
        Info "[$Env] 이미지 빌드..."
        Run-DC "build"
        Ok "[$Env] 빌드 완료."
    }
    "restart" {
        Info "[$Env] 재시작..."
        Invoke-Expression "docker compose $ProfileFlag down"
        Invoke-Expression "docker compose $ProfileFlag up -d --build"
        Ok "[$Env] 재시작 완료!"
    }
    "ps" {
        Invoke-Expression "docker compose $ProfileFlag ps"
    }
    "logs" {
        Info "[$Env] 로그 스트리밍 (Ctrl+C로 종료)"
        $logCmd = "docker compose $ProfileFlag logs -f"
        if ($Extra) { $logCmd += " " + ($Extra -join " ") }
        Invoke-Expression $logCmd
    }
    "shell" {
        Info "[백엔드] bash 접속..."
        docker exec -it aipath-backend bash
    }
}
