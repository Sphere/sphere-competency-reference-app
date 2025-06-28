import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { ModalController } from '@ionic/angular';
import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import { ToastService } from '../../../../../app/manage-learn/core/services/toast/toast.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import * as _ from "lodash"
import { BehaviorSubject } from 'rxjs';
import { CordovaHttpService } from '../../../../../app/modules/core/services/cordova-http.service';
import { buildConfig } from '../../../../../../configurations/configuration';
import { API_END_POINTS } from '../../../../../app/apiConstants';

@Injectable({
    providedIn: 'root'
})
export class LoginService extends CordovaHttpService {
    public _updateValue = new BehaviorSubject<any>(undefined)
    updateValue$ = this._updateValue.asObservable()
    isAuthenticated = false
    private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    baseUrl = 'https://'+buildConfig.SITEPATH;

    constructor(
        public http: HttpClient,
        public toast: ToastService,
        public modalController: ModalController,
        @Inject('AUTH_SERVICE') public authService: AuthService,
        @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
        @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
        public ionicHttp: HTTP,
        public configSvc: ConfigurationsService,
    ) {
        super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
        this.baseUrl = 'https://'+buildConfig.SITEPATH;
    }

    sendOTP(data: any) {
      return this.http.post(this.baseUrl+API_END_POINTS.SEND_OTP, data);
    }

    resendOTP(data: any) {
      return this.http.post(this.baseUrl+API_END_POINTS.RESEND_OTP, data);
    }
  
    userLogin(data: any) {
      return this.http.post(this.baseUrl+API_END_POINTS.USER_LOGIN, data);
    }

    searchUser(header, data: any) {
      let options = {
        headers:header
      }
      return this.http.post(this.baseUrl+API_END_POINTS.USER_SEARCH, data, options);
    }
}
