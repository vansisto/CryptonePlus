const { ipcRenderer, webUtils } = require('electron');

window.electron = {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  generateKeyPair: (keyPairName) => ipcRenderer.invoke('generate-key-pair', keyPairName),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  encryptFile: (cfile, password, publicKeyPath) => ipcRenderer.invoke('encrypt-file', cfile, password, publicKeyPath),
  decryptFile: (cfile, password, privateKeyPath) => ipcRenderer.invoke('decrypt-file', cfile, password, privateKeyPath),
  isEncryptedFile: (cfile) => ipcRenderer.invoke('is-encrypted-file', cfile),
  fileExists: (cfile) => ipcRenderer.invoke('file-exists', cfile),
  selectKeyDialog: (isPublic) => ipcRenderer.invoke('select-key-dialog', isPublic),
  deleteFiles: (cfiles) => ipcRenderer.invoke('delete-files', cfiles),
  archiveFiles: (cfiles) => ipcRenderer.invoke('archive-files', cfiles),
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
