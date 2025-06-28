import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { ModalController } from '@ionic/angular';
import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import { ToastService } from '../../../../app/manage-learn/core/services/toast/toast.service';
import * as _ from "lodash"
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { DataService } from './data.service';
import { switchMap } from 'rxjs/operators';
import { EMPTY, Observable, from, of } from 'rxjs';
import { AppFrameworkDetectorService } from './app-framework-detector-service.service';
import { buildConfig } from '../../../../../configurations/configuration';
import { API_END_POINTS } from '../../../apiConstants';

@Injectable({
  providedIn: 'root'
})
export class AppVersionService extends DataService {
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP,
    private appVersion: AppVersion,
    private appFrameworkDetectorService: AppFrameworkDetectorService
  ) {
    super(http, authService)
    !this.baseUrl ? 'https://' +buildConfig.SITEPATH : '';
  }
  checkNewAppVersion(): Observable<any> {
    // console.log('checkNewAppVersion Called');
    const requestParam = {
      url: API_END_POINTS.MOBILE_APP_VERSION,
    };

    return from(this.appVersion.getVersionCode()).pipe(
      switchMap((versionCode: any) => {
        // console.log('versionCode', versionCode);
        return this.get(requestParam).pipe(
          switchMap((apiResponse: any) => {
            return from(this.appFrameworkDetectorService.detectAppFramework()).pipe(
              switchMap((appFramework: string) => {
                const responseKey = appFramework.toLowerCase();
                const appResponse = _.get(apiResponse, 'response', {});
                const appVersions = appResponse[responseKey] || [];
                const latestAppVersion = _.find(appVersions, (version: any) =>
                  parseInt(version.version_id) > versionCode
                );
                if (latestAppVersion && latestAppVersion.mandatory) {
                  const popeOverdata: any = {
                    type: "force",
                    title: "Update Available",
                    desc: 'A new version of the app is available',
                    actionButtons: [{
                      action: 'yes',
                      label: 'Update Now',
                      link: latestAppVersion.redirection
                    },
                    {
                      action: 'no',
                      label: 'No',
                      link: latestAppVersion.redirection
                    }],
                    currentAppVersionCode: versionCode,
                    maxVersionCode: parseInt(latestAppVersion.version_id),
                    minVersionCode: versionCode,
                  }
                  return of(_.assign(latestAppVersion, popeOverdata));
                }
                return EMPTY;
              }))
          })
        );
      })
    );
  }
}