const path = require('path');
const fs = require('fs');
const { log } = require('./log-util');
const { app } = require('electron');

const userDataPath = app.getPath('userData');
const storePath = path.join(userDataPath, 'store.json');

const store = {
  get: (key) => {
    try {
      const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      return data[key];
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      const data = fs.existsSync(storePath)
        ? JSON.parse(fs.readFileSync(storePath, 'utf8'))
        : {};
      data[key] = value;
      fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
    } catch (err) {
      log('Error saving to session store:', err);
    }
  },
  delete: (key) => {
    try {
      const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      delete data[key];
      fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
    } catch {
    }
  }
};

module.exports = {
  store
}
