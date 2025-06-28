import { Inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import * as _ from 'lodash'
import { DataService } from '../../../core/services/data.service'
import { AuthService } from 'sunbird-sdk'
import { buildConfig } from '../../../../../../configurations/configuration'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { API_END_POINTS } from '../../../../../app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class SignupService extends DataService {
  baseUrl: string;
  constructor(public  http: HttpClient,
    private configSvc: ConfigurationsService,
    @Inject('AUTH_SERVICE') public authService: AuthService,
  ) {
    super(http,authService)
    this.baseUrl = 'https://'+buildConfig.SITEPATH+'/'
   }

  signup(data: any): Observable<any> {
    const options = {
      url: API_END_POINTS.USER_SIGNUP,
      data: data,
    };
    return this.post(options).pipe(
      map(response => {
        return response
      }),
    )
  }

  registerWithMobile(data: any) {
    const options = {
      url: API_END_POINTS.REGISTERUSERWITHMOBILE,
      data: data,
    };
    return this.post(options).pipe(
      map(response => {
        return response
      }),
    )
  }

  verifyUserMobile(data: any) {
    const options = {
      url: API_END_POINTS.VERIFY_OTP,
      data: data,
    };
    return this.post(options).pipe(
      map(response => {
        return response
      }),
    )
  }

  generateOtp(data: any) {
    const options = {
      url: API_END_POINTS.VERIFY_OTP,
      data: data,
    };
    return this.post(options).pipe(
      map(response => {
        return response
      }),
    )
  }
  validateOtp(data: any) {
    const options = {
      url: API_END_POINTS.VALIDATE_OTP,
      data: data,
    };
    return this.post(options).pipe(
      map(response => {
        return response
      }),
    )
  }

  public forgotPassword(data: any): Observable<any> {
    const options = {
      url: API_END_POINTS.RESET_PASSWORD,
      data: data,
    };
    return this.post(options).pipe(
      map(response => {
        return response
      }),
    )
  }
  plumb5SendEvent(data: any) {
    return this.http.post<any>(`https://track.plumb5.com/EventDetails/SaveEventDetails`, data).pipe(
      map(response => {
        return response
      })
    )
  }
  

  setPasswordWithOtp(request: any): Observable<any> {
    return this.http.post(API_END_POINTS.VERIFY_OTP, request).pipe(
      map((response: any) => {
        return response
      }))
  }

  async fetchStartUpDetails(): Promise<any> {
    if (this.configSvc.instanceConfig) {
      let userPidProfile: any | null = null
      try {
        userPidProfile = await this.http
          .get<any>(API_END_POINTS.profilePid)
          .pipe(map((res: any) => res.result.response))
          .toPromise()
          // console.log('general', userPidProfile)
        if (userPidProfile && userPidProfile.roles && userPidProfile.roles.length > 0 &&
          this.hasRole(userPidProfile.roles)) {
          if (localStorage.getItem('telemetrySessionId')) {
            localStorage.removeItem('telemetrySessionId')
          }
          // localStorage.setItem('telemetrySessionId', uuid())
          this.configSvc.unMappedUser = userPidProfile
          const profileV2 = _.get(userPidProfile, 'profiledetails')
          this.configSvc.userProfile = {
            country: _.get(profileV2, 'personalDetails.countryCode') || null,
            email: _.get(profileV2, 'profileDetails.officialEmail') || userPidProfile.email,
            givenName: userPidProfile.firstName,
            userId: userPidProfile.userId,
            firstName: userPidProfile.firstName,
            lastName: userPidProfile.lastName,
            rootOrgId: userPidProfile.rootOrgId,
            rootOrgName: userPidProfile.channel,
            userName: userPidProfile.userName,
            profileImage: userPidProfile.thumbnail,
            departmentName: userPidProfile.channel,
            dealerCode: null,
            isManager: false,
            phone: _.get(userPidProfile, 'phone'),
          }
          this.configSvc.userProfileV2 = {
            userId: _.get(profileV2, 'userId') || userPidProfile.userId,
            email: _.get(profileV2, 'personalDetails.officialEmail') || userPidProfile.email,
            firstName: _.get(profileV2, 'personalDetails.firstname') || userPidProfile.firstName,
            surName: _.get(profileV2, 'personalDetails.surname') || userPidProfile.lastName,
            middleName: _.get(profileV2, 'personalDetails.middlename') || '',
            departmentName: _.get(profileV2, 'employmentDetails.departmentName') || userPidProfile.channel,
            givenName: _.get(userPidProfile, 'userName'),
            userName: `${_.get(profileV2, 'personalDetails.firstname') ? _.get(profileV2, 'personalDetails.firstname') :
              ''}${_.get(profileV2, 'personalDetails.surname') ? _.get(profileV2, 'personalDetails.surname') : ''}`,
            profileImage: _.get(profileV2, 'photo') || userPidProfile.thumbnail,
            dealerCode: null,
            isManager: false,
          }
        }
        if (!this.configSvc.nodebbUserProfile) {
          this.configSvc.nodebbUserProfile = {
            username: userPidProfile.userName,
            email: 'null',
          }
        }
        const details = {
          group: [],
          profileDetailsStatus: !!_.get(userPidProfile, 'profileDetails.mandatoryFieldsExists'),
          roles: (userPidProfile.roles || []).map((v: { toLowerCase: () => void }) => v.toLowerCase()),
          tncStatus: !(_.isUndefined(this.configSvc.unMappedUser)),
          isActive: !!!userPidProfile.isDeleted,
          userId: userPidProfile.userId,
          status: 200,
        }
        this.configSvc.hasAcceptedTnc = details.tncStatus
        this.configSvc.profileDetailsStatus = details.profileDetailsStatus
        this.configSvc.userGroups = new Set(details.group)
        this.configSvc.userRoles = new Set((details.roles || []).map((v: string) => v.toLowerCase()))
        this.configSvc.isActive = details.isActive
        return details
      } catch (e) {
        this.configSvc.userProfile = null
        return e
      }
    }
    //return { group: [], profileDetailsStatus: true, roles: new Set(['Public']), tncStatus: true, isActive: true }
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

}
