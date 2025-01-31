const {ipcMain, dialog, app} = require("electron");
const {collectRecursivelyFilePaths, sendFilesToRenderer} = require("../../utils/file-utils")
const {isCryptoneEncoded} = require("../../utils/file-utils")
const path = require("path");
const fs = require("fs");

const ADD_FILES_CHANNEL = 'add-files';
const userDataPath = app.getPath('userData');
const baseKeysPath = path.join(userDataPath, 'CryptoneKeys', 'Offline');

function extractCFilesRecursively(paths) {
  const allFiles = [];

  for (const fileOrFolderPath of paths) {
    collectRecursivelyFilePaths(fileOrFolderPath, allFiles);
  }

  return allFiles
    .map((filePath) => {
      return {
        path: filePath,
        name: path.parse(filePath).base,
        encrypted: isCryptoneEncoded(filePath),
        size: fs.statSync(filePath).size,
      };
    });
}

function initializeDroppedFilesHandler() {
  ipcMain.on('dropped-files', (event, paths) => {
    const mappedFilesToCFiles = extractCFilesRecursively(paths);
    event.reply(ADD_FILES_CHANNEL, mappedFilesToCFiles);
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

function initializeOpenFileDialogHandler(mainWindow) {
  ipcMain.handle('open-file-dialog', () => {
    dialog
      .showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'All Files', extensions: ['*'] },
        ],
      })
      .then((result) => {
        if (!result.canceled) {
          sendFilesToRenderer(mainWindow, result.filePaths)
        }
      })
      .catch((err) => {
        console.error('Error opening file dialog:', err);
      });
  });
}

function initializeSelectKeyDialogHandler() {
  ipcMain.handle('select-key-dialog', (event, isPublic) => {
    return dialog
      .showOpenDialog({
        properties: ['openFile'],
        defaultPath: baseKeysPath,
        filters: [
          {
            name: isPublic ? 'Cryptone public key' : 'Cryptone private key',
            extensions: [ isPublic ? 'crtn.public.key' : 'crtn.private.key']
          },
        ],
      })
      .then((result) => {
        if (!result.canceled) {
          return result.filePaths[0]
        }
      })
      .catch((err) => {
        console.error('Error opening key selection dialog:', err);
      });
  });
}

function initializeDeleteFilesHandler() {
  ipcMain.handle('delete-files', (event, cfiles) => {
    cfiles.forEach((file) => {
      fs.rmSync(file.path)
    })
  })
}

function initializeFileHandlers(mainWindow, pendingFiles) {
  initializeDidFinishLoadHandler(mainWindow, pendingFiles);
  initializeGetPendingFilesHandler(mainWindow, pendingFiles);
  initializeDroppedFilesHandler();
  initializeOpenFileDialogHandler(mainWindow);
  initializeSelectKeyDialogHandler();
  initializeDeleteFilesHandler();
}

module.exports = {initializeFileHandlers}
