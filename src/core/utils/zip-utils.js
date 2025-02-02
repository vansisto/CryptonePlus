const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip')

function archiveFiles(cfiles) {
  return new Promise((resolve, reject) => {
    const filesPaths = cfiles.map(cfile => cfile.path);

    const archivePath = path.join(path.dirname(filesPaths[0]), 'crtn.zip');

    const zip = new AdmZip();
    filesPaths.forEach(filePath => zip.addLocalFile(filePath));
    zip.addZipComment("crtn")
    zip.writeZip(archivePath);

    const archiveCFile = {
      path: archivePath,
      name: path.basename(archivePath),
      encrypted: false,
      formattedSize: "",
      size: 0
    }

    resolve(archiveCFile);
  })
}

function unarchiveIfExists(archivePath) {
  return new Promise((resolve, reject) => {
    const isArchiveExists = fs.existsSync(archivePath);
    if (isArchiveExists) {
      const zip = new AdmZip(archivePath);
      const zipComment = zip.getZipComment();
      if (zipComment && zipComment === "crtn") {
        zip.extractAllTo(path.join(path.dirname(archivePath), 'decrypted'), true);
        fs.rmSync(archivePath);
        resolve(true);
      }
    }
    resolve(false);
  })
}

module.exports = {
  archiveFiles,
  unarchiveIfExists,
}
