const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let logFilePath = path.join(app.getPath('userData'), 'app.log');

function logInfo(message) {
  fs.appendFileSync(logFilePath, `[${new Date().toISOString()}] INFO: ${message}\n`, 'utf8');
}

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    const files = commandLine.slice(1).filter(arg => !arg.startsWith('--'));
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.webContents.send('files-selected', files);
    }
  })

  app.on('ready', () => {
    const args = process.argv.slice(1);
    const files = args.filter(arg => arg !== '.');

    logInfo(args)

    mainWindow = new BrowserWindow({
      width: 1100,
      height: 520,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    mainWindow.loadFile(path.join(__dirname, 'dist', 'cryptone', 'browser/index.html'));

    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send('files-selected', files);
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}


