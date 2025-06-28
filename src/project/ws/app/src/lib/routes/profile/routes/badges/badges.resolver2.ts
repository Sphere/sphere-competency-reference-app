import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { IBadgeResponse } from './badges.model'
import { BadgesService } from './badges.service'
import { IResolveResponse } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'

@Injectable()
export class BadgesResolver2
  implements
  Resolve<
  Observable<IResolveResponse<{ response: IBadgeResponse }>> | IResolveResponse<IBadgeResponse>
  > {
  constructor(private badgesSvc: BadgesService) { }

  resolve(): Observable<IResolveResponse<IBadgeResponse>> | IResolveResponse<IBadgeResponse> {
    return this.badgesSvc.fetchBadges().pipe(
      map(data => ({ data, error: null })),
      catchError(() => of({ data: null, error: null })),
    )
  }
}
