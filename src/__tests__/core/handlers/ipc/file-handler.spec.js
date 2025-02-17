jest.mock('electron', () => ({
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn()
  },
  dialog: {
    showOpenDialog: jest.fn()
  },
  app: {
    getPath: jest.fn(() => '/mock/user/data/path')
  },
  shell: {
    openPath: jest.fn(),
    showItemInFolder: jest.fn()
  }
}));

jest.mock('../../../../core/utils/file-utils', () => ({
  collectRecursivelyFilePaths: jest.fn(),
  sendFilesToRenderer: jest.fn(),
  isCryptoneEncoded: jest.fn()
}));

jest.mock('../../../../core/utils/zip-utils', () => ({
  archiveFiles: jest.fn(),
  unarchiveIfExists: jest.fn()
}));

jest.mock('../../../../core/utils/log-util', () => ({
  error: jest.fn()
}));

const fs = require('fs');
const path = require('path');
const { ipcMain, dialog, shell } = require('electron');
const { initializeFileHandlers } = require('../../../../core/handlers/ipc/file-handler');
const { sendFilesToRenderer, collectRecursivelyFilePaths, isCryptoneEncoded } = require('../../../../core/utils/file-utils');
const { archiveFiles, unarchiveIfExists } = require('../../../../core/utils/zip-utils');
const { error } = require('../../../../core/utils/log-util');

