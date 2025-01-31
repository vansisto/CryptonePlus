import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {CFile} from '../models/cfile';

@Injectable({providedIn: 'root'})
export class FilesService {
  electron: any = (window as any).electron;
  private allFilesSubject: BehaviorSubject<CFile[]> = new BehaviorSubject<CFile[]>([]);
  private selectedFilesSubject: BehaviorSubject<CFile[]> = new BehaviorSubject<CFile[]>([]);
  allFiles$: Observable<CFile[]> = this.allFilesSubject.asObservable();
  selectedFiles$: Observable<CFile[]> = this.selectedFilesSubject.asObservable();
  filesToProcess: CFile[] = [];

  constructor() { }

  updateSelectedFiles(selectedFiles: any[]): void {
    this.selectedFilesSubject.next(selectedFiles);
  }

  addFile(newFile: CFile): void {
    const currentFiles: CFile[] = this.allFilesSubject.value;
    this.allFilesSubject.next([...currentFiles, newFile]);
  }

  removeFile(fileToRemove: CFile): void {
    const currentSelectedFiles = this.selectedFilesSubject.value;
    const updatedSelectedFiles = currentSelectedFiles.filter(file => file.path !== fileToRemove.path);
    this.selectedFilesSubject.next(updatedSelectedFiles);

    const currentFiles = this.allFilesSubject.value;
    const updatedFiles = currentFiles.filter(file => file.path !== fileToRemove.path);
    this.allFilesSubject.next(updatedFiles);
  }

  getTotalSize(): number {
    return this.allFilesSubject.value.reduce((sum, file) => sum + file.size, 0);
  }

  removeAllFiles(): void {
    this.allFilesSubject.next([]);
    this.selectedFilesSubject.next([]);
  }

  removeSelected(): void {
    const selectedFiles = this.selectedFilesSubject.value;
    const allFiles = this.allFilesSubject.value;

    const updatedFiles = allFiles.filter(
      file => !selectedFiles.some(selected => selected.path === file.path)
    );
    this.selectedFilesSubject.next([]);
    this.allFilesSubject.next(updatedFiles);
  }

  addFileToProcess(newFile: CFile): void {
    const exists = this.filesToProcess.some(existing => existing.path === newFile.path);
    if (!exists) {
      this.filesToProcess.push(newFile);
    }
  }

  addFilesToProcess(newFiles: CFile[]): void {
    newFiles.forEach((file: CFile) => {
      this.filesToProcess.push(file);
    })
  }

  async encrypt(password: string, keyPath: string): Promise<{
    okCount: number;
    failCount: number;
    failedFiles: CFile[]
  }> {
    let okCount = 0;
    let failCount = 0;
    const failedFiles: CFile[] = [];

    const promises = this.filesToProcess
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

    return Promise.all(promises).then(() => {
      return {
        okCount,
        failCount,
        failedFiles
      };
    });
  }

  async decrypt(password: string, keyPath: string): Promise<{
    okCount: number;
    failCount: number;
    failedFiles: CFile[]
  }> {
    let okCount = 0;
    let failCount = 0;
    const failedFiles: CFile[] = [];

    const promises = this.filesToProcess
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

    return Promise.all(promises).then(() => {
      return {
        okCount,
        failCount,
        failedFiles
      }
    });
  }

  deleteProcessedFilesExcept(failedFiles: CFile[]) {
    const filesToDelete: CFile[] = this.filesToProcess.filter(file =>
      !failedFiles.some(failed => failed.path === file.path)
    );

    this.electron.deleteFiles(filesToDelete)
      .then(() => this.revalidateFilesExisting());
  }

  encryptFiles(password: string, keyPath: string, deleteAfter: boolean): Promise<{ okCount: number, failCount: number, failedFiles: CFile[] }> {
    return new Promise((resolve) => {
      this.encrypt(password, keyPath)
        .then(result => {
          if (deleteAfter) {
            this.deleteProcessedFilesExcept(result.failedFiles);
          }
          resolve(result);
        });
    })
  }

  decryptFiles(password: string, keyPath: string, deleteAfter: boolean): Promise<{ okCount: number, failCount: number, failedFiles: CFile[] }> {
    return new Promise((resolve) => {
      this.decrypt(password, keyPath)
        .then(result => {
          if (deleteAfter) {
            const notEncryptedFiles = this.filesToProcess.filter(file => !file.encrypted);
            const excludedFiles: CFile[] = [...result.failedFiles, ...notEncryptedFiles];
            this.deleteProcessedFilesExcept(excludedFiles);
          }
          resolve(result);
        })
    })
  }

  async revalidateFilesExisting(): Promise<void> {
    const checks = this.allFilesSubject.value.map(async (cfile) => {
      const exists = await this.electron.fileExists(cfile);
      return { cfile, exists };
    });

    const checkedFiles = await Promise.all(checks);

    const updatedFiles = checkedFiles
      .filter(result => result.exists)
      .map(result => result.cfile);

    this.allFilesSubject.next(updatedFiles);

    const updatedSelected: CFile[] = this.selectedFilesSubject.value
      .filter(selectedCFile =>
        updatedFiles.some(cfile => cfile.path === selectedCFile.path)
      );
    this.selectedFilesSubject.next(updatedSelected);
  }
}
