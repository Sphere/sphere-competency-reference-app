import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { NsSettings } from './settings.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable()
export class SettingsService {

  constructor(
    private http: HttpClient,
  ) { }

  fetchNotificationSettings(): Observable<NsSettings.INotificationGroup[]> {
    return this.http.get<NsSettings.INotificationGroup[]>(API_PROTECTED_END_POINTS.NOTIFICATIONS)
  }
  updateNotificationSettings(body: NsSettings.INotificationGroup[]): Observable<any> {
    return this.http.patch(API_PROTECTED_END_POINTS.NOTIFICATIONS, body)
  }
}
