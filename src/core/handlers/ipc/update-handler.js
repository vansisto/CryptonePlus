const {autoUpdater} = require("electron-updater");
const {dialog} = require("electron");

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
        autoUpdater.quitAndInstall();
      }
    });
  });
}

function initializeUpdateErrorHandler() {
  autoUpdater.on('error', (error) => {
    dialog.showErrorBox(
      'Auto Update Error',
      `An error occurred while updating: ${error == null ? 'unknown' : (error.stack || error).toString()}`
    );
  });
}

function checkForUpdatesAndNotify() {
  autoUpdater.disableDifferentialDownload = true;
  autoUpdater.checkForUpdatesAndNotify();
}

function initializeUpdateHandlers() {
  initializeUpdateAvailableHandler();
  initializeUpdateDownloadedHandler();
  initializeUpdateErrorHandler();
}

module.exports = {initializeUpdateHandlers, checkForUpdatesAndNotify}
