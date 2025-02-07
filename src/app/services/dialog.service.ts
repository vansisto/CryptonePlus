import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly encryptDialogVisibleSubject = new BehaviorSubject<boolean>(false);
  private readonly decryptDialogVisibleSubject = new BehaviorSubject<boolean>(false);
  private readonly whatsAppContactListDialogVisibleSubject = new BehaviorSubject<boolean>(false);
  encryptDialogVisible$ = this.encryptDialogVisibleSubject.asObservable()
  decryptDialogVisible$ = this.decryptDialogVisibleSubject.asObservable()
  whatsAppContactListDialogVisible$ = this.whatsAppContactListDialogVisibleSubject.asObservable()

  showEncryptDialog() {
    this.encryptDialogVisibleSubject.next(true);
  }

  showDecryptDialog() {
    this.decryptDialogVisibleSubject.next(true);
  }

  hideEncryptDialog() {
    this.encryptDialogVisibleSubject.next(false);
  }

  hideDecryptDialog() {
    this.decryptDialogVisibleSubject.next(false);
  }

  showWhatsAppContactListDialog() {
    this.whatsAppContactListDialogVisibleSubject.next(true);
  }

  hideWhatsAppContactListDialog() {
    this.whatsAppContactListDialogVisibleSubject.next(false);
  }

  isWhatsAppContactListDialogVisible(): boolean {
    return this.whatsAppContactListDialogVisibleSubject.value;
  }
}
