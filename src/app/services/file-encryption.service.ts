import {Injectable} from '@angular/core';
import {CFile} from '../models/cfile';
import {FilesService} from './files.service';
import {ArchivatorService} from "./archivator.service";

@Injectable({
  providedIn: 'root'
})
export class FileEncryptionService {
  electron: any = (window as any).electron;
  pendingCryptingFiles: CFile[] = [];

  constructor(
    private readonly filesService: FilesService,
    private readonly archivatorService: ArchivatorService,
  ) {
  }

  async encryptFiles(
      password: string,
      keyPath: string,
      deleteAfter: boolean,
      doArchive: boolean
  ): Promise<{ okCount: number; failCount: number; failedFiles: CFile[] }> {
    let cachedFilesToBeDeleted: CFile[] = [];

    if (doArchive) {
      if (deleteAfter) {
        cachedFilesToBeDeleted = [...this.pendingCryptingFiles];
      }
      const archive: CFile = await this.archivatorService.archive(this.pendingCryptingFiles);
      this.pendingCryptingFiles = [archive];
    }

    const result = await this.processPending(true, password, keyPath);

    if (doArchive) {
      this.deleteProcessedFilesExcludingFailed(result.failedFiles);
      this.pendingCryptingFiles = [...cachedFilesToBeDeleted];
    }
    if (deleteAfter) {
      this.deleteProcessedFilesExcludingFailed(result.failedFiles);
    }
    return result;
  }

  async decryptFiles(password: string, keyPath: string, deleteAfter: boolean): Promise<{
    okCount: number,
    failCount: number,
    failedFiles: CFile[]
  }> {
    const result = await this.processPending(false, password, keyPath);
    if (deleteAfter) {
      const notEncryptedFiles = this.pendingCryptingFiles.filter(f => !f.encrypted);
      const excludedFiles = [...result.failedFiles, ...notEncryptedFiles];
      this.deleteProcessedFilesExcludingFailed(excludedFiles);
    }
    return result;
  }

  addFileToPending(newFile: CFile): void {
    const exists = this.pendingCryptingFiles.some(existing => existing.path === newFile.path);
    if (!exists) {
      this.pendingCryptingFiles.push(newFile);
    }
  }

  addFilesToPending(newFiles: CFile[]): void {
    newFiles.forEach(file => {
      if (!this.pendingCryptingFiles.some(existing => existing.path === file.path)) {
        this.pendingCryptingFiles.push(file);
      }
    });
  }

  deleteProcessedFilesExcludingFailed(failedFiles: CFile[]) {
    const filesToDelete: CFile[] = this.pendingCryptingFiles.filter(
      file => !failedFiles.some(failed => failed.path === file.path)
    );

    this.electron.deleteFiles(filesToDelete).then(() => this.filesService.syncFilesWithFileSystem());
  }

  private async processPending(isEncrypt: boolean, password: string, keyPath: string): Promise<{
    okCount: number;
    failCount: number;
    failedFiles: CFile[]
  }> {
    let okCount = 0;
    let failCount = 0;
    const failedFiles: CFile[] = [];

    const files = isEncrypt
      ? this.pendingCryptingFiles
      : this.pendingCryptingFiles.filter(file => file.encrypted);

    const actionFunction = isEncrypt
      ? (cfile: CFile) => this.electron.encryptFile(cfile, password, keyPath)
      : (cFile: CFile) => this.electron.decryptFile(cFile, password, keyPath);

    const promises = files.map(cfile => {
      return actionFunction(cfile).then((result: { success: boolean; message: string }) => {
        if (!result.success) {
          failCount++;
          failedFiles.push(cfile);
        } else {
          okCount++;
        }
      });
    });

    await Promise.all(promises);
    return {okCount, failCount, failedFiles};
  }
}
