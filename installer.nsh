!include "MUI2.nsh"
!define UPDATE_MODE_FILE "$APPDATA\Cryptone\update-mode"

Section "Install"
  WriteRegStr HKCU "Software\Classes\*\shell\Cryptone" "" "Cryptone"
  WriteRegStr HKCU "Software\Classes\*\shell\Cryptone" "Icon" "$INSTDIR\Cryptone.exe"
  WriteRegStr HKCU "Software\Classes\*\shell\Cryptone\command" "" '"$INSTDIR\Cryptone.exe" "%1"'
  
  WriteRegStr HKCU "Software\Classes\Directory\shell\Cryptone" "" "Cryptone"
  WriteRegStr HKCU "Software\Classes\Directory\shell\Cryptone" "Icon" "$INSTDIR\Cryptone.exe"
  WriteRegStr HKCU "Software\Classes\Directory\shell\Cryptone\command" "" '"$INSTDIR\Cryptone.exe" "%1"'

  WriteUninstaller "$INSTDIR\Uninstall Cryptone.exe"
SectionEnd

Section "Uninstall"
  IfFileExists "${UPDATE_MODE_FILE}" skipUninstall
  
  DeleteRegKey HKCU "Software\Classes\*\shell\Cryptone\command"
  DeleteRegKey HKCU "Software\Classes\*\shell\Cryptone"
  
  DeleteRegKey HKCU "Software\Classes\Directory\shell\Cryptone\command"
  DeleteRegKey HKCU "Software\Classes\Directory\shell\Cryptone"
  
  skipUninstall:
  Delete "${UPDATE_MODE_FILE}"
SectionEnd
