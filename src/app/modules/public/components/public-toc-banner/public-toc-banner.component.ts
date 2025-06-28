import { Component, OnInit, Input, Inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ToastService } from '../../../../../app/manage-learn/core'
import { CordovaHttpService } from '../../../../../app/modules/core/services/cordova-http.service'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { ModalController } from '@ionic/angular'
import { AuthService, DeviceInfo, SharedPreferences } from '@project-sunbird/sunbird-sdk'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'ws-public-toc-banner',
  templateUrl: './public-toc-banner.component.html',
  styleUrls: ['./public-toc-banner.component.scss'],
})
export class PublicTocBannerComponent extends CordovaHttpService implements OnInit {
  @Input() content: any
  tocConfig: any = null
  routelinK = 'license'
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
  }

  ngOnInit() {
    this.fetchTocConfig()
  }
  fetchTocConfig() {
    const options = {
      url: '/assets/configurations/feature/toc.json',
    };
    this.get(options).pipe().subscribe((res: any) => {
      this.tocConfig = res
    })
  }
}
