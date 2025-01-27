import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {CFile} from '../models/cfile';

@Injectable({providedIn: 'root'})
export class FilesService {
  private filesSubject: BehaviorSubject<CFile[]> = new BehaviorSubject<CFile[]>([]);
  private selectedFilesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  files$: Observable<CFile[]> = this.filesSubject.asObservable();
  selectedFiles$: Observable<CFile[] | null> = this.selectedFilesSubject.asObservable();

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
}
