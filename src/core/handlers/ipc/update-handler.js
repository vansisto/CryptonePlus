const {autoUpdater} = require("electron-updater");
const {dialog} = require("electron");
const path = require("path");
const fs = require("fs");
const { app } = require('electron');

function initializeUpdateAvailableHandler() {
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: 'A new version is available. Downloading now...',
    });
  });
}

function initializeUpdateDownloadedHandler() {
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update ready',
      message: 'A new version has been downloaded. Quit and install now?',
      buttons: ['Yes', 'Later'],
    }).then(result => {
      if (result.response === 0) {
        const updateModeFile = path.join(app.getPath("userData"), "update-mode");
        fs.writeFileSync(updateModeFile, "");
        autoUpdater.quitAndInstall();
      }
    });
  });
}

function initializeUpdateErrorHandler() {
  autoUpdater.on('error', () => {
    dialog.showErrorBox(
      'Auto Update Error',
      'An error occurred while updating'
    );
  });
}

function checkForUpdatesAndNotify() {
  autoUpdater.checkForUpdatesAndNotify();
}

function initializeUpdateHandlers() {
  initializeUpdateAvailableHandler();
  initializeUpdateDownloadedHandler();
  initializeUpdateErrorHandler();
}

module.exports = {initializeUpdateHandlers, checkForUpdatesAndNotify}
