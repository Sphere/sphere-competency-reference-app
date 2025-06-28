import { TestBed } from '@angular/core/testing';

import { DataSyncService } from './data-sync.service';

describe('DataSyncService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataSyncService = TestBed.get(DataSyncService);
    expect(service).toBeTruthy();
  });
});
