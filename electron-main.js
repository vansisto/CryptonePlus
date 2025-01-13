const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

let mainWindow;
let pendingFiles = [];

log.transports.file.resolvePath = () => {
  return path.join(process.cwd(), 'logs', 'main.log');
};

log.catchErrors({
  showDialog: false,
});

process.on('uncaughtException', (error) => {
  log.error('[uncaughtException]', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('[unhandledRejection]', reason);
});

function initializeApp() {
  const isFirstInstance = app.requestSingleInstanceLock();

  if (!isFirstInstance) {
    log.warn('[initializeApp] Another instance detected, quitting...');
    app.quit();
  } else {
    log.info('[initializeApp] This is the first instance. Proceeding...');
    app.on('second-instance', handleSecondInstance);
    app.on('ready', createFirstInstance);
    app.on('window-all-closed', handleAllWindowsClosed);
  }
}

function handleSecondInstance(event, commandLine) {
  log.info('[handleSecondInstance] Second instance launched, parsing files...');
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
  log.info('[createFirstInstance] Checking for updates...');
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
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  log.info('[createFirstInstance] BrowserWindow created, loading index...');
  mainWindow.loadFile(path.join(__dirname, 'dist', 'cryptone', 'browser', 'index.html'));

  mainWindow.webContents.once('did-finish-load', () => {
    log.info('[createFirstInstance] Main window did-finish-load, sending initial files...');
    sendInitialFilesToRenderer();
  });

  ipcMain.on('get-pending-files', () => {
    log.info('[ipcMain] "get-pending-files" received, sending pending files...');
    sendPendingFilesToRenderer();
  });
}

function handleAllWindowsClosed() {
  log.info('[handleAllWindowsClosed] All windows closed, quitting app...');
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

function sendInitialFilesToRenderer() {
  if (pendingFiles.length > 0 && mainWindow) {
    log.info('[sendInitialFilesToRenderer] Sending initial files to renderer:', pendingFiles);
    mainWindow.webContents.send('files-selected', pendingFiles);
    pendingFiles = [];
  }
}

function sendPendingFilesToRenderer() {
  if (mainWindow && !mainWindow.webContents.isLoading() && pendingFiles.length > 0) {
    log.info('[sendPendingFilesToRenderer] Sending pending files to renderer:', pendingFiles);
    mainWindow.webContents.send('files-selected', pendingFiles);
    pendingFiles = [];
  } else {
    log.info('[sendPendingFilesToRenderer] No files to send or window is still loading...');
  }
}

function extractFilesFromCommandLine(commandLine) {
  return commandLine.filter(arg => !arg.startsWith('--'));
}

initializeApp();

autoUpdater.on('update-available', () => {
  log.info('[autoUpdater] Update available. Downloading...');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update available',
    message: 'A new version is available. Downloading now...',
  });
});

autoUpdater.on('update-downloaded', () => {
  log.info('[autoUpdater] Update downloaded. Prompting user to install.');
  dialog.showMessageBox({
    type: 'info',
    title: 'Update ready',
    message: 'A new version has been downloaded. Quit and install now?',
    buttons: ['Yes', 'Later'],
  }).then(result => {
    if (result.response === 0) {
      log.info('[autoUpdater] User chose to update. Quitting and installing...');
      autoUpdater.quitAndInstall();
    } else {
      log.info('[autoUpdater] User chose "Later". Update deferred.');
    }
  });
});

autoUpdater.on('error', (error) => {
  log.error('[autoUpdater] Error:', error);
  dialog.showErrorBox(
    'Auto Update Error',
    `An error occurred while updating: ${error == null ? 'unknown' : (error.stack || error).toString()}`
  );
});
