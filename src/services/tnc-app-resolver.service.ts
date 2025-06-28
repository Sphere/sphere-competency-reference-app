import { Inject, Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { IResolveResponse } from '../library/ws-widget/utils/src/lib/resolvers/resolver.model'
import { ConfigurationsService } from '../library/ws-widget/utils/src/lib/services/configurations.service'
import { NsTnc } from '../app/models/tnc.model' 
import { CordovaHttpService } from '../app/modules/core/services/cordova-http.service'
import { ToastService } from '../app/manage-learn/core'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { ModalController } from '@ionic/angular'
import { AuthService, DeviceInfo, SharedPreferences } from '@project-sunbird/sunbird-sdk'
import tncConfig from 'assets/configurations/tnc.config.json'
import hitncConfig from 'assets/configurations/hitnc.config.json'
import kntncConfig from 'assets/configurations/kntnc.config.json'
import * as _ from 'lodash-es';
import { UserService } from '../app/modules/home/services/user.service'
import { buildConfig } from '../../configurations/configuration'

@Injectable()
export class TncAppResolverService extends CordovaHttpService implements Resolve<Observable<IResolveResponse<NsTnc.ITnc>> | IResolveResponse<NsTnc.ITnc>> {

  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP,
    private configSvc: ConfigurationsService,
    private userHomeSvc:UserService,
  ) { 
    super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
    this.baseUrl = 'https://'+buildConfig.SITEPATH
  }

  resolve(): Observable<IResolveResponse<NsTnc.ITnc>> {
    let configType = tncConfig;  
    console.log("fk", this.configSvc.userProfile) 
    if(this.configSvc.userProfile?.language){
      const code = _.get(this.configSvc, 'userProfile.language')
      if (code === 'hi') {
        configType = hitncConfig;
      } else if (code === 'kn') {
        configType = kntncConfig;
      } else{
        configType = tncConfig
      }
    }
    return of(configType)
  }
  getTnc(locale?: string): Observable<any> {
    let configType;
    this.userHomeSvc.updateValue$.subscribe(async (res: any) => {

      if (res) {
        if (res && res.profileDetails) {
          if (_.get(res, 'profileDetails.preferences.language')) {
            const code = _.get(res, 'profileDetails.preferences.language')
            if (code === 'hi') {
              configType = hitncConfig
            }
            else if (code === 'kn') {
              configType = kntncConfig
            }
            else{
              configType = tncConfig
            }
          }
        }
      }})
    return of(configType)
  } 

}
