import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IWsCounterInfyMeResponse, IWsCounterPlatformResponse } from '../models/counter.model'
import { HttpClient } from '@angular/common/http'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  constructor(private http: HttpClient) {}

  fetchPlatformCounterData(): Observable<IWsCounterPlatformResponse> {
    return this.http.get<IWsCounterPlatformResponse>(`${API_PROTECTED_END_POINTS.lexPlatform}`)
  }

  fetchInfyMeCounterData(): Observable<IWsCounterInfyMeResponse> {
    return this.http.get<IWsCounterInfyMeResponse>(`${API_PROTECTED_END_POINTS.infyMeCounter}`)
  }
}
