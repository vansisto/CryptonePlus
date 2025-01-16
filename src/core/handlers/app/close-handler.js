const {app} = require("electron");

function handleAllWindowsClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

module.exports = {
  handleAllWindowsClosed
}
