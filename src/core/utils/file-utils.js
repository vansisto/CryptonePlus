const {statSync, readdirSync} = require("node:fs");
const path = require('path');

function collectRecursivelyFilePaths(fileOrFolderPath, filePaths) {
  const stats = statSync(fileOrFolderPath);

  if (stats.isDirectory()) {
    const filesInDirectory = readdirSync(fileOrFolderPath);
    for (const name of filesInDirectory) {
      const fullPath = path.join(fileOrFolderPath, name);
      collectRecursivelyFilePaths(fullPath, filePaths);
    }
  } else {
    filePaths.push(fileOrFolderPath);
  }
}

function sendFilesToRenderer(mainWindow, pendingFiles) {
  if (pendingFiles && pendingFiles.length > 0 && mainWindow) {
    const expandedFiles = expandAllPaths(pendingFiles);
    mainWindow.webContents.send('files-selected', expandedFiles);
    pendingFiles.splice(0, pendingFiles.length);
  }
}

function expandAllPaths(paths) {
  const allFiles = [];

  for (const p of paths) {
    collectRecursivelyFilePaths(p, allFiles);
  }

  return allFiles;
}

function extractFilesFromCommandLine(commandLine) {
  return commandLine
    .filter(arg => !arg.startsWith('--'))
    .filter(arg => arg !== '.');
}

module.exports = {
  collectRecursivelyFilePaths,
  sendFilesToRenderer,
  extractFilesFromCommandLine
}
