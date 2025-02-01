!include "MUI2.nsh"

Section "Install"
  WriteRegStr HKCR "*\shell\Cryptone" "" "Cryptone"
  WriteRegStr HKCR "*\shell\Cryptone" "Icon" "$INSTDIR\Cryptone.exe"
  WriteRegStr HKCR "*\shell\Cryptone\command" "" '"$INSTDIR\Cryptone.exe" "%1"'
  
  WriteRegStr HKCR "Directory\shell\Cryptone" "" "Cryptone"
  WriteRegStr HKCR "Directory\shell\Cryptone" "Icon" "$INSTDIR\Cryptone.exe"
  WriteRegStr HKCR "Directory\shell\Cryptone\command" "" '"$INSTDIR\Cryptone.exe" "%1"'
  
  WriteRegStr HKCR ".crtn_public_key" "" "CryptonePublicKeyFile"
  WriteRegStr HKCR "CryptonePublicKeyFile\DefaultIcon" "" "$INSTDIR\resources\icons\key.ico"

  WriteRegStr HKCR ".crtn_private_key" "" "CryptonePrivateKeyFile"
  WriteRegStr HKCR "CryptonePrivateKeyFile\DefaultIcon" "" "$INSTDIR\resources\icons\key.ico"
  
  WriteRegStr HKCR ".crtn" "" "CryptoneEncryptedFile"
  WriteRegStr HKCR "CryptoneEncryptedFile\DefaultIcon" "" "$INSTDIR\resources\icons\lock.ico"
  WriteRegStr HKCR "CryptoneEncryptedFile\shell\open\command" "" '"$INSTDIR\Cryptone.exe" "%1"'

  WriteUninstaller "$INSTDIR\Uninstall Cryptone.exe"
SectionEnd

Section "Uninstall"
  DeleteRegKey HKCR "*\shell\Cryptone\command"
  DeleteRegKey HKCR "*\shell\Cryptone"
  
  DeleteRegKey HKCR "Directory\shell\Cryptone\command"
  DeleteRegKey HKCR "Directory\shell\Cryptone"
  
  DeleteRegKey HKCR "CryptonePublicKeyFile\DefaultIcon"
  DeleteRegKey HKCR "CryptonePublicKeyFile"
  DeleteRegKey HKCR ".crtn.public.key"

  DeleteRegKey HKCR "CryptonePrivateKeyFile\DefaultIcon"
  DeleteRegKey HKCR "CryptonePrivateKeyFile"
  DeleteRegKey HKCR ".crtn.private.key"
  
  DeleteRegKey HKCR "CryptoneEncryptedFile\shell\open\command"
  DeleteRegKey HKCR "CryptoneEncryptedFile\DefaultIcon"
  DeleteRegKey HKCR "CryptoneEncryptedFile"
  DeleteRegKey HKCR ".crtn"

SectionEnd
