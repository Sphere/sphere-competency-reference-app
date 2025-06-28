import { TestBed } from '@angular/core/testing';

import { EnqueueService } from './enqueue.service';

describe('EnqueueService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EnqueueService = TestBed.get(EnqueueService);
    expect(service).toBeTruthy();
  });
});
