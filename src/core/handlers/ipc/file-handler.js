const {ipcMain} = require("electron");
const {collectRecursivelyFilePaths, sendFilesToRenderer} = require("../../utils/file-utils")

function initializeDroppedFilesHandler() {
  ipcMain.on('dropped-files', (event, paths) => {
    const allFiles = [];

    for (const fileOrFolderPath of paths) {
      collectRecursivelyFilePaths(fileOrFolderPath, allFiles);
    }

    event.reply('files-selected', allFiles);
  });
}

function initializeGetPendingFilesHandler(mainWindow, pendingFiles) {
  ipcMain.on('get-pending-files', () => {
    sendFilesToRenderer(mainWindow, pendingFiles);
  });
}

function initializeDidFinishLoadHandler(mainWindow, pendingFiles) {
  mainWindow.webContents.once('did-finish-load', () => {
    sendFilesToRenderer(mainWindow, pendingFiles);
  });
}

function initializeFileHandlers(mainWindow, pendingFiles) {
  initializeDidFinishLoadHandler(mainWindow, pendingFiles);
  initializeGetPendingFilesHandler(mainWindow, pendingFiles);
  initializeDroppedFilesHandler();
}

module.exports = {initializeFileHandlers}
