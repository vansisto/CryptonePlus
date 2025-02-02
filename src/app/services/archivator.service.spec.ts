import { TestBed } from '@angular/core/testing';

import { ArchivatorService } from './archivator.service';

describe('ArchivatorService', () => {
  let service: ArchivatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchivatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
