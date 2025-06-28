import { TestBed } from '@angular/core/testing';

import { OfflineCourseOptimisticService } from './offline-course-optimistic.service';

describe('OfflineCourseOptimisticService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OfflineCourseOptimisticService = TestBed.get(OfflineCourseOptimisticService);
    expect(service).toBeTruthy();
  });
});
