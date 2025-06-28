import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { NSLearningData } from '../models/my-learning.model'
import { ConfigurationsService } from '../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { API_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class MyLearningService {
  httpOptions = {
    headers: new HttpHeaders({
      validator_URL: `https://${this.configSvc.hostPath}/apis/protected/v8/user/validate`,
    }),
  }
  constructor(private http: HttpClient, private configSvc: ConfigurationsService) { }

  getMyLearningData(): Observable<NSLearningData.ILearningDetails> {
    return this.http.get<NSLearningData.ILearningDetails>(
      `${API_END_POINTS.MY_LEARNING}`,
      this.httpOptions,
    )
  }
}
