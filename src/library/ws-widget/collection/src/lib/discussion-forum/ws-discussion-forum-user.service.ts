import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { NsDiscussionForum } from './ws-discussion-forum.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class WsDiscussionForumUserService {
  constructor(private http: HttpClient) { }
  fetchUserFollow(userId: string): Observable<NsDiscussionForum.IUserFollow> {
    return this.http.get<NsDiscussionForum.IUserFollow>(`${API_PROTECTED_END_POINTS.USER_FOLLOW_DATA}/${userId}`)
  }
  followUser(request: any): Observable<any> {
    return this.http.post<any>(API_PROTECTED_END_POINTS.USER_FOLLOW, request)
  }
  unFollowUser(request: any): Observable<any> {
    return this.http.post<any>(API_PROTECTED_END_POINTS.USER_UNFOLLOW, request)
  }
}
