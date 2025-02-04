const {ipcMain, dialog, app, shell} = require("electron");
const {collectRecursivelyFilePaths, sendFilesToRenderer} = require("../../utils/file-utils")
const {isCryptoneEncoded} = require("../../utils/file-utils")
const path = require("path");
const fs = require("fs");
const {
  archiveFiles,
  unarchiveIfExists
} = require("../../utils/zip-utils");

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
    event.reply('add-files', mappedFilesToCFiles);
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
            extensions: [ isPublic ? 'crtn_public_key' : 'crtn_private_key']
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

function initializeIsFileExistsHandler() {
  ipcMain.handle('file-exists', (event, cfile) => {
    return fs.existsSync(cfile.path);
  })
}

function initializeArchiveFilesHandler() {
  ipcMain.handle('archive-files', (event, cfiles) => {
    return archiveFiles(cfiles);
  })
}

function initializeUnarchiveIfExistsHandler(mainWindow) {
  ipcMain.handle('unarchive-if-exists', (event, cfilePath) => {
    const archivePath = path.join(path.dirname(cfilePath), '.crtn.zip');
    return unarchiveIfExists(archivePath, mainWindow);
  })
}

function initializeOpenKeysFolderHandler() {
  ipcMain.on('open-keys-folder', (event, exactKeysFolder) => {
    try {
      const fullKeysPath = path.join(baseKeysPath, exactKeysFolder || '');
      shell.openPath(fullKeysPath);
    } catch (err) {
      console.error('Error during open folder:', err);
    }
  });
}

function initializeShowFileInFolderHandler() {
  ipcMain.handle('show-file-in-folder', (event, cfile) => {
    shell.showItemInFolder(cfile.path);
  });
}

function initializeFileHandlers(mainWindow, pendingFiles) {
  initializeDidFinishLoadHandler(mainWindow, pendingFiles);
  initializeGetPendingFilesHandler(mainWindow, pendingFiles);
  initializeDroppedFilesHandler();
  initializeOpenFileDialogHandler(mainWindow);
  initializeSelectKeyDialogHandler();
  initializeDeleteFilesHandler();
  initializeIsFileExistsHandler();
  initializeArchiveFilesHandler();
  initializeUnarchiveIfExistsHandler(mainWindow);
  initializeOpenKeysFolderHandler();
  initializeShowFileInFolderHandler();
}

module.exports = {initializeFileHandlers}
