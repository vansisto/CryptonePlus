const {ipcMain} = require("electron");
const {collectRecursivelyFilePaths, sendFilesToRenderer} = require("../../utils/file-utils")
const path = require("path");
const fs = require("fs");

function initializeDroppedFilesHandler() {
  ipcMain.on('dropped-files', (event, paths) => {
    const allFiles = [];

    for (const fileOrFolderPath of paths) {
      collectRecursivelyFilePaths(fileOrFolderPath, allFiles);
    }

    const parsedFiles = allFiles
      .map((filePath) => {
      return {
        path: filePath,
        name: path.parse(filePath).base,
        type: "",
        size: fs.statSync(filePath).size,
      };
    })

    event.reply('add-files', parsedFiles);
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
