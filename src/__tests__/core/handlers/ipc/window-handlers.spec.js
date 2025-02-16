jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn()
  }
}));

const { ipcMain } = require('electron');
const { initializeWindowHandlers } = require('../../../../core/handlers/ipc/window-handlers');

describe('Window Handler', () => {
  let mainWindow;

  beforeEach(() => {
    jest.clearAllMocks();

    mainWindow = {
      webContents: {
        zoomFactor: 1.0
      }
    };
  });

  describe('Zoom In Handler', () => {
    it('should increase zoom factor by 0.1', () => {
      initializeWindowHandlers(mainWindow);

      const zoomInHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'zoom-in'
      )[1];

      const result = zoomInHandler();

      expect(mainWindow.webContents.zoomFactor).toBe(1.1);
      expect(result).toBe(1.1);
    });
  });

  describe('Zoom Out Handler', () => {
    it('should decrease zoom factor by 0.1', () => {
      initializeWindowHandlers(mainWindow);

      const zoomOutHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'zoom-out'
      )[1];

      const result = zoomOutHandler();

      expect(mainWindow.webContents.zoomFactor).toBe(0.9);
      expect(result).toBe(0.9);
    });
  });

  describe('Set Zoom Handler', () => {
    it('should set exact zoom factor', () => {
      initializeWindowHandlers(mainWindow);

      const setZoomHandler = ipcMain.handle.mock.calls.find(
        call => call[0] === 'set-zoom'
      )[1];

      setZoomHandler({}, 1.5);

      expect(mainWindow.webContents.zoomFactor).toBe(1.5);
    });
  });

  describe('Initialize Window Handlers', () => {
    it('should register all window handlers', () => {
      initializeWindowHandlers(mainWindow);

      expect(ipcMain.handle).toHaveBeenCalledWith('zoom-in', expect.any(Function));
      expect(ipcMain.handle).toHaveBeenCalledWith('zoom-out', expect.any(Function));
      expect(ipcMain.handle).toHaveBeenCalledWith('set-zoom', expect.any(Function));
    });
  });
});
