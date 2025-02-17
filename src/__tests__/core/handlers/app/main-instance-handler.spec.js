jest.mock('electron', () => ({
  BrowserWindow: jest.fn()
}));

const path = require('path');
const { BrowserWindow } = require('electron');
const { initializeMainWindow } = require('../../../../core/handlers/app/main-instance-handler');

describe('Main Window', () => {
  let mockWindow;

  beforeEach(() => {
    mockWindow = {
      loadFile: jest.fn()
    };

    BrowserWindow.mockImplementation(() => mockWindow);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create window with correct parameters', () => {
    initializeMainWindow();

    expect(BrowserWindow).toHaveBeenCalledWith({
      width: 1000,
      height: 550,
      resizable: true,
      fullscreenable: true,
      icon: path.join(__dirname, '../../../../', 'assets', 'favicon.ico'),
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, '../../../../', 'core', 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
  });

  it('should load correct HTML file', () => {
    initializeMainWindow();

    expect(mockWindow.loadFile).toHaveBeenCalledWith(
      path.join(__dirname, '../../../../../', 'dist', 'cryptone', 'browser', 'index.html')
    );
  });

  it('should return window instance', () => {
    const window = initializeMainWindow();

    expect(window).toBe(mockWindow);
  });

  it('should create new window instance each time', () => {
    const window1 = initializeMainWindow();
    const window2 = initializeMainWindow();

    expect(BrowserWindow).toHaveBeenCalledTimes(2);
    expect(window1).not.toBe(undefined);
    expect(window2).not.toBe(undefined);
  });
});
