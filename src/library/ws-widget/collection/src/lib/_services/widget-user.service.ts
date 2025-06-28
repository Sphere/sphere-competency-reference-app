import { Inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { IUserGroupDetails } from './widget-user.model'
import { NsContent } from './widget-content.model'
import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import { CordovaHttpService } from '../../../../../../app/modules/core/services/cordova-http.service'
import { ModalController } from '@ionic/angular'
import { ToastService } from '../../../../../../app/manage-learn/core'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { API_END_POINTS, API_PROTECTED_END_POINTS } from 'app/apiConstants'


@Injectable({
  providedIn: 'root',
})
export class WidgetUserService extends CordovaHttpService {
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences : SharedPreferences,
    public ionicHttp:HTTP
  ) {
    super(http, toast, modalController, authService, deviceInfo,preferences,ionicHttp);
    }

  fetchUserGroupDetails(userId: string): Observable<IUserGroupDetails[]> {
    const options = {
      url: API_PROTECTED_END_POINTS.FETCH_USER_GROUPS(userId),
    };
    return this.get(options);
  }


  // tslint:disable-next-line:max-line-length
  fetchUserBatchList(userId: string | undefined, queryParams?: { orgdetails: any, licenseDetails: any, fields: any, batchDetails: any }): Observable<NsContent.ICourse[]> {
    let options = {url: ''};
    if (queryParams) {
      // tslint:disable-next-line: max-line-length
      options = {
      url: API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_V2(userId, queryParams.orgdetails, queryParams.licenseDetails, queryParams.fields, queryParams.batchDetails),
    };
    } else {
      options = {
        url: API_END_POINTS.FETCH_USER_ENROLLMENT_LIST_V1(userId),
      };
    }
    return this.get(options);
  }

  fetchCourseRemommendationv(request?: any, profession?:any, appId?:string, ) :Observable<NsContent.ICourse[]> {
    let payload = {
      "search_text": request.designation || profession,
      "search_fieldnames": [
          "rolesMapped"
      ],
      "course_status": "Live",
      "primaryCategory": "Course",
      offset: request.Offset,
      limit: request.limit,
    } 
    let options :any = {
      url:API_END_POINTS.COURSE_RECOMMENDATION_CBP(request.appId || appId),
      payload: payload
    }
    return this.post(options);
  }

}