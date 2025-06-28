import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IBadgeResponse, IUserNotifications } from './badges.model'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class BadgesService {
  constructor(private http: HttpClient) { }

  fetchBadges(): Observable<IBadgeResponse> {
    return this.http.get<IBadgeResponse>(`${API_PROTECTED_END_POINTS.USER_BADGE}`)
  }

  reCalculateBadges(): Observable<any> {
    return this.http.post(`${API_PROTECTED_END_POINTS.USER_BADGES_UPDATE}`, {})
  }

  fetchRecentBadge(): Observable<IUserNotifications> {
    return this.http
      .get<any>(API_PROTECTED_END_POINTS.USER_BADGE_RECENT)
      .pipe(map(notifications => notifications))
  }

  generateQRCode(req: { course: string }): Observable<any> {
    return this.http.post(`${API_PROTECTED_END_POINTS.GENERATE_QRCODE}`, req)
  }
}
