import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { SocialForum } from '../../forums/models/SocialForumposts.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})

export class SocialSearchService {

  constructor(private http: HttpClient) { }

  fetchSearchTimelineData(request: SocialForum.ISocialSearchRequest) {

    return this.http.post<SocialForum.ISocialSearchTimeline>(API_PROTECTED_END_POINTS.SOCIAL_VIEW_SEARCH_RESULT, request)
  }
}
