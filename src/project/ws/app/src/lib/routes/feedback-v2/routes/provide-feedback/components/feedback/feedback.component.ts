import { Component } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators, UntypedFormGroup, UntypedFormControl } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { TSendStatus } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';
import { EFeedbackRole, IFeedbackConfig, INotificationRequest } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model';
import { FeedbackService } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/services/feedback.service';
import { ConfigurationsService } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { IResolveResponse } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model';
import { EFeedbackType } from '../../../../models/feedback.model';
import { FeedbackSnackbarComponent } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/components/feedback-snackbar/feedback-snackbar.component';

@Component({
  selector: 'ws-app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent {
  positiveFeedbackSendStatus: TSendStatus
  negativeFeedbackSendStatus: TSendStatus
  singleFeedbackSendStatus: TSendStatus
  feedbackForm: UntypedFormGroup
  singleFeedbackForm: UntypedFormGroup
  feedbackConfig!: IFeedbackConfig

  constructor(
    private feedbackApi: FeedbackService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private configSvc: ConfigurationsService,
  ) {
    this.positiveFeedbackSendStatus = 'none'
    this.negativeFeedbackSendStatus = 'none'
    this.singleFeedbackSendStatus = 'none'

    this.feedbackForm = new UntypedFormGroup({
      positive: new UntypedFormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
      negative: new UntypedFormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
    })

    this.singleFeedbackForm = new UntypedFormGroup({
      feedback: new UntypedFormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
    })

    const feedbackConfigResolve = this.route.snapshot.data['feedbackConfig'] as IResolveResponse<
      IFeedbackConfig
    >
    if (feedbackConfigResolve && feedbackConfigResolve.data) {
      this.feedbackConfig = feedbackConfigResolve.data
    }
  }

  submitPositiveFeedback(text: string) {
    this.positiveFeedbackSendStatus = 'sending'
    this.feedbackApi
      .submitPlatformFeedback({
        text,
        type: EFeedbackType.Platform,
        sentiment: 'positive',
        role: EFeedbackRole.User,
      })
      .subscribe(
        () => {
          this.positiveFeedbackSendStatus = 'done'
          this.feedbackForm.patchValue({ positive: null })
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'platform_feedback_submit', code: 'success' },
          })
        },
        () => {
          this.positiveFeedbackSendStatus = 'error'
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'platform_feedback_submit', code: 'failure' },
          })
        },
      )
  }

  submitNegativeFeedback(text: string) {
    this.negativeFeedbackSendStatus = 'sending'
    this.feedbackApi
      .submitPlatformFeedback({
        text,
        type: EFeedbackType.Platform,
        sentiment: 'negative',
        role: EFeedbackRole.User,
      })
      .subscribe(
        () => {
          this.negativeFeedbackSendStatus = 'done'
          this.feedbackForm.patchValue({ negative: null })
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'platform_feedback_submit', code: 'success' },
          })
        },
        () => {
          this.negativeFeedbackSendStatus = 'error'
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'platform_feedback_submit', code: 'failure' },
          })
        },
      )
  }

  submitFeedback() {
    if (this.feedbackForm.controls['positive'].valid && this.feedbackForm.value['positive']) {
      this.submitPositiveFeedback(this.feedbackForm.value['positive'])
    }

    if (this.feedbackForm.controls['negative'].valid && this.feedbackForm.value['negative']) {
      this.submitNegativeFeedback(this.feedbackForm.value['negative'])
    }
  }

  submitSingleFeedback() {
    this.singleFeedbackSendStatus = 'sending'

    this.feedbackApi
      .submitPlatformFeedback({
        text: this.singleFeedbackForm.value['feedback'],
        role: EFeedbackRole.User,
        type: EFeedbackType.Platform,
      })
      .subscribe(
        () => {
          this.singleFeedbackSendStatus = 'done'
          if (this.configSvc.instanceConfig && this.configSvc.instanceConfig.rootOrg === 'RootOrg') {
            const req: INotificationRequest = {
              'event-id': 'platform_feedback',
              'tag-value-pair': {
                '#feedback': this.singleFeedbackForm.value['feedback'],
              },
              recipients: {
                learner: [
                  (this.configSvc.userProfile && this.configSvc.userProfile.userId) || '',
                ],
              },
            }
            this.feedbackApi.contentShareNew(req).subscribe()
          }
          this.singleFeedbackForm.patchValue({ feedback: null })

          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_feedback_submit', code: 'success' },
          })
        },
        () => {
          this.singleFeedbackSendStatus = 'error'
          this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
            data: { action: 'content_feedback_submit', code: 'failure' },
          })
        },
      )
  }
}
