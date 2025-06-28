import { Inject, Injectable } from '@angular/core'
import { AuthService } from '@project-sunbird/sunbird-sdk';
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/lib/services/configurations.service'
import * as _ from 'lodash-es';
import { ConfigService as CompetencyConfiService } from '@aastrika_npmjs/comptency/entry-module'

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  userProfileData: any
  constructor(
    public configSvc: ConfigurationsService,
    private CompetencyConfiService: CompetencyConfiService,
    @Inject('AUTH_SERVICE') private authService: AuthService,

  ) {

  }

  async setConfig(userData:any) {
    
    const session = await this.authService.getSession().toPromise();
    const config = {
      userName: userData?.userName,
      profileData: _.get(userData, 'profileData.professionalDetails'),
      language: userData?.language,
      id: userData?.userId,
      hostPath: this.configSvc.hostPath,
      isMobileApp: true,
      session
    }
    localStorage.setItem('competency', JSON.stringify(config))
    this.CompetencyConfiService.setConfig(config)
  }

}
