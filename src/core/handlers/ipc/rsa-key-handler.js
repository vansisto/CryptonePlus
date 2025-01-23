const {app, ipcMain, shell} = require("electron");
const {generateKeyPairSync} = require("crypto");
const path = require("path");
const {writeFileSync, mkdirSync, readFileSync} = require("node:fs");

const userDataPath = app.getPath('userData');
const baseKeysPath = path.join(userDataPath, 'CryptoneKeys', 'Offline');

function initializeGenerateKeyPairHandler() {
  ipcMain.handle('generate-key-pair', (event, keyPairName) => {
    const {publicKey, privateKey} = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    const finalKeysFolderPath = path.join(baseKeysPath, keyPairName);
    writeFileSync(path.join(finalKeysFolderPath, `${keyPairName}.public.key`), publicKey);
    writeFileSync(path.join(finalKeysFolderPath, `${keyPairName}.private.key`), privateKey);
  })
}

function initializeOpenKeysFolderHandler() {
  ipcMain.on('open-keys-folder', (event, exactKeysFolder) => {
    try {
      const fullPath = path.join(...[baseKeysPath, exactKeysFolder].filter(Boolean));
      shell.openPath(fullPath);
    } catch (err) {
      console.error('Error during open folder:', err);
    }
  });
}

function initializeCreateRSAKeyPairFolderHandler() {
  ipcMain.on('create-rsa-keypair-folder', (event, folderName) => {
    try {
      mkdirSync(baseKeysPath, { recursive: true });
      const finalFolderPath = path.join(baseKeysPath, folderName);
      mkdirSync(finalFolderPath);
    } catch (err) {
      console.error('Error during folder creation:', err);
    }
  });
}

function initializeGenerateTestFileHandler() {
  ipcMain.on('generate-test-file', () => {
    try {
      const testFilePath = path.join(userDataPath, 'test.txt');

      const dataBuffer = Buffer.from([0xAA, 0xBB, 0xCC, 0xDD])

      writeFileSync(testFilePath, dataBuffer);

      const fileBuffer = readFileSync(testFilePath);
      console.log(fileBuffer);
    } catch (error) {
      console.error(error);
    }
  });
}

function initializeRsaKeysHandlers() {
  initializeGenerateTestFileHandler();
  initializeCreateRSAKeyPairFolderHandler();
  initializeOpenKeysFolderHandler();
  initializeGenerateKeyPairHandler();
}

module.exports = {initializeRsaKeysHandlers};
