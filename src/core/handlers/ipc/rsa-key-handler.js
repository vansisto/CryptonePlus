const {app, ipcMain, shell} = require("electron");
const {generateKeyPairSync} = require("crypto");
const path = require("path");
const {writeFileSync, mkdirSync} = require("node:fs");

const userDataPath = app.getPath('userData');
const baseKeysPath = path.join(userDataPath, 'CryptoneKeys', 'Offline');

function initializeGenerateKeyPairHandler() {
  ipcMain.handle('generate-key-pair', (event, keyPairName) => {
    const {publicKey, privateKey} = generateKeyPair();

    const finalKeysFolderPath = path.join(baseKeysPath, keyPairName);
    writeFileSync(path.join(finalKeysFolderPath, `${keyPairName}.crtn_public_key`), publicKey);
    writeFileSync(path.join(finalKeysFolderPath, `${keyPairName}.crtn_private_key`), privateKey);
  })
}

function initializeGenerateKeysWithDifferentNamesHandler() {
  ipcMain.handle('generate-keys-with-different-names', (event, publicKeyName, privateKeyName) => {
    const {publicKey, privateKey} = generateKeyPair();

    const folderName = `${privateKeyName}_${publicKeyName}`
    const finalKeysFolderPath = path.join(baseKeysPath, folderName);
    writeFileSync(path.join(finalKeysFolderPath, `${publicKeyName}.crtn_public_key`), publicKey);
    writeFileSync(path.join(finalKeysFolderPath, `${privateKeyName}.crtn_private_key`), privateKey);

    return folderName;
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
  initializeGenerateKeyPairHandler();
  initializeGenerateKeysWithDifferentNamesHandler();
}

function generateKeyPair() {
  return generateKeyPairSync('rsa', {
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
}

module.exports = {initializeRsaKeysHandlers};
