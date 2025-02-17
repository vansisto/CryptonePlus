const mockFs = {
  statSync: jest.fn(),
  readdirSync: jest.fn(),
  existsSync: jest.fn(),
  openSync: jest.fn(),
  readSync: jest.fn(),
  closeSync: jest.fn()
};

jest.mock('fs', () => mockFs);

jest.mock('crypto', () => ({
  randomUUID: jest.fn()
}));

const {
  sendFilesToRenderer,
  extractFilesFromCommandLine,
  generateRandomUUIDCryptoneFileName,
  isCryptoneEncoded
} = require('../../../core/utils/file-utils');

describe('File Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendFilesToRenderer', () => {
    let mainWindow;

    beforeEach(() => {
      mainWindow = {
        webContents: {
          send: jest.fn()
        }
      };

      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
        size: 1024
      });

      mockFs.existsSync.mockReturnValue(true);
    });

    it('should not send if no files', () => {
      sendFilesToRenderer(mainWindow, []);
      expect(mainWindow.webContents.send).not.toHaveBeenCalled();
    });

    it('should not send if no window', () => {
      sendFilesToRenderer(null, ['/test/file.txt']);
      expect(mainWindow.webContents.send).not.toHaveBeenCalled();
    });
  });

  describe('extractFilesFromCommandLine', () => {
    it('should extract valid file paths', () => {
      const args = ['--param', '.', '/path/file1.txt', '/path/file2.txt'];
      const result = extractFilesFromCommandLine(args);
      expect(result).toEqual(['/path/file1.txt', '/path/file2.txt']);
    });

    it('should ignore special arguments', () => {
      const args = ['--param1', '--param2', '.', '--param3'];
      const result = extractFilesFromCommandLine(args);
      expect(result).toEqual([]);
    });
  });

  describe('generateRandomUUIDCryptoneFileName', () => {
    it('should generate unique filename', () => {
      const { randomUUID } = require('crypto');
      randomUUID.mockReturnValue('test-uuid');
      mockFs.existsSync.mockReturnValue(false);

      const result = generateRandomUUIDCryptoneFileName('/test/dir');
      expect(result).toBe('test-uuid.crtn');
    });

    it('should retry if file exists', () => {
      const { randomUUID } = require('crypto');
      randomUUID
        .mockReturnValueOnce('existing-uuid')
        .mockReturnValueOnce('new-uuid');

      mockFs.existsSync
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const result = generateRandomUUIDCryptoneFileName('/test/dir');
      expect(result).toBe('new-uuid.crtn');
    });
  });

  describe('isCryptoneEncoded', () => {
    const FILE_TYPE_ENDING = '==CRTF==';

    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.openSync.mockReturnValue(1);
      mockFs.closeSync.mockReturnValue(undefined);
    });

    it('should return true for encoded file', () => {
      mockFs.statSync.mockReturnValue({ size: 100 });
      mockFs.readSync.mockImplementation((fd, buffer) => {
        buffer.write(FILE_TYPE_ENDING);
      });

      const result = isCryptoneEncoded('/test/file.crtn');
      expect(result).toBe(true);
    });

    it('should return false for non-encoded file', () => {
      mockFs.statSync.mockReturnValue({ size: 100 });
      mockFs.readSync.mockImplementation((fd, buffer) => {
        buffer.write('not-encoded');
      });

      const result = isCryptoneEncoded('/test/file.txt');
      expect(result).toBe(false);
    });

    it('should return false for non-existent file', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = isCryptoneEncoded('/test/missing.txt');
      expect(result).toBe(false);
    });

    it('should return false for small file', () => {
      mockFs.statSync.mockReturnValue({ size: 5 });

      const result = isCryptoneEncoded('/test/small.txt');
      expect(result).toBe(false);
    });
  });
});
