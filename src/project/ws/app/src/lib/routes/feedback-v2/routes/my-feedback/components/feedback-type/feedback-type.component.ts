import { Component, OnInit, Input } from '@angular/core'
import { EFeedbackType } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model'

@Component({
  selector: 'ws-app-feedback-type',
  templateUrl: './feedback-type.component.html',
  styleUrls: ['./feedback-type.component.scss'],
})
export class FeedbackTypeComponent implements OnInit {
  @Input() feedbackType!: EFeedbackType
  feedbackTypes: typeof EFeedbackType

  constructor() {
    this.feedbackTypes = EFeedbackType
  }

  ngOnInit() {}
}
