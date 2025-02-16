jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn()
  },
  app: {
    getPath: jest.fn(() => '/mock/user/data/path')
  }
}));

const { ipcMain } = require('electron');
const whatsappHandler = require('../../../../core/handlers/ipc/whatsapp-handler');

describe('WhatsApp Handler', () => {
  let mainWindow;

  beforeEach(() => {
    mainWindow = {
      webContents: {
        send: jest.fn()
      }
    };
  });

  describe('Initialize Handlers', () => {
    it('should initialize all WhatsApp handlers', () => {
      whatsappHandler.initializeWhatsAppHandlers(mainWindow);

      expect(ipcMain.handle).toHaveBeenCalledWith('get-whatsapp-contacts', expect.any(Function));
      expect(ipcMain.handle).toHaveBeenCalledWith('send-files-via-whatsapp', expect.any(Function));
    });
  });
});
