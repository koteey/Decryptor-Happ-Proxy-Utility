@echo off
echo [*] Запуск frida-server на устройстве...
adb shell "su -c '/data/local/tmp/frida-server &'"
exit