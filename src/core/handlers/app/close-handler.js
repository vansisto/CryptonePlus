const {app} = require("electron");

function handleAllWindowsClosed() {
  app.quit();
}

module.exports = {
  handleAllWindowsClosed
}
