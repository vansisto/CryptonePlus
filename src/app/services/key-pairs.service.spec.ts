import { TestBed } from '@angular/core/testing';

import { KeyPairsService } from './key-pairs.service';

describe('KeyPairsService', () => {
  let service: KeyPairsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyPairsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
