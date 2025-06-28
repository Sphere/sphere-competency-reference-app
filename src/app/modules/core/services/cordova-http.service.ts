import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { from, Observable, of as observableOf, of, throwError } from 'rxjs';
import { RequestParams } from '../../../../app/manage-learn/core/interfaces/request-params';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { ModalController } from '@ionic/angular';
import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { mergeMap, catchError } from 'rxjs/operators';
import { ToastService } from '../../../../app/manage-learn/core/services/toast/toast.service';
import appsConfig from 'assets/configurations/apps.json';
import { buildConfig } from '../../../../../configurations/configuration';

@Injectable({
  providedIn: 'root'
})
export class CordovaHttpService {
  baseUrl: string;
  tokens;
  authToken;
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP
  ) {
    this.baseUrl = 'https://'+buildConfig.SITEPATH
  }

  setHeaders(session, header?: any) {
    const headers = {
      'Authorization': `Bearer ${appsConfig.API.secret_key}`,
      
      'X-authenticated-user-token': session ? session.access_token : '',
      'Content-Type': 'application/json',
     
    }
    if(header){
      if(!session?.access_token){
        delete headers['X-authenticated-user-token'];
        delete headers['x-auth-token']
      }
      return {...headers, ...header}
     }else{
      if(!session?.access_token){
        delete headers['X-authenticated-user-token'];
        delete headers['x-auth-token']
      } 
       return {...headers}
     }
    if(!session?.access_token){
      delete headers['X-authenticated-user-token'];
      delete headers['x-auth-token']
    }
    // return headers;
  }

  get(requestParam: RequestParams): Observable<any> {
    return this.checkTokenValidation().pipe(
      mergeMap(async session => {
        const headers = session ? this.setHeaders(session) : {};
          this.ionicHttp.setDataSerializer('json');
          const body = requestParam.payload ? requestParam.payload : '';
          const url = this.checkBaseUrl(requestParam.url);
          return await this.ionicHttp.get(url, body, headers).then(
            data => {
              return JSON.parse(data.data);
            }
          ).catch(error => {
            this.handleError(error);
            throw error; 
          });
      })
    )
  }

  getWithHandleError(requestParam: RequestParams): Observable<any> {
    return this.checkTokenValidation().pipe(
      mergeMap((session) => from(this.makeRequest(session, requestParam))),
      catchError(error => throwError(error))
    );
  }
  
  private async makeRequest(session: any, requestParam: RequestParams): Promise<any> {
    try {
      const headers = session ? this.setHeaders(session) : {};
      this.ionicHttp.setDataSerializer('json');
      const body = requestParam.payload ? requestParam.payload : '';
      const url = this.checkBaseUrl(requestParam.url);
  
      const data = await this.ionicHttp.get(url, body, headers);
      return JSON.parse(data.data);
    } catch (error) {
      this.handleGetError(error);
    }
  }
  
  private handleGetError(error: any): any {
    let status = error.status <= 0 ? 0 : error.status;
  
    switch (status) {
      case 0:
        // this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger')
        break;
      case 400:
        console.log(error);
        break;
      case 419:
        console.log(error);
        break;
      case 401:
        this.toast.showMessage('Session expired', 'danger');
        break;
      default:
        console.log(error);
    }
  
    throw error;
  }
  
  

  patch(requestParam: RequestParams): Observable<any> {
    return this.checkTokenValidation().pipe(
      mergeMap(session => {
        const headers = session ? this.setHeaders(session, requestParam.header) : {};
        let body = requestParam.payload ? requestParam.payload : {};
          this.ionicHttp.setDataSerializer('json');
          const url = this.checkBaseUrl(requestParam.url)
          return this.ionicHttp.patch(url, body, headers).then(
            data => {
              return JSON.parse(data.data);
            }
          ).catch(error => {
            this.handleError(error);
            throw error; 
          });
      })
    )
  }

  checkTokenValidation(): Observable<any> {
    return this.authService.getSession().pipe(
      mergeMap(tokens => {
        if(tokens){
          const token = jwt_decode(tokens.access_token);
          const tokenExpiryTime = moment(token.exp * 1000);
          const currentTime = moment(Date.now());
          const duration = moment.duration(tokenExpiryTime.diff(currentTime));
          const hourDifference = duration.asHours();
          if (hourDifference < 2) {
            return this.authService.refreshSession().pipe(
              mergeMap(refreshData => {
                return this.authService.getSession()
              })
            )
          } else {
            return this.authService.getSession()
          }
        }else{
          return observableOf({})
        }
      })
    )
  }

  getToken() {
    this.preferences.getString('api_bearer_token_v2').subscribe(resp => {
      this.authToken = `Bearer ${resp}`;
    });
  }

  post(requestParam: RequestParams): Observable<any> {
    return this.checkTokenValidation().pipe(
      mergeMap(session => {
        const headers = session ? this.setHeaders(session) :{};
          let body = requestParam.payload ? requestParam.payload : {};
          this.ionicHttp.setDataSerializer('json');
          const url = this.checkBaseUrl(requestParam.url)
          return this.ionicHttp.post(url, body, headers).then(
            data => {
              return JSON.parse(data.data);
            }).catch(error => {
            this.handleError(error);
            throw error; 
          });
      })
    )
  }

  delete(requestParam: RequestParams): Observable<any> {
    return this.checkTokenValidation().pipe(
      mergeMap(session => {
        const headers = this.setHeaders(session);
        const url = this.checkBaseUrl(requestParam.url)
          return this.ionicHttp.delete(url, '', headers).then(data => {
            return data; 
          })
          .catch(error => {
            this.handleError(error);
            throw error; 
          });
      })
    )
  }



  private handleError(result) {
    let status  = result.status <= 0 ? 0 :result.status;
    // console.log(result)
    switch (status) {
      case 0:
        // this.toast.showMessage('FRMELEMNTS_MSG_YOU_ARE_WORKING_OFFLINE_TRY_AGAIN', 'danger')
        break
      case 400: 
        console.log(result);
        break
      case 419: 
        console.log(result);
        break
      case 500: // explicitly handle 500 if needed
        console.log(result);
        break;
      case 401:
        this.toast.showMessage('Session expired', 'danger')
        break
      default:
        console.log(result);
        
    }
    return throwError(() => result);
  }

  private checkBaseUrl(url: string) {
    if((url).includes(this.baseUrl)) {
      return url;
    }
    else {
      return ((url).charAt(0))=== '/' ? this.baseUrl + url : this.baseUrl + '/' + url
    }
  }
}
