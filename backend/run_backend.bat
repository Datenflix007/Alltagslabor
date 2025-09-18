@echo off
cd /d "%~dp0"
if exist ".venv\Scripts\activate" call ".venv\Scripts\activate"
echo Backend startet auf http://localhost:8001
echo Zum Beenden: Strg+C
echo(
python -m uvicorn server:app --host 127.0.0.1 --port 8001

