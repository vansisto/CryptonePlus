const { ipcRenderer, webUtils } = require('electron');

window.electron = {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  generateKeyPair: (keyPairName) => ipcRenderer.invoke('generate-key-pair', keyPairName),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
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
