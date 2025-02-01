const { ipcMain } = require('electron');
const fs = require('fs');
const {
  buildFileMetadata,
  encryptFile,
  decryptFile,
  buildEncodedFilePath,
  buildDecodedFilePath,
} = require('../../utils/cipher-utils')
const crypto = require('crypto');
const { isCryptoneEncoded } = require('../../utils/file-utils')

const AES_ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const FILE_TYPE_ENDING = '==CRTF==';
const FILE_TYPE_ENDING_SIZE = FILE_TYPE_ENDING.length;
const RSA_BLOCK_SIZE = 512;
const IV_SIZE = 16;
const SALT_SIZE = 32;

function initializeFileCrypterHandler() {

  ipcMain.handle('encrypt-file', async (event, cfile, password, publicKeyPath) => {
    if (!fs.existsSync(cfile.path)) return { success: false, message: 'File does not exist' };

    const rsaPublicKey = fs.readFileSync(publicKeyPath);
    const fileMetadata = buildFileMetadata(cfile);
    const outputFilePath = buildEncodedFilePath(cfile);

    const rsaEncryptedMetadata = crypto.publicEncrypt(
      rsaPublicKey,
      Buffer.concat([
        fileMetadata.iv,
        fileMetadata.salt,
        Buffer.from(cfile.name, 'utf8')
      ])
    );

    const aesKey = crypto.scryptSync(password, fileMetadata.salt, KEY_LENGTH);
    const cipher = crypto.createCipheriv(AES_ALGORITHM, aesKey, fileMetadata.iv);

    const readStream = fs.createReadStream(cfile.path);
    const outputStream = fs.createWriteStream(outputFilePath);

    outputStream.write(rsaEncryptedMetadata);

    await new Promise((resolve, reject) => {
      readStream
        .on('close', () => {
          outputStream.end(Buffer.from(FILE_TYPE_ENDING, 'ascii'));
          resolve();
        })
        .on('error', () => {
          reject('Error occurred during file encryption');
        });

      readStream
        .pipe(cipher)
        .pipe(outputStream, { end: false });
    });

    return { success: true, message: 'File encrypted' };
  });

  ipcMain.handle('decrypt-file', async (event, cfile, password, privateKeyPath) => {
    if (!fs.existsSync(cfile.path)) return { success: false, message: 'File does not exist' };
    if (!isCryptoneEncoded(cfile.path)) return { success: false, message: 'File is not Cryptone Encrypted' };

    try {
      const fileDescriptor = fs.openSync(cfile.path, 'r');
      const rsaMetaBuffer = Buffer.alloc(RSA_BLOCK_SIZE);
      fs.readSync(fileDescriptor, rsaMetaBuffer, 0, RSA_BLOCK_SIZE, 0);
      fs.closeSync(fileDescriptor);

      const rsaPrivateKey = fs.readFileSync(privateKeyPath);
      const decryptedMetadata = crypto.privateDecrypt(rsaPrivateKey, rsaMetaBuffer);
      const { iv, salt, originalFileNameBuffer } = parseEncryptedMetadata(decryptedMetadata);

      const aesKey = crypto.scryptSync(password, salt, KEY_LENGTH);
      const decipher = crypto.createDecipheriv(AES_ALGORITHM, aesKey, iv);

      const outputFilePath = buildDecodedFilePath(cfile, originalFileNameBuffer);
      const outputStream = fs.createWriteStream(outputFilePath);


      await new Promise((resolve, reject) => {
        const fileSize = fs.statSync(cfile.path).size;
        const contentStart = RSA_BLOCK_SIZE;
        const contentEnd = fileSize - FILE_TYPE_ENDING_SIZE - 1;

        const readStream = fs.createReadStream(cfile.path, { start: contentStart, end: contentEnd });
        readStream
          .on('close', resolve)
          .on('error', () => {
            reject('Error occurred during file decryption')
          });

        readStream
          .pipe(decipher)
          .pipe(outputStream);
      });

      return { success: true, message: 'File decrypted' };
    } catch (error) {
      return { success: false, message: 'Decryption error' };
    }
  });
}

function parseEncryptedMetadata(decryptedMetadata) {
  const iv = decryptedMetadata.slice(0, IV_SIZE);
  const salt = decryptedMetadata.slice(IV_SIZE, IV_SIZE + SALT_SIZE);
  const originalFileNameBuffer = decryptedMetadata.slice(IV_SIZE + SALT_SIZE);
  return {iv, salt, originalFileNameBuffer};
}

module.exports = {
  initializeFileCrypterHandler,
};
