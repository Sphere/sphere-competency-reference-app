import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { IFeedbackSummary } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/models/feedback.model'
import { FeedbackService } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/services/feedback.service'
import { IResolveResponse } from '../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

@Injectable()
export class FeedbackSummaryResolver implements Resolve<IResolveResponse<IFeedbackSummary>> {
  constructor(private feedbackApi: FeedbackService) {}

  resolve(): Observable<IResolveResponse<IFeedbackSummary>> {
    try {
      return this.feedbackApi.getFeedbackSummary().pipe(
        map(summary => {
          return {
            data: summary,
            error: null,
          }
        }),
        catchError(() => {
          const result: IResolveResponse<IFeedbackSummary> = {
            data: null,
            error: 'FEEDBACK_SUMMARY_API_ERROR',
          }

          return of(result)
        }),
      )
    } catch (err) {
      const result: IResolveResponse<IFeedbackSummary> = {
        data: null,
        error: 'FEEDBACK_SUMMARY_RESOLVER_ERROR',
      }
      return of(result)
    }
  }
}
