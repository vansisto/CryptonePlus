jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn()
  }
}));

jest.mock('../../../../core/utils/cipher-utils', () => ({
  encryptFile: jest.fn(),
  decryptFile: jest.fn()
}));

jest.mock('../../../../core/utils/file-utils', () => ({
  isCryptoneEncoded: jest.fn()
}));

const fs = require('fs');
const { initializeFileCrypterHandler } = require('../../../../core/handlers/crypto/file-crypter-handler');
const { encryptFile, decryptFile } = require('../../../../core/utils/cipher-utils');
const { isCryptoneEncoded } = require('../../../../core/utils/file-utils');

describe('File Crypter Handler', () => {
  const mockMainWindow = {};
  const mockFile = {
    path: '/path/to/test/file.txt'
  };
  const mockPassword = 'test-password';
  const mockPublicKeyPath = '/path/to/public/key';
  const mockPrivateKeyPath = '/path/to/private/key';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
  });

  describe('encrypt-file handler', () => {
    it('should handle file encryption successfully', async () => {
      encryptFile.mockResolvedValue(undefined);

      initializeFileCrypterHandler(mockMainWindow);

      const encryptHandler = require('electron').ipcMain.handle.mock.calls.find(
        call => call[0] === 'encrypt-file'
      );

      if (!encryptHandler) {
        throw new Error('Handler for encrypt-file was not registered');
      }

      const result = await encryptHandler[1](null, mockFile, mockPassword, mockPublicKeyPath);

      expect(result).toEqual({ success: true, message: 'File encrypted' });
      expect(encryptFile).toHaveBeenCalledWith(mockFile, mockPublicKeyPath, mockPassword, mockMainWindow);
    });

    it('should handle non-existent file', async () => {
      fs.existsSync.mockReturnValue(false);

      initializeFileCrypterHandler(mockMainWindow);

      const encryptHandler = require('electron').ipcMain.handle.mock.calls.find(
        call => call[0] === 'encrypt-file'
      );

      const result = await encryptHandler[1](null, mockFile, mockPassword, mockPublicKeyPath);

      expect(result).toEqual({ success: false, message: 'File does not exist' });
      expect(encryptFile).not.toHaveBeenCalled();
    });
  });

  describe('decrypt-file handler', () => {
    it('should handle file decryption successfully', async () => {
      isCryptoneEncoded.mockReturnValue(true);
      decryptFile.mockResolvedValue(undefined);

      initializeFileCrypterHandler(mockMainWindow);

      const decryptHandler = require('electron').ipcMain.handle.mock.calls.find(
        call => call[0] === 'decrypt-file'
      );

      if (!decryptHandler) {
        throw new Error('Handler for decrypt-file was not registered');
      }

      const result = await decryptHandler[1](null, mockFile, mockPassword, mockPrivateKeyPath);

      expect(result).toEqual({ success: true, message: 'File decrypted' });
      expect(decryptFile).toHaveBeenCalledWith(mockPrivateKeyPath, mockFile, mockPassword, mockMainWindow);
    });

    it('should handle non-existent file', async () => {
      fs.existsSync.mockReturnValue(false);

      initializeFileCrypterHandler(mockMainWindow);

      const decryptHandler = require('electron').ipcMain.handle.mock.calls.find(
        call => call[0] === 'decrypt-file'
      );

      const result = await decryptHandler[1](null, mockFile, mockPassword, mockPrivateKeyPath);

      expect(result).toEqual({ success: false, message: 'File does not exist' });
      expect(decryptFile).not.toHaveBeenCalled();
    });

    it('should handle non-Cryptone encoded file', async () => {
      isCryptoneEncoded.mockReturnValue(false);

      initializeFileCrypterHandler(mockMainWindow);

      const decryptHandler = require('electron').ipcMain.handle.mock.calls.find(
        call => call[0] === 'decrypt-file'
      );

      const result = await decryptHandler[1](null, mockFile, mockPassword, mockPrivateKeyPath);

      expect(result).toEqual({ success: false, message: 'File is not Cryptone Encrypted' });
      expect(decryptFile).not.toHaveBeenCalled();
    });

    it('should handle decryption error', async () => {
      isCryptoneEncoded.mockReturnValue(true);
      decryptFile.mockRejectedValue(new Error('Decryption failed'));

      initializeFileCrypterHandler(mockMainWindow);

      const decryptHandler = require('electron').ipcMain.handle.mock.calls.find(
        call => call[0] === 'decrypt-file'
      );

      const result = await decryptHandler[1](null, mockFile, mockPassword, mockPrivateKeyPath);

      expect(result).toEqual({ success: false, message: 'Decryption error' });
      expect(decryptFile).toHaveBeenCalled();
    });
  });
});
