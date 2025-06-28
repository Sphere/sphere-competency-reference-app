import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { SocialForum } from '../../../models/SocialForumposts.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class BtnAdminService {

  constructor(
    private http: HttpClient
  ) { }

  reject(moderatorRequest: SocialForum.IAdminBtnRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_PROTECTED_END_POINTS.SOCIAL_ADMIN_DEL}`, moderatorRequest)
  }
  revivePost(adminRequest: SocialForum.IAdminRevivePostRequest) {
    return this.http.post<{ data: Observable<number> }>(`${API_PROTECTED_END_POINTS.SOCIAL_ADMIN_REVIVE}`, adminRequest)
  }

}
