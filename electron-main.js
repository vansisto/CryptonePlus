const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

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

    if (mainWindow.webContents.isLoading() === false) {
      sendPendingFilesToRenderer();
    }
  }
}
function createFirstInstance() {
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

  mainWindow.loadFile(path.join(__dirname, 'dist', 'cryptone', 'browser', 'index.html'));

  mainWindow.webContents.once('did-finish-load', () => {
    sendInitialFilesToRenderer();
  });

  ipcMain.on('get-pending-files', () => {
    sendPendingFilesToRenderer();
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
  } else {
  }
}

function extractFilesFromCommandLine(commandLine) {
  return commandLine.filter(arg => !arg.startsWith('--'));
}

initializeApp();
