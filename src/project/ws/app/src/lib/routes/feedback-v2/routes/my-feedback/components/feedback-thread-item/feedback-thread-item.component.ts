import { Component, OnInit, Input } from '@angular/core'
import { IFeedbackThread } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model'

@Component({
  selector: 'ws-app-feedback-thread-item',
  templateUrl: './feedback-thread-item.component.html',
  styleUrls: ['./feedback-thread-item.component.scss'],
})
export class FeedbackThreadItemComponent implements OnInit {
  @Input() threadItem!: IFeedbackThread
  truncatedText: string

  constructor() {
    this.truncatedText = ''
  }

  ngOnInit() {}
}
