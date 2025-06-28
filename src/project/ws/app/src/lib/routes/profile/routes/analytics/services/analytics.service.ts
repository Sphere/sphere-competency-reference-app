import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { NSAnalyticsData } from '../models/analytics.model'
import { NSCompetency } from '../../competency/models/competency.model'
import { ConfigurationsService } from '../../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { API_END_POINTS } from 'app/apiConstants'


@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  httpOptions = {
    headers: new HttpHeaders({
      validator_URL: `https://${this.configSvc.hostPath}/apis/protected/v8/user/validate`,
    }),
  }
  constructor(private http: HttpClient, private configSvc: ConfigurationsService) { }
  timeSpent(
    startDate: string,
    endDate: string,
    contentType: string,
    isCompleted: number,
  ): Observable<NSAnalyticsData.ITimeSpentResponse> {
    return this.http.get<NSAnalyticsData.ITimeSpentResponse>(
      `${API_END_POINTS.TIME_SPENT}?startDate=${startDate}&endDate=${endDate}&isCompleted=${isCompleted}&contentType=${contentType}`,
      this.httpOptions,
    )
  }

  nsoArtifacts(
    startDate: string,
    endDate: string,
    contentType: string,
    isCompleted: number,
  ): Observable<NSAnalyticsData.INsoResponse> {
    return this.http.get<NSAnalyticsData.INsoResponse>(
      `${API_END_POINTS.NSO_PROGRESS}?startDate=${startDate}&endDate=${endDate}&isCompleted=${isCompleted}&contentType=${contentType}`,
      this.httpOptions,
    )
  }
  userProgress(
    filterType: string,
    contentType: string,
  ): Observable<NSAnalyticsData.IUserProgressResponse> {
    return this.http.get<NSAnalyticsData.IUserProgressResponse>(
      `${API_END_POINTS.USER_PROGRESS}?contentType=${contentType}&progressSource=${filterType}`,
      this.httpOptions,
    )
  }
  assessments(
    startDate: string,
    endDate: string,
    contentType: string,
    isCompleted: number,
  ): Observable<NSAnalyticsData.IAssessmentResponse> {
    return this.http.get<NSAnalyticsData.IAssessmentResponse>(
      `${API_END_POINTS.ASSESSMENTS}?startDate=${startDate}&endDate=${endDate}&isCompleted=${isCompleted}&contentType=${contentType}`,
      this.httpOptions,
    )
  }
  fetchAssessments(startDate: string, endDate: string): Observable<NSCompetency.IAchievementsRes> {
    return this.http
      .get<NSCompetency.IAchievementsRes>(
        `${API_END_POINTS.GET_ASSESSMENTS}?startDate=${startDate}&endDate=${endDate}`,
        this.httpOptions,
      )
  }
  fetchFilterList(): Observable<null> {
    return this.http
      .get<null>(
        `${API_END_POINTS.FILTER_LIST}`,
        this.httpOptions,
      )
  }

}
