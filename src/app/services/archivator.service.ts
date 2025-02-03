import {Injectable} from '@angular/core';
import {CFile} from '../models/cfile';

@Injectable({
  providedIn: 'root'
})
export class ArchivatorService {
  electron = (window as any).electron;

  async archive(pendingCryptingFiles: CFile[]): Promise<CFile> {
    return await this.electron.archiveFiles(pendingCryptingFiles);
  }

  async extract(inputCFilePath: string): Promise<void> {
    return await this.electron.unarchiveIfExists(inputCFilePath);
  }
}
