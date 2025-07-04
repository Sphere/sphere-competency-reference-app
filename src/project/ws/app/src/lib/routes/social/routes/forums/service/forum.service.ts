import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'
import { SocialForum } from '../models/SocialForumposts.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class ForumService {
  forumViewRequest: SocialForum.IForumViewRequest = {
    sessionId: Date.now(),
    forumKind: SocialForum.EForumKind.FORUM,
    pgNo: 0, pgSize: 20,
    type: SocialForum.EForumViewType.ACTIVEALL,

  }
  private forumsSubject: ReplaySubject<SocialForum.IForumViewResponse> | null = null

  constructor(private http: HttpClient) { }
  fetchTimelineData(request: SocialForum.ITimelineRequest): Observable<SocialForum.ITimeline> {

    return this.http.post<SocialForum.ITimeline>(API_PROTECTED_END_POINTS.SOCIAL_TIMELINE, request)
  }

  fetchModeratorTimelineData(timelineRequest: SocialForum.IModeratorTimelineRequest) {
    return this.http.post<SocialForum.IModeratorTimeline>(API_PROTECTED_END_POINTS.SOCIAL_MODERATOR_TIMELINE, timelineRequest)
  }
  fetchForums(forumViewRequest: SocialForum.IForumViewRequest) {
    return this.http.post<SocialForum.IForumViewResponse>(API_PROTECTED_END_POINTS.SOCIAL_FORUMVIEW, forumViewRequest)
  }
  fetchMyPosts(myPostTimelineReq: SocialForum.ITimelineRequest) {
    return this.http.post<SocialForum.ITimeline>(API_PROTECTED_END_POINTS.SOCIAL_TIMELINE, myPostTimelineReq)
  }

  fetchAdminTimelineData(adminPostTimelineReq: SocialForum.IAdminTimelineRequest) {
    // // console.log('The postkind for api call is' + adminPostTimelineReq.postKind)
    return this.http.post<SocialForum.IAdminTimeline>(API_PROTECTED_END_POINTS.SOCIAL_ADMIN_TIMELINE, adminPostTimelineReq)
  }

  private fetchForumsSubject(forumViewRequest: SocialForum.IForumViewRequest) {
    this.http.post<SocialForum.IForumViewResponse>(API_PROTECTED_END_POINTS.SOCIAL_FORUMVIEW, forumViewRequest)
      .subscribe(
        data => {
          if (!this.forumsSubject) {
            this.forumsSubject = new ReplaySubject(1)
          }

          this.forumsSubject.next(data)
        },
        _ => {
          if (!this.forumsSubject) {
            this.forumsSubject = new ReplaySubject(1)
          }
          this.forumsSubject.next()
        },
      )
  }

  fetchForumById(forumId: string) {
    return this.http.post<any>(API_PROTECTED_END_POINTS.SOCIAL_FORUM_BY_ID, { id: forumId })
  }

  getForumsDetails(
    forumViewRequest: SocialForum.IForumViewRequest
  ): Observable<SocialForum.IForumViewResponse> {

    this.forumsSubject = new ReplaySubject()
    this.fetchForumsSubject(forumViewRequest)

    return this.forumsSubject.asObservable()
  }

}
