import { Inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import {
  IUserProfileDetails,
  ILanguagesApiData,
  INationalityApiData,
  IUserProfileDetailsFromRegistry,
} from '../models/user-profile.model'
import { map } from 'rxjs/operators'
import { CordovaHttpService } from '../../../../../../../../app/modules/core/services/cordova-http.service'
import { ToastService, LocalStorageService } from '../../../../../../../../app/manage-learn/core'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { ModalController } from '@ionic/angular'
import { AuthService, DeviceInfo, SharedPreferences } from '@project-sunbird/sunbird-sdk'
import { UserService } from '../../../../../../../../app/modules/home/services/user.service'
import { storageKeys } from '../../../../../../../../app/manage-learn/storageKeys'
import * as _ from 'lodash'
import { buildConfig } from '../../../../../../../../../configurations/configuration'
const API_ENDPOINTS = {
  // updateProfileDetails: '/apis/protected/v8/user/profileRegistry/updateUserRegistry',
  updateProfileDetails: '/apis/public/v8/mobileApp/user/profileUpdate',
  // updateProfileDetails: '/apis/protected/v8/user/profileDetails/updateUser',
  // getUserdetailsFromRegistry: '/apis/protected/v8/user/profileRegistry/getUserRegistryById',
  getUserdetailsFromRegistry: '/apis/public/v8/mobileApp/kong/user/v2/read',
  getUserdetails: '/apis/protected/v8/user/details/detailV1',
  getMasterNationlity: '/apis/protected/v8/user/profileRegistry/getMasterNationalities',
  getMasterLanguages: '/apis/protected/v8/user/profileRegistry/getMasterLanguages',
  // getProfilePageMeta: '/apis/protected/v8/user/profileRegistry/getProfilePageMeta',
  getAllDepartments: '/apis/protected/v8/portal/listDeptNames',
  approveRequest: '/apis/protected/v8/workflowhandler/transition',
  getPendingFields: '/apis/protected/v8/workflowhandler/userWFApplicationFieldsSearch',
  // getProfilePageMeta: '/apis/protected/v8/user/profileDetails/getProfilePageMeta',
}

@Injectable()
export class UserProfileService extends CordovaHttpService {
  public _updateuser = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  updateuser$ = this._updateuser.asObservable()
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP,
    private userService: UserService,
    private localStorage: LocalStorageService
  ) {
    super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
    this.baseUrl = 'https://'+buildConfig.SITEPATH
  }
  updateProfileDetails(data: any) {
    const options = {
      url: API_ENDPOINTS.updateProfileDetails,
      payload: data,
    };
    return this.post(options)
  }
  getUserdetails(email: string | undefined): Observable<[IUserProfileDetails]> {
    const options = {
      url: API_ENDPOINTS.getUserdetails,
      payload: { email },
    };
    return this.post(options)
  }
  getMasterLanguages(): Observable<ILanguagesApiData> {
    const options = {
      url: API_ENDPOINTS.getMasterLanguages,
    };
    return this.get(options)
  }
  getMasterNationlity(): Observable<INationalityApiData> {
    const options = {
      url: API_ENDPOINTS.getMasterNationlity,
    };
    return this.get(options)
  }
  getUserdetailsFromRegistry(wid: string): Observable<[IUserProfileDetailsFromRegistry]> {
    const options = {
      url: `${API_ENDPOINTS.getUserdetailsFromRegistry}/${wid}`,
    };
    
    const response = this.get(options)
    .pipe(map((res: any) => res.result.response))
    return response
  }

  getData(url: string) {
    const options = {
      url: url,
    };
    return this.get(options)
  }

  async updateProfileData(res:any){
    if(res ){
      this.userService.setConfigService(res)
      this.userService._updateValue.next(res)
      this.userService.isAuthenticated = true
      await this.localStorage.deleteOneStorage(storageKeys.userProfile)
      this.localStorage.setLocalStorage(storageKeys.userProfile, res)
    }
  }
}
