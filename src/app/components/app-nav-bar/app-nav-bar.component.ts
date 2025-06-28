import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { IBtnAppsConfig } from '../../../library/ws-widget/collection/src/lib/btn-apps/btn-apps.model'
import { CustomTourService } from '../../../library/ws-widget/collection/src/lib/_common/tour-guide/tour-guide.service'
import { NsWidgetResolver } from '../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { NsInstanceConfig } from '../../../library/ws-widget/utils/src/lib/services/configurations.model'
import { NsPage } from '../../../library/ws-widget/utils/src/lib/resolvers/page.model'
import { ValueService } from '../../../library/ws-widget/utils/src/lib/services/value.service'
import { Router, NavigationStart, NavigationEnd, Event } from '@angular/router'
import { Observable } from 'rxjs'
import { MatDialog } from '@angular/material/dialog'
import { RouterLinks } from '../../../app/app.constant'
import { CommonUtilService, Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../services'
import { AppFrameworkDetectorService } from '../../../app/modules/core/services/app-framework-detector-service.service'
import { UserService } from '../../../app/modules/home/services/user.service'
import { buildConfig } from '../../../../configurations/configuration'
import * as _ from 'lodash';
import { LocalStorageService } from '../../../app/manage-learn/core';
import { Events } from '../../../util/events'

@Component({
  selector: 'ws-app-nav-bar',
  templateUrl: './app-nav-bar.component.html',
  styleUrls: ['./app-nav-bar.component.scss'],
})
export class AppNavBarComponent implements OnInit, OnChanges {
  allowAuthor = false
  @Input() mode: 'top' | 'bottom' = 'top'
  @Input() authorised = false
  @Input() showUPGovLogo = false

  basicBtnAppsConfig: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig> = {
    widgetType: 'actionButton',
    widgetSubType: 'actionButtonApps',
    widgetData: { allListingUrl: '/app/features' },
  }
  instanceVal = ''
  btnAppsConfig!: NsWidgetResolver.IRenderConfigWithTypedData<IBtnAppsConfig>
  appIcon: SafeUrl | null = 'https://'+buildConfig.SITEPATH+'/assets/instances/eagle/app_logos/aastar-logo.svg'
  appBottomIcon?: SafeUrl
  primaryNavbarBackground: Partial<NsPage.INavBackground> | null = null
  primaryNavbarConfig: NsInstanceConfig.IPrimaryNavbarConfig | null = null
  pageNavbar: Partial<NsPage.INavBackground> | null = null
  featureApps: string[] = []
  isHelpMenuRestricted = false
  isTourGuideAvailable = false
  isTourGuideClosed = false
  showAppNavBar = false
  popupTour: any
  courseNameHeader: any
  // showCreateBtn = false
  isXSmall$: Observable<boolean>
  langDialog: any
  preferedLanguage: any = ['english']
  hideCreateButton = true
  showSphereFoundation = false
  appFramework: string
  orgName: any
  currentOrgId: string
  baseUrl = buildConfig.SITEPATH
  activeRoute = '';

  constructor(
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private tourService: CustomTourService,
    private router: Router,
    private valueSvc: ValueService,
    public dialog: MatDialog,
    public commonUtilService: CommonUtilService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private userSvc: UserService,
    private localStorage: LocalStorageService,
    private events: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
    this.btnAppsConfig = { ...this.basicBtnAppsConfig }
    if (this.configSvc.restrictedFeatures) {
      this.isHelpMenuRestricted = this.configSvc.restrictedFeatures.has('helpNavBarMenu')
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.cancelTour()
      } else if (event instanceof NavigationEnd) {
        this.cancelTour();
      }
    })

    this.events.subscribe('updatePrimaryNavBarConfig',()=>{
      this.updatePrimaryNavBarConfig();
    })
  }

  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (this.appFramework === 'Ekshamata') {
        this.hideCreateButton = false
        this.showSphereFoundation = true
      } else {
        this.hideCreateButton = true
        this.showSphereFoundation = false
      }
    } catch (error) {
      // console.log('error while getting packagename')
    }

  }

  async getOrgName() {
    this.currentOrgId = this.configSvc.userProfile?.rootOrgId;
    let res:any = await this.userSvc.getOrgData();
    this.orgName = res.orgNames.find(obj => obj.channelId === this.currentOrgId);
  }

  ngOnInit() {
    this.detectFramework()
    this.getOrgName();
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.hideCreateButton = false
    }
    this.router.events.subscribe((e: Event) => {
      if (e instanceof NavigationEnd) {
        if ((e.url.includes('/app/setup') && this.configSvc.instanceConfig && !this.configSvc.instanceConfig.showNavBarInSetup)) {
          this.showAppNavBar = false
        } else {
          this.showAppNavBar = true;
        }
        this.updatePrimaryNavBarConfig();
      }
    })

    // this.showCreateBtn = this.configSvc.userProfile === null ? true : false

    if (this.configSvc.instanceConfig) {
      if (localStorage.getItem('orgValue') === 'nhsrc') {
        this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          'https://'+buildConfig.SITEPATH+'/assets/instances/eagle/app_logos/aastar-logo.svg',
        )
      } else {
        this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.configSvc.instanceConfig.logos.app)
      }
      this.instanceVal = this.configSvc.rootOrg || ''
      if (this.configSvc.instanceConfig.logos.appBottomNav) {
        this.appBottomIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.configSvc.instanceConfig.logos.appBottomNav,
        )
      }
      this.primaryNavbarBackground = this.configSvc.primaryNavBar
      this.pageNavbar = this.configSvc.pageNavBar
      this.updatePrimaryNavBarConfig()
      // this.primaryNavbarConfig = this.configSvc.primaryNavBarConfig
    }
    if (this.configSvc.appsConfig) {
      this.featureApps = Object.keys(this.configSvc.appsConfig.features)
    }
    this.configSvc.tourGuideNotifier.subscribe(canShow => {
      if (
        this.configSvc.restrictedFeatures &&
        !this.configSvc.restrictedFeatures.has('tourGuide')
      ) {
        this.isTourGuideAvailable = canShow
        this.popupTour = this.tourService.createPopupTour()
      }
    })
  }

  createAcct() {
    localStorage.removeItem('url_before_login')
    this.commonUtilService.addLoader()
    this.generateInteractEvent()
    this.router.navigateByUrl(`${RouterLinks.CREATE_ACCOUNT}`)
  }

  generateInteractEvent(route?) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      route ? InteractSubtype.CLOSE_CLICKED : InteractSubtype.CREATE_ACCOUNT_CLICKED,
      Environment.HOME,
      route? route : PageId.LOGIN,
    )
  } 

  goHomePage() {
    if (this.router.url === "/app/new-tnc") {
      return; // Disable the click event if on T&C page
    }
    
    if(!navigator.onLine){
      return
    }
    // this.commonUtilService.addLoader()
    this.router.navigate([`${RouterLinks.PRIVATE_HOME}`]);
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

  async updatePrimaryNavBarConfig(){
    const mentorRoute = {
      feature_home : true,
      feature_courses: false,
      feature_competency: false,
      feature_search: false,
      feature_observation: false,
      feature_dashboard: true,
      feature_account_details: true,
      feature_schedule: true,
      feature_notification: false
    }
    this.activeRoute = this.router.url;
    let activeRole = await this.getActiveRole();
    if(this.activeRoute.startsWith('/mentor') || activeRole == 'mentor'){
      let tempPrimaryNavBarConfig:any = _.cloneDeep(this.configSvc.primaryNavBarConfig);
      tempPrimaryNavBarConfig.smallScreen.left.map((_row, _index)=>{
        if(mentorRoute[_row.config.actionBtnId]){
          tempPrimaryNavBarConfig.smallScreen.left[_index].config.show = true;
        }else{
          tempPrimaryNavBarConfig.smallScreen.left[_index].config.show = false;
        }
      })
      this.primaryNavbarConfig = _.cloneDeep(tempPrimaryNavBarConfig);
    }else{
      this.primaryNavbarConfig = _.cloneDeep(this.configSvc.primaryNavBarConfig);
    }
  }

  startTour() {
    this.tourService.startTour()
    this.tourService.isTourComplete.subscribe((result: boolean) => {
      if ((result)) {
        this.tourService.startPopupTour()
        this.configSvc.completedTour = true
        this.configSvc.prefChangeNotifier.next({ completedTour: this.configSvc.completedTour })
        setTimeout(
          () => {
            this.tourService.cancelPopupTour()
          },
          3000,
        )
      }
    })
  }

  cancelTour() {
    if (this.popupTour) {
      this.tourService.cancelPopupTour()
      this.isTourGuideClosed = false
    }
  }

  getActiveRole(){
    return new Promise(async resolve => {
      this.localStorage.getLocalStorage('userActiveRole').then(
        (_role) => {
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
  manageProfileBTNAction(){
    if(!navigator.onLine){
      return
    }
    this.generateInteractEvent(this.activeRoute)
    if(this.activeRoute.includes('profile-dashboard')){
      const previesUrl = this.commonUtilService.getPreviesUrl;
      if (previesUrl.includes(`${RouterLinks.COMPETENCY_DASHBOARD}`)
      || previesUrl.includes(`${RouterLinks.MY_COURSES}`)
      || previesUrl.includes(`${RouterLinks.SEARCH_PAGE}`)
      ) {
        this.router.navigateByUrl(`${previesUrl}`)
      } else {
        this.router.navigate([`${RouterLinks.PRIVATE_HOME}`]);
      }
    }else{
      const redirectUrl = `${RouterLinks.PROFILE_DASHBOARD}`;
      if (_.get(this.configSvc.unMappedUser, 'profileDetails.profileReq.personalDetails.dob', undefined) !== undefined) {
        this.router.navigate([redirectUrl]);
      } else {
        this.router.navigate([`${RouterLinks.ABOUT_YOU}`], { queryParams: { redirect: redirectUrl } });
      }      
    }
  }
}
