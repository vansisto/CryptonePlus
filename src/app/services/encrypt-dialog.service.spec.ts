import { TestBed } from '@angular/core/testing';

import { EncryptDialogService } from './encrypt-dialog.service';

describe('EncryptDialogService', () => {
  let service: EncryptDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncryptDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
