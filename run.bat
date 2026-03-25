@echo off
REM AI Path — Docker 관리 스크립트 (Windows CMD)
REM
REM 사용법:
REM   run.bat <env> <command> [options]
REM
REM env     : dev | prod
REM command : up | down | build | restart | ps | logs | shell
REM
REM 예시:
REM   run.bat dev up
REM   run.bat dev up --build
REM   run.bat prod up --build
REM   run.bat dev logs
REM   run.bat dev down

setlocal enabledelayedexpansion

set "ENV=%~1"
set "CMD=%~2"

REM ── 도움말 ────────────────────────────────────────────
if "%ENV%"=="" goto :usage
if "%CMD%"=="" goto :usage
if not "%ENV%"=="dev" if not "%ENV%"=="prod" (
  echo [aipath] ERROR: env는 'dev' 또는 'prod' 여야 합니다.
  goto :usage
)

REM ── 명령 실행 ─────────────────────────────────────────
if "%CMD%"=="up"      goto :do_up
if "%CMD%"=="down"    goto :do_down
if "%CMD%"=="build"   goto :do_build
if "%CMD%"=="restart" goto :do_restart
if "%CMD%"=="ps"      goto :do_ps
if "%CMD%"=="logs"    goto :do_logs
if "%CMD%"=="shell"   goto :do_shell

echo [aipath] ERROR: 알 수 없는 command '%CMD%'
goto :usage

:do_up
  echo [aipath] [%ENV%] 컨테이너 시작...
  docker compose --profile %ENV% up -d %3 %4 %5
  if errorlevel 1 goto :err
  echo [aipath] [%ENV%] 시작 완료!
  if "%ENV%"=="dev"  echo [aipath]   프론트엔드 ^-^> http://localhost:5173
  if "%ENV%"=="prod" echo [aipath]   프론트엔드 ^-^> http://localhost:80
  echo [aipath]   백엔드 API  ^-^> http://localhost:8000
  goto :eof

:do_down
  echo [aipath] [%ENV%] 컨테이너 중지 및 제거...
  docker compose --profile %ENV% down %3 %4 %5
  if errorlevel 1 goto :err
  echo [aipath] [%ENV%] 중지 완료.
  goto :eof

:do_build
  echo [aipath] [%ENV%] 이미지 빌드...
  docker compose --profile %ENV% build %3 %4 %5
  if errorlevel 1 goto :err
  echo [aipath] [%ENV%] 빌드 완료.
  goto :eof

:do_restart
  echo [aipath] [%ENV%] 재시작...
  docker compose --profile %ENV% down
  docker compose --profile %ENV% up -d --build
  if errorlevel 1 goto :err
  echo [aipath] [%ENV%] 재시작 완료!
  goto :eof

:do_ps
  docker compose --profile %ENV% ps
  goto :eof

:do_logs
  echo [aipath] [%ENV%] 로그 스트리밍 (Ctrl+C로 종료)
  docker compose --profile %ENV% logs -f %3 %4 %5
  goto :eof

:do_shell
  echo [aipath] [백엔드] bash 접속...
  docker exec -it aipath-backend bash
  goto :eof

:usage
  echo.
  echo   사용법: run.bat ^<env^> ^<command^> [options]
  echo.
  echo   env     : dev ^| prod
  echo   command : up ^| down ^| build ^| restart ^| ps ^| logs ^| shell
  echo.
  echo   예시:
  echo     run.bat dev up              개발 환경 시작
  echo     run.bat dev up --build      빌드 후 시작
  echo     run.bat prod up --build     프로덕션 빌드 후 시작
  echo     run.bat dev logs            로그 확인
  echo     run.bat dev down            중지
  echo.
  exit /b 1

:err
  echo [aipath] ERROR: 명령 실행 중 오류가 발생했습니다.
  exit /b 1
