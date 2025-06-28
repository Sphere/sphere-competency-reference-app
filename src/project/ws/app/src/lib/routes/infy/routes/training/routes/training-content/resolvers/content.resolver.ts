import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { NsContent } from '../../../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { WidgetContentService } from '../../../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { IResolveResponse } from '../../../../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class ContentResolver implements Resolve<IResolveResponse<NsContent.IContent>> {
  constructor(private contentSvc: WidgetContentService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<NsContent.IContent>> {
    const contentId = route.paramMap.get('contentId')
    if (contentId) {
      return this.contentSvc.fetchContent(contentId, 'detail').pipe(
        map(data => ({ data, error: null })),
        catchError((error: any) => of({ error, data: null })),
      )
    }
    return of({ error: 'NO_ID', data: null })
  }
}
