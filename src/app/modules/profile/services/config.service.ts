import { Injectable } from '@angular/core'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  userProfileData: any
  constructor(
    public configSvc: ConfigurationsService,
  ) {

  }

  setConfig(profileData: any) {
    const config = {
      userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      profileData: (profileData.professionalDetails),
      id: this.configSvc.unMappedUser.id,
      hostPath: this.configSvc.hostPath,
    }

    localStorage.setItem('competency', JSON.stringify(config))
  }

}
