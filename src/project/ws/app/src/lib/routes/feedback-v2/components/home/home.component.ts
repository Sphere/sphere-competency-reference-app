import { Component, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { EFeedbackType } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model'
import { NsPage } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnDestroy {
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  feedbackType?: EFeedbackType
  feedbackTypes: typeof EFeedbackType
  private queryParamSub?: Subscription
  feedbacktypeName?: String = 'Feedback'

  constructor(private configSvc: ConfigurationsService, private route: ActivatedRoute) {
    this.pageNavbar = this.configSvc.pageNavBar
    this.feedbackTypes = EFeedbackType

    this.queryParamSub = this.route.queryParamMap.subscribe(queryParams => {
      const feedbackType = queryParams.get('feedbackType') as EFeedbackType
      if (feedbackType) {
        this.feedbackType = feedbackType
        if (this.feedbackType) {
          this.feedbacktypeName = this.feedbackType === EFeedbackType.Content ? 'Content Feedback'
            : (this.feedbackType === EFeedbackType.ContentRequest ? 'Content Request'
              : (this.feedbackType === EFeedbackType.Platform ? 'Platform Feedback'
                : (this.feedbackType === EFeedbackType.ServiceRequest ? 'Service Request'
                  : 'Feedback')))
        }
      } else {
        this.feedbackType = undefined
      }
    })
  }

  ngOnDestroy() {
    if (this.queryParamSub && !this.queryParamSub.closed) {
      this.queryParamSub.unsubscribe()
    }
  }
}
