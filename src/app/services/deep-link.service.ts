import { Inject, Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Deeplinks } from '@awesome-cordova-plugins/deeplinks/ngx';
import { CommonUtilService } from '../../services';
import { Router } from '@angular/router';
import { AuthService } from 'sunbird-sdk';
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { UserService } from '../modules/home/services/user.service';
import { RouterLinks } from '../app.constant';
import _ from 'lodash';
import { LocalStorageService } from '../../app/manage-learn/core'
import { Events } from '../../util/events';

@Injectable({
  providedIn: 'root'
})

export class DeepLinkService {
  private deepLinkInitialized = false;
  public isNavigating = true;

  constructor(
    @Inject('AUTH_SERVICE')
    public authService: AuthService,
    private platform: Platform,
    public deeplinks: Deeplinks,
    public commonUtilService: CommonUtilService,
    private zone: NgZone,
    public router: Router,
    private userHomeSvc: UserService,
    private localStorageService: LocalStorageService,
    private events: Events,
  ) { 
    this.events.subscribe
    this.events.subscribe('basicNavigationIsDone', () => {
      this.isNavigating = false;
    });
  }


  isDeepLinkInitialized() {
    return this.deepLinkInitialized;
  }

  init() {
    this.deepLinkInitialized = true;
    console.log('init deep linking');
    this.platform.ready().then(() => {
      this.deeplinks.routeWithNavController(this.router, {
        '/': {},
        '/public/home': { "publicHome": true },
        '/search/learning': {},
        '/toc/:id/overview': {},

      }).subscribe((match: any) => {
        this.manageRedirection(match);
      },
      (noMatch) => {
          console.log('deeplink noMatch - ', noMatch);
          this.manageRedirection(noMatch);
      })
    });
  }


  manageRedirection(match){
    this.zone.run(() => {
      console.log('Match-', match);
      let url = match.$link.path;
      if (match.$link.host && match.$link.scheme !== "https") {
        url = match.$link.host + '/' + url;
      }
      url = url.replace(/\/\//g, '/');
      if (match.$link.queryString) {
        url = url + '?' + match.$link.queryString;
      }
      this.commonUtilService.addLoader();

      if (url && url.includes('/public/toc/')) {
        const parts = url.split('?');
        const queryStr = parts[parts.length-1];
        const contentIdentifier = queryStr.split('=');
        url = `app/toc/` + `${contentIdentifier[contentIdentifier.length-1]}` + `/overview`;
      }
      console.log('deeplink url-', url);
      this.checkNavigationProcess(url);
    });
  }

  checkNavigationProcess(url:string){
    if(!this.isNavigating){
      console.log('i am navigating')
      this.checkTokenValidation(url)
    }else{
      console.log('i will navigate after 1000ms')
      setTimeout(() => {
        this.checkNavigationProcess(url);
      }, 1000);
    }
  }


  async checkTokenValidation(url: string) {
    const session = await this.authService.getSession().toPromise();
    if (session) {
      if (session) {
        const token = jwt_decode(session.access_token);
        const tokenExpiryTime = moment(token.exp * 1000);
        const currentTime = moment(Date.now());
        const duration = moment.duration(tokenExpiryTime.diff(currentTime));
        const hourDifference = duration.asHours();
        if (hourDifference < 2) {
          await this.localStorageService.setLocalStorage(`url_before_login`, url);
          this.router.navigateByUrl('/public/home');
          setTimeout(() => {
            this.events.publish('triggerPublicLoginEvent');
          }, 1000);
        } else {
          this.commonUtilService.addLoader()
          this.userHomeSvc.userReadCall(session.userToken).subscribe(async (res) => {
            this.userHomeSvc.setUserProfile(res);
            if (_.get(res, 'result.response.tcStatus', 'false') === 'false') {
              await this.localStorageService.setLocalStorage(`url_before_login`, url);
              this.router.navigateByUrl(RouterLinks.NEW_TNC);
            } else {
              if (url) {
                this.router.navigateByUrl(url);
              } else {
                this.router.navigateByUrl(RouterLinks.PRIVATE_HOME);
              }
            }
          })
        }
      }
    } else {
      await this.localStorageService.setLocalStorage(`url_before_login`, url);
      setTimeout(() => {
        this.events.publish('triggerPublicLoginEvent');
      }, 1000);
    }
  }

}


