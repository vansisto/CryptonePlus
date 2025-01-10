const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)), //TODO: Investigate, what is it
  // onFilesSelected: (func) => ipcRenderer.send('files-selected', (event, files) => func(files)),
})