describe('File Handlers', () => {
  let mainWindow;
  let pendingFiles;

  beforeEach(() => {
    mainWindow = {
      webContents: {
        once: jest.fn(),
        isLoading: jest.fn()
      }
    };
    pendingFiles = [];
    jest.clearAllMocks();
    jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
    jest.spyOn(fs, 'statSync').mockImplementation(() => ({ size: 1024 }));
    jest.spyOn(fs, 'rmSync').mockImplementation(() => {});
  });

  describe('didFinishLoad Handler', () => {
    it('should send pending files when window loads', () => {
      initializeFileHandlers(mainWindow, ['file1.txt', 'file2.txt']);

      const didFinishLoadCallback = mainWindow.webContents.once.mock.calls.find(
        call => call[0] === 'did-finish-load'
      )[1];

      didFinishLoadCallback();

      expect(sendFilesToRenderer).toHaveBeenCalledWith(
        mainWindow,
        ['file1.txt', 'file2.txt']
      );
    });
  });

  describe('getPendingFiles Handler', () => {
    it('should send pending files when requested', () => {
      initializeFileHandlers(mainWindow, ['file1.txt', 'file2.txt']);

      const getPendingFilesHandler = ipcMain.on.mock.calls.find(
        call => call[0] === 'get-pending-files'
      )[1];

      getPendingFilesHandler();

      expect(sendFilesToRenderer).toHaveBeenCalledWith(
        mainWindow,
        ['file1.txt', 'file2.txt']
      );
    });
  });

  describe('Dropped Files Handler', () => {
    it('should handle dropped files', () => {
      const mockPaths = ['/path/to/file1.txt', '/path/to/folder'];

      collectRecursivelyFilePaths.mockImplementation((path, files) => {
        if (path === '/path/to/file1.txt') {
          files.push('/path/to/file1.txt');
        } else {
          files.push('/path/to/folder/file2.txt');
        }
      });

      isCryptoneEncoded.mockImplementation(path => path.includes('file2.txt'));

      initializeFileHandlers(mainWindow, pendingFiles);
      const droppedHandler = ipcMain.on.mock.calls.find(
        call => call[0] === 'dropped-files'
      )[1];

      const mockEvent = { reply: jest.fn() };
      droppedHandler(mockEvent, mockPaths);

      expect(mockEvent.reply).toHaveBeenCalledWith('add-files', expect.arrayContaining([
        expect.objectContaining({
          path: '/path/to/file1.txt',
          name: 'file1.txt',
          encrypted: false,
          size: 1024
        }),
        expect.objectContaining({
          path: '/path/to/folder/file2.txt',
          name: 'file2.txt',
          encrypted: true,
          size: 1024
        })
      ]));
    });
  });

  describe('Open File Dialog Handler', () => {
    it('should send files to renderer when files are selected', async () => {
      dialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/path/to/file1.txt', '/path/to/file2.txt']
      });

      initializeFileHandlers(mainWindow, pendingFiles);
      const openFileHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'open-file-dialog'
      )[1];

      await openFileHandler();

      expect(sendFilesToRenderer).toHaveBeenCalledWith(
        mainWindow,
        ['/path/to/file1.txt', '/path/to/file2.txt']
      );
    });

    it('should handle dialog cancellation', async () => {
      dialog.showOpenDialog.mockResolvedValue({ canceled: true });

      initializeFileHandlers(mainWindow, pendingFiles);
      const openFileHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'open-file-dialog'
      )[1];

      await openFileHandler();

      expect(sendFilesToRenderer).not.toHaveBeenCalled();
    });
  });

  describe('Select Key Dialog Handler', () => {
    it('should open dialog for public key selection', async () => {
      dialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/path/to/key.crtn_public_key']
      });

      initializeFileHandlers(mainWindow, pendingFiles);
      const selectKeyHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'select-key-dialog'
      )[1];

      const result = await selectKeyHandler({}, true);

      expect(dialog.showOpenDialog).toHaveBeenCalledWith({
        properties: ['openFile'],
        defaultPath: expect.any(String),
        filters: [{
          name: 'Cryptone public key',
          extensions: ['crtn_public_key']
        }]
      });
      expect(result).toBe('/path/to/key.crtn_public_key');
    });

    it('should open dialog for private key selection', async () => {
      dialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/path/to/key.crtn_private_key']
      });

      initializeFileHandlers(mainWindow, pendingFiles);
      const selectKeyHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'select-key-dialog'
      )[1];

      await selectKeyHandler({}, false);

      expect(dialog.showOpenDialog).toHaveBeenCalledWith({
        properties: ['openFile'],
        defaultPath: expect.any(String),
        filters: [{
          name: 'Cryptone private key',
          extensions: ['crtn_private_key']
        }]
      });
    });

    it('should handle dialog cancellation', async () => {
      dialog.showOpenDialog.mockResolvedValue({ canceled: true });

      initializeFileHandlers(mainWindow, pendingFiles);
      const selectKeyHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'select-key-dialog'
      )[1];

      const result = await selectKeyHandler({}, true);

      expect(result).toBeUndefined();
    });

    it('should handle dialog error', async () => {
      const mockError = new Error('Dialog error');
      dialog.showOpenDialog.mockRejectedValue(mockError);

      initializeFileHandlers(mainWindow, pendingFiles);
      const selectKeyHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'select-key-dialog'
      )[1];

      await selectKeyHandler({}, true);

      expect(error).toHaveBeenCalledWith('Error opening key selection dialog:', mockError);
    });
  });

  describe('Delete Files Handler', () => {
    it('should delete specified files', async () => {
      const mockFiles = [
        { path: '/path/to/file1.txt' },
        { path: '/path/to/file2.txt' }
      ];

      initializeFileHandlers(mainWindow, pendingFiles);
      const deleteHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'delete-files'
      )[1];

      await deleteHandler({}, mockFiles);

      expect(fs.rmSync).toHaveBeenCalledTimes(2);
      expect(fs.rmSync).toHaveBeenCalledWith('/path/to/file1.txt');
      expect(fs.rmSync).toHaveBeenCalledWith('/path/to/file2.txt');
    });
  });

  describe('File Exists Handler', () => {
    it('should check if file exists', async () => {
      const mockFile = { path: '/path/to/file.txt' };
      fs.existsSync.mockReturnValue(true);

      initializeFileHandlers(mainWindow, pendingFiles);
      const existsHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'file-exists'
      )[1];

      const result = await existsHandler({}, mockFile);

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/file.txt');
    });
  });

  describe('Archive Files Handler', () => {
    it('should archive files', async () => {
      const mockFiles = [
        { path: '/path/to/file1.txt' },
        { path: '/path/to/file2.txt' }
      ];
      archiveFiles.mockResolvedValue(true);

      initializeFileHandlers(mainWindow, pendingFiles);
      const archiveHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'archive-files'
      )[1];

      const result = await archiveHandler({}, mockFiles);

      expect(result).toBe(true);
      expect(archiveFiles).toHaveBeenCalledWith(mockFiles);
    });
  });

  describe('Unarchive Files Handler', () => {
    it('should unarchive if archive exists', async () => {
      const mockFilePath = '/path/to/file.txt';
      unarchiveIfExists.mockResolvedValue(true);

      initializeFileHandlers(mainWindow, pendingFiles);
      const unarchiveHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'unarchive-if-exists'
      )[1];

      const result = await unarchiveHandler({}, mockFilePath);

      expect(result).toBe(true);
      expect(unarchiveIfExists).toHaveBeenCalledWith(
        path.join(path.dirname(mockFilePath), '.crtn.zip'),
        mainWindow
      );
    });
  });

  describe('Open Keys Folder Handler', () => {
    it('should open existing keys folder', () => {
      initializeFileHandlers(mainWindow, pendingFiles);
      const openFolderHandler = ipcMain.on.mock.calls.find(
        call => call[0] === 'open-keys-folder'
      )[1];

      openFolderHandler({}, 'test-folder');

      expect(shell.openPath).toHaveBeenCalledWith(
        path.join('/mock/user/data/path', 'CryptoneKeys', 'Offline', 'test-folder')
      );
    });

    it('should handle non-existent keys folder', () => {
      fs.existsSync.mockReturnValue(false);

      initializeFileHandlers(mainWindow, pendingFiles);
      const openFolderHandler = ipcMain.on.mock.calls.find(
        call => call[0] === 'open-keys-folder'
      )[1];

      openFolderHandler({}, 'test-folder');

      expect(error).toHaveBeenCalledWith(
        'Keys folder does not exist:',
        path.join('/mock/user/data/path', 'CryptoneKeys', 'Offline', 'test-folder')
      );
    });
  });

  describe('Show File in Folder Handler', () => {
    it('should show file in folder', async () => {
      const mockFile = { path: '/path/to/file.txt' };

      initializeFileHandlers(mainWindow, pendingFiles);
      const showFileHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'show-file-in-folder'
      )[1];

      await showFileHandler({}, mockFile);

      expect(shell.showItemInFolder).toHaveBeenCalledWith('/path/to/file.txt');
    });
  });

  describe('Is Keys Folder Exists Handler', () => {
    it('should check if keys folder exists', async () => {
      initializeFileHandlers(mainWindow, pendingFiles);
      const isKeysFolderExistsHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'is-keys-folder-exists'
      )[1];

      const result = await isKeysFolderExistsHandler();

      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(
        path.join('/mock/user/data/path', 'CryptoneKeys', 'Offline')
      );
    });
  });
});
