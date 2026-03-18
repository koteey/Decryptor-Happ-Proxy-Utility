@echo off
chcp 65001 >nul
title HAPP decryptor - Запуск frida-server
echo [*] Запуск frida-server на устройстве...
adb shell "su -c '/data/local/tmp/frida-server &'"
exit