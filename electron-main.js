const { app, BrowserWindow, ipcMain, dialog, shell} = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const {writeFileSync, readFileSync, statSync, readdirSync, mkdirSync} = require("node:fs");
const {generateKeyPairSync} = require("crypto");

let mainWindow;
let pendingFiles = [];
const userDataPath = app.getPath('userData');
const baseKeysPath = path.join(userDataPath, 'CryptoneKeys', 'Offline');

function initializeApp() {
  const isFirstInstance = app.requestSingleInstanceLock();

  if (!isFirstInstance) {
    app.quit();
  } else {
    app.on('second-instance', handleSecondInstance);
    app.on('ready', createFirstInstance);
    app.on('window-all-closed', handleAllWindowsClosed);
  }
}

function handleSecondInstance(event, commandLine) {
  const files = extractFilesFromCommandLine(commandLine.slice(1));
  pendingFiles.push(...files);

  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    if (!mainWindow.webContents.isLoading()) {
      sendPendingFilesToRenderer();
    }
  }
}

function createFirstInstance() {
  autoUpdater.checkForUpdatesAndNotify();

  const files = extractFilesFromCommandLine(process.argv.slice(1));
  pendingFiles.push(...files);

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 520,
    resizable: false,
    icon: path.join(__dirname, 'src', 'assets', 'favicon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'dist', 'cryptone', 'browser', 'index.html'));

  mainWindow.webContents.once('did-finish-load', () => {
    sendInitialFilesToRenderer();
  });

  ipcMain.on('get-pending-files', () => {
    sendPendingFilesToRenderer();
  });

  ipcMain.on('dropped-files', (event, paths) => {
    const allFiles = [];

    for (const fileOrFolderPath of paths) {
      collectRecursivelyFilePaths(fileOrFolderPath, allFiles);
    }

    event.reply('files-selected', allFiles);
  });

  ipcMain.on('generate-test-file', () => {
    try {
      const testFilePath = path.join(userDataPath, 'test.txt');

      const dataBuffer = Buffer.from([0xAA, 0xBB, 0xCC, 0xDD])

      writeFileSync(testFilePath, dataBuffer);

      const fileBuffer = readFileSync(testFilePath);
      console.log(fileBuffer);
    } catch (error) {
      console.error(error);
    }
  })

  ipcMain.on('create-rsa-keypair-folder', (event, folderName) => {
    console.log("Create rsa keypair folder")
    try {
      mkdirSync(baseKeysPath, { recursive: true });
      const finalFolderPath = path.join(baseKeysPath, folderName);
      mkdirSync(finalFolderPath);
    } catch (err) {
      console.error('Error during folder creation:', err);
    }
  });

  ipcMain.on('open-keys-folder', (event, exactKeysFolder) => {
    try {
      const fullPath = path.join(...[baseKeysPath, exactKeysFolder].filter(Boolean));
      shell.openPath(fullPath);
    } catch (err) {
      console.error('Error during open folder:', err);
    }
  });

  ipcMain.handle('generate-key-pair', (event, keyPairName) => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    const finalKeysFolderPath = path.join(baseKeysPath, keyPairName);
    writeFileSync(path.join(finalKeysFolderPath, `${keyPairName}.public.key`), publicKey);
    writeFileSync(path.join(finalKeysFolderPath, `${keyPairName}.private.key`), privateKey);
  });
}

function handleAllWindowsClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

function sendInitialFilesToRenderer() {
  if (pendingFiles.length > 0 && mainWindow) {
    const expandedFiles = expandAllPaths(pendingFiles);
    mainWindow.webContents.send('files-selected', expandedFiles);
    pendingFiles = [];
  }
}

function sendPendingFilesToRenderer() {
  if (mainWindow && !mainWindow.webContents.isLoading() && pendingFiles.length > 0) {
    const expandedFiles = expandAllPaths(pendingFiles);
    mainWindow.webContents.send('files-selected', expandedFiles);
    pendingFiles = [];
  }
}

function expandAllPaths(paths) {
  const allFiles = [];

  for (const p of paths) {
    collectRecursivelyFilePaths(p, allFiles);
  }

  return allFiles;
}

function extractFilesFromCommandLine(commandLine) {
  return commandLine
    .filter(arg => !arg.startsWith('--'))
    .filter(arg => arg !== '.');
}

function collectRecursivelyFilePaths(fileOrFolderPath, filePaths) {
  const stats = statSync(fileOrFolderPath);

  if (stats.isDirectory()) {
    const filesInDirectory = readdirSync(fileOrFolderPath);
    for (const name of filesInDirectory) {
      const fullPath = path.join(fileOrFolderPath, name);
      collectRecursivelyFilePaths(fullPath, filePaths);
    }
  } else {
    filePaths.push(fileOrFolderPath);
  }
}

function handleUpdates() {
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: 'A new version is available. Downloading now...',
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update ready',
      message: 'A new version has been downloaded. Quit and install now?',
      buttons: ['Yes', 'Later'],
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (error) => {
    dialog.showErrorBox(
      'Auto Update Error',
      `An error occurred while updating: ${error == null ? 'unknown' : (error.stack || error).toString()}`
    );
  });
}

initializeApp();
handleUpdates();
