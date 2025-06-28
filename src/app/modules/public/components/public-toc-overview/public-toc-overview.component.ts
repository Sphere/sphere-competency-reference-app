import { Component, OnInit, OnDestroy, Input, Inject } from '@angular/core'
import { Subject } from 'rxjs'
import * as _ from 'lodash'
import { HttpClient } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { AuthService, DeviceInfo, SharedPreferences } from '@project-sunbird/sunbird-sdk'
import { ToastService } from '../../../../../app/manage-learn/core'
import { CordovaHttpService } from '../../../../../app/modules/core/services/cordova-http.service'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { ModalController } from '@ionic/angular'
import LicenseMetadata from '../../../../../assets/configurations/license.meta.json'

@Component({
  selector: 'ws-public-toc-overview',
  templateUrl: './public-toc-overview.component.html',
  styleUrls: ['./public-toc-overview.component.scss'],
})
export class PublicTocOverviewComponent extends CordovaHttpService implements OnInit, OnDestroy {
  /*
* to unsubscribe the observable
*/
  @Input() tocData: any
  public unsubscribe = new Subject<void>()
  content: any
  tocConfig: any = null
  currentLicenseData: any
  licenseName: any
  license = 'CC BY'
  constructor(
    public http: HttpClient,
    private route: ActivatedRoute,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP
  ) {
    super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
  }

  ngOnInit() {
    if (this.tocData) {
      this.content = this.tocData
    }
    if (localStorage.getItem('tocData')) {
      const data: any = localStorage.getItem('tocData')
      this.content = JSON.parse(data)
    }
    this.fetchTocConfig()

    this.route.queryParams.subscribe(params => {
      this.licenseName = params['license'] || this.license
      this.getLicenseConfig()
    })
  }
  fetchTocConfig() {
    const options = {
      url: '/assets/configurations/feature/toc.json',
    };
    this.get(options).pipe().subscribe((res: any) => {
      this.tocConfig = res
    })
  }

  getLicenseConfig() {
    const licenseData = LicenseMetadata
      if (licenseData) {
        this.currentLicenseData = licenseData.licenses.filter((license: any) => license.licenseName === this.licenseName)
      }
  }

  ngOnDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }
}
