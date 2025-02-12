const { app, BrowserWindow} = require('electron');
const {initializeRsaKeysHandlers} = require("./handlers/ipc/rsa-key-handler");
const {initializeFileHandlers} = require("./handlers/ipc/file-handler")
const {extractFilesFromCommandLine} = require("./utils/file-utils");
const {initializeUpdateHandlers, checkForUpdatesAndNotify} = require("./handlers/ipc/update-handler")
const {initializeMainWindow} = require("./handlers/app/main-instance-handler")
const {initializeSecondInstanceHandler} = require("./handlers/app/second-instance-handler")
const {handleAllWindowsClosed} = require("./handlers/app/close-handler")
const {initializeFileCrypterHandler} = require("./handlers/crypto/file-crypter-handler");
const {initializeWhatsAppHandlers} = require("./handlers/ipc/whatsapp-handler");
const {log} = require('./utils/log-util');

log('');

let mainWindow;
let pendingFiles = [];

function initializeApp() {
  const isFirstInstance = app.requestSingleInstanceLock();

  if (!isFirstInstance) {
    app.quit();
  } else {
    app.on('ready', createFirstInstance);
    app.on('second-instance', handleSecondInstance);
    app.on('window-all-closed', handleAllWindowsClosed);
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createFirstInstance();
      }
    });
  }
}

function createFirstInstance() {
  checkForUpdatesAndNotify();

  const files = extractFilesFromCommandLine(process.argv.slice(1));
  pendingFiles.push(...files);

  mainWindow = initializeMainWindow();

  initializeFileHandlers(mainWindow, pendingFiles);
  initializeRsaKeysHandlers();
  initializeFileCrypterHandler(mainWindow);
  initializeWhatsAppHandlers(mainWindow);
}

function handleSecondInstance(event, commandLine) {
  initializeSecondInstanceHandler(mainWindow, pendingFiles, commandLine);
}

initializeUpdateHandlers();
initializeApp();
