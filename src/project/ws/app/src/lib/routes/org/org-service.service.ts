import { map, catchError } from 'rxjs/operators'
import { Inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of, BehaviorSubject } from 'rxjs'
import { AuthService, DeviceInfo, SharedPreferences } from '@project-sunbird/sunbird-sdk'
import { ToastService } from '../../../../../../../app/manage-learn/core'
import { CordovaHttpService } from '../../../../../../../app/modules/core/services/cordova-http.service'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { ModalController } from '@ionic/angular'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { API_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class OrgServiceService extends CordovaHttpService {
  hideHeaderFooter = new BehaviorSubject<boolean>(false)
  sitePath = `assets/configurations/`

  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP,
    public configSvc: ConfigurationsService
  ) {
    super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
  }

  resolve(): Observable<any> {
    return this.getOrgMetadata().pipe(
      map((data: any) => ({ data, error: null })),
      catchError((error: any) => of({ error, data: null })),
    )
  }

  getOrgMetadata() {
    const orgMeta = this.http.get(`${this.sitePath}/orgmeta.config.json`)
    return orgMeta
  }

  getSearchResults(source?: any): Observable<any> {
    const req = { 
      request: { 
        filters: {
            primaryCategory: ['Course'], 
            contentType: ['Course'],
            sourceName: source
          } 
        }, 
        query: '', 
        sort: [
          { 
            lastUpdatedOn: 'desc' 
          }
      ] 
    }
    const options = {
      url: API_END_POINTS.GET_CORUSES,
      payload: req
    };
    return this.post(options)
  }

  getSearchResultsById(identifier?: any): Observable<any> {
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], "status": [
            "Live"
          ],
          "identifier": identifier
        }
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }]
    }
    const options = {
      url: API_END_POINTS.GET_CORUSES,
      payload: req
    };
    return this.post(options)
  }

  getDatabyOrgId(): Promise<any> {
    const options = {
      url: `${this.configSvc.sitePath}/page/course.json`
    };
    return this.get(options).toPromise()
  }

  

  // setConnectSid(authCode: any): Observable<any> {
  //   // // console.log(authCode)
  //   const options = {
  //     url: `${API_END_POINTS.KEYCLOAK_COOKIE}/endpoint?keycloak=true&code=${authCode}`,
  //     payload: {}
  //   };
  //   return this.post(options)

  // }
}
