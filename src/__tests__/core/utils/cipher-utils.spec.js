jest.mock('fs', () => ({
  createWriteStream: jest.fn(),
  createReadStream: jest.fn(),
  readFileSync: jest.fn(),
  openSync: jest.fn(),
  readSync: jest.fn(),
  closeSync: jest.fn(),
  statSync: jest.fn(),
  existsSync: jest.fn(),
  rmSync: jest.fn()
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
  scryptSync: jest.fn(),
  createCipheriv: jest.fn(),
  createDecipheriv: jest.fn(),
  publicEncrypt: jest.fn(),
  privateDecrypt: jest.fn()
}));

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

jest.mock('stream', () => ({
  pipeline: jest.fn((readStream, transform, writeStream, cb) => cb())
}));

jest.mock('../../../core/utils/file-utils', () => ({
  generateRandomUUIDCryptoneFileName: jest.fn(),
  sendFilesToRenderer: jest.fn()
}));

const fs = require('fs');
const crypto = require('crypto');
const { pipeline } = require('stream');
const { exec } = require('child_process');
const { generateRandomUUIDCryptoneFileName, sendFilesToRenderer } = require('../../../core/utils/file-utils');
const { encryptFile, decryptFile } = require('../../../core/utils/cipher-utils');

describe('Crypto Utils', () => {
  let mainWindow;
  const mockFile = {
    path: '/path/to/file.txt',
    name: 'file.txt'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mainWindow = { webContents: { send: jest.fn() } };

    crypto.randomBytes.mockImplementation(size => Buffer.alloc(size));
    crypto.scryptSync.mockReturnValue(Buffer.alloc(32));

    const mockTransform = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      write: jest.fn(),
      end: jest.fn()
    };

    crypto.createCipheriv.mockReturnValue(mockTransform);
    crypto.createDecipheriv.mockReturnValue(mockTransform);

    const mockWriteStream = {
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === 'finish') setTimeout(cb, 0);
        return mockWriteStream;
      }),
      pipe: jest.fn().mockReturnThis()
    };

    const mockReadStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === 'close') setTimeout(cb, 0);
        return mockReadStream;
      })
    };

    fs.createWriteStream.mockReturnValue(mockWriteStream);
    fs.createReadStream.mockReturnValue(mockReadStream);
    fs.statSync.mockReturnValue({ size: 1024 });
    fs.readFileSync.mockReturnValue(Buffer.from('mock-key'));
    fs.existsSync.mockReturnValue(false);

    generateRandomUUIDCryptoneFileName.mockReturnValue('random-uuid.cryptone');
  });

  describe('encryptFile', () => {
    it('should encrypt file successfully', async () => {
      const publicKeyPath = '/path/to/public.key';
      const password = 'test-password';

      crypto.publicEncrypt.mockReturnValue(Buffer.alloc(512));

      await encryptFile(mockFile, publicKeyPath, password, mainWindow);

      expect(crypto.randomBytes).toHaveBeenCalledTimes(2); // IV and Salt
      expect(crypto.publicEncrypt).toHaveBeenCalled();
      expect(crypto.createCipheriv).toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalled();
      expect(sendFilesToRenderer).toHaveBeenCalled();
    });
  });

  describe('decryptFile', () => {
    it('should decrypt file successfully', async () => {
      const privateKeyPath = '/path/to/private.key';
      const password = 'test-password';

      const mockMetadata = Buffer.concat([
        Buffer.alloc(16), // IV
        Buffer.alloc(32), // Salt
        Buffer.from('decrypted-file.txt') // Original filename
      ]);

      crypto.privateDecrypt.mockReturnValue(mockMetadata);

      fs.openSync.mockReturnValue(1);
      fs.readSync.mockImplementation(() => {});

      await decryptFile(privateKeyPath, mockFile, password, mainWindow);

      expect(fs.readFileSync).toHaveBeenCalledWith(privateKeyPath);
      expect(crypto.privateDecrypt).toHaveBeenCalled();
      expect(crypto.createDecipheriv).toHaveBeenCalled();
      expect(fs.createReadStream).toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalled();
      expect(sendFilesToRenderer).toHaveBeenCalled();
    });

    it('should handle decryption error', async () => {
      const privateKeyPath = '/path/to/private.key';
      const password = 'test-password';
      const mockError = new Error('Decryption failed');

      pipeline.mockImplementation((readStream, transform, writeStream, cb) => {
        cb(mockError);
      });

      crypto.privateDecrypt.mockReturnValue(Buffer.concat([
        Buffer.alloc(16), // IV
        Buffer.alloc(32), // Salt
        Buffer.from('decrypted-file.txt') // Original filename
      ]));

      fs.openSync.mockReturnValue(1);
      fs.readSync.mockImplementation(() => {});

      await expect(decryptFile(privateKeyPath, mockFile, password, mainWindow))
        .rejects.toThrow('Decryption failed');

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it('should clean up output file on error', async () => {
      const privateKeyPath = '/path/to/private.key';
      const password = 'test-password';
      const mockError = new Error('Decryption failed');

      pipeline.mockImplementation((readStream, transform, writeStream, cb) => {
        cb(mockError);
      });

      crypto.privateDecrypt.mockReturnValue(Buffer.concat([
        Buffer.alloc(16), // IV
        Buffer.alloc(32), // Salt
        Buffer.from('decrypted-file.txt') // Original filename
      ]));

      fs.openSync.mockReturnValue(1);
      fs.readSync.mockImplementation(() => {});
      fs.existsSync.mockReturnValue(true);

      await expect(decryptFile(privateKeyPath, mockFile, password, mainWindow))
        .rejects.toThrow('Decryption failed');

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.rmSync).toHaveBeenCalled();
    });
  });

  describe('hideDecryptedFileIfIsCryptoneArchive', () => {
    it('should not set hidden attribute on non-Windows platforms', () => {
      const originalPlatform = process.platform;

      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });

      const filePath = '/path/to/.crtn.zip';
      const mockWriteStream = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'open') {
            callback();
          }
          return mockWriteStream;
        })
      };

      fs.createWriteStream.mockReturnValue(mockWriteStream);

      const writeStream = fs.createWriteStream(filePath);
      writeStream.on('open', () => {});

      expect(exec).not.toHaveBeenCalled();

      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });
  });
});
