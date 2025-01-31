import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CryptoDialogService {
  private readonly encryptDialogVisibleSubject = new BehaviorSubject<boolean>(false);
  private readonly decryptDialogVisibleSubject = new BehaviorSubject<boolean>(false);
  encryptDialogVisible$ = this.encryptDialogVisibleSubject.asObservable()
  decryptDialogVisible$ = this.decryptDialogVisibleSubject.asObservable()

  constructor() { }

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
}
