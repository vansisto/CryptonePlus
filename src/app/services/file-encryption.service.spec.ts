import { TestBed } from '@angular/core/testing';

import { FileEncryptionService } from './file-encryption.service';

describe('FileEncryptionService', () => {
  let service: FileEncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileEncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
