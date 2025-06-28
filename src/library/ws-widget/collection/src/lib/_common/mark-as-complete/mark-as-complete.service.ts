import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { IReqMarkAsComplete } from './mark-as-complete.model'
import { API_PROTECTED_END_POINTS } from '../../../../../../../app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class MarkAsCompleteService {
  constructor(
    private http: HttpClient,
  ) { }
  markAsComplete(req: IReqMarkAsComplete, contentId: string) {
    return this.http.post(
      `${API_PROTECTED_END_POINTS.markAsComplete}/${contentId}`,
      req,
    ).toPromise()
  }
}
