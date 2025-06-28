import { Injectable } from '@angular/core'
import { IEvent } from '../models/event.model'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor(private http: HttpClient) {}

  fetchLiveEvents(): Observable<IEvent[]> {
    return this.http.get<IEvent[]>(`${API_PROTECTED_END_POINTS.LIVE_EVENTS}`)
  }
}
