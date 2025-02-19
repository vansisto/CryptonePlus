const {statSync, readdirSync} = require("node:fs");
const path = require('path');
const fs = require("fs");
const {randomUUID} = require("crypto");

const READ_FLAG = 'r';
const FILE_TYPE_ENDING = '==CRTF==';
const FILE_TYPE_ENDING_SIZE = FILE_TYPE_ENDING.length;

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

function generateRandomUUIDCryptoneFileName(dirPath) {
  const uuidFileName = `${randomUUID()}.crtn`;
  const fullPath = path.join(dirPath, uuidFileName);
  if (!fs.existsSync(fullPath)) {
    return uuidFileName;
  }
  return generateRandomUUIDCryptoneFileName(dirPath);
}

function isCryptoneEncoded(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const stats = fs.statSync(filePath);
  if (stats.size < FILE_TYPE_ENDING_SIZE) return false;

  const fileDescriptor = fs.openSync(filePath, READ_FLAG);
  const buffer = Buffer.alloc(FILE_TYPE_ENDING_SIZE);

  fs.readSync(fileDescriptor, buffer, 0, FILE_TYPE_ENDING_SIZE, stats.size - FILE_TYPE_ENDING_SIZE);
  fs.closeSync(fileDescriptor);

  return buffer.toString('ascii') === FILE_TYPE_ENDING;
}

module.exports = {
  collectRecursivelyFilePaths,
  sendFilesToRenderer,
  extractFilesFromCommandLine,
  generateRandomUUIDCryptoneFileName,
  isCryptoneEncoded,
}
