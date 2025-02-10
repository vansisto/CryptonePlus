const { app } = require('electron');
const fs = require('fs');
const path = require('path');

function log(message, ...args) {
  const userDataPath = app.getPath('userData');
  const logFilePath = path.join(userDataPath, 'app.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message} ${args}\n`;

  console.log(logMessage);
  fs.appendFile(logFilePath, logMessage, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

function error(message, ...args) {
  log(`[ERROR] ${message}`, ...args);
}

module.exports = { log, error };
