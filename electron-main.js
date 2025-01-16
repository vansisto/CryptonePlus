const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let pendingFiles = [];

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
    event.reply('files-selected', paths);
  });
}

function handleAllWindowsClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

function sendInitialFilesToRenderer() {
  if (pendingFiles.length > 0 && mainWindow) {
    mainWindow.webContents.send('files-selected', pendingFiles);
    pendingFiles = [];
  }
}

function sendPendingFilesToRenderer() {
  if (mainWindow && !mainWindow.webContents.isLoading() && pendingFiles.length > 0) {
    mainWindow.webContents.send('files-selected', pendingFiles);
    pendingFiles = [];
  }
}

function extractFilesFromCommandLine(commandLine) {
  return commandLine.filter(arg => !arg.startsWith('--'));
}

initializeApp();

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
