jest.mock('../../../../core/utils/file-utils', () => ({
  extractFilesFromCommandLine: jest.fn(),
  sendFilesToRenderer: jest.fn()
}));

const { initializeSecondInstanceHandler } = require('../../../../core/handlers/app/second-instance-handler');
const { extractFilesFromCommandLine, sendFilesToRenderer } = require('../../../../core/utils/file-utils');

describe('Second Instance Handler', () => {
  let mainWindow;
  let pendingFiles;
  let commandLine;

  beforeEach(() => {
    pendingFiles = [];
    commandLine = ['app.exe', 'file1.txt', 'file2.txt'];
    mainWindow = {
      isMinimized: jest.fn(),
      restore: jest.fn(),
      focus: jest.fn(),
      webContents: {
        isLoading: jest.fn()
      }
    };

    extractFilesFromCommandLine.mockReturnValue(['file1.txt', 'file2.txt']);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should extract files from command line and add to pending files', () => {
    initializeSecondInstanceHandler(mainWindow, pendingFiles, commandLine);

    expect(extractFilesFromCommandLine).toHaveBeenCalledWith(['file1.txt', 'file2.txt']);
    expect(pendingFiles).toEqual(['file1.txt', 'file2.txt']);
  });

  it('should restore minimized window', () => {
    mainWindow.isMinimized.mockReturnValue(true);

    initializeSecondInstanceHandler(mainWindow, pendingFiles, commandLine);

    expect(mainWindow.restore).toHaveBeenCalled();
    expect(mainWindow.focus).toHaveBeenCalled();
  });

  it('should focus non-minimized window without restoring', () => {
    mainWindow.isMinimized.mockReturnValue(false);

    initializeSecondInstanceHandler(mainWindow, pendingFiles, commandLine);

    expect(mainWindow.restore).not.toHaveBeenCalled();
    expect(mainWindow.focus).toHaveBeenCalled();
  });

  it('should send files to renderer if window is not loading', () => {
    mainWindow.webContents.isLoading.mockReturnValue(false);

    initializeSecondInstanceHandler(mainWindow, pendingFiles, commandLine);

    expect(sendFilesToRenderer).toHaveBeenCalledWith(mainWindow, pendingFiles);
  });

  it('should not send files to renderer if window is loading', () => {
    mainWindow.webContents.isLoading.mockReturnValue(true);

    initializeSecondInstanceHandler(mainWindow, pendingFiles, commandLine);

    expect(sendFilesToRenderer).not.toHaveBeenCalled();
  });

  it('should handle null mainWindow', () => {
    initializeSecondInstanceHandler(null, pendingFiles, commandLine);

    expect(extractFilesFromCommandLine).toHaveBeenCalled();
    expect(pendingFiles).toEqual(['file1.txt', 'file2.txt']);
  });

  it('should handle empty command line', () => {
    extractFilesFromCommandLine.mockReturnValue([]);

    initializeSecondInstanceHandler(mainWindow, pendingFiles, ['app.exe']);

    expect(extractFilesFromCommandLine).toHaveBeenCalledWith([]);
    expect(pendingFiles).toEqual([]);
  });
});
