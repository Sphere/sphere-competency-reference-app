import { Inject, Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router'
import * as _ from 'lodash-es'

import { ConfigurationsService } from '../../library/ws-widget/utils/src/lib/services/configurations.service'
import { CommonUtilService } from '../../services/common-util.service'
import { UserService } from '../modules/home/services/user.service'
import { RouterLinks } from '../app.constant'

@Injectable({
  providedIn: 'root',
})
export class GeneralGuard implements CanActivate {
  dobFlag = false
  isXSmall = false
  locale = ''
  constructor(
    private router: Router,
    private configSvc: ConfigurationsService,
    private commonUtilService: CommonUtilService,
    private userHomeSvc: UserService,
  ) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const requiredFeatures = (next.data && next.data.requiredFeatures) || []
    const requiredRoles = (next.data && next.data.requiredRoles) || []

    return await this.shouldAllow<boolean | UrlTree>(requiredFeatures, requiredRoles, state)
  }

  private async shouldAllow<T>(
    requiredFeatures: string[],
    requiredRoles: string[],
    state: RouterStateSnapshot
  ): Promise<T | UrlTree | boolean> {

    if (state && state.url.includes('public/home')) {
      return this.checkTokenValidation()
    } else {
      if (localStorage.getItem('lang') && this.configSvc.userProfile!.language) {
        this.locale = this.configSvc.userProfile!.language
        if (this.locale === 'en') {
          this.locale = ''
        }
      }
      if (localStorage.getItem('lang')) {
        this.locale = localStorage.getItem('lang') || ''
        if (this.locale === 'en') {
          this.locale = ''
        }
      }
      if (!localStorage.getItem('lang') && this.configSvc.userProfile !== null) {
        if (this.configSvc.userProfile!.language === 'en') {
        } else {
          this.locale = this.configSvc.userProfile!.language || 'en-US'
        }
      }
      if (
        this.configSvc.userProfile === null &&
        this.configSvc.instanceConfig &&
        !Boolean(this.configSvc.instanceConfig.disablePidCheck)
      ) {
        return this.router.parseUrl(`/public/home`)
      }
      if (this.configSvc.userProfile) {

        const data = this.configSvc.userDetails
        // if (data.tcStatus && data.tcStatus === 'false') {
          // (this.configSvc.userDetails.tcStatus === 'false')
        if  (!data.tcStatus || (data.tcStatus && data.tcStatus === 'false'))  {
          this.userLanguage(data)
          return this.router.navigate(['app', 'new-tnc'])
        }
        if (data.profileDetails) {
          return true
        }
        this.userLanguage(data)
        // return this.router.navigate(['app', 'new-tnc'])
      }
      if (requiredRoles && requiredRoles.length && this.configSvc.userRoles) {
        const requiredRolePreset = requiredRoles.some(item =>
          (this.configSvc.userRoles || new Set()).has(item),
        )

        if (!requiredRolePreset) {
          // if (state.url.includes('/page/home')) {
          //   return true
          // }
          // return this.router.parseUrl(`/page/home`)
          return true
        }
      }

      if (requiredFeatures && requiredFeatures.length && this.configSvc.restrictedFeatures) {
        const requiredFeaturesMissing = requiredFeatures.some(item =>
          (this.configSvc.restrictedFeatures || new Set()).has(item),
        )

        if (requiredFeaturesMissing) {
          // if (state.url.includes('/page/home')) {
          //   return true
          // }
          // return this.router.parseUrl(`/page/home`)
          return true
        }
      }
      return true
    }
  }

  async checkTokenValidation() {
    const data = this.configSvc.userDetails;
    if (this.configSvc.userDetails && this.configSvc.userProfile) {
      if (!data.tcStatus || (data.tcStatus && data.tcStatus === 'false')) {
        this.router.navigateByUrl(RouterLinks.NEW_TNC)
        this.userLanguage()
      } else {
        this.userLanguage()
        this.router.navigateByUrl('page/home');
      }
    }
    return true
  }
  userLanguage(data?:any) {
    if(data){
      if(_.get(data,'profileDetails.preferences.language') ){
        const code = _.get(data,'profileDetails.preferences.language')
          this.commonUtilService.updateAppLanguage(code);
      }
    }else {
      this.userHomeSvc.updateValue$.subscribe((res: any) => {
        if(res && res.profileDetails){
          if(_.get(res,'profileDetails.preferences.language') ){
            const code = _.get(res,'profileDetails.preferences.language')
            this.commonUtilService.updateAppLanguage(code);
          }
        }
      })
    }
    
  }
}
