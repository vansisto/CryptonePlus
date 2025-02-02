const { app} = require('electron');
const {initializeRsaKeysHandlers} = require("./handlers/ipc/rsa-key-handler");
const {initializeFileHandlers} = require("./handlers/ipc/file-handler")
const {extractFilesFromCommandLine} = require("./utils/file-utils");
const {initializeUpdateHandlers, checkForUpdatesAndNotify} = require("./handlers/ipc/update-handler")
const {initializeMainWindow} = require("./handlers/app/main-instance-handler")
const {initializeSecondInstanceHandler} = require("./handlers/app/second-instance-handler")
const {handleAllWindowsClosed} = require("./handlers/app/close-handler")
const {initializeFileCrypterHandler} = require("./handlers/crypto/file-crypter-handler");
const path = require("path");
const fs = require("fs");

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
  }
}

function createFirstInstance() {
  const updateModeFile = path.join(app.getPath("userData"), "update-mode");
  if (fs.existsSync(updateModeFile)) {
    fs.rmSync(updateModeFile);
  }
  checkForUpdatesAndNotify();

  const files = extractFilesFromCommandLine(process.argv.slice(1));
  pendingFiles.push(...files);

  mainWindow = initializeMainWindow();

  initializeFileHandlers(mainWindow, pendingFiles);
  initializeRsaKeysHandlers();
}

function handleSecondInstance(event, commandLine) {
  initializeSecondInstanceHandler(mainWindow, pendingFiles, commandLine);
}

initializeUpdateHandlers();
initializeApp();
initializeFileCrypterHandler();
