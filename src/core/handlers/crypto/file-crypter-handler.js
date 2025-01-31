const { ipcMain } = require('electron');
const fs = require('fs');
const {
  buildFileMetadata,
  encryptFile,
  decryptFile,
  buildEncodedFilePath,
  buildDecodedFilePath,
} = require('../../utils/cipher-utils')

const { isCryptoneEncoded } = require('../../utils/file-utils')

function initializeFileCrypterHandler(mainWindow) {

  ipcMain.handle('encrypt-file', (event, cfile, password, publicKeyPath) => {
    if (!fs.existsSync(cfile.path)) return {
      success: false,
      message: 'File does not exist',
    };

    const rsaPublicKey = fs.readFileSync(publicKeyPath);
    const fileBuffer = fs.readFileSync(cfile.path);
    const fileMetadata = buildFileMetadata(cfile);

    const outputFilePath = buildEncodedFilePath(cfile);

    try {
      const finalBuffer = encryptFile(rsaPublicKey, fileBuffer, password, fileMetadata);

      fs.writeFileSync(outputFilePath, finalBuffer);
      return {
        success: true,
        message: 'File encrypted',
      }
    } catch (error) {
      return {
        success: false,
        message: 'Encryption error',
      };
    }
  });

  ipcMain.handle('decrypt-file', (event, cfile, password, privateKeyPath) => {
    if (!fs.existsSync(cfile.path)) return {
      success: false,
      message: 'File does not exist',
    }
    if (!isCryptoneEncoded(cfile.path)) return {
      success: false,
      message: 'File is not Cryptone Encrypted',
    }

    try {
      const {originalFileNameBuffer, decryptedFileContent} = decryptFile(cfile, privateKeyPath, password);

      const outputFilePath = buildDecodedFilePath(cfile, originalFileNameBuffer);
      fs.writeFileSync(outputFilePath, decryptedFileContent);

      return {
        success: true,
        message: 'File decrypted',
      }
    } catch (error) {
      return {
        success: false,
        message: 'Decryption error',
      };
    }
  });

  ipcMain.handle('is-encrypted-file', (event, cfile) => {
    return isCryptoneEncoded(cfile.path);
  });
}

module.exports = {
  initializeFileCrypterHandler,
};
