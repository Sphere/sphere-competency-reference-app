import { IBtnAppsConfig } from '../../../library/ws-widget/collection/src/lib/btn-apps/btn-apps.model'
import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges, HostListener } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { NsPage } from '../../../library/ws-widget/utils/src/lib/resolvers/page.model'
import { NsInstanceConfig } from '../../../library/ws-widget/utils/src/lib/services/configurations.model'
import { ValueService } from '../../../library/ws-widget/utils/src/lib/services/value.service'
import { Observable, Subscription } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { NsWidgetResolver } from '../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import * as _ from "lodash-es"
import { RouterLinks } from '../../../app/app.constant'
import { AppFrameworkDetectorService } from '../../../app/modules/core/services/app-framework-detector-service.service';
import { buildConfig } from '../../../../configurations/configuration'
import { Events } from '../../../util/events'
import { CommonUtilService } from '../../../services/common-util.service'
import { TelemetryGeneratorService } from '../../../services/telemetry-generator.service'
import { Environment, InteractSubtype, InteractType, PageId } from '../../../services/telemetry-constants'
import { Actor, ProducerData, TelemetryObject } from 'sunbird-sdk'
@Component({
  selector: 'ws-app-public-nav-bar',
  templateUrl: './app-public-nav-bar.component.html',
  styleUrls: ['./app-public-nav-bar.component.scss'],
})
export class AppPublicNavBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() mode: 'top' | 'bottom' = 'top'
  @Input() showLoginButton: true | false = true;
  appIcon: SafeUrl | null = null
  logo = ''
  appName = ''
  navBar: Partial<NsPage.INavBackground> | null = null
  isClientLogin = false
  private subscriptionLogin: Subscription | null = null
  loginConfig: any | null = null
  redirectUrl = ''
  primaryNavbarConfig: NsInstanceConfig.IPrimaryNavbarConfig | null = null
  pageNavbar: Partial<NsPage.INavBackground> | null = null
  featureApps: string[] = []
  appBottomIcon?: SafeUrl
  showCreateBtn = false
  hideCreateButton = true
  public telemetryObject: TelemetryObject;

  basicBtnAppsConfig: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig> = {
    widgetType: 'actionButton',
    widgetSubType: 'actionButtonApps',
    widgetData: { allListingUrl: '/app/features' },
  }
  instanceVal = ''
  btnAppsConfig!: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig>
  isXSmall$: Observable<boolean>
  showSignInCard = false;
  source = 'profile'
  appFramework: string
  baseUrl = buildConfig.SITEPATH
  showSphereFoundation = false;
  isTablet = false;
  
  constructor(
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private valueSvc: ValueService,
    private appFrameworkDetectorService:AppFrameworkDetectorService,
    private events: Events,
    public commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.isTablet = this.commonUtilService.isTablet();
    this.isXSmall$ = this.valueSvc.isXSmall$
    this.btnAppsConfig = { ...this.basicBtnAppsConfig }
    this.events.subscribe('triggerPublicLoginEvent', () => {
      this.login();
    });
  }

  public get showPublicNavbar(): boolean {
    return true
  }

  async ngOnInit() {
    this.detectFramework()
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.hideCreateButton = false
    }
    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
      this.appName = this.configSvc.instanceConfig.details.appName
      this.navBar = this.configSvc.pageNavBar
      this.primaryNavbarConfig = this.configSvc.primaryNavBarConfig
    }

    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = false
      } else {
        this.showCreateBtn = true
      }
    })
    const paramsMap = this.activateRoute.snapshot.queryParamMap
    const href = window.location.href
    if (paramsMap.has('ref')) {
      this.redirectUrl = document.baseURI + paramsMap.get('ref')
    } else if (href.indexOf('org-details') > 0) {
      this.redirectUrl = href
    } else {
      this.redirectUrl = `${document.baseURI}openid/keycloak`
    }

    // added from app nav
    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
      this.instanceVal = this.configSvc.rootOrg || ''
      if (this.configSvc.instanceConfig.logos.appBottomNav) {
        this.appBottomIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.configSvc.instanceConfig.logos.appBottomNav,
        )
      }
      this.pageNavbar = this.configSvc.pageNavBar
      this.primaryNavbarConfig = this.configSvc.primaryNavBarConfig
    }
    if (this.configSvc.appsConfig) {
      this.featureApps = Object.keys(this.configSvc.appsConfig.features)
    }
  }

  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (this.appFramework === 'Ekshamata') {
        this.showSphereFoundation = true
      } else {
        this.showSphereFoundation = false
      }
    } catch (error) {
      console.log('error while getting packagename')
    }

  }

  get isUserProfileNull(): boolean {
    return this.configSvc.userProfile === null;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      if (property === 'mode') {
        if (this.mode === 'bottom') {
          this.btnAppsConfig = {
            ...this.basicBtnAppsConfig,
            widgetData: {
              ...this.basicBtnAppsConfig.widgetData,
              showTitle: true,
            },
          }
        } else {
          this.btnAppsConfig = {
            ...this.basicBtnAppsConfig,
          }
        }
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = false
      } else {
        this.showCreateBtn = true
      }
    })
  }

  createAcct() {
    this.router.navigateByUrl('app/create-account')
  }
  
  async login() {
    this.generateInteractEvent()
    this.router.navigateByUrl(RouterLinks.APP_LOGIN);
    return '';
  }

  ngOnDestroy() {
    if (this.subscriptionLogin) {
      this.subscriptionLogin.unsubscribe()
    }
  }
  goHomePage() {
    if(!navigator.onLine){
      return
    }
    this.router.navigateByUrl(`/${RouterLinks.PUBLIC_HOME}`)
  }

  generateInteractEvent() {
    const values = new Map();
    values['appName'] = this.appFramework.toUpperCase();
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LOGIN_CLICKED,
      Environment.HOME,
      PageId.PUBLIC_HOME,
      undefined,
      values
    )
  }
}
