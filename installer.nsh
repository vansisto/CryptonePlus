!include "MUI2.nsh"

!macro customInit
  WriteRegStr HKCR "*\shell\Cryptone" "" "Cryptone"
  WriteRegStr HKCR "*\shell\Cryptone" "Icon" "$INSTDIR\Cryptone.exe"
  WriteRegStr HKCR "*\shell\Cryptone\command" "" '"$INSTDIR\Cryptone.exe" "%1"'
  
  WriteRegStr HKCR "Directory\shell\Cryptone" "" "Cryptone"
  WriteRegStr HKCR "Directory\shell\Cryptone" "Icon" "$INSTDIR\Cryptone.exe"
  WriteRegStr HKCR "Directory\shell\Cryptone\command" "" '"$INSTDIR\Cryptone.exe" "%1"'

  WriteUninstaller "$INSTDIR\Uninstall Cryptone.exe"
!macroend

Section "Uninstall"
  DeleteRegKey HKCR "*\shell\Cryptone\command"
  DeleteRegKey HKCR "*\shell\Cryptone"
  
  DeleteRegKey HKCR "Directory\shell\Cryptone\command"
  DeleteRegKey HKCR "Directory\shell\Cryptone"
SectionEnd
