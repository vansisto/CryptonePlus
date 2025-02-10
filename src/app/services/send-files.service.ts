import {Injectable} from '@angular/core';
import {CFile} from '../models/cfile';
import {CContact} from '../models/ccontact';

@Injectable({
  providedIn: 'root'
})
export class SendFilesService {
  electron: any = (window as any).electron;
  filesToSend: CFile[] = [];

  constructor(
  ) { }

  async sendFiles(ccontact: CContact) {
    return this.electron.sendFilesViaWhatsApp(ccontact, this.filesToSend);
  }
}
