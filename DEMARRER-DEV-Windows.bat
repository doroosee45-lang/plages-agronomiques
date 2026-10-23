@echo off
chcp 65001 >nul
title Plages agronomiques - mode developpement (frontend + backend)
cd /d "%~dp0"

echo.
echo ==========================================================
echo   PLAGES AGRONOMIQUES - MODE DEVELOPPEMENT (frontend + backend)
echo   (backend + frontend en meme temps)
echo ==========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [PROBLEME] Node.js n'est pas installe.
  echo   Installez la version "LTS" depuis https://nodejs.org puis relancez.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo   Installation des composants (1 a 2 minutes, une seule fois)...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo   [PROBLEME] L'installation a echoue. Verifiez votre connexion Internet.
    pause
    exit /b 1
  )
)

echo.
echo   Demarrage de npm run dev...
echo.
echo   ------------------------------------------------------------
echo    Ouvrez votre navigateur a l'adresse :  http://localhost:3000
echo    Backend (API) : http://localhost:4000
echo    Base de donnees : MongoDB, base "plages_agronomiques"
echo    N'ecrivez jamais 0.0.0.0 dans le navigateur.
echo   ------------------------------------------------------------
echo.
echo   Pour ARRETER : Ctrl + C dans cette fenetre.
echo.

start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"
call npm run dev

echo.
echo   Serveur arrete.
pause
