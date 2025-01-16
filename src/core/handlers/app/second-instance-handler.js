const {extractFilesFromCommandLine, sendFilesToRenderer} = require("../../utils/file-utils");

function initializeSecondInstanceHandler(mainWindow, pendingFiles, commandLine) {
  const files = extractFilesFromCommandLine(commandLine.slice(1));
  pendingFiles.push(...files);

  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    if (!mainWindow.webContents.isLoading()) {
      sendFilesToRenderer(mainWindow, pendingFiles);
    }
  }
}

module.exports = {
  initializeSecondInstanceHandler
}
