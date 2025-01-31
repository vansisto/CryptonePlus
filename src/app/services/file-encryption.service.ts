import { Injectable } from '@angular/core';
import {CFile} from '../models/cfile';
import { FilesService } from './files.service';

@Injectable({
  providedIn: 'root'
})
export class FileEncryptionService {
  electron: any = (window as any).electron;
  pendingCryptingFiles: CFile[] = [];

  constructor(
    private filesService: FilesService,
  ) { }

  encryptFiles(password: string, keyPath: string, deleteAfter: boolean): Promise<{ okCount: number, failCount: number, failedFiles: CFile[] }> {
    return new Promise((resolve) => {
      this.encrypt(password, keyPath)
        .then(result => {
          if (deleteAfter) {
            this.deleteProcessedFilesExcludingFailed(result.failedFiles);
          }
          resolve(result);
        });
    });
  }

  async encrypt(password: string, keyPath: string): Promise<{ okCount: number; failCount: number; failedFiles: CFile[] }> {
    let okCount = 0;
    let failCount = 0;
    const failedFiles: CFile[] = [];

    const promises = this.pendingCryptingFiles
      .map((cfile: CFile) => {
        return this.electron.encryptFile(cfile, password, keyPath)
          .then((result: { success: boolean; message: string }) => {
            if (!result.success) {
              failCount++;
              failedFiles.push(cfile);
            } else {
              okCount++;
            }
          });
      });

    return Promise.all(promises)
      .then(() => {
        return {okCount, failCount, failedFiles};
      });
  }

  decryptFiles(password: string, keyPath: string, deleteAfter: boolean): Promise<{ okCount: number, failCount: number, failedFiles: CFile[] }> {
    return new Promise((resolve) => {
      this.decrypt(password, keyPath)
        .then(result => {
          if (deleteAfter) {
            const notEncryptedFiles = this.pendingCryptingFiles.filter(file => !file.encrypted);
            const excludedFiles: CFile[] = [...result.failedFiles, ...notEncryptedFiles];
            this.deleteProcessedFilesExcludingFailed(excludedFiles);
          }
          resolve(result);
        });
    });
  }

  async decrypt(password: string, keyPath: string): Promise<{ okCount: number; failCount: number; failedFiles: CFile[] }> {
    let okCount = 0;
    let failCount = 0;
    const failedFiles: CFile[] = [];

    const promises = this.pendingCryptingFiles
      .filter(file => file.encrypted)
      .map((cfile: CFile) => {
        return this.electron.decryptFile(cfile, password, keyPath)
          .then((result: { success: boolean; message: string }) => {
            if (!result.success) {
              failCount++;
              failedFiles.push(cfile);
            } else {
              okCount++;
            }
          });
      });

    return Promise.all(promises)
      .then(() => {
        return {okCount, failCount, failedFiles}
      });
  }

  addFileToPending(newFile: CFile): void {
    const exists = this.pendingCryptingFiles.some(existing => existing.path === newFile.path);
    if (!exists) {
      this.pendingCryptingFiles.push(newFile);
    }
  }

  addFilesToPending(newFiles: CFile[]): void {
    newFiles.forEach((file: CFile) => {
      if (!this.pendingCryptingFiles.some(existing => existing.path === file.path)) {
        this.pendingCryptingFiles.push(file);
      }
    })
  }

  deleteProcessedFilesExcludingFailed(failedFiles: CFile[]) {
    const filesToDelete: CFile[] = this.pendingCryptingFiles.filter(file =>
      !failedFiles.some(failed => failed.path === file.path)
    );

    this.electron.deleteFiles(filesToDelete).then(() => this.filesService.syncFilesWithFileSystem());
  }
}
