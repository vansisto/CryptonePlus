const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { randomUUID } = require('crypto');

const RSA_BLOCK_SIZE = 512;
const FILE_TYPE_ENDING = '==CRTF==';
const FILE_TYPE_ENDING_SIZE = FILE_TYPE_ENDING.length;

const IV_SIZE = 16;
const SALT_SIZE = 32;
const AES_ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;

function generateRandomUUIDCryptoneFileName(dirPath) {
  const uuidFileName = `${randomUUID()}.crtn`;
  const fullPath = path.join(dirPath, uuidFileName);
  if (!fs.existsSync(fullPath)) {
    return uuidFileName;
  }
  return generateRandomUUIDCryptoneFileName(dirPath);
}

function encryptContentWithAES(fileBuffer, password, iv, salt) {
  const key = crypto.scryptSync(password, salt, KEY_LENGTH);
  const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);

  return Buffer.concat([
    cipher.update(fileBuffer),
    cipher.final()
  ]);
}

function decryptContentWithAES(encryptedBuffer, password, iv, salt) {
  const key = crypto.scryptSync(password, salt, KEY_LENGTH);
  const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, iv);

  return Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final()
  ]);
}

function isCryptoneEncoded(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const fileData = fs.readFileSync(filePath);
  const endBytes = fileData.slice(fileData.length - FILE_TYPE_ENDING_SIZE);
  return endBytes.toString('ascii') === FILE_TYPE_ENDING;
}

function initializeFileCrypterHandler(mainWindow) {

  ipcMain.handle('encrypt-file', (event, cfile, password, publicKeyPath) => {
    if (!fs.existsSync(cfile.path)) return;
    const fileBuffer = fs.readFileSync(cfile.path);

    const iv = crypto.randomBytes(IV_SIZE);
    const salt = crypto.randomBytes(SALT_SIZE);

    const fileNameBuffer = Buffer.from(cfile.name, 'utf8');
    const metadata = Buffer.concat([iv, salt, fileNameBuffer]);

    const rsaPublicKey = fs.readFileSync(publicKeyPath);
    const rsaEncryptedMetadata = crypto.publicEncrypt(rsaPublicKey, metadata);

    const aesEncryptedContent = encryptContentWithAES(fileBuffer, password, iv, salt);

    const endingBuffer = Buffer.from(FILE_TYPE_ENDING, 'ascii');
    const finalBuffer = Buffer.concat([
      rsaEncryptedMetadata,
      aesEncryptedContent,
      endingBuffer
    ]);

    const outputDir = path.dirname(cfile.path);
    const outputFileName = generateRandomUUIDCryptoneFileName(outputDir);
    const outputFilePath = path.join(outputDir, outputFileName);

    fs.writeFileSync(outputFilePath, finalBuffer);
  });

  ipcMain.handle('decrypt-file', (event, cfile, password, privateKeyPath) => {
    if (!fs.existsSync(cfile.path)) {
      throw new Error('File not found: ' + cfile.path);
    }
    if (!isCryptoneEncoded(cfile.path)) {
      throw new Error('Not a Cryptone encrypted file');
    }

    let fileBuffer = fs.readFileSync(cfile.path);
    fileBuffer = fileBuffer.slice(0, fileBuffer.length - FILE_TYPE_ENDING_SIZE);

    const rsaEncryptedMetadata = fileBuffer.slice(0, RSA_BLOCK_SIZE);
    const aesEncryptedContent = fileBuffer.slice(RSA_BLOCK_SIZE);

    const rsaPrivateKey = fs.readFileSync(privateKeyPath);
    const decryptedMetadata = crypto.privateDecrypt(rsaPrivateKey, rsaEncryptedMetadata);

    const iv = decryptedMetadata.slice(0, IV_SIZE);
    const salt = decryptedMetadata.slice(IV_SIZE, IV_SIZE + SALT_SIZE);
    const originalFileNameBuffer = decryptedMetadata.slice(IV_SIZE + SALT_SIZE);

    const outputDir = path.dirname(cfile.path);
    const originalFileName = originalFileNameBuffer.toString('utf8');
    const outputFilePath = path.join(outputDir, originalFileName);

    const decryptedFileContent = decryptContentWithAES(aesEncryptedContent, password, iv, salt);

    fs.writeFileSync(outputFilePath, decryptedFileContent);
  });

  ipcMain.handle('is-encrypted-file', (event, cfile) => {
    return isCryptoneEncoded(cfile.path);
  });
}

module.exports = {
  initializeFileCrypterHandler,
  isCryptoneEncoded,
};
