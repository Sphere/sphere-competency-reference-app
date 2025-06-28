import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { WidgetContentService } from '../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { IResolveResponse } from '../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

@Injectable()
export class ChannelsLabelsResolve
  implements
  Resolve<
  | Observable<IResolveResponse<any>>
  | IResolveResponse<any>
  > {
  constructor(private contentSvc: WidgetContentService) { }

  resolve(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<any>> {

    return this.contentSvc.search({
      pageNo: 0,
      pageSize: 0,
    }).pipe(
      map(data => {
        const labels = data.notToBeShownFilters.find(unit => unit.type === 'labels')
        if (labels) {
          return labels.content
        }
        return []
      }),
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
}
