@echo off
set "DIR=%~dp0"

reg add "HKEY_CLASSES_ROOT\*\shell\Cryptone" /v "" /t REG_SZ /d "Cryptone" /f
reg add "HKEY_CLASSES_ROOT\*\shell\Cryptone" /v "Icon" /t REG_SZ /d "%DIR%resources\favicon.ico" /f
reg add "HKEY_CLASSES_ROOT\*\shell\Cryptone\command" /v "" /t REG_SZ /d "\"%DIR%Cryptone.exe\" \"%%1\"" /f
