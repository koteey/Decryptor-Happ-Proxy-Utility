@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title HAPP decryptor

:START
cls
echo ==================================================
echo   🛠 Запуск
echo ==================================================

:: 1. Убиваем старые процессы на телефоне через ADB напрямую, 
:: чтобы frida.bat запускался на "чистую" почву
echo [*] Чистка старых хвостов на телефоне
adb shell "su -c 'pkill -9 frida-server'" >nul 2>&1
adb shell "su -c 'pkill -9 com.happproxy'" >nul 2>&1

:: 2. Запускаем твой батник сервера
echo [*] Запускаю сервер frida
:: Используем /c чтобы он отработал и вернул управление, либо просто start
start "" frida.bat

echo [*] ...ожидание запуска...
timeout /t 5 >nul

:: 3. Ждем приложение
echo [*] запусти HAPP
:WAIT_FOR_PID
for /f "tokens=2" %%a in ('adb shell "ps -A | grep com.happproxy | grep -v :XRayDaemon | grep -v :bg_process"') do (
    set PID=%%a
)
if "%PID%"=="" (
    timeout /t 1 >nul
    goto WAIT_FOR_PID
)

echo [✅] приложение найдено. PID: %PID%
echo [*] подключаюсь
echo --------------------------------------------------

:: Запуск самой фриды
frida.exe -U -p %PID% -l happ_final.js

echo --------------------------------------------------
echo [!] сессия завершена.
pause
goto START