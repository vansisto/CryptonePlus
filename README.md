
![GitHub package.json version](https://img.shields.io/github/package-json/v/vansisto/CryptonePlus?color=black)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/vansisto/CryptonePlus/total)

![GitHub Release Date](https://img.shields.io/github/release-date/vansisto/CryptonePlus)
![GitHub last commit](https://img.shields.io/github/last-commit/vansisto/CryptonePlus)

![Angular Version](https://img.shields.io/badge/v19-red?logo=angular&logoColor=red&label=Angular&labelColor=grey&color=red)
![NodeJS Version](https://img.shields.io/badge/v22-white?logo=node.js&label=NodeJS&labelColor=grey&color=green)
![Electron Version](https://img.shields.io/badge/v33-grey?logo=electron&label=Electron&labelColor=white&color=blue)

# <img src="https://raw.githubusercontent.com/vansisto/CryptonePlus/refs/heads/main/src/assets/favicon.png" width="50" alt="Logo"> Cryptone

## Overview
This application allows you to encrypt files using two encryption algorithms, 
AES256 and RSA4096. Before encryption, you (or the recipient) need to generate 
a pair of keys - a private and a public key. Files are encrypted with the 
public key and decrypted with the private key. To encrypt, you need to send 
the public key to the person who has the file you need so that they can encrypt 
the file with this key. Then you, in turn, will decrypt the received file with 
your private key.

### Features:
* __Password__: You can set a password of any complexity for additional protection 
(it can be without a password).
* __Archiving__: If you encrypt several files, each of them will be encrypted 
separately, and you will receive the same number of encrypted files as the 
original ones. But there is also an option to archive files before encryption. 
Files are archived into a zip archive without compression, and then this archive 
is encrypted. Thus, you get one output file regardless of the number of input files.

## Run locally
### Prerequisites
- nodejs v22

### 1. Install packages
```shell 
  npm install 
```

### 2. Build 
```shell
  npm run build
```

### 3. Start
```shell
  npm run start
```

## Build executables
For Windows:
```shell
  electron-builder --win
```
or
```shell
  npx electron-builder -w
```

For Linux:
```shell
  electron-builder --linux
```

For MacOS:
```shell
  electron-builder --mac
```

## Encrypting logic
![](./CryptoneCipher.png)
