import { TestBed } from '@angular/core/testing';

import { CryptoDialogService } from './crypto-dialog.service';

describe('EncryptDialogService', () => {
  let service: CryptoDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
