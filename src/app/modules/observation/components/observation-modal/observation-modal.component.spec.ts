import { ObservationModalComponent } from './observation-modal.component';
import { MatDialogRef } from '@angular/material/dialog';


describe('ObservationModalComponent', () => {
  let observationModalComponent: ObservationModalComponent;
  let mockDialogRefSpy: Partial<MatDialogRef<ObservationModalComponent>> = {
    close: jest.fn()
  };

  beforeAll(() => {
    observationModalComponent = new ObservationModalComponent(
      mockDialogRefSpy as MatDialogRef<ObservationModalComponent>,
      { pointsBasedPercentageScore: 42 },
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be create a instance of mentee list', () => {
    expect(observationModalComponent).toBeTruthy();
  });


  it('pointsBasedPercentageScore should be 0 default', () => {
    observationModalComponent = new ObservationModalComponent(
      mockDialogRefSpy as MatDialogRef<ObservationModalComponent>,
      {},
    );
    expect(observationModalComponent.pointsBasedPercentageScore).toEqual(0);
  });

  it('should be call MatDialogRef close', () => {
    // mockDialogRefSpy.close = jest.fn();
    observationModalComponent.closePopup();
    expect(mockDialogRefSpy.close).toBeCalled();
  });

  it('should ivnoked backSchedule', () => {
    observationModalComponent.backSchedule();
    expect(mockDialogRefSpy.close).toBeCalled();
  });
});

