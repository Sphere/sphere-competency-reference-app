import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { NsDiscussionForum } from '../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.model'
import { WsDiscussionForumService } from '../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.services'
import { IResolveResponse } from '../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'
import { ConfigurationsService } from '../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

@Injectable()
export class SocialTimelineResolverService implements
  Resolve<Observable<IResolveResponse<{ request: NsDiscussionForum.ITimelineRequest, response: NsDiscussionForum.ITimeline }>>
  | IResolveResponse<{ request: NsDiscussionForum.ITimelineRequest, response: NsDiscussionForum.ITimeline }>> {

  userId = ''
  constructor(
    private discussionSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
  }

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<{ request: NsDiscussionForum.ITimelineRequest, response: NsDiscussionForum.ITimeline }>> {
    if (route.data.postKind) {
      const request: NsDiscussionForum.ITimelineRequest = {
        postKind: route.data.postKind,
        pgNo: 0,
        pgSize: 10,
        sessionId: Date.now(),
        userId: this.userId,
        type: ((route.queryParamMap.get('tab') as NsDiscussionForum.ETimelineType) || route.data.type),
      }
      return this.discussionSvc.fetchTimelineData(request)
        .pipe(
          map(data => ({ data: { request, response: data }, error: null })),
          catchError((error: any) => of({ error, data: null })),
        )
    }
    return of({ error: 'INVALID_POST_KIND', data: null })
  }
}
