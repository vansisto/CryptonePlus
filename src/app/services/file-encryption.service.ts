import {Injectable} from '@angular/core';
import {CFile} from '../models/cfile';
import {FilesService} from './files.service';
import {ArchivatorService} from "./archivator.service";
import {ProcessingResult} from "../interfaces/processing-result";

@Injectable({
  providedIn: 'root'
})
export class FileEncryptionService {
  electron: any = (window as any).electron;
  pendingCryptingFiles: CFile[] = [];

  constructor(
    private readonly filesService: FilesService,
    private readonly archivatorService: ArchivatorService,
  ) {}

  async encryptFiles(password: string, keyPath: string, deleteAfter: boolean, doArchive: boolean): Promise<ProcessingResult> {
    let cachedFilesToBeDeleted: CFile[] = [];
    cachedFilesToBeDeleted = await this.prepareArchiveForProcessing(doArchive, deleteAfter, cachedFilesToBeDeleted);
    const result: ProcessingResult = await this.processPending(true, password, keyPath);
    this.postProcessDeleting(doArchive, result, cachedFilesToBeDeleted, deleteAfter);
    return result;
  }

  private postProcessDeleting(doArchive: boolean, result: ProcessingResult, cachedFilesToBeDeleted: CFile[], deleteAfter: boolean) {
    if (doArchive) {
      this.deleteProcessedFilesExcludingFailed(result.failedFiles);
      this.pendingCryptingFiles = [...cachedFilesToBeDeleted];
    }
    if (deleteAfter) {
      this.deleteProcessedFilesExcludingFailed(result.failedFiles);
    }
  }

  private async prepareArchiveForProcessing(doArchive: boolean, deleteAfter: boolean, cachedFilesToBeDeleted: CFile[]) {
    if (doArchive) {
      if (deleteAfter) {
        cachedFilesToBeDeleted = [...this.pendingCryptingFiles];
      }
      const archive: CFile = await this.archivatorService.archive(this.pendingCryptingFiles);
      this.pendingCryptingFiles = [archive];
    }
    return cachedFilesToBeDeleted;
  }

  async decryptFiles(password: string, keyPath: string, deleteAfter: boolean): Promise<ProcessingResult> {
    const result: ProcessingResult = await this.processPending(false, password, keyPath);
    await this.archivatorService.extract(this.pendingCryptingFiles[0].path);
    if (deleteAfter) {
      const notEncryptedFiles: CFile[] = this.pendingCryptingFiles.filter(f => !f.encrypted);
      const excludedFiles: CFile[] = [...result.failedFiles, ...notEncryptedFiles];
      this.deleteProcessedFilesExcludingFailed(excludedFiles);
    }
    return result;
  }

  addFileToPending(newFile: CFile): void {
    const exists: boolean = this.pendingCryptingFiles.some(existing => existing.path === newFile.path);
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

  private async processPending(isEncrypt: boolean, password: string, keyPath: string): Promise<ProcessingResult> {
    let processingResult: ProcessingResult = {okCount: 0, failCount: 0, failedFiles: []};

    const files = isEncrypt
      ? this.pendingCryptingFiles
      : this.pendingCryptingFiles.filter(file => file.encrypted);

    const actionFunction = isEncrypt
      ? (cfile: CFile) => this.electron.encryptFile(cfile, password, keyPath)
      : (cFile: CFile) => this.electron.decryptFile(cFile, password, keyPath);
    const promises = this.processFunction(files, actionFunction, processingResult);

    await Promise.all(promises);
    return processingResult;
  }

  private processFunction(files: CFile[], actionFunction: (cfile: CFile) => any, processingResult: ProcessingResult) {
    return files.map(cfile => {
      return actionFunction(cfile).then((result: { success: boolean; message: string }) => {
        if (!result.success) {
          processingResult.failCount++;
          processingResult.failedFiles.push(cfile);
        } else {
          processingResult.okCount++;
        }
      });
    });
  }
}
