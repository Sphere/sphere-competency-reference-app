import { Component, OnInit } from '@angular/core'
import { NsDiscussionForum } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.model'
import { WsDiscussionForumService } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.services'
import { TFetchStatus } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants'
import { NsPage } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model'
import { ConfigurationsService } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { ValueService } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/services/value.service'
import { Observable } from 'rxjs'

@Component({
  selector: 'ws-app-recent-blog',
  templateUrl: './recent-blog.component.html',
  styleUrls: ['./recent-blog.component.scss'],
})
export class RecentBlogComponent implements OnInit {
  timelineData: NsDiscussionForum.ITimeline = {
    hits: 0,
    result: [],
  }
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  timelineRequest: NsDiscussionForum.ITimelineRequest = {
    pgNo: -1,
    pgSize: 20,
    postKind: [NsDiscussionForum.EPostKind.BLOG],
    sessionId: Date.now(),
    type: NsDiscussionForum.ETimelineType.ALL,
    userId: '',
  }
  timelineFetchStatus: TFetchStatus = 'none'
  showSocialLike = false
  isXSmall$: Observable<boolean>
  queryEntered = ''
  placeHolder: String = 'Type the blog name you are looking for'
  constructor(
    private discussionSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,

  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    if (this.configSvc.userProfile) {
      this.timelineRequest.userId = this.configSvc.userProfile.userId || ''
    }
  }

  ngOnInit() {
    this.fetchTimelineData()
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false

  }

  fetchTimelineData() {
    if (this.timelineFetchStatus === 'done') {
      return
    }
    this.timelineFetchStatus = 'fetching';

    (this.timelineRequest.pgNo as number) += 1

    this.discussionSvc.fetchTimelineData(this.timelineRequest).subscribe(
      data => {
        if (data.hits && data.result) {
          this.timelineData.hits = data.hits
          this.timelineData.result = [...this.timelineData.result, ...data.result]
          if (data.hits > this.timelineData.result.length) {
            this.timelineFetchStatus = 'hasMore'
          } else {
            this.timelineFetchStatus = 'done'
          }
        } else {
          this.timelineFetchStatus = 'none'
        }
      },
      () => {
        this.timelineFetchStatus = 'error'
      },
    )
  }
}
