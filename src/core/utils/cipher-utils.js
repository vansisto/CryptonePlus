const fs = require("fs");
const path = require("path");
const { generateRandomUUIDCryptoneFileName, sendFilesToRenderer} = require('./file-utils');
const crypto = require('crypto');
const { pipeline } = require('stream');
const { exec } = require('child_process');

const AES_ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const FILE_TYPE_ENDING = '==CRTF==';
const FILE_TYPE_ENDING_SIZE = FILE_TYPE_ENDING.length;
const IV_SIZE = 16;
const SALT_SIZE = 32;
const RSA_BLOCK_SIZE = 512;

async function encryptFile(cfile, publicKeyPath, password, mainWindow) {
  const fileMetadata = buildFileMetadata(cfile);
  const outputFilePath = buildEncodedFilePath(cfile);
  const outputStream = fs.createWriteStream(outputFilePath);
  const rsaEncryptedMetadata = encryptMetadataWithRSA(publicKeyPath, fileMetadata, cfile);
  outputStream.write(rsaEncryptedMetadata);

  await encryptContentWithAESToFile(cfile, outputStream, password, fileMetadata, outputFilePath, mainWindow);
}

async function decryptFile(privateKeyPath, cfile, password, mainWindow) {
  const rsaPrivateKey = fs.readFileSync(privateKeyPath);
  const decryptedMetadata = decryptMetadataWithRSA(cfile, rsaPrivateKey);
  const {iv, salt, originalFileNameBuffer} = parseEncryptedMetadata(decryptedMetadata);
  return await decryptContentWithAESToFile(cfile, password, salt, iv, originalFileNameBuffer, mainWindow);
}

async function encryptContentWithAESToFile(cfile, outputStream, password, fileMetadata, outputFilePath, mainWindow) {
  await new Promise((resolve, reject) => {
    const aesKey = crypto.scryptSync(password, fileMetadata.salt, KEY_LENGTH);
    const {cipher, readStream} = createEncryptionPipelineComponents(aesKey, fileMetadata, cfile);

    readStream
      .on('close', () => {
        outputStream.end(Buffer.from(FILE_TYPE_ENDING, 'ascii'))
        outputStream.on('finish', () => {
          sendFilesToRenderer(mainWindow, [outputFilePath]);
          resolve();
        });
      })
      .on('error', reject)
      .pipe(cipher)
      .pipe(outputStream, {end: false});
  });
}

async function decryptContentWithAESToFile(cfile, password, salt, iv, originalFileNameBuffer, mainWindow) {
  return await new Promise((resolve, reject) => {
    const { contentStart, contentEnd } = buildFileContentRange(cfile);
    const readStream = fs.createReadStream(cfile.path, { start: contentStart, end: contentEnd });
    const { decipher, writeStream } = createDecryptionPipelineComponents(password, salt, iv, cfile, originalFileNameBuffer);

    pipeline(
      readStream,
      decipher,
      writeStream,
      (err) => {
        if (err) {
          const outFilePath = buildDecodedFilePath(cfile, originalFileNameBuffer);
          if (fs.existsSync(outFilePath)) {
            try {
              fs.rmSync(outFilePath);
            } catch (rmErr) {
              console.error('Error while removing output file:', rmErr);
            }
          }
          return reject(err);
        }
        sendFilesToRenderer(mainWindow, [buildDecodedFilePath(cfile, originalFileNameBuffer)]);
        resolve();
      }
    );
  });
}

function encryptMetadataWithRSA(publicKeyPath, fileMetadata, cfile) {
  const rsaPublicKey = fs.readFileSync(publicKeyPath);
  return crypto.publicEncrypt(
    rsaPublicKey,
    Buffer.concat([
      fileMetadata.iv,
      fileMetadata.salt,
      Buffer.from(cfile.name, 'utf8')
    ])
  );
}

function decryptMetadataWithRSA(cfile, rsaPrivateKey) {
  const fileDescriptor = fs.openSync(cfile.path, 'r');
  const rsaMetaBuffer = Buffer.alloc(RSA_BLOCK_SIZE);
  fs.readSync(fileDescriptor, rsaMetaBuffer, 0, RSA_BLOCK_SIZE, 0);
  fs.closeSync(fileDescriptor);
  return crypto.privateDecrypt(rsaPrivateKey, rsaMetaBuffer);
}

function createEncryptionPipelineComponents(aesKey, fileMetadata, cfile) {
  const cipher = crypto.createCipheriv(AES_ALGORITHM, aesKey, fileMetadata.iv);
  const readStream = fs.createReadStream(cfile.path);
  return {cipher, readStream};
}

function createDecryptionPipelineComponents(password, salt, iv, cfile, originalFileNameBuffer) {
  const aesKey = crypto.scryptSync(password, salt, KEY_LENGTH);
  const decipher = crypto.createDecipheriv(AES_ALGORITHM, aesKey, iv);
  const outputFilePath = buildDecodedFilePath(cfile, originalFileNameBuffer);
  const writeStream = fs.createWriteStream(outputFilePath);
  hideDecryptedFileIfIsCryptoneArchive(writeStream, outputFilePath);
  return {decipher, writeStream};
}

function buildEncodedFilePath(cfile) {
  const outputDir = path.dirname(cfile.path);
  const outputFileName = generateRandomUUIDCryptoneFileName(outputDir);
  return path.join(outputDir, outputFileName);
}

function buildDecodedFilePath(cfile, originalFileNameBuffer) {
  const outputDir = path.dirname(cfile.path);
  const originalFileName = originalFileNameBuffer.toString();
  return path.join(outputDir, originalFileName);
}

function buildFileContentRange(cfile) {
  const fileSize = fs.statSync(cfile.path).size;
  const contentStart = RSA_BLOCK_SIZE;
  const contentEnd = fileSize - FILE_TYPE_ENDING_SIZE - 1;
  return {contentStart, contentEnd};
}

function parseEncryptedMetadata(decryptedMetadata) {
  const iv = decryptedMetadata.slice(0, IV_SIZE);
  const salt = decryptedMetadata.slice(IV_SIZE, IV_SIZE + SALT_SIZE);
  const originalFileNameBuffer = decryptedMetadata.slice(IV_SIZE + SALT_SIZE);
  return {iv, salt, originalFileNameBuffer};
}

function buildFileMetadata(cfile) {
  const iv = crypto.randomBytes(IV_SIZE);
  const salt = crypto.randomBytes(SALT_SIZE);
  const fileNameBuffer = Buffer.from(cfile.name, 'utf8');
  return {iv, salt, fileNameBuffer};
}

function hideDecryptedFileIfIsCryptoneArchive(writeStream, outputFilePath) {
  writeStream.on("open", () => {
    if (process.platform === "win32" && path.basename(outputFilePath) === ".crtn.zip") {
      exec(`attrib +h "${outputFilePath}"`, (err) => {
        if (err) {
          console.error("Error setting hidden attribute on output file:", err);
        }
      });
    }
  });
}

module.exports = {
  encryptFile,
  decryptFile,
}
