import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { SocialForum } from '../../../models/SocialForumposts.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class BtnModeratorService {

  constructor(
    private http: HttpClient
  ) { }

  accept(moderatorRequest: SocialForum.IModeratorBtnRequest) {
    // // console.log("In the service class the request obtained is "+moderatorRequest)
    // // console.log("In the service class the request obtained is "+JSON.stringify(moderatorRequest))
    return this.http.post<{ data: Observable<number> }>(`${API_PROTECTED_END_POINTS.SOCIAL_MODERATOR_REACT}`, moderatorRequest)
  }
  reject(moderatorRequest: SocialForum.IModeratorBtnRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_PROTECTED_END_POINTS.SOCIAL_MODERATOR_REACT}`, moderatorRequest)
  }

}
