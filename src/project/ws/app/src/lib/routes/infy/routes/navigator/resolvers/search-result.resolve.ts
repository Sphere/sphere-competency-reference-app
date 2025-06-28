import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'

import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { NavigatorService } from '../services/navigator.service'
import { IResolveResponse } from '../../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'

@Injectable()
export class SearchResultResolve
  implements Resolve<Observable<IResolveResponse<any>> | IResolveResponse<any>> {
  constructor(private navigatorSvc: NavigatorService) {}

  resolve(): Observable<IResolveResponse<any>> | IResolveResponse<any> {
    return this.navigatorSvc.fetchLearningPathData().pipe(
      map(data => ({ data, error: null })),
      catchError(_ => of({ data: null, error: null })),
    )
  }
}
