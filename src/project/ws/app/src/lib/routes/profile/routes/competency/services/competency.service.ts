import { Injectable } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { NSCompetency } from '../models/competency.model'
import { map } from 'rxjs/operators'
import { ConfigurationsService } from '../../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { API_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  httpOptions = {
    headers: new HttpHeaders({
      validator_URL: `https://${this.configSvc.hostPath}/apis/protected/v8/user/validate`,
    }),
  }
  private assessmentSubject: ReplaySubject<NSCompetency.IAchievementsRes> | null = null
  constructor(private http: HttpClient, private configSvc: ConfigurationsService) {
  }

  getAssessmentDetails(
    startDate: string,
    endDate: string,
  ): Observable<NSCompetency.IAchievementsRes> {
    if (!this.assessmentSubject) {
      this.assessmentSubject = new ReplaySubject()
      this.fetchAssessments(startDate, endDate)
    }
    return this.assessmentSubject.asObservable()
  }

  getAssessmentForID(id: string, startDate: string, endDate: string) {
    if (!this.assessmentSubject) {
      this.assessmentSubject = new ReplaySubject()
      this.fetchAssessments(startDate, endDate)
    }

    return this.assessmentSubject
      .asObservable()
      .pipe(
        map((data: NSCompetency.IAchievementsRes) => {
          if (data.achievements) {
            data.achievements.find(assessment => assessment.id === id)
          }
        }),
      )
  }

  private fetchAssessments(startDate: string, endDate: string) {
    this.http
      .get<NSCompetency.IAchievementsRes>(
        `${API_END_POINTS.GET_ASSESSMENTS}?startDate=${startDate}&endDate=${endDate}`,
        this.httpOptions,
      )
      .subscribe(
        data => {
          if (!this.assessmentSubject) {
            this.assessmentSubject = new ReplaySubject(1)
          }
          const response: NSCompetency.IAchievementsRes = {
            ...data,
            achievements: data.assessments,
          }
          this.assessmentSubject.next(response)
        },
        _ => {
          if (!this.assessmentSubject) {
            this.assessmentSubject = new ReplaySubject(1)
          }
          this.assessmentSubject.next()
        },
      )
  }

  getDetails(startDate: string, endDate: string): Observable<NSCompetency.IAchievementsRes> {
    return this.http
      .get<NSCompetency.IAchievementsRes>(
        `${API_END_POINTS.GET_ASSESSMENTS}?startDate=${startDate}&endDate=${endDate}`,
        this.httpOptions,
      )
  }
}
