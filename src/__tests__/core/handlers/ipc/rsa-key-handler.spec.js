jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => process.env.RUNNER_TEMP || require('os').tmpdir())
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn()
  }
}));

const path = require('path');
const fs = require('fs');
const os = require('os');
const { initializeRsaKeysHandlers } = require('../../../../core/handlers/ipc/rsa-key-handler');

describe('RSA Key Handler', () => {
  const mockBaseKeysPath = path.join(
    process.env.RUNNER_TEMP || os.tmpdir(),
    'CryptoneKeys',
    'Offline'
  );
  const testKeypairName = 'test-keypair';
  const testPublicKeyName = 'public-key';
  const testPrivateKeyName = 'private-key';
  const testDifferentNamesFolderName = `${testPrivateKeyName}_${testPublicKeyName}`;

  beforeEach(() => {
    jest.restoreAllMocks();

    if (!fs.existsSync(mockBaseKeysPath)) {
      fs.mkdirSync(mockBaseKeysPath, { recursive: true });
    }

    const sameNamesFolderPath = path.join(mockBaseKeysPath, testKeypairName);
    if (!fs.existsSync(sameNamesFolderPath)) {
      fs.mkdirSync(sameNamesFolderPath, { recursive: true });
    }

    const differentNamesFolderPath = path.join(mockBaseKeysPath, testDifferentNamesFolderName);
    if (!fs.existsSync(differentNamesFolderPath)) {
      fs.mkdirSync(differentNamesFolderPath, { recursive: true });
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

  it('should generate keys with different names', async () => {
    initializeRsaKeysHandlers();

    const generateKeysHandler = require('electron').ipcMain.handle.mock.calls.find(
      call => call[0] === 'generate-keys-with-different-names'
    );

    if (!generateKeysHandler) {
      throw new Error('Handler for generate-keys-with-different-names was not registered');
    }

    const folderName = await generateKeysHandler[1](null, testPublicKeyName, testPrivateKeyName);

    expect(folderName).toBe(`${testPrivateKeyName}_${testPublicKeyName}`);

    const publicKeyPath = path.join(mockBaseKeysPath, folderName, `${testPublicKeyName}.crtn_public_key`);
    const privateKeyPath = path.join(mockBaseKeysPath, folderName, `${testPrivateKeyName}.crtn_private_key`);

    expect(fs.existsSync(publicKeyPath)).toBe(true);
    expect(fs.existsSync(privateKeyPath)).toBe(true);
  });

  it('should create RSA keypair folder', () => {
    initializeRsaKeysHandlers();

    const createFolderHandler = require('electron').ipcMain.on.mock.calls.find(
      call => call[0] === 'create-rsa-keypair-folder'
    );

    if (!createFolderHandler) {
      throw new Error('Handler for create-rsa-keypair-folder was not registered');
    }

    const testFolderName = 'test-folder';
    createFolderHandler[1](null, testFolderName);

    const folderPath = path.join(mockBaseKeysPath, testFolderName);
    expect(fs.existsSync(folderPath)).toBe(true);
  });

  it('should register all required handlers', () => {
    jest.restoreAllMocks();

    initializeRsaKeysHandlers();

    const { ipcMain } = require('electron');
    expect(ipcMain.on).toHaveBeenCalledWith('create-rsa-keypair-folder', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('generate-key-pair', expect.any(Function));
    expect(ipcMain.handle).toHaveBeenCalledWith('generate-keys-with-different-names', expect.any(Function));
  });
});
