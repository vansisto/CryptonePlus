import {Injectable} from '@angular/core';
import {CContact} from '../models/ccontact';
import {CFile} from '../models/cfile';
import {SendFilesService} from './send-files.service';
import {DialogService} from './dialog.service';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  electron: any;
  ccontactsSubject = new BehaviorSubject<CContact[]>([]);
  ccontacts$ = this.ccontactsSubject.asObservable();
  isWhatsAppLoadingSubject = new BehaviorSubject<boolean>(false);
  isWhatsAppLoading$ = this.isWhatsAppLoadingSubject.asObservable();
  isAuthenticated: boolean = false;

  private readonly CCONTACTS_LOCAL_STORAGE_RECORD = 'whatsapp-cContacts';

  constructor(
    private readonly sendFilesService: SendFilesService,
    private readonly dialogService: DialogService,
  ) {
    this.electron = (window as any).electron;
    this.electron.receive('whatsapp-authenticated', () => {
      this.isAuthenticated = true;
      this.showCachedContactsIfExist();
    });
    this.electron.receive('whatsapp-logged-out', () => {
      localStorage.removeItem(this.CCONTACTS_LOCAL_STORAGE_RECORD);
    })
  }

  sendViaWhatsApp(cfiles: CFile[]) {
    this.sendFilesService.filesToSend = cfiles;
    this.isWhatsAppLoadingSubject.next(true);

    if (this.isAuthenticated) {
      this.showCachedContactsIfExist();
    }

    this.electron.getWhatsAppContactList()
      .then((contacts: string[]) => {
        const cContacts: CContact[] = contacts.map(contact => CContact.fromContact(contact));
        this.ccontactsSubject.next(cContacts);
        localStorage.setItem(this.CCONTACTS_LOCAL_STORAGE_RECORD, JSON.stringify(cContacts));
        if (!this.dialogService.isWhatsAppContactListDialogVisible()) {
          this.dialogService.showWhatsAppContactListDialog();
        }
        this.isWhatsAppLoadingSubject.next(false);
      });
  }

  private showCachedContactsIfExist() {
    const cachedCContacts: string | null = localStorage.getItem(this.CCONTACTS_LOCAL_STORAGE_RECORD);
    if (cachedCContacts && cachedCContacts.length > 0) {
      const ccontacts = JSON.parse(cachedCContacts).map((contact: object) => CContact.fromContact(contact));
      this.ccontactsSubject.next(ccontacts);
      this.dialogService.showWhatsAppContactListDialog();
    }
  }
}
