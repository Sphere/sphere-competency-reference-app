import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ProfileService } from 'sunbird-sdk';
import * as jwt_decode from 'jwt-decode';
import * as moment from 'moment';
import { UserService } from '../../../../../app/modules/home/services/user.service';
import { Events } from '../../../../../util/events';
import { CommonUtilService } from '../../../../../services/common-util.service';
import _ from 'lodash';
import { RouterLinks, ProfileConstants } from '../../../../../app/app.constant';
import { LocalStorageService } from '../../../../../app/manage-learn/core/services/local-storage/local-storage.service';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { DeepLinkService } from '../../../../../app/services/deep-link.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'app-public-home',
  templateUrl: './public-home.component.html',
  styleUrls: ['./public-home.component.scss'],
})
export class PublicHomeComponent implements OnInit {

  public data: any;
  content: any;
  toggleComponet: boolean = false;
  appFramework: string;
  isTokenChecked: boolean = false; // Flag to control template rendering

  constructor(
    @Inject('AUTH_SERVICE') public authService: AuthService,
    public router: Router,
    private userHomeSvc: UserService,
    private events: Events,
    private commonUtilService: CommonUtilService,
    private localStorageService: LocalStorageService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private deepLinkService: DeepLinkService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private configSvc: ConfigurationsService,
  ) { }

  ngOnInit() {
    this.commonUtilService.addLoader()
    this.checkTokenValidation()
      .then(() => {
        // Call detectFramework only if token is invalid
        if (!this.isTokenChecked) {
          return this.detectFramework();
        }
      })
      .catch((error) => {
        console.error('Error during token validation:', error);
      })
      .finally(() => {
        this.isTokenChecked = true; // Set flag to true after validation is completed
        this.commonUtilService.removeLoader()
      });

    this.localStorageService.getLocalStorage('url_before_login')
      .then((url) => {
        this.localStorageService.deleteOneStorage('url_before_login');
      });

    this.initDeeplinks();
  }

  async detectFramework() {
    console.log('call me only when token is invalid')
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
    } catch (error) {
      // Handle error while getting package name
    }
  }

  async checkTokenValidation() {
    const session = await this.authService.getSession().toPromise();
    if (session) {
      const token = jwt_decode(session.access_token);
      const tokenExpiryTime = moment(token.exp * 1000);
      const currentTime = moment(Date.now());
      const duration = moment.duration(tokenExpiryTime.diff(currentTime));
      const hourDifference = duration.asHours();

      if (hourDifference < 2) {
        this.isTokenChecked = false
        this.router.navigateByUrl('/public/home');
      } else {
        this.isTokenChecked = true
        if (!navigator.onLine) {
          const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
          console.log('getActiveSessionProfile--', profile);
          await this.userHomeSvc.userRead(session.userToken);
          console.log('configSvc.userDetails--', this.configSvc.userDetails);
          if (this.configSvc.userDetails) {
            this.router.navigateByUrl(RouterLinks.PRIVATE_HOME);
          }
        } else {
          await this.handleUserReadCall(session.userToken);
        }
      }
    }
  }
  async handleUserReadCall(userToken: string) {
    try {
      const res = await this.userHomeSvc.userReadCall(userToken).toPromise();
      this.userHomeSvc.setUserProfile(res);
      const data = _.get(res, 'result.response', 'false');

      if (!data.tcStatus || (data.tcStatus && data.tcStatus === 'false')) {
        this.userLanguage()
        this.router.navigateByUrl(RouterLinks.NEW_TNC);
      } else {
        this.router.navigateByUrl(RouterLinks.PRIVATE_HOME);
      }
    } catch (error) {
      // Handle error if userReadCall fails
      console.error('Error in handleUserReadCall:', error);
    }
  }

  initDeeplinks() {
    if (!this.deepLinkService.isDeepLinkInitialized()) {
      this.deepLinkService.init();
    }
    this.events.publish('basicNavigationIsDone');
  }
  userLanguage() {
      this.userHomeSvc.updateValue$.subscribe((res: any) => {
        if(res && res.profileDetails){
          if(_.get(res,'profileDetails.preferences.language') ){
            const code = _.get(res,'profileDetails.preferences.language')
            this.commonUtilService.updateAppLanguage(code);
          }
        }
      })
  }
}
