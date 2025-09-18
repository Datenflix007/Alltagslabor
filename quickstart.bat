@echo off
setlocal ENABLEDELAYEDEXPANSION ENABLEEXTENSIONS
set "FRONTEND_FAILED=1"
if not defined SKIP_NPM_CACHE_CLEAN set "SKIP_NPM_CACHE_CLEAN=0"
if not defined SKIP_GLOBAL_INSTALLS set "SKIP_GLOBAL_INSTALLS=0"

:: -------------------------------------------
:: AlltagsLabor - Quickstart fuer Windows (VS Code)
:: -------------------------------------------

:: In Skriptverzeichnis wechseln (Projektwurzel)
cd /d "%~dp0"

echo(
echo ==============================
echo  AlltagsLabor Quickstart
echo ==============================
echo(

:: --- Grundchecks -------------------------------------------------------------

:: Node.js / npm pruefen
where node >nul 2>&1
if errorlevel 1 (
  echo [FEHLT] Node.js ist nicht installiert.
  echo Bitte von https://nodejs.org laden und installieren ^(LTS-Version^).
  echo Danach dieses Skript erneut ausfuehren.
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo [FEHLT] npm wurde nicht gefunden. Bitte Node.js korrekt installieren.
  pause
  exit /b 1
)

:: Python pruefen (bevorzugt py-Launcher)
where py >nul 2>&1
if errorlevel 1 (
  where python >nul 2>&1
  if errorlevel 1 (
    echo [FEHLT] Python ist nicht installiert.
    echo Bitte Python 3.10+ von https://www.python.org installieren
    echo und waehrend der Installation "Add Python to PATH" aktivieren.
    pause
    exit /b 1
  ) else (
    set PYTHON=python
  )
) else (
  set PYTHON=py
)

:: Ordner pruefen
if not exist "backend" (
  echo [FEHLT] Ordner "backend" nicht gefunden. Skript bitte im Projektwurzelordner ausfuehren.
  pause 
  exit /b 1
)
if not exist "frontend" (
  echo [FEHLT] Ordner "frontend" nicht gefunden. Skript bitte im Projektwurzelordner ausfuehren.
  pause 
  exit /b 1
)

echo [OK] Node.js, npm und Python gefunden.

:: --- Backend Setup -----------------------------------------------------------

echo(
echo [1/4] Backend-Umgebung vorbereiten...
pushd backend

:: Virtuelle Umgebung aktivieren (sollte schon existieren)
if exist ".venv\Scripts\activate" (
  call ".venv\Scripts\activate"
  echo [OK] Virtuelle Umgebung aktiviert.
) else (
  echo [WARNUNG] Keine virtuelle Umgebung gefunden - verwende System-Python.
)


:: .env erzeugen, falls fehlend
if not exist ".env" (
  echo    - Erzeuge backend\.env mit Standardwerten...
  echo MONGO_URL="mongodb://localhost:27017" > ".env"
  echo DB_NAME="alltagslabor_local" >> ".env"
)

popd
echo [OK] Backend Setup abgeschlossen.

:: --- Frontend Setup mit Fallback-Optionen ----------------------------------

echo(
echo [2/4] Frontend-Dependencies installieren...
pushd frontend

:: package.json pruefen
if not exist "package.json" (
  echo [FEHLER] Keine package.json im frontend gefunden.
  echo Bitte pruefen Sie, ob Sie im richtigen Ordner sind.
  popd 
  pause 
  exit /b 1
)

:: npm cache cleanup
echo    - npm Cache bereinigen (kann ein paar Minuten dauern)...
if "%SKIP_NPM_CACHE_CLEAN%"=="1" (
  echo      [INFO] Ueberspringe npm Cache Bereinigung ^(SKIP_NPM_CACHE_CLEAN=1 gesetzt^).
) else (
  call npm cache clean --force
  if errorlevel 1 (
    echo      [WARNUNG] npm cache clean fehlgeschlagen. Fahre ohne Bereinigung fort.
  ) else (
    echo      [OK] npm Cache bereinigt.
  )
)

:: .env fuer Frontend erzeugen, falls fehlend
if not exist ".env" (
  echo    - Erzeuge frontend\.env mit lokalen Einstellungen...
  echo EXPO_PUBLIC_BACKEND_URL=http://localhost:8001 > ".env"
  echo EXPO_USE_FAST_RESOLVER="1" >> ".env"
)

:: Mehrere Installation-Versuche
echo    - Versuche npm install...
echo      (dieser Schritt kann je nach Verbindung einige Minuten dauern)
call npm install
if errorlevel 1 (
  echo [WARNUNG] Normales npm install fehlgeschlagen. Versuche Alternative 1...
  call npm install --force
  if errorlevel 1 (
    echo [WARNUNG] npm install --force fehlgeschlagen. Versuche Alternative 2...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
      echo [WARNUNG] npm install --legacy-peer-deps fehlgeschlagen. Versuche Alternative 3...
      rmdir /s /q node_modules >nul 2>&1
      del package-lock.json >nul 2>&1
      call npm install --legacy-peer-deps --force
      if errorlevel 1 (
        echo(
        echo [WARNUNG] Alle npm Installation-Versuche fehlgeschlagen!
        echo Versuche Yarn als Alternative...
        
        :: Yarn pruefen/installieren
        where yarn >nul 2>&1
        if errorlevel 1 (
          if "%SKIP_GLOBAL_INSTALLS%"=="1" (
            echo    - Ueberspringe automatische Yarn-Installation ^(SKIP_GLOBAL_INSTALLS=1 gesetzt^).
          ) else (
            echo    - Installiere Yarn global ^(kann Adminrechte verlangen^)...
            call npm install -g yarn --force
            if errorlevel 1 (
              echo    - [WARNUNG] Automatische Yarn-Installation fehlgeschlagen. Bitte Yarn manuell installieren und Skript erneut starten.
            )
          )
        )
        
        :: Yarn install versuchen
        call yarn install
        if errorlevel 1 (
          echo(
          echo [FEHLER] Auch Yarn Installation fehlgeschlagen.
          echo(
          echo MANUELLE LOESUNGSANSAETZE:
          echo 1. Oeffnen Sie ein neues Terminal als Administrator
          echo 2. cd "%~dp0frontend"
          echo 3. Versuchen Sie:
          echo    - npm install --force --legacy-peer-deps
          echo    - oder: yarn install
          echo    - oder: rm -rf node_modules ^&^& npm install
          echo(
          echo TROTZDEM WEITERFAHREN? ^(Backend funktioniert^)
          echo [J/N]?
          set /p CONTINUE=
          if /i "!CONTINUE!"=="N" (
            popd
            pause
            exit /b 1
          )
          echo [INFO] Fahre ohne Frontend-Dependencies fort...
          set FRONTEND_FAILED=1
        ) else (
          echo [OK] Yarn Installation erfolgreich!
          set FRONTEND_FAILED=0
        )
      ) else (
        echo [OK] npm install mit --legacy-peer-deps --force erfolgreich!
        set FRONTEND_FAILED=0
      )
    ) else (
      echo [OK] npm install mit --legacy-peer-deps erfolgreich!
      set FRONTEND_FAILED=0
    )
  ) else (
    echo [OK] npm install mit --force erfolgreich!
    set FRONTEND_FAILED=0
  )
) else (
  echo [OK] npm install erfolgreich!
  set FRONTEND_FAILED=0
)

:: Expo CLI Vorbereitung (nur wenn Frontend erfolgreich)
if "%FRONTEND_FAILED%"=="0" (
  where expo >nul 2>&1
  if errorlevel 1 (
    echo    - Expo CLI nicht global vorhanden. Verwende npx expo beim Start.
    where npx >nul 2>&1
    if errorlevel 1 (
      echo      [WARNUNG] npx wurde nicht gefunden. Bitte npm aktualisieren oder Expo CLI lokal installieren ^(npm install --save-dev expo-cli^).
    ) else (
      echo      [INFO] Beim ersten Aufruf von npx expo kann ein Download einige Minuten dauern.
    )
  ) else (
    echo    - Expo CLI global gefunden.
  )
)

popd

if "%FRONTEND_FAILED%"=="0" (
  echo [OK] Frontend Setup abgeschlossen.
) else (
  echo [WARNUNG] Frontend Setup mit Fehlern abgeschlossen.
)

:: --- VS Code Konfiguration ---------------------------------------------------

echo(
echo [3/4] VS Code Konfiguration vorbereiten...
if not exist ".vscode" mkdir ".vscode"

:: launch.json fuer Debugging
if not exist ".vscode\launch.json" (
  echo    - Erstelle .vscode\launch.json fuer Debugging...
  echo { > ".vscode\launch.json"
  echo   "version": "0.2.0", >> ".vscode\launch.json"
  echo   "configurations": [ >> ".vscode\launch.json"
  echo     { >> ".vscode\launch.json"
  echo       "name": "Backend Server", >> ".vscode\launch.json"
  echo       "type": "python", >> ".vscode\launch.json"
  echo       "request": "launch", >> ".vscode\launch.json"
  echo       "program": "${workspaceFolder}/backend/server.py", >> ".vscode\launch.json"
  echo       "cwd": "${workspaceFolder}/backend" >> ".vscode\launch.json"
  echo     } >> ".vscode\launch.json"
  if "%FRONTEND_FAILED%"=="0" (
    echo     , >> ".vscode\launch.json"
    echo     { >> ".vscode\launch.json"
    echo       "name": "Expo Frontend", >> ".vscode\launch.json"
    echo       "type": "node", >> ".vscode\launch.json"
    echo       "request": "launch", >> ".vscode\launch.json"  
    echo       "program": "${workspaceFolder}/frontend/node_modules/.bin/expo", >> ".vscode\launch.json"
    echo       "args": ["start"], >> ".vscode\launch.json"
    echo       "cwd": "${workspaceFolder}/frontend" >> ".vscode\launch.json"
    echo     } >> ".vscode\launch.json"
  )
  echo   ] >> ".vscode\launch.json"
  echo } >> ".vscode\launch.json"
)

echo [OK] VS Code Konfiguration erstellt.

:: --- Services starten -------------------------------------------------------

echo(
echo ===============================
echo  Starte AlltagsLabor Services
echo ===============================
echo(

:: Backend in neuem CMD-Fenster starten
echo [BACKEND] Starte Backend-Server in separatem Fenster...
start "AlltagsLabor Backend" cmd /k "%~dp0backend\run_backend.bat"

:: Frontend starten (nur wenn Installation erfolgreich)
if "%FRONTEND_FAILED%"=="0" (
  :: Kurz warten, damit Backend Zeit hat zu starten
  timeout /t 2 /nobreak >nul
  
  echo [FRONTEND] Starte Expo Frontend in separatem Fenster...
  start "AlltagsLabor Frontend" cmd /k "%~dp0frontend\run_frontend.bat"
) else (
  echo [WARNUNG] Frontend wird NICHT gestartet (Installation fehlgeschlagen).
  echo Sie koennen das Frontend manuell starten:
  echo 1. cd frontend
  echo 2. npm install --force --legacy-peer-deps
  echo 3. npx expo start
)

:: Kurz warten und dann VS Code oeffnen
echo(
if "%FRONTEND_FAILED%"=="0" (
  echo [INFO] Warte 3 Sekunden und oeffne dann VS Code...
  timeout /t 3 /nobreak >nul
) else (
  echo [INFO] Oeffne VS Code...
  timeout /t 1 /nobreak >nul
)

:: VS Code oeffnen
where code >nul 2>&1
if not errorlevel 1 (
  echo [VS CODE] Oeffne Visual Studio Code...
  code .
) else (
  echo [INFO] VS Code nicht gefunden. Bitte manuell oeffnen: code .
)

:: --- Abschluss ---------------------------------------------------------------

echo(
echo ================================
if "%FRONTEND_FAILED%"=="0" (
  echo  AlltagsLabor ist bereit!
) else (
  echo  AlltagsLabor Backend ist bereit!
)
echo ================================
echo(
echo BACKEND:   http://localhost:8001/api/
if "%FRONTEND_FAILED%"=="0" (
  echo FRONTEND:  Expo QR-Code scannen oder Browser
) else (
  echo FRONTEND:  Installation fehlgeschlagen - siehe oben
)
echo(er mit Strg+C schliessen
) else (
  echo - Backend-Terminal mit Strg+C schliessen
)
echo(
echo Viel Spass beim Entwickeln!
echo(
pause

endlocal




if "%FRONTEND_FAILED%"=="0" (
  echo NAECHSTE SCHRITTE:
  echo 1. Expo Go App auf Handy installieren
  echo 2. QR-Code im Frontend-Terminal scannen
  echo 3. App sollte auf Handy erscheinen
  echo 4. Alternativ: 'w' im Frontend-Terminal fuer Browser
) else (
  echo NAECHSTE SCHRITTE ^(nur Backend^):
  echo 1. Backend testen: http://localhost:8001/api/experiments
  echo 2. Frontend manuell reparieren ^(siehe Anweisungen oben^)
)
echo(
echo ENTWICKLUNG:
echo - Code in VS Code aendern
echo - Backend ist bereits verfuegbar
if "%FRONTEND_FAILED%"=="0" (
  echo - App aktualisiert sich automatisch
)
echo(
echo BEENDEN:
if "%FRONTEND_FAILED%"=="0" (
  echo - Beide Terminal-Fenst