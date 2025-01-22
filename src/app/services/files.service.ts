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

  setFiles(files: CFile[]) {
    this.filesSubject.next(files);
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
  }

  getTotalSize(): number {
    return this.filesSubject.value.reduce((sum, file) => sum + file.size, 0);
  }
}
