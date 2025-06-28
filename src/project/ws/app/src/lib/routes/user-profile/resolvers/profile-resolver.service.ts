import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { IResolveResponse } from '../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'
import { NsUser } from '../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.model'
import { ConfigurationsService } from '../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { Observable, of } from 'rxjs'

@Injectable()
export class ProfileResolverService implements Resolve<Observable<NsUser.IUserProfile>> {

  constructor(private configSvc: ConfigurationsService) { }

  resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {

    const result: IResolveResponse<NsUser.IUserProfile> = {
      data: this.configSvc.userProfile,
      error: null,
    }
    return of(result)
  }
}
