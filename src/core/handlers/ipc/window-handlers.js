const {ipcMain} = require("electron");

function initializeWindowHandlers(mainWindow) {
  ipcMain.handle('zoom-in', (event, window) => {
    mainWindow.webContents.zoomFactor += 0.1;
    return mainWindow.webContents.zoomFactor;
  });
  ipcMain.handle('zoom-out', (event, window) => {
    mainWindow.webContents.zoomFactor -= 0.1;
    return mainWindow.webContents.zoomFactor;
  });
  ipcMain.handle('set-zoom', (event, zoomFactor) => {
    mainWindow.webContents.zoomFactor = zoomFactor;
  });
}

module.exports = {initializeWindowHandlers}
