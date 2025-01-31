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
  filesToEncrypt: CFile[] = [];
  filesToDecrypt: CFile[] = [];

  constructor() { }

  getAllFiles(): CFile[] {
    return this.allFilesSubject.value;
  }

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

  addFilesToEncrypt(newFiles: CFile[]): void {
    const uniqueFiles = newFiles.filter(file =>
      !this.filesToEncrypt.some(existing => existing.path === file.path)
    );

    this.filesToEncrypt = [...this.filesToEncrypt, ...uniqueFiles];
  }

  addFileToEncrypt(newFile: CFile): void {
    const exists = this.filesToEncrypt.some(existing => existing.path === newFile.path);
    if (!exists) {
      this.filesToEncrypt.push(newFile);
    }
  }

  addFilesToDecrypt(newFiles: CFile[]): void {
    const encryptedFiles: CFile[] = newFiles.filter(file => file.encrypted);
    const uniqueFiles = encryptedFiles.filter(file =>
      !this.filesToDecrypt.some(existing => existing.path === file.path)
    );

    this.filesToDecrypt = [...this.filesToDecrypt, ...uniqueFiles];
  }

  addFileToDecrypt(newFile: CFile): void {
    const exists = this.filesToDecrypt.some(existing => existing.path === newFile.path);
    if (newFile.encrypted && !exists) {
      this.filesToDecrypt.push(newFile);
    }
  }

  async encrypt(password: string, keyPath: string): Promise<{
    encryptedCount: number;
    failCount: number;
    failedFiles: CFile[]
  }> {
    let encryptedCount = 0;
    let failCount = 0;
    const failedFiles: CFile[] = [];

    const promises = this.filesToEncrypt.map((cfile: CFile) => {
      return this.electron.encryptFile(cfile, password, keyPath).then((result: { success: boolean; message: string }) => {
        if (!result.success) {
          failCount++;
          failedFiles.push(cfile);
        } else {
          encryptedCount++;
        }
      });
    });

    return Promise.all(promises).then(() => {
      return {
        encryptedCount,
        failCount,
        failedFiles
      };
    });
  }

  async decrypt(password: string, keyPath: string): Promise<{
    decryptedCount: number;
    failCount: number;
    failedFiles: CFile[]
  }> {
    let decryptedCount = 0;
    let failCount = 0;
    const failedFiles: CFile[] = [];

    const promises = this.filesToDecrypt.map((cfile: CFile) => {
      return this.electron.decryptFile(cfile, password, keyPath)
        .then((result: { success: boolean; message: string }) => {
          if (!result.success) {
            failCount++;
            failedFiles.push(cfile);
          } else {
            decryptedCount++;
          }
        });
    });

    return Promise.all(promises).then(() => {
      return {
        decryptedCount,
        failCount,
        failedFiles
      }
    });
  }

  async deleteFilesToEncrypt(): Promise<void> {
    return this.electron.deleteFiles(this.filesToEncrypt);
  }

  async deleteFilesToDecrypt(): Promise<void> {
    return this.electron.deleteFiles(this.filesToDecrypt);
  }

  removeDeletedFilesFromTable(): void {
    this.filesToEncrypt.forEach((cfile: CFile) => {
      this.removeFile(cfile);
    })
    this.filesToDecrypt.forEach((cfile: CFile) => {
      this.removeFile(cfile);
    })
  }

  clearFilesToEncryptFromMemory(): void {
    this.filesToEncrypt = []
  }

  clearFilesToDecryptFromMemory(): void {
    this.filesToDecrypt = [];
  }
}
