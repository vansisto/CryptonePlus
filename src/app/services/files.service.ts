import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {CFile} from '../models/cfile';

@Injectable({providedIn: 'root'})
export class FilesService {
  private filesSubject: BehaviorSubject<CFile[]> = new BehaviorSubject<CFile[]>([]);
  private selectedFilesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  electron: any = (window as any).electron;
  files$: Observable<CFile[]> = this.filesSubject.asObservable();
  selectedFiles$: Observable<CFile[] | null> = this.selectedFilesSubject.asObservable();
  filesToEncrypt: CFile[] = [];
  filesToDecrypt: CFile[] = [];

  constructor() { }

  getFiles(): CFile[] {
    return this.filesSubject.value;
  }

  updateSelectedFiles(selectedFiles: any[]) {
    this.selectedFilesSubject.next(selectedFiles);
  }

  addFile(newFile: CFile): void {
    const currentFiles: CFile[] = this.filesSubject.value;
    this.filesSubject.next([...currentFiles, newFile]);
  }

  removeFile(fileToRemove: CFile) {
    const currentFiles = this.filesSubject.value;
    const updatedFiles = currentFiles.filter(file => file.path !== fileToRemove.path);
    this.filesSubject.next(updatedFiles);

    const currentSelectedFiles = this.selectedFilesSubject.value;
    const updatedSelectedFiles = currentSelectedFiles.filter(file => file.path !== fileToRemove.path);
    this.selectedFilesSubject.next(updatedSelectedFiles);
  }

  getTotalSize(): number {
    return this.filesSubject.value.reduce((sum, file) => sum + file.size, 0);
  }

  removeAllFiles(): void {
    this.filesSubject.next([]);
    this.selectedFilesSubject.next([]);
  }

  removeSelected() {
    const selectedFiles = this.selectedFilesSubject.value;
    const allFiles = this.filesSubject.value;

    const updatedFiles = allFiles.filter(
      file => !selectedFiles.some(selected => selected.path === file.path)
    );
    this.selectedFilesSubject.next([]);
    this.filesSubject.next(updatedFiles);
  }

  addFilesToEncrypt(newFiles: CFile[]) {
    const uniqueFiles = newFiles.filter(file =>
      !this.filesToEncrypt.some(existing => existing.path === file.path)
    );

    this.filesToEncrypt = [...this.filesToEncrypt, ...uniqueFiles];
  }

  addFileToEncrypt(cfile: CFile) {
    const exists = this.filesToEncrypt.some(existing => existing.path === cfile.path);
    if (!exists) {
      this.filesToEncrypt.push(cfile);
    }
  }

  addFilesToDecrypt(newFiles: CFile[]) {
    const uniqueFiles = newFiles.filter(file =>
      !this.filesToDecrypt.some(existing => existing.path === file.path)
    );

    this.filesToDecrypt = [...this.filesToDecrypt, ...uniqueFiles];
  }

  addFileToDecrypt(cfile: CFile) {
    const exists = this.filesToDecrypt.some(existing => existing.path === cfile.path);
    if (!exists) {
      this.filesToDecrypt.push(cfile);
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

  clearFilesToEncrypt() {
    this.filesToEncrypt.splice(0, this.filesToEncrypt.length);
  }

  clearFilesToDecrypt() {
    this.filesToDecrypt.splice(0, this.filesToDecrypt.length);
  }
}
