const fs = require("fs");
const path = require("path");
const { generateRandomUUIDCryptoneFileName } = require('./file-utils');

const crypto = require('crypto');

const AES_ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const FILE_TYPE_ENDING = '==CRTF==';
const FILE_TYPE_ENDING_SIZE = FILE_TYPE_ENDING.length;
const IV_SIZE = 16;
const SALT_SIZE = 32;
const RSA_BLOCK_SIZE = 512;

function encryptFile(rsaPublicKey, fileBuffer, password, fileMetadata) {
  const rsaEncryptedMetadata = crypto.publicEncrypt(rsaPublicKey, Buffer.concat([fileMetadata.iv, fileMetadata.salt, fileMetadata.fileNameBuffer]));
  const aesEncryptedContent = encryptContentWithAES(fileBuffer, password, fileMetadata.iv, fileMetadata.salt);
  const endingBuffer = Buffer.from(FILE_TYPE_ENDING, 'ascii');

  return Buffer.concat([
    rsaEncryptedMetadata,
    aesEncryptedContent,
    endingBuffer
  ]);
}

function decryptFile(cfile, privateKeyPath, password) {
  const {rsaEncryptedMetadata, aesEncryptedContent} = parseEncodedFile(cfile);
  const rsaPrivateKey = fs.readFileSync(privateKeyPath);
  const decryptedMetadata = crypto.privateDecrypt(rsaPrivateKey, rsaEncryptedMetadata);

  const {iv, salt, originalFileNameBuffer} = parseEncryptedMetadata(decryptedMetadata);

  const decryptedFileContent = decryptContentWithAES(aesEncryptedContent, password, iv, salt);
  return {originalFileNameBuffer, decryptedFileContent};
}

function encryptContentWithAES(fileBuffer, password, iv, salt) {
  const key = crypto.scryptSync(password, salt, KEY_LENGTH);
  const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);

  return Buffer.concat([
    cipher.update(fileBuffer),
    cipher.final()
  ]);
}

function decryptContentWithAES(encryptedBuffer, password, iv, salt) {
  const key = crypto.scryptSync(password, salt, KEY_LENGTH);
  const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, iv);

  return Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final()
  ]);
}

function buildEncodedFilePath(cfile) {
  const outputDir = path.dirname(cfile.path);
  const outputFileName = generateRandomUUIDCryptoneFileName(outputDir);
  return path.join(outputDir, outputFileName);
}

function buildDecodedFilePath(cfile, originalFileNameBuffer) {
  const outputDir = path.dirname(cfile.path);
  const originalFileName = originalFileNameBuffer.toString('utf8');
  return path.join(outputDir, originalFileName);
}

function parseEncodedFile(cfile) {
  let fileBuffer = fs.readFileSync(cfile.path);
  fileBuffer = fileBuffer.slice(0, fileBuffer.length - FILE_TYPE_ENDING_SIZE);
  const rsaEncryptedMetadata = fileBuffer.slice(0, RSA_BLOCK_SIZE);
  const aesEncryptedContent = fileBuffer.slice(RSA_BLOCK_SIZE);
  return {rsaEncryptedMetadata, aesEncryptedContent};
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

module.exports = {
  buildFileMetadata,
  encryptFile,
  decryptFile,
  buildEncodedFilePath,
  buildDecodedFilePath,
}
