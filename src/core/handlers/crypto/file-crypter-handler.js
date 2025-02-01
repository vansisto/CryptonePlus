const { ipcMain } = require('electron');
const fs = require('fs');
const {
  encryptFile,
  decryptFile,
} = require('../../utils/cipher-utils')
const { isCryptoneEncoded } = require('../../utils/file-utils')

function initializeFileCrypterHandler() {
  ipcMain.handle('encrypt-file', async (event, cfile, password, publicKeyPath) => {
    if (!fs.existsSync(cfile.path)) return { success: false, message: 'File does not exist' };

    await encryptFile(cfile, publicKeyPath, password);

    return { success: true, message: 'File encrypted' };
  });

  ipcMain.handle('decrypt-file', async (event, cfile, password, privateKeyPath) => {
    if (!fs.existsSync(cfile.path)) return { success: false, message: 'File does not exist' };
    if (!isCryptoneEncoded(cfile.path)) return { success: false, message: 'File is not Cryptone Encrypted' };

    try {
      await decryptFile(privateKeyPath, cfile, password);

      return { success: true, message: 'File decrypted' };
    } catch (error) {
      return { success: false, message: 'Decryption error' };
    }
  });
}

module.exports = {
  initializeFileCrypterHandler,
};
