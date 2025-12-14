import { TestBed } from '@angular/core/testing';

import { PsalmService } from './psalm.service';

describe('PsalmService', () => {
  let service: PsalmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PsalmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
