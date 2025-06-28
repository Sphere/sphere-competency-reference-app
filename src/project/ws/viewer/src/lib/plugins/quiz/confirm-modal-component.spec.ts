import { ConfirmmodalComponent } from './confirm-modal-component';
import { FormBuilder } from '@angular/forms'
import { MatSnackBar} from '@angular/material/snack-bar'
import { MatDialogRef } from '@angular/material/dialog'
import { ConfigurationsService } from '../../../../../../../../src/library/ws-widget/utils'
import { ViewerUtilService } from '../../viewer-util.service'
import { of } from 'rxjs'
import { TranslateService } from '@ngx-translate/core';


describe('ConfirmmodalComponent', () => {
  let component: ConfirmmodalComponent;
  let mockDialogRefSpy: Partial<MatDialogRef<ConfirmmodalComponent>> = {
    close: jest.fn()
  };
  let mockFormBuilder: FormBuilder = {
    group: jest.fn(),
    control: jest.fn(),
    array: jest.fn()
  };
  const mockConfigurationsService: Partial<ConfigurationsService> = {};
  const mockViewerUtilService: Partial<ViewerUtilService> = {
    submitCourseRating: jest.fn(() => of({ data: [] }))
  }
  const mockTranslateService: Partial<TranslateService> = {};
  const mockMatSnackBar: MatSnackBar = {
    open: jest.fn(),
  } as unknown as MatSnackBar

  beforeAll(() => {
    component = new ConfirmmodalComponent(
      mockDialogRefSpy as MatDialogRef<ConfirmmodalComponent>,
      { request: { courseId: 'testCourseId', courseRating: { content: [{ rating: 3, review: 'testReview' }] } } },
      mockFormBuilder = {
        group: jest.fn(() => ({
          controls: {
            review: {
              value: '',
              setValidators: jest.fn(),
            },
          },
        })) as any,
      } as FormBuilder,
      mockMatSnackBar,
      mockConfigurationsService,
      mockViewerUtilService as ViewerUtilService,
      mockTranslateService as TranslateService
    );
  });

  it('should create component', (done) => {
    expect(component).toBeTruthy();
    done();
  });

  it('should set selectedRating when calling setRating', (done) => {
    component.setRating(3)
    expect(component.selectedRating).toBe(3);
    done();
  })

  it('should not submit data if review is empty', () => {
    spyOn(component, 'submitRating')
    component.submitData()
    expect(component.submitRating).not.toHaveBeenCalled()
  })

  it('should submit data when review is not empty and rating is selected', () => {
    spyOn(component, 'submitRating')
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    component.submitData()
    expect(component.submitRating).toHaveBeenCalled()
  })


  it('should call submitRating when submitData is called with non-empty review and selectedRating', () => {
    spyOn(component, 'submitRating')
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    component.submitData()
    expect(component.submitRating).toHaveBeenCalled()
  })

 


  it('should call submitRating when review is not empty and rating is selected', () => {
    component.ratingsForm.patchValue({ review: 'Test review' })
    component.selectedRating = 4
    const submitRatingSpy = spyOn(component, 'submitRating')
    component.submitData()
    expect(submitRatingSpy).toHaveBeenCalled()
  })

  it('should not call submitRating when review is empty', () => {
    component.ratingsForm.patchValue({ review: '' })
    component.selectedRating = 4
    const submitRatingSpy = spyOn(component, 'submitRating')
    component.submitData()
    expect(submitRatingSpy).not.toHaveBeenCalled()
  })

 
  

  });
