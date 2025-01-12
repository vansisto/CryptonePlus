!include "MUI2.nsh"

Section "Install"
  WriteRegStr HKCR "*\shell\Cryptone" "" "Cryptone"
  WriteRegStr HKCR "*\shell\Cryptone" "Icon" "$INSTDIR\Cryptone.exe"
  WriteRegStr HKCR "*\shell\Cryptone\command" "" '"$INSTDIR\Cryptone.exe" "%1"'

  WriteUninstaller "$INSTDIR\Uninstall Cryptone.exe"
SectionEnd

Section "Uninstall"
  DeleteRegKey HKCR "*\shell\Cryptone\command"
  DeleteRegKey HKCR "*\shell\Cryptone"
SectionEnd
