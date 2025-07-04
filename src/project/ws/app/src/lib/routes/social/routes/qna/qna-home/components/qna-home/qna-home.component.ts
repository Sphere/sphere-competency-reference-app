import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Data, NavigationExtras, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { NsError } from '../../../../../../../../../../../../library/ws-widget/collection/src/lib/models/error-resolver.model';
import { NsWidgetResolver } from '../../../../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model';
import { ROOT_WIDGET_CONFIG } from '../../../../../../../../../../../../library/ws-widget/collection/src/lib/collection.config';
import { NsDiscussionForum } from '../../../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.model';
import { TFetchStatus } from '../../../../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';
import { WsDiscussionForumService } from '../../../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.services';
import { NsPage } from '../../../../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model';
import { ConfigurationsService } from '../../../../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'ws-app-qna-home',
  templateUrl: './qna-home.component.html',
  styleUrls: ['./qna-home.component.scss'],
})
export class QnaHomeComponent implements OnInit, OnDestroy {

  private routeSubscription: Subscription | null = null
  private queryParamsSubscription: Subscription | null = null
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  errorFetchingTimeline = false
  qnaTimeline!: NsDiscussionForum.ITimeline
  qnaTimelineRequest!: NsDiscussionForum.ITimelineRequest
  eTimelineTypes = NsDiscussionForum.ETimelineType
  currentTab = NsDiscussionForum.ETimelineType.ALL
  fetchStatus: TFetchStatus | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private discussionSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.queryParamsSubscription = this.activatedRoute.queryParamMap.subscribe(qParams => {
      const queryParams = qParams.get('tab')
      if (queryParams) {
        this.currentTab = queryParams as NsDiscussionForum.ETimelineType
      }
    })
    this.routeSubscription = this.activatedRoute.data.subscribe((response: Data) => {
      if (response.resolveData.error) {
        this.errorFetchingTimeline = true
      } else {
        this.qnaTimelineRequest = response.resolveData.data.request;
        (this.qnaTimelineRequest.pgNo as number) += 1
        this.qnaTimeline = response.resolveData.data.response
        this.verifyTimelineContentStatus()
      }
    })
  }
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe()
    }
  }
  onTabChange(event: MatButtonToggleChange) {
    const navigationExtras: NavigationExtras = {
      state: {
         queryParams: { tab: event.value },
         preserveQueryParams: false 
      }
    }
    this.router.navigate([], navigationExtras)
  }
  fetchTimeLine() {
    if (this.fetchStatus === 'fetching') {
      return
    }
    this.fetchStatus = 'fetching'
    this.discussionSvc.fetchTimelineData(this.qnaTimelineRequest).subscribe(
      data => {
        if (Array.isArray(data.result)) {
          this.qnaTimeline.result = [
            ...this.qnaTimeline.result,
            ...data.result,
          ]
        }
        (this.qnaTimelineRequest.pgNo as number) += 1
        this.verifyTimelineContentStatus()
      },
      () => {
        this.fetchStatus = 'error'
      },
    )
  }
  verifyTimelineContentStatus() {
    if (this.qnaTimeline.hits > this.qnaTimeline.result.length) {
      this.fetchStatus = 'hasMore'
    } else if (!this.qnaTimeline.result.length) {
      this.fetchStatus = 'none'
    } else {
      this.fetchStatus = 'done'
    }
  }
}
