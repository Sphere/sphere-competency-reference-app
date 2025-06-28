import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { IWsEmailTextRequest, IWsEmailResponse } from '../models/co-create.model'
import { IWsToDoListResponse } from '../models/ocm.model'
import { IWsFeedbackTypeRequest } from '../models/feedback.model'
import { map } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class OcmService {
  constructor(private http: HttpClient) {}

  shareTextMail(req: IWsEmailTextRequest): Observable<IWsEmailResponse> {
    return this.http.post<any>(API_PROTECTED_END_POINTS.EMAIL_TEXT, req).pipe(map(u => u.result))
  }

  submitFeedback(request: IWsFeedbackTypeRequest): Observable<any> {
    return this.submitFeedbackWithData(request)
  }

  submitFeedbackWithData(data: IWsFeedbackTypeRequest): Observable<any> {
    // converting rating to string as per API request contract
    if (data.rating) {
      data.rating = data.rating.toString()
    }
    return this.http.post<any>(API_PROTECTED_END_POINTS.USER_FEEDBACK, { request: data }).pipe(
      map(response => {
        return response.result
      }),
    )
  }

  fetchToDos(id: string): Observable<IWsToDoListResponse[]> {
    return this.http.get<IWsToDoListResponse[]>(`${API_PROTECTED_END_POINTS.FETCH_TO_DOS}/${id}`)
  }
}
