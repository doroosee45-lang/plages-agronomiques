@echo off
chcp 65001 >nul
title Plages agronomiques - demarrage
cd /d "%~dp0"

echo.
echo ==========================================================
echo   PLAGES AGRONOMIQUES - demarrage de la plateforme
echo   (dossier frontend + dossier backend)
echo ==========================================================
echo.

REM --- 1. Node.js est-il installe ? ---------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo   [PROBLEME] Node.js n'est pas installe sur cet ordinateur.
  echo.
  echo   1. Ouvrez https://nodejs.org dans votre navigateur
  echo   2. Telechargez la version "LTS" et installez-la (Suivant, Suivant...)
  echo   3. Redemarrez cet ordinateur, puis double-cliquez a nouveau sur ce fichier
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -v') do set NODE_VERSION=%%v
echo   Node.js detecte : %NODE_VERSION%

REM --- 2. Les dependances sont-elles installees ? -------------------------
if not exist "node_modules" (
  echo.
  echo   Premiere utilisation : installation des composants...
  echo   Cela peut prendre 1 a 2 minutes, merci de patienter.
  echo.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo   [PROBLEME] L'installation a echoue. Verifiez votre connexion Internet
    echo   puis relancez ce fichier.
    pause
    exit /b 1
  )
)

REM --- 3. Le site est-il construit ? --------------------------------------
if not exist "frontend\dist\index.html" (
  echo.
  echo   Preparation du site (frontend)...
  call npm run build
  if errorlevel 1 (
    echo   [PROBLEME] La preparation du site a echoue.
    pause
    exit /b 1
  )
)

REM --- 4. Lancement --------------------------------------------------------
echo.
echo   Demarrage du serveur...
echo.
echo   ------------------------------------------------------------
echo    Ouvrez votre navigateur a l'adresse :  http://localhost:4000
echo    (n'ecrivez jamais 0.0.0.0 dans le navigateur)
echo    Les relectures sont enregistrees dans MongoDB (base
echo    "plages_agronomiques") ; si MongoDB n'est pas demarre, un
echo    fichier backend\data\relectures.json prend le relais.
echo   ------------------------------------------------------------
echo.
echo   Pour ARRETER le site : appuyez sur Ctrl + C dans cette fenetre,
echo   ou fermez simplement cette fenetre noire.
echo.

start "" http://localhost:4000
node backend\server\index.js

echo.
echo   Le serveur est arrete.
pause
