const {statSync, readdirSync} = require("node:fs");
const path = require('path');
const fs = require("fs");
const {isCryptoneEncoded} = require("../handlers/crypto/file-crypter-handler")

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

function sendFilesToRenderer(mainWindow, files) {
  if (files && files.length > 0 && mainWindow) {
    const expandedFiles = expandAllPaths(files);
    const mappedFilesToCFiles = expandedFiles
      .map((filePath) => {
        return {
          path: filePath,
          name: path.parse(filePath).base,
          encrypted: isCryptoneEncoded(filePath),
          size: fs.statSync(filePath).size,
        };
      })
    mainWindow.webContents.send('add-files', mappedFilesToCFiles);
    files.splice(0, files.length);
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
