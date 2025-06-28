import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CordovaHttpService } from '../../core/services/cordova-http.service';

import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { ModalController } from '@ionic/angular';
import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import { ToastService } from '../../../../app/manage-learn/core/services/toast/toast.service';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import * as _ from "lodash"
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from '../../../../app/manage-learn/core';
import { storageKeys } from '../../../../app/manage-learn/storageKeys';
import { AppFrameworkDetectorService } from '../../core/services/app-framework-detector-service.service';
import { buildConfig } from '../../../../../configurations/configuration';
import { API_END_POINTS, API_END_POINTS_S3 } from '../../../../app/apiConstants';

@Injectable({
  providedIn: 'root'
})
export class UserService extends CordovaHttpService {
  public _updateValue = new BehaviorSubject<any>(undefined)
  updateValue$ = this._updateValue.asObservable()
  private roleSelected = new BehaviorSubject<string>('learner');
  roleSelected$ = this.roleSelected.asObservable();
  isAuthenticated = false
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  activeRole = 'learner'
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP,
    public configSvc: ConfigurationsService,
    private localStorage: LocalStorageService,
    private frameWorkDetector: AppFrameworkDetectorService
  ) {
    super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
    !this.baseUrl ? 'https://' +buildConfig.SITEPATH : '';
  }

  async userRead(userId) {
    if (userId) {
      await this.getUserProfilefromLocalstorage(userId)
    }
  }

  setRole(data: string): void {
    this.localStorage.setLocalStorage('userActiveRole',data);
    this.roleSelected.next(data);
  }

  getActiveRole(){
    return new Promise(async resolve => {
      this.localStorage.getLocalStorage('userActiveRole').then(
        (_role:string) => {
          if(_role == " " || _role == undefined) {
            resolve("learner");
          }else{
            resolve(_role);
          }
        },
        (error) => {
          resolve('learner')
        }
      );
    })
  }
  

  async getUserProfilefromLocalstorage(userId) {
    try {
      const resp = await this.localStorage.getLocalStorage(storageKeys.userProfile);
      if (resp) {
        this.setConfigService(resp);
        this._updateValue.next(resp);
        await this.userReadCall(userId);
      } else {
        this.userReadCall(userId).subscribe((res) => {
          this.setUserProfile(res)
        })
      }
    } catch (error) {
      this.userReadCall(userId).subscribe((res) => {
        this.setUserProfile(res)
      })
    }
  }

  userReadCall(userId) {
    const requestParam = {
      url: API_END_POINTS.USER_READ(userId),
    };
    return this.get(requestParam)

  }

  setUserProfile(res) {
    let userProfile = _.get(res, 'result.response')
    this.setConfigService(userProfile)
    this._updateValue.next(userProfile)
    // console.log('After receiving userProfile',userProfile)
    this.isAuthenticated = true
    this.isAuthenticatedSubject.next(true);
    // console.log("serice",this.isAuthenticated)
    this.localStorage.setLocalStorage(storageKeys.userProfile, userProfile)
  }
  resetUserProfile(){
    this._updateValue.next(undefined)
    this._updateValue.complete()
    this.isAuthenticated = false
    this.configSvc.userProfile = null 
    this.configSvc.unMappedUser = null
    localStorage.removeItem('competency')
    this.isAuthenticatedSubject.next(false);
    this.localStorage.deleteOneStorage(storageKeys.userProfile)
  }
  setConfigService(userPidProfile: any) {
    this.configSvc.userDetails = userPidProfile
   let lang = this.setLanguage(userPidProfile);
    if (userPidProfile && userPidProfile.roles && userPidProfile.roles.length > 0 &&
      this.hasRole(userPidProfile.roles)) {
      this.configSvc.unMappedUser = userPidProfile
      const profileV = _.get(userPidProfile, 'profileDetails.profileReq')
      this.configSvc.userProfile = {
        country: _.get(profileV, 'personalDetails.countryCode') || null,
        email: _.get(profileV, 'profileDetails.officialEmail') || userPidProfile.email,
        givenName: userPidProfile.firstName,
        userId: userPidProfile.userId,
        firstName: userPidProfile.firstName,
        lastName: userPidProfile.lastName,
        rootOrgId: userPidProfile.rootOrgId,
        rootOrgName: userPidProfile.channel,
        // tslint:disable-next-line: max-line-length
        // userName: `${userPidProfile.firstName ? userPidProfile.firstName : ' '}${userPidProfile.lastName ? userPidProfile.lastName : ' '}`,
        userName: userPidProfile.userName,
        profileImage: userPidProfile.thumbnail,
        departmentName: userPidProfile.channel,
        dealerCode: null,
        isManager: false,
        phone: _.get(userPidProfile, 'phone'),
        language:  this.setLanguage(userPidProfile),
        profileData:  _.get(userPidProfile.profileDetails, 'profileReq'),
      }
      if (!this.configSvc.nodebbUserProfile) {
        this.configSvc.nodebbUserProfile = {
          username: userPidProfile.userName,
          email: 'null',
        }
      }
    }
    const details = {
      group: [],
      profileDetailsStatus: !!_.get(userPidProfile, 'profileDetails.mandatoryFieldsExists'),
      roles: (userPidProfile.roles || []).map((v: { toLowerCase: () => void }) => v.toLowerCase()),
      tncStatus: !(_.isUndefined(this.configSvc.unMappedUser)),
      isActive: !!!userPidProfile.isDeleted,
    }
    this.configSvc.hasAcceptedTnc = details.tncStatus
    this.configSvc.profileDetailsStatus = details.profileDetailsStatus
    this.configSvc.userGroups = new Set(details.group)
    this.configSvc.userRoles = new Set((details.roles || []).map((v: string) => v.toLowerCase()))
    this.configSvc.isActive = details.isActive
  }
  hasRole(role: string[]): boolean {
    let returnValue = false
    const rolesForCBP: any = ['PUBLIC']
    role.forEach(v => {
      if ((rolesForCBP).includes(v)) {
        returnValue = true
      }
    })
    return returnValue
  }

  setLanguage(userPidProfile) {
    let lang;
    if(userPidProfile?.profileDetails?.preferences?.language ){
      lang =  _.get(userPidProfile, 'profileDetails.preferences.language')
      return lang 
    }else{
      this.frameWorkDetector.detectAppFramework().then(
        (res) => {
          lang = res  === 'Sphere' ? 'en' : 'hi';
          // console.log(">>>>>>> language", res, typeof(res))
        }
      )
    }

    return lang;
   
  }

  async getOrgData(): Promise<Observable<any>> {
    return new Promise(async (resolve, reject) => {
      if(navigator.onLine){
        let ordData =  await this.http.get<any>(API_END_POINTS_S3.ORG_DATA);
        ordData.subscribe((_res) => {
          this.localStorage.setLocalStorage('APP_ORG_DATA', _res);
          console.log('getOrgData from server -', _res)
          resolve(_res);
        });
      } else{
        const ordData = await this.localStorage.getLocalStorage('APP_ORG_DATA');
        console.log('getOrgData from local -', ordData)
        resolve(ordData);
      }
    });
  }

  async getCompetencyData(): Promise<Observable<any>> {
    return new Promise(async (resolve, reject) => {
      if(navigator.onLine){
        let ordData =  await this.http.get<any>(API_END_POINTS_S3.COMPETENCY_ORG_DATA);
        ordData.subscribe((_res) => {
          this.localStorage.setLocalStorage('APP_COMPETENCY_DATA', _res);
          console.log('getOrgData from server -', _res)
          resolve(_res);
        });
      } else{
        const ordData = await this.localStorage.getLocalStorage('APP_COMPETENCY_DATA');
        console.log('getOrgData from local -', ordData)
        resolve(ordData);
      }
    });
  }



  getRoleWiseData() {
    const requestParam = {
      url: API_END_POINTS.ROLE_WISE_COMPETENCY,
    };
    return this.get(requestParam)

  }

  getAshaProgress(userId){
    const requestParam = {
      url: API_END_POINTS.GET_ASHA_PROGRESS(userId)
    }

    return this.get(requestParam)
  }


  public getCompetencyCourseIdentifier(data:any){ 
    const req = {
      "request": {
        "filters": {
          "primaryCategory": [
            "Course"
          ],
          "contentType": [
            "Course"
          ],
          "status": [
            "Live"
          ],
          "competency": [true],
          "lang": data
        }
      },
      "sort": [
        {
          "lastUpdatedOn": "desc"
        }
      ]
    }
   
    let options = {
      
    }
    const httpOptions: any = {
      url:   API_END_POINTS.GET_CORUSES,
      payload: req
    };
    
    return this.post(httpOptions)
  }

}
