const {BrowserWindow} = require("electron");
const path = require("path");

function initializeMainWindow() {
  let mainWindow = new BrowserWindow({
    width: 1250,
    height: 600,
    resizable: false,
    icon: path.join(__dirname, '../../../', 'assets', 'favicon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../../', 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../../../../', 'dist', 'cryptone', 'browser', 'index.html'));

  return mainWindow;
}

module.exports = {
  initializeMainWindow
}
