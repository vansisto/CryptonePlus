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
        type: 'pkcs1',
        format: 'pem',
      },
    });

    const finalKeysFolderPath = path.join(baseKeysPath, keyPairName);
    writeFileSync(path.join(finalKeysFolderPath, `${keyPairName}.crtn_public_key`), publicKey);
    writeFileSync(path.join(finalKeysFolderPath, `${keyPairName}.crtn_private_key`), privateKey);
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

function initializeRsaKeysHandlers() {
  initializeCreateRSAKeyPairFolderHandler();
  initializeOpenKeysFolderHandler();
  initializeGenerateKeyPairHandler();
}

module.exports = {initializeRsaKeysHandlers};
