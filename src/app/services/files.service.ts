import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {CFile} from '../models/cfile';

@Injectable({providedIn: 'root'})
export class FilesService {
  electron: any = (window as any).electron;
  private readonly allFilesSubject: BehaviorSubject<CFile[]> = new BehaviorSubject<CFile[]>([]);
  private readonly selectedFilesSubject: BehaviorSubject<CFile[]> = new BehaviorSubject<CFile[]>([]);
  allFiles$: Observable<CFile[]> = this.allFilesSubject.asObservable();
  selectedFiles$: Observable<CFile[]> = this.selectedFilesSubject.asObservable();

  updateSelectedFiles(selectedFiles: CFile[]): void {
    this.selectedFilesSubject.next(selectedFiles);
  }

  addFileToAll(newFile: CFile): void {
    const currentFiles: CFile[] = this.allFilesSubject.value;
    this.allFilesSubject.next([...currentFiles, newFile]);
  }

  removeFileFromAll(fileToRemove: CFile): void {
    const currentFiles = this.allFilesSubject.value;
    const allFilesWithoutRemoved = currentFiles.filter(file => file.path !== fileToRemove.path);
    this.allFilesSubject.next(allFilesWithoutRemoved);

    this.syncSelectedFiles();
  }

  getTotalSize(): number {
    return this.allFilesSubject.value.reduce((sum, file) => sum + file.size, 0);
  }

  removeAllFiles(): void {
    this.allFilesSubject.next([]);
    this.selectedFilesSubject.next([]);
  }

  removeSelected(): void {
    this.selectedFilesSubject.value
      .forEach((file: CFile): void => this.removeFileFromAll(file));
  }

  async syncFilesWithFileSystem(): Promise<void> {
    const checks = this.allFilesSubject.value.map(async (cfile) => {
      const exists = await this.electron.fileExists(cfile);
      return { cfile, exists };
    });

    const checkedFiles = await Promise.all(checks);

    const updatedFiles = checkedFiles
      .filter(result => result.exists)
      .map(result => result.cfile);

    this.allFilesSubject.next(updatedFiles);
    this.syncSelectedFiles();
  }

  private syncSelectedFiles() {
    const newSelected = this.selectedFilesSubject.value.filter(selected =>
      this.allFilesSubject.value.some(file => file.path === selected.path)
    );
    this.selectedFilesSubject.next(newSelected);
  }
}
