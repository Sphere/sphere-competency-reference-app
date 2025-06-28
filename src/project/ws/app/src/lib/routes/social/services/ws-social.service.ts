import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { NsSocial } from '../models/social.model'
import { NsDiscussionForum } from '../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class WsSocialService {
  constructor(private http: HttpClient) { }

  fetchAutoComplete(queryStr: string): Observable<NsDiscussionForum.IPostTag[]> {
    const req: NsSocial.IPostAutoComplete = {
      query: queryStr,
    }
    return this.http.post<NsDiscussionForum.IPostTag[]>(API_PROTECTED_END_POINTS.SOCIAL_POST_AUTOCOMPLETE, req)
  }
  draftPost(request: NsDiscussionForum.IPostPublishRequest) {
    return this.http.post(API_PROTECTED_END_POINTS.SOCIAL_POST_DRAFT, request)
  }
  acceptAnswer(request: NsSocial.IAcceptAnswer): Observable<any> {
    return this.http.post<any>(API_PROTECTED_END_POINTS.SOCIAL_POST_ACCEPT_ANSWER, request)
  }
}
