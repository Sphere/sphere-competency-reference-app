import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { NsInstanceConfig } from '../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.model'
import { ConfigurationsService } from '../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { Observable, of } from 'rxjs'
import { IResolveResponse } from '../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'

@Injectable()
export class ConfigResolverService implements Resolve<Observable<NsInstanceConfig.IConfig>> {

  constructor(private configSvc: ConfigurationsService) { }

  resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {

    const result: IResolveResponse<NsInstanceConfig.IConfig> = {
      data: this.configSvc.instanceConfig,
      error: null,
    }
    return of(result)
  }
}
