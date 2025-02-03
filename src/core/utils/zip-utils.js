const fs = require('fs');
const path = require('path');
const archiver = require('archiver')
const { exec } = require('child_process')
const StreamZip = require('node-stream-zip');

function archiveFiles(cfiles) {
  return new Promise((resolve, reject) => {
    const filesPaths = cfiles.map(cfile => cfile.path);
    const archivePath = path.join(path.dirname(filesPaths[0]), '.crtn.zip');

    const archiverInstance = prepareArchiverInstance(reject);
    const writeStream = createWriteStream(archivePath, archiverInstance, resolve, reject);
    archiverInstance.pipe(writeStream);

    filesPaths.forEach(filePath => {
      archiverInstance.file(filePath, { name: path.basename(filePath) });
    });

    archiverInstance.finalize();
  });
}

function unarchiveIfExists(archivePath) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(archivePath)) {
      return resolve(false);
    }
    try {
      const zip = new StreamZip.async({ file: archivePath });
      const zipComment = await zip.comment;

      if (zipComment && zipComment === "crtn") {
        const outputDir = path.join(path.dirname(archivePath), 'decrypted');
        fs.mkdirSync(outputDir, { recursive: true });
        await zip.extract(null, outputDir);
        await zip.close();
        fs.rmSync(archivePath);
        return resolve(true);
      }
      await zip.close();
      resolve(false);
    } catch (err) {
      reject(err);
    }
  });
}

function createWriteStream(archivePath, archive, resolve, reject) {
  const writeStream = fs.createWriteStream(archivePath);

  writeStream.on("open", () => {
    if (process.platform === "win32") {
      exec(`attrib +h "${archivePath}"`, (err) => {
        if (err) {
          console.error("Error setting hidden attribute:", err);
        }
      });
    }
  });

  writeStream.on("close", () => {
    const archiveCFile = {
      path: archivePath,
      name: path.basename(archivePath),
      encrypted: false,
      formattedSize: "",
      size: archive.pointer()
    };
    resolve(archiveCFile);
  });
  writeStream.on("error", err => reject(err));
  return writeStream;
}

function prepareArchiverInstance(reject) {
  const archiverInstance = archiver("zip", {
    zlib: {level: 0},
    zip64: true,
    comment: "crtn"
  });
  archiverInstance.on("error", err => reject(err));
  return archiverInstance;
}

module.exports = {
  archiveFiles,
  unarchiveIfExists,
}
