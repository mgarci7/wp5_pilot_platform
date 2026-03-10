@echo off
setlocal

REM Double-click launcher for WP5 (Windows + Anaconda Prompt)
REM - Activates conda env: wp5py312
REM - Starts backend in researcher mode (manual treatment override enabled)
REM - Starts frontend in a second window

set "ROOT_DIR=%~dp0"
set "CONDA_ENV=wp5py312"

echo Starting WP5 from: %ROOT_DIR%

echo Launching backend window...
start "WP5 Backend (Researcher)" cmd /k "cd /d %ROOT_DIR%backend && call conda activate %CONDA_ENV% && set ALLOW_TREATMENT_OVERRIDE=true && python main.py"

echo Launching frontend window...
start "WP5 Frontend" cmd /k "cd /d %ROOT_DIR%frontend && call conda activate %CONDA_ENV% && npm run dev"

echo.
echo Done. Two windows should now be running:
echo  - Backend (researcher mode enabled)
echo  - Frontend (Next.js dev server)
echo.
endlocal
