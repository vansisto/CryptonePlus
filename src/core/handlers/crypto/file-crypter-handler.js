const {ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const {randomUUID} = require('crypto');

const SALT_SIZE = 32;
const IV_SIZE = 16;
const RSA_ENCRYPTED_METADATA_LENGTH = 512;
const FILE_TYPE_ENDING = "==CRTF=="
const FILE_TYPE_ENDING_SIZE = FILE_TYPE_ENDING.length;

const AES_ALGORITHM = "aes-256-cbc";
const KEY_LENGTH = 32;

function encryptContentWithAES(content, password, iv, salt) {
  const key = crypto.scryptSync(password, salt, KEY_LENGTH);
  const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);
  cipher.update(content);
  return cipher.final();
}

function decryptContentWithAES(encryptedContent, password, iv, salt) {
  const key = crypto.scryptSync(password, salt, KEY_LENGTH);
  const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, iv);
  decipher.update(encryptedContent);
  return decipher.final();
}

function generateRandomUUIDCryptoneFileName(filePath) {
  const uuidFileName = `${randomUUID().toString()}.crtn`;
  if (!fs.existsSync(path.join(filePath, uuidFileName))) {
    return uuidFileName;
  }
  return generateRandomUUIDCryptoneFileName(filePath);
}


function isCryptoneEncoded(filePath) {
  if (fs.existsSync(filePath)) {
    const file = fs.readFileSync(filePath).toString('utf8');
    const fileTypeEnding = file.substring(file.length - FILE_TYPE_ENDING_SIZE);
    return fileTypeEnding === FILE_TYPE_ENDING;
  }
}

function initializeFileCrypterHandler(mainWindow) {
  ipcMain.handle('encrypt-file', (event, cfile, password, publicKeyPath) => {
    if (fs.existsSync(cfile.path)) {
      const iv = crypto.randomBytes(IV_SIZE);
      const salt = crypto.randomBytes(SALT_SIZE);
      const fileContentToEncrypt = fs.readFileSync(cfile.path);
      const metaData = "".concat(
        iv.toString(),
        salt.toString(),
        cfile.name,
      );
      const rsaPublicKey = fs.readFileSync(publicKeyPath);
      const metaDataEncryptedWithRsa = crypto.publicEncrypt(rsaPublicKey, metaData);
      const aesEncryptedContent = encryptContentWithAES(fileContentToEncrypt, password, iv, salt);
      const encryptedFileContent = "".concat(
        metaDataEncryptedWithRsa.toString(),
        aesEncryptedContent.toString(),
        FILE_TYPE_ENDING,
      );

      const outputFilePath = path.dirname(cfile.path);
      fs.writeFileSync(path.join(outputFilePath, generateRandomUUIDCryptoneFileName(outputFilePath)), encryptedFileContent);
    }
  });

  ipcMain.handle('decrypt-file', (event, cfile, password, privateKeyPath) => {
    if (fs.existsSync(cfile.path) && isCryptoneEncoded(cfile.path)) {
      let encryptedFile = fs.readFileSync(cfile.path).toString();
      encryptedFile = encryptedFile.substring(0, encryptedFile.length - FILE_TYPE_ENDING_SIZE)

      const encryptedMetaData = encryptedFile.substring(0, RSA_ENCRYPTED_METADATA_LENGTH);
      const encryptedContent = encryptedFile.substring(RSA_ENCRYPTED_METADATA_LENGTH)

      const rsaPrivateKey = fs.readFileSync(privateKeyPath);
      const decryptedMetaData = crypto.privateDecrypt(rsaPrivateKey, encryptedMetaData).toString();
      const iv = decryptedMetaData.substring(0, IV_SIZE - 1)
      const salt = decryptedMetaData.substring(IV_SIZE, SALT_SIZE - 1)
      const fileName = decryptedMetaData.substring(IV_SIZE + SALT_SIZE)

      const decryptedFileContent = decryptContentWithAES(encryptedContent, password, iv, salt);
      fs.writeFileSync(fileName, decryptedFileContent);
    }
  })

  ipcMain.handle('is-encrypted-file', (event, cfile) => {
    return isCryptoneEncoded(cfile);
  })
}

module.exports = {
  initializeFileCrypterHandler,
  isCryptoneEncoded,
};
