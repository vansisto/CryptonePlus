const { ipcMain } = require('electron');
const fs = require('fs');
const {
  encryptFile,
  decryptFile,
} = require('../../utils/cipher-utils')
const { isCryptoneEncoded } = require('../../utils/file-utils')

function initializeFileCrypterHandler(mainWindow) {
  ipcMain.handle('encrypt-file', async (event, cfile, password, publicKeyPath) => {
    if (!fs.existsSync(cfile.path)) return { success: false, message: 'File does not exist' };

    await encryptFile(cfile, publicKeyPath, password, mainWindow);

    return { success: true, message: 'File encrypted' };
  });

  ipcMain.handle('decrypt-file', async (event, cfile, password, privateKeyPath) => {
    if (!fs.existsSync(cfile.path)) return { success: false, message: 'File does not exist' };
    if (!isCryptoneEncoded(cfile.path)) return { success: false, message: 'File is not Cryptone Encrypted' };

    return await decryptFile(privateKeyPath, cfile, password, mainWindow)
      .then(() => {
        return { success: true, message: 'File decrypted' }
      })
      .catch(() => {
        return { success: false, message: 'Decryption error' }
      });
  });
}

module.exports = {
  initializeFileCrypterHandler,
};
