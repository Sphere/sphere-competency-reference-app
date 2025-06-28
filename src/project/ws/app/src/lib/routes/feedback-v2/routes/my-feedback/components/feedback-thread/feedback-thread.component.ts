import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar';
import { noop } from 'rxjs'
import {
  IFeedbackThread,
  IFeedback,
  EFeedbackType,
  EFeedbackRole,
} from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model'
import { TFetchStatus, TSendStatus } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants'
import { MyFeedbackService } from '../../services/my-feedback.service'
import { FeedbackService } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/services/feedback.service';
import { FeedbackSnackbarComponent } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/components/feedback-snackbar/feedback-snackbar.component';

@Component({
  selector: 'ws-app-feedback-thread',
  templateUrl: './feedback-thread.component.html',
  styleUrls: ['./feedback-thread.component.scss'],
})
export class FeedbackThreadComponent implements OnInit, OnChanges {
  @Input() feedbackId!: string
  feedbackThread!: IFeedbackThread[]
  feedbackReply!: IFeedback
  threadFetchStatus: TFetchStatus
  sendStatus: TSendStatus
  replyForm: UntypedFormGroup
  viewedBy: EFeedbackRole

  constructor(
    private route: ActivatedRoute,
    private feedbackApi: FeedbackService,
    private myFeedbackSvc: MyFeedbackService,
    private snackbar: MatSnackBar,
  ) {
    this.threadFetchStatus = 'none'
    this.sendStatus = 'none'

    this.viewedBy = this.route.snapshot.url[0].path as EFeedbackRole

    this.replyForm = new UntypedFormGroup({
      reply: new UntypedFormControl(null, [Validators.minLength(1), Validators.maxLength(2000)]),
    })
  }

  ngOnInit() {
    const routeParam = this.route.snapshot.paramMap.get('feedbackId')
    if (routeParam) {
      this.feedbackId = routeParam
    }

    this.fetchThread()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      !changes.feedbackId.isFirstChange() &&
      changes.feedbackId.currentValue !== changes.feedbackId.previousValue
    ) {
      this.fetchThread()
    }
  }

  fetchThread() {
    this.threadFetchStatus = 'fetching'
    this.feedbackApi.getFeedbackThread(this.feedbackId).subscribe(
      thread => {
        this.feedbackThread = thread
        this.threadFetchStatus = 'done'

        const threadHead = this.feedbackThread[0]
        this.feedbackReply = {
          rootFeedbackId: threadHead.rootFeedbackId,
          type: threadHead.feedbackType,
          text: '',
          role: this.viewedBy,
        }

        if (threadHead.feedbackType === EFeedbackType.Content) {
          this.feedbackReply.contentId = threadHead.contentId
        }

        if (this.viewedBy === EFeedbackRole.User && threadHead.replied && !threadHead.seenReply) {
          this.updateThread()
        }
      },
      () => {
        this.threadFetchStatus = 'error'
      },
    )
  }

  updateThread(category?: string) {
    this.feedbackApi.updateFeedbackStatus(this.feedbackId, category).subscribe(noop, noop)
  }

  submitReply() {
    if (this.replyForm.invalid) {
      return
    }

    this.feedbackReply.text = this.replyForm.value['reply']

    this.sendStatus = 'sending'
    this.myFeedbackSvc.submitReply(this.feedbackReply).subscribe(
      (reply: { response: IFeedbackThread }) => {
        this.sendStatus = 'done'
        this.replyForm.patchValue({ reply: null })
        this.feedbackThread.push(reply.response)

        const threadHead = this.feedbackThread[0]
        this.feedbackReply = {
          rootFeedbackId: threadHead.rootFeedbackId,
          type: threadHead.feedbackType,
          text: '',
          role: this.viewedBy,
        }
      },
      () => {
        this.sendStatus = 'error'
        this.snackbar.openFromComponent(FeedbackSnackbarComponent, {
          data: { action: 'feedback_reply_submit', code: 'failure' },
        })
      },
    )
  }
}
