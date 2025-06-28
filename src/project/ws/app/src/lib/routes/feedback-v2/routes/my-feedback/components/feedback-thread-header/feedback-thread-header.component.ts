import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsContent } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { EFeedbackRole, EFeedbackType, IFeedbackConfig, IFeedbackThread } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model'
import { FeedbackService } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/services/feedback.service'
import { IResolveResponse } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'
import { ConfigurationsService } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { noop } from 'rxjs'

@Component({
  selector: 'ws-app-feedback-thread-header',
  templateUrl: './feedback-thread-header.component.html',
  styleUrls: ['./feedback-thread-header.component.scss'],
})
export class FeedbackThreadHeaderComponent implements OnInit {
  @Input() threadHead!: IFeedbackThread
  @Input() viewedBy!: EFeedbackRole
  feedbackTypes: typeof EFeedbackType
  feedbackRoles: typeof EFeedbackRole
  contentTypes: typeof NsContent.EContentTypes
  feedbackConfig!: IFeedbackConfig
  feedbackCategory?: string
  readonly userId?: string

  constructor(
    private feedbackApi: FeedbackService,
    private route: ActivatedRoute,
    private configSvc: ConfigurationsService,
  ) {
    const userProfile = this.configSvc.userProfile
    if (userProfile) {
      this.userId = userProfile.userId
    }

    this.feedbackTypes = EFeedbackType
    this.feedbackRoles = EFeedbackRole
    this.contentTypes = NsContent.EContentTypes

    const feedbackConfigResolve = this.route.snapshot.data['feedbackConfig'] as IResolveResponse<
      IFeedbackConfig
    >
    if (feedbackConfigResolve && feedbackConfigResolve.data) {
      this.feedbackConfig = feedbackConfigResolve.data
    }
  }

  ngOnInit() {
    this.feedbackCategory = this.threadHead.feedbackCategory
  }

  updateCategory(category: string) {
    this.feedbackApi
      .updateFeedbackStatus(this.threadHead.rootFeedbackId, category)
      .subscribe(threadItem => {
        this.feedbackCategory = threadItem.feedbackCategory
      },         noop)
  }
}
