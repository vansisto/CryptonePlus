import {Injectable} from '@angular/core';
import {CFile} from '../models/cfile';

@Injectable({
  providedIn: 'root'
})
export class ArchivatorService {
  electron = (window as any).electron;

  constructor() { }

  async archive(pendingCryptingFiles: CFile[]): Promise<CFile> {
    return await this.electron.archiveFiles(pendingCryptingFiles);
  }
}
