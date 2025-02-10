import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyPairsService {
  electron = (window as any).electron;
  isKeysFolderExistsSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isKeysFolderExists$ = this.isKeysFolderExistsSubject.asObservable();

  constructor() { }

  checkKeysFolderExisting() {
    this.electron.isKeysFolderExists().then((isExists: boolean) => {
      this.isKeysFolderExistsSubject.next(isExists);
    });
  }
}
