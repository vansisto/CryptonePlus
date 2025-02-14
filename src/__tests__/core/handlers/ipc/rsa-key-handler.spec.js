jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/user/data/path')
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn()
  }
}));

const path = require('path');
const fs = require('fs');
const { initializeRsaKeysHandlers } = require('../../../../core/handlers/ipc/rsa-key-handler');

describe('RSA Key Handler', () => {
  const mockBaseKeysPath = path.join('/mock/user/data/path', 'CryptoneKeys', 'Offline');
  const testKeypairName = 'test-keypair';

  beforeEach(() => {
    if (!fs.existsSync(mockBaseKeysPath)) {
      fs.mkdirSync(mockBaseKeysPath, { recursive: true });
    }

    const finalKeysFolderPath = path.join(mockBaseKeysPath, testKeypairName);
    if (!fs.existsSync(finalKeysFolderPath)) {
      fs.mkdirSync(finalKeysFolderPath, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(mockBaseKeysPath)) {
      fs.rmSync(mockBaseKeysPath, { recursive: true, force: true });
    }
    jest.clearAllMocks();
  });

  it('should generate a keypair with specified name', async () => {
    initializeRsaKeysHandlers();

    const generateKeyPairHandler = require('electron').ipcMain.handle.mock.calls.find(
      call => call[0] === 'generate-key-pair'
    );

    if (!generateKeyPairHandler) {
      throw new Error('Handler for generate-key-pair was not registered');
    }

    await generateKeyPairHandler[1](null, testKeypairName);

    const publicKeyPath = path.join(mockBaseKeysPath, testKeypairName, `${testKeypairName}.crtn_public_key`);
    const privateKeyPath = path.join(mockBaseKeysPath, testKeypairName, `${testKeypairName}.crtn_private_key`);

    expect(fs.existsSync(publicKeyPath)).toBe(true);
    expect(fs.existsSync(privateKeyPath)).toBe(true);
  });

  it('should register all required handlers', () => {
    initializeRsaKeysHandlers();

    const { ipcMain } = require('electron');
    expect(ipcMain.on).toHaveBeenCalledWith('create-rsa-keypair-folder', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('generate-key-pair', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('generate-keys-with-different-names', expect.any(Function));
  });
});
