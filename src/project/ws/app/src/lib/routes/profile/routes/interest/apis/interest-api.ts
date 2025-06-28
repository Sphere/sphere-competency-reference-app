import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { ITopic, ITopicRecommended } from '../models/interest.model'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class InterestApiService {
  constructor(private http: HttpClient) {}
  fetchSuggestedTopics(): Observable<string[]> {
    return this.http
      .get<ITopicRecommended[]>(`${API_PROTECTED_END_POINTS.recommendedTopics}`)
      .pipe(map(u => u.map((topic: ITopicRecommended) => topic.name)))
  }
  fetchUserTopics(): Observable<string[]> {
    return this.http
      .get<ITopic[]>(`${API_PROTECTED_END_POINTS.userTopics}?ts=${new Date().getTime()}`)
      .pipe(map(u => u.map((topic: ITopic) => topic.name)))
  }
  modifyUserTopics(topics: string[]) {
    return this.http.post(API_PROTECTED_END_POINTS.userTopics, { topics })
  }
}
