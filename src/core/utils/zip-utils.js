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

module.exports = {
  archiveFiles,
}
