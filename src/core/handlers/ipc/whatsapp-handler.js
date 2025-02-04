const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');
const { log } = require('../../utils/log-util');
const puppeteer = require('puppeteer');
const { store } = require('../../utils/store-util');

let client = null;
let isClientReady = false;
const userDataPath = app.getPath('userData');

async function initializeWhatsAppClient(mainWindow) {
  log('## Initializing WhatsApp client...');
  if (!client) {
    log('### No WhatsApp client. Creating new client...');

    let chromePath = puppeteer.executablePath();
    chromePath = chromePath.replace('app.asar', 'app.asar.unpacked');

    const clientId = store.get('clientId') || `client-${Date.now()}`;
    store.set('clientId', clientId);

    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.join(userDataPath, 'whatsapp-sessions'),
        clientId: clientId,
      }),
      puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      },
      webVersionCache: {
        type: 'local',
        path: path.join(userDataPath, '.wwebjs_cache'),
        strict: false
      },
      restartOnAuthFail: true,
    });

    client
      .on('qr', async (qr) => {
        await handleReceivedQR(mainWindow, qr);
      })
      .on('authenticated', () => {
        log('#### WhatsApp Client authenticated. Sending to renderer whatsapp-authenticated...');
        store.set('lastAuthenticated', Date.now());
        mainWindow.webContents.send('whatsapp-authenticated');
      })
      .on('auth_failure', () => {
        log('#### WhatsApp Authentication failure');
        isClientReady = false;
      })
      .on('change_state', (state) => {
        log('#### WhatsApp State changed:', state);
        isClientReady = state === 'CONNECTED';
      })
      .on('disconnected', async (reason) => {
        await reinitializeClient(reason, mainWindow);
      });

    client.once('ready', () => {
      log('### WhatsApp Client once \'ready\' event');
      isClientReady = true;
    });
  }

  if (!isClientReady) {
    log('### WhatsApp Client not ready. Initializing client...');
    try {
      await client.initialize();
      log('#### WhatsApp Client initialized');
    } catch (err) {
      log('#### WhatsApp Error initializing client:', err);
      throw err;
    }
  }
}

function initializeSendFileViaWhatsAppHandler() {
  return ipcMain.handle('send-files-via-whatsapp', async (event, ccontact, cfiles) => {
    log('# send-files-via-whatsapp handler called...');
    try {
      for (const cfile of cfiles) {
        log('[FILE]', JSON.stringify(cfile));
        const media = MessageMedia.fromFilePath(cfile.path);
        await client.sendMessage(ccontact.id._serialized, media);
      }
      return { status: 'ok' };
    } catch (err) {
      throw err;
    }
  });
}

function initializeGetContactsHandler(mainWindow) {
  return ipcMain.handle('get-whatsapp-contacts', async (event) => {
    log('# get-whatsapp-contacts handler called...');
    try {
      await initializeWhatsAppClient(mainWindow);
      if (!isClientReady) {
        log('### Waiting for client to be ready...');
        await waitForClientReady();
      }
      return await getWhatsAppContacts();
    } catch (err) {
      log('### Error in get-whatsapp-contacts:', err);
      throw err;
    }
  });
}


async function getWhatsAppContacts() {
  log('# Getting WhatsApp contacts...');
  try {
    const contacts = (await client.getContacts())
      .filter(contact => (contact.isMyContact && contact.id.server === 'c.us') || contact.isGroup);

    return await getSortedContactsWithProfilesPictures(contacts);
  } catch (err) {
    log('### Error getting WhatsApp contacts:', err);
    throw err;
  }
}

async function getSortedContactsWithProfilesPictures(contacts) {
  const chats = await client.getChats();

  const lastActivityMap = new Map();
  chats.forEach(chat => {
    if (chat.id && chat.timestamp) {
      lastActivityMap.set(chat.id._serialized, chat.timestamp);
    }
  });

  const sortedContacts = await Promise.all(
    contacts.map(async (contact) => {
      let profilePicUrl = null;
      try {
        profilePicUrl = await contact.getProfilePicUrl();
      } catch (err) {
        log('### Error getting profile picture for contact:', contact.id._serialized);
      }
      const lastActive = lastActivityMap.get(contact.id._serialized) || 0;
      return {...contact, profilePicUrl, lastActive};
    })
  );

  sortedContacts.sort((a, b) => b.lastActive - a.lastActive);
  return sortedContacts;
}

async function reinitializeClient(reason, mainWindow) {
  log('#### WhatsApp Client disconnected:', reason);
  isClientReady = false;
  if (reason && reason.toLowerCase().includes('logout')) {
    log('#### Client logged out. Reinitializing client...');

    await resetClient();
    mainWindow.webContents.send('whatsapp-logged-out');

    try {
      await initializeWhatsAppClient(mainWindow);
    } catch (err) {
      log('#### Error reinitializing client:', err);
    }
  }
}

async function resetClient() {
  await client.destroy();
  client = null;
  store.delete('clientId');
  clearSessionsFolder();
}

function clearSessionsFolder() {
  const sessionPath = path.join(userDataPath, 'whatsapp-sessions');
  try {
    fs.rmSync(sessionPath, {recursive: true, force: true});
    log('#### Deleted old session files:', sessionPath);
  } catch (err) {
    log('#### Error deleting session files:', err);
  }
}

async function handleReceivedQR(mainWindow, qr) {
  log('#### WhatsApp QR received. Sending to renderer...');
  try {
    const state = await client.getState();
    if (state !== 'CONNECTED') {
      log('##### WhatsApp Client state - not CONNECTED');
      mainWindow.webContents.send('whatsapp-qr-received', qr);
    }
  } catch (err) {
    log('##### Error getting WhatsApp client state. Sending QR to renderer...');
    mainWindow.webContents.send('whatsapp-qr-received', qr);
  }
}

function waitForClientReady() {
  return new Promise((resolve) => {
    if (isClientReady) {
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (isClientReady) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 30000);
  });
}

function initializeWhatsAppHandlers(mainWindow) {
  initializeGetContactsHandler(mainWindow);
  initializeSendFileViaWhatsAppHandler();
}

module.exports = {
  initializeWhatsAppHandlers,
};
