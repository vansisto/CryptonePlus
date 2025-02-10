import { TestBed } from '@angular/core/testing';

import { SendFilesService } from './send-files.service';

describe('SendFilesService', () => {
  let service: SendFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SendFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
