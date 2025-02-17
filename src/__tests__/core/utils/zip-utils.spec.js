jest.mock('fs', () => ({
  createWriteStream: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  rmSync: jest.fn()
}));

jest.mock('archiver', () => jest.fn());
jest.mock('node-stream-zip', () => ({ async: jest.fn() }));
jest.mock('child_process', () => ({ exec: jest.fn() }));
jest.mock('../../../core/utils/file-utils', () => ({
  sendFilesToRenderer: jest.fn()
}));
jest.mock('../../../core/utils/log-util', () => ({
  log: jest.fn(),
  error: jest.fn()
}));

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const StreamZip = require('node-stream-zip');
const { exec } = require('child_process');
const { sendFilesToRenderer } = require('../../../core/utils/file-utils');
const { archiveFiles, unarchiveIfExists } = require('../../../core/utils/zip-utils');

describe('Archive Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('archiveFiles', () => {
    const mockFiles = [
      { path: '/test/file1.txt' },
      { path: '/test/file2.txt' }
    ];

    let mockArchiver;
    let mockWriteStream;

    beforeEach(() => {
      mockArchiver = {
        pipe: jest.fn(),
        file: jest.fn(),
        finalize: jest.fn(),
        on: jest.fn(),
        pointer: jest.fn().mockReturnValue(1024)
      };

      mockWriteStream = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'close') setTimeout(callback, 0);
          return mockWriteStream;
        })
      };

      archiver.mockReturnValue(mockArchiver);
      fs.createWriteStream.mockReturnValue(mockWriteStream);
    });

    it('should archive files successfully', async () => {
      const archiveResult = await archiveFiles(mockFiles);

      expect(archiver).toHaveBeenCalledWith('zip', {
        zlib: { level: 0 },
        zip64: true,
        comment: 'crtn'
      });

      expect(mockArchiver.pipe).toHaveBeenCalled();
      expect(mockArchiver.file).toHaveBeenCalledTimes(2);
      expect(mockArchiver.finalize).toHaveBeenCalled();

      expect(archiveResult).toEqual({
        path: path.join(path.dirname(mockFiles[0].path), '.crtn.zip'),
        name: '.crtn.zip',
        encrypted: false,
        formattedSize: '',
        size: 1024
      });
    });

    it('should set hidden attribute on Windows', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true
      });

      archiveFiles(mockFiles);

      // Trigger 'open' event
      const openCallback = mockWriteStream.on.mock.calls
        .find(call => call[0] === 'open')[1];
      openCallback();

      expect(exec).toHaveBeenCalledWith(
        `attrib +h "${path.join(path.dirname(mockFiles[0].path), '.crtn.zip')}"`,
        expect.any(Function)
      );

      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });

    it('should handle archiver error', async () => {
      const mockError = new Error('Archiver error');
      mockArchiver.on.mockImplementation((event, callback) => {
        if (event === 'error') callback(mockError);
      });

      await expect(archiveFiles(mockFiles)).rejects.toThrow('Archiver error');
    });
  });

  describe('unarchiveIfExists', () => {
    const archivePath = '/test/.crtn.zip';
    const mainWindow = { webContents: { send: jest.fn() } };

    let mockZip;

    beforeEach(() => {
      mockZip = {
        comment: 'crtn',
        extract: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined)
      };

      StreamZip.async.mockReturnValue(mockZip);
    });

    it('should return false if archive does not exist', async () => {
      fs.existsSync.mockReturnValue(false);

      const result = await unarchiveIfExists(archivePath, mainWindow);

      expect(result).toBe(false);
      expect(StreamZip.async).not.toHaveBeenCalled();
    });

    it('should extract archive with crtn comment', async () => {
      fs.existsSync.mockReturnValue(true);

      const result = await unarchiveIfExists(archivePath, mainWindow);

      expect(StreamZip.async).toHaveBeenCalledWith({ file: archivePath });
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(path.dirname(archivePath), 'decrypted'),
        { recursive: true }
      );
      expect(mockZip.extract).toHaveBeenCalled();
      expect(mockZip.close).toHaveBeenCalled();
      expect(fs.rmSync).toHaveBeenCalledWith(archivePath);
      expect(sendFilesToRenderer).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if archive has no crtn comment', async () => {
      fs.existsSync.mockReturnValue(true);
      mockZip.comment = 'not-crtn';

      const result = await unarchiveIfExists(archivePath, mainWindow);

      expect(mockZip.extract).not.toHaveBeenCalled();
      expect(mockZip.close).toHaveBeenCalled();
      expect(fs.rmSync).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle extraction error', async () => {
      fs.existsSync.mockReturnValue(true);
      const mockError = new Error('Extraction failed');
      mockZip.extract.mockRejectedValue(mockError);

      await expect(unarchiveIfExists(archivePath, mainWindow))
        .rejects.toThrow('Extraction failed');
    });
  });
});
