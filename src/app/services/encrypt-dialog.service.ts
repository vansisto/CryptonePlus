import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EncryptDialogService {
  private encryptDialogVisibleSubject = new BehaviorSubject<boolean>(false);
  private decryptDialogVisibleSubject = new BehaviorSubject<boolean>(false);
  encryptDialogVisible$ = this.encryptDialogVisibleSubject.asObservable()
  decryptDialogVisible$ = this.decryptDialogVisibleSubject.asObservable()

  constructor() { }

  showEncryptDialog() {
    this.encryptDialogVisibleSubject.next(true);
  }

  showDecryptDialog() {
    this.decryptDialogVisibleSubject.next(true);
  }
}
