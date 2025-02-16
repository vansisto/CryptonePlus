jest.mock('electron-updater', () => ({
  autoUpdater: {
    on: jest.fn(),
    quitAndInstall: jest.fn(),
    checkForUpdatesAndNotify: jest.fn()
  }
}));

jest.mock('electron', () => ({
  dialog: {
    showMessageBox: jest.fn()
  },
  app: {
    getPath: jest.fn(() => '/mock/user/data/path')
  }
}));

jest.mock('../../../../core/utils/log-util', () => ({
  error: jest.fn()
}));

const fs = require('fs');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { dialog, app } = require('electron');
const { error } = require('../../../../core/utils/log-util');
const { initializeUpdateHandlers, checkForUpdatesAndNotify } = require('../../../../core/handlers/ipc/update-handler');

describe('Update Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  describe('Update Available Handler', () => {
    it('should show message box when update is available', () => {
      dialog.showMessageBox.mockResolvedValue({});
      initializeUpdateHandlers();

      const updateAvailableHandler = autoUpdater.on.mock.calls.find(
        call => call[0] === 'update-available'
      )[1];

      updateAvailableHandler();

      expect(dialog.showMessageBox).toHaveBeenCalledWith({
        type: 'info',
        title: 'Update available',
        message: 'A new version is available. Downloading now...',
      });
    });
  });

  describe('Update Downloaded Handler', () => {
    it('should show message box and install when user confirms', async () => {
      dialog.showMessageBox.mockResolvedValue({ response: 0 });
      initializeUpdateHandlers();

      const updateDownloadedHandler = autoUpdater.on.mock.calls.find(
        call => call[0] === 'update-downloaded'
      )[1];

      await updateDownloadedHandler();

      expect(dialog.showMessageBox).toHaveBeenCalledWith({
        type: 'info',
        title: 'Update ready',
        message: 'A new version has been downloaded. Quit and install now?',
        buttons: ['Yes', 'Later'],
      });

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join('/mock/user/data/path', 'update-mode'),
        ''
      );
      expect(autoUpdater.quitAndInstall).toHaveBeenCalled();
    });

    it('should not install when user cancels', async () => {
      dialog.showMessageBox.mockResolvedValue({ response: 1 });
      initializeUpdateHandlers();

      const updateDownloadedHandler = autoUpdater.on.mock.calls.find(
        call => call[0] === 'update-downloaded'
      )[1];

      await updateDownloadedHandler();

      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(autoUpdater.quitAndInstall).not.toHaveBeenCalled();
    });
  });

  describe('Update Error Handler', () => {
    it('should log error when update fails', () => {
      initializeUpdateHandlers();

      const updateErrorHandler = autoUpdater.on.mock.calls.find(
        call => call[0] === 'error'
      )[1];

      updateErrorHandler(new Error('Update failed'));

      expect(error).toHaveBeenCalledWith('An error occurred while updating');
    });
  });

  describe('Check For Updates', () => {
    it('should call checkForUpdatesAndNotify', () => {
      checkForUpdatesAndNotify();

      expect(autoUpdater.checkForUpdatesAndNotify).toHaveBeenCalled();
    });
  });

  describe('Initialize Update Handlers', () => {
    it('should register all update handlers', () => {
      initializeUpdateHandlers();

      expect(autoUpdater.on).toHaveBeenCalledWith('update-available', expect.any(Function));
      expect(autoUpdater.on).toHaveBeenCalledWith('update-downloaded', expect.any(Function));
      expect(autoUpdater.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });
});
