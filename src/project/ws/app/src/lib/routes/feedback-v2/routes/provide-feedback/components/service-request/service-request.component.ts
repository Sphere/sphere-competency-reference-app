import { Component, OnDestroy } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeedbackSnackbarComponent } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/components/feedback-snackbar/feedback-snackbar.component';
import { EFeedbackRole, EFeedbackType } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model';
import { FeedbackService } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/services/feedback.service';
import { TSendStatus } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-app-service-request',
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss'],
})
export class ServiceRequestComponent implements OnDestroy {
  sendStatus: TSendStatus
  serviceRequestForm: UntypedFormGroup
  private _submitSub?: Subscription

  constructor(private feedbackSvc: FeedbackService, private snackbar: MatSnackBar) {
    this.sendStatus = 'none'

    this.serviceRequestForm = new UntypedFormGroup({
      serviceRequest: new UntypedFormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
    })
  }

  ngOnDestroy() {
    if (this._submitSub) {
      this._submitSub.unsubscribe()
    }
  }

  submitServiceRequest() {
    if (this.serviceRequestForm.invalid) {
      return
    }

    this.sendStatus = 'sending'
    this._submitSub = this.feedbackSvc
      .submitServiceRequest({
        text: this.serviceRequestForm.value['serviceRequest'],
        type: EFeedbackType.ServiceRequest,
        role: EFeedbackRole.User,
      })
      .subscribe(
        () => {
          this.sendStatus = 'done'
          this.serviceRequestForm.patchValue({ serviceRequest: null })
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'service_request_submit', code: 'success' },
          })
        },
        () => {
          this.sendStatus = 'error'
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'service_request_submit', code: 'failure' },
          })
        },
      )
  }
}
