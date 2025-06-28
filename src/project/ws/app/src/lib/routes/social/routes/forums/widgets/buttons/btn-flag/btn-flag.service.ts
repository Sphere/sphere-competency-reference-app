import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { SocialForum } from '../../../models/SocialForumposts.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class BtnFlagService {

  constructor(private http: HttpClient) { }

  flagPost(flagRequest: SocialForum.IFlagRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_PROTECTED_END_POINTS.USER_CONTENT_FLAG}`, flagRequest)
  }
  unflagPost(flagRequest: SocialForum.IFlagRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_PROTECTED_END_POINTS.USER_CONTENT_FLAG}`, flagRequest)
  }
}
