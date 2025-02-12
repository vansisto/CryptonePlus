const { ipcRenderer, webUtils } = require('electron');

window.electron = {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  generateKeyPair: (keyPairName) => ipcRenderer.invoke('generate-key-pair', keyPairName),
  generateKeysWithDifferentNames: (publicKeyName, privateKeyName) => ipcRenderer.invoke('generate-keys-with-different-names', publicKeyName, privateKeyName),
  isKeysFolderExists: () => ipcRenderer.invoke('is-keys-folder-exists'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  encryptFile: (cfile, password, publicKeyPath) => ipcRenderer.invoke('encrypt-file', cfile, password, publicKeyPath),
  decryptFile: (cfile, password, privateKeyPath) => ipcRenderer.invoke('decrypt-file', cfile, password, privateKeyPath),
  isEncryptedFile: (cfile) => ipcRenderer.invoke('is-encrypted-file', cfile),
  fileExists: (cfile) => ipcRenderer.invoke('file-exists', cfile),
  selectKeyDialog: (isPublic) => ipcRenderer.invoke('select-key-dialog', isPublic),
  deleteFiles: (cfiles) => ipcRenderer.invoke('delete-files', cfiles),
  archiveFiles: (cfiles) => ipcRenderer.invoke('archive-files', cfiles),
  unarchiveIfExists: (cfilePath) => ipcRenderer.invoke('unarchive-if-exists', cfilePath),
  sendFilesViaWhatsApp: (ccontact, cfiles) => ipcRenderer.invoke('send-files-via-whatsapp', ccontact, cfiles),
  getWhatsAppContactList: () => ipcRenderer.invoke('get-whatsapp-contacts'),
  showFileInFolder: (cfile) => ipcRenderer.invoke('show-file-in-folder', cfile),
  zoomIn: () => ipcRenderer.invoke('zoom-in'),
  zoomOut: () => ipcRenderer.invoke('zoom-out'),
  setZoom: (zoom) => ipcRenderer.invoke('set-zoom', zoom),
};

window.addEventListener('dragover', (event) => {
  event.preventDefault();
});

window.addEventListener('drop', (event) => {
  event.preventDefault();

  const droppedFiles = event.dataTransfer?.files || [];
  if (!droppedFiles.length) {
    return;
  }

  const filePaths = [];
  for (const file of droppedFiles) {
    const path = webUtils.getPathForFile(file);
    filePaths.push(path);
  }

  ipcRenderer.send('dropped-files', filePaths);
});
