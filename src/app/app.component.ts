import {
  AfterViewInit, Component,
  EventEmitter, Inject, NgZone,
  OnInit, ViewChild
} from '@angular/core';
import { ChildrenOutletContexts, NavigationExtras, NavigationStart, Router } from '@angular/router';
import { NetworkAvailabilityToastService } from '../services/network-availability-toast/network-availability-toast.service';
import {
  CorReleationDataType, Environment,
   ImpressionType, InteractSubtype, InteractType,
  PageId
} from '../services/telemetry-constants';
import { Network } from '@capacitor/network';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { IonRouterOutlet, NavController, Platform } from '@ionic/angular';
import { Events } from '../util/events';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription } from 'rxjs';
import { filter, mergeMap, take, tap } from 'rxjs/operators';
import {
  AuthEventType, CorrelationData,
  DeviceRegisterService, ErrorEventType, EventNamespace, EventsBusService,
  GetSystemSettingsRequest,
  Profile, ProfileService, SharedPreferences,
  DebuggingService, TelemetryObject,
  SystemSettings, SystemSettingsService, TelemetryAutoSyncService, TelemetryService, AuthService
} from 'sunbird-sdk';
import {
  AppGlobalService,
  CommonUtilService,
  TelemetryGeneratorService
} from '../services';
import { AppVersionService } from './modules/core/services/app-version.service';
import { EventTopics,
  PreferenceKey, ProfileConstants, RouterLinks, SystemSettingsIds, AppOrientation
} from './app.constant';
import { EventParams } from './components/sign-in-card/event-params.interface';
import { ApiUtilsService, DbService, NetworkService } from './manage-learn/core';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { UserService } from './modules/home/services/user.service';
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations';
import * as _ from 'lodash-es';
import { AnimationOptions } from '@ionic/angular/providers/nav-controller';
import { AppFrameworkDetectorService } from './modules/core/services/app-framework-detector-service.service';
import { MatDialog } from '@angular/material/dialog';
import { OfflineModalComponent } from './modules/shared/components/offline-modal/offline-modal.component';
import { ConfigurationsService } from '../library/ws-widget/utils/src/lib/services/configurations.service';
import { urlConfig } from "@aastrika_npmjs/comptency/core";
import appsConfig from './../assets/configurations/apps.json';
import { DeepLinkService } from '../app/services/deep-link.service';
import { CsModule } from '@project-sunbird/client-services';
import { buildConfig } from '../../configurations/configuration';
import { io } from "socket.io-client";
import { SplashScreen } from '@capacitor/splash-screen';

declare const window;
export const slideInAnimation =
  trigger('routeAnimations', [
    transition('* <=> *', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ], { optional: true }),
      query(':enter', [
        style({ left: '-100%' })
      ], { optional: true }),
      query(':leave', animateChild(), { optional: true }),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ left: '100%', opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          animate('300ms ease-out', style({ left: '0%' }))
        ], { optional: true }),
      ]),
    ])
  ]);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  animations: [
    slideInAnimation
  ]
})
export class AppComponent implements OnInit, AfterViewInit {
  showPublicNavbar = false;
  showNavbar = true
  hideFooter = false
  isNavBarRequired = false
  showUPGovLogo = false
  rootPage: any;
  public counter = 0;
  appFramework: string;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: true,
    actionButtons: ['search'],
  };
  public sideMenuEvent = new EventEmitter<void>();
  public showWalkthroughBackDrop = false;

  private telemetryAutoSync: TelemetryAutoSyncService;
  toggleRouterOutlet = true;
  profile: any = {};
  selectedLanguage: string;
  appName: string;
  appVersion: string;
  @ViewChild('mainContent', { read: IonRouterOutlet, static: false }) routerOutlet: IonRouterOutlet;
  isForeground: boolean;
  isPlannedMaintenanceStarted = false;
  isUnplannedMaintenanceStarted = false;
  timeLeft: string;
  eventSubscription: Subscription;
  isTimeAvailable = false;
  isOnBoardingCompleted: boolean;
  public swipeGesture = this.platform.is('ios') ? false : true;
  isCommonChatEnabled = true
  previesUrl: any = ''
  isCreateAccount: boolean = false;
  isHomePage: boolean;
  currentOrgId: any;
  orgName: any;
  isAuthenticated: boolean;
  showLoginButton: boolean = true;
  showBorder: boolean = false;
  showbottom: boolean;
  isTablet = false;
  userId: string;
  constructor(
    @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('EVENTS_BUS_SERVICE') private eventsBusService: EventsBusService,
    @Inject('SYSTEM_SETTINGS_SERVICE') private systemSettingsService: SystemSettingsService,
    @Inject('DEVICE_REGISTER_SERVICE') private deviceRegisterService: DeviceRegisterService,
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    @Inject('DEBUGGING_SERVICE') private debuggingService: DebuggingService,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    private platform: Platform,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private events: Events,
    private zone: NgZone,
    private appGlobalService: AppGlobalService,
    public commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private router: Router,
    private networkAvailability: NetworkAvailabilityToastService,
    private utils: ApiUtilsService,
    private networkServ: NetworkService,
    private db: DbService,
    private appVersionService: AppVersionService,
    private screenOrientation: ScreenOrientation,
    private userHomeSvc: UserService,
    private contexts: ChildrenOutletContexts,
    private navCtrl: NavController,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private dialog: MatDialog,
    private configSvc: ConfigurationsService,
    private deepLinkService: DeepLinkService
  ) {
    this.hideSplashScreen();
    this.telemetryAutoSync = this.telemetryService.autoSync;
    urlConfig.mobileHost = 'https://' + buildConfig.SITEPATH;
    urlConfig.authorization = 'bearer ' + appsConfig.API.secret_key;
    this.initDeeplinks();
    console.log("site patha", urlConfig.mobileHost, buildConfig.SITEPATH )
  }

  hideSplashScreen() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
    });
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  initDeeplinks() {
    if (!this.deepLinkService.isDeepLinkInitialized()) {
      this.deepLinkService.init();
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
      if (!(hourDifference < 2)) {
        this.userHomeSvc.userRead(session.userToken)

        this.isAuthenticated = true;
        this.userHomeSvc.updateValue$.subscribe(async (res: any) => {
          if (res) {
            if(res && res.profileDetails){
              if(_.get(res, 'profileDetails.preferences.language')){
                const code = _.get(res,'profileDetails.preferences.language')
                this.commonUtilService.updateAppLanguage(code);
              }
            }
          }
        })
      }
    } else {
      this.isAuthenticated = false;
    }
   
    const buildConfigValues = buildConfig
    CsModule.instance.updateConfig({
      core: {
        httpAdapter: 'HttpClientBrowserAdapter',
        global: {
          channelId: '', 
          producerId: '', 
          deviceId: '', 
          sessionId: '',
        },
        api: {
          host:  buildConfigValues['BASE_URL'],
          authentication: {
           
          },
        },
      },
      services: {
        
        discussionServiceConfig: {
          apiPath: '/apis/public/v8/mobileApp/discussion',
        },
      },
    })
    console.log('>>.',CsModule.instance)
  }
  
  async ngOnInit() {
    this.isTablet = await this.commonUtilService.isTablet();
    this.generateStartTelemetry();
    this.platform.ready().then(async () => {
      // if (this.platform.is('iphone') || this.platform.is('ipad')) {
      //   this.iosDeeplink();
      // }
      //SplashScreen.hide();
      this.isForeground = true;

      // this.formAndFrameworkUtilService.init();
      this.networkAvailability.init();
      this.subscribeEvents();
      this.checkAppUpdateAvailable();
      this.commonUtilService.initialize()
      await this.getSelectedLanguage();
      await this.getDeviceProfile();
      if (this.appGlobalService.getUserId()) {
        await this.getConnectToSocket();
      } else {
        this.reloadGuestEvents();
      }
      
      this.handleAuthErrors();
      this.preferences.putString(PreferenceKey.CONTENT_CONTEXT, '').subscribe();
      window['thisRef'] = this;
      this.statusBar.styleBlackTranslucent();
      if (this.platform.is('ios')) {
        this.statusBar.styleDefault();
        if (window['Keyboard']) {
          window['Keyboard'].hideFormAccessoryBar(false);
        }
      }
      this.routerSubscriptions();
      this.handleBackButton();
      // this.appRatingService.checkInitialDate();
      this.checkForCodeUpdates();
      this.utils.initilizeML();
      this.networkServ.netWorkCheck();
  
      this.events.subscribe('user-loggedIn', async(data) => {
        await this.getConnectToSocket(data);
      })
      // Reordered
      this.detectNetwork();
      this.checkAndroidWebViewVersion();
      this.getSystemConfig();
      this.generateNetworkTelemetry();
      this.autoSyncTelemetry();
      this.handleAuthAutoMigrateEvents();
    });
    this.triggerSignInEvent();
    this.checkCurrentOrientation();
    await this.checkTokenValidation()

    this.userHomeSvc.isAuthenticated$.subscribe((isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        this.showPublicNavbar = true
        this.showNavbar = false
        this.manageFooter(false);
        this.isNavBarRequired = false
      } else {
        this.isAuthenticated = true;
      }
    })

    this.commonUtilService.showNavbar$.subscribe(async (value) => {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework()
      
      if(this.appFramework === 'Sphere'){
        this.showBorder = true;
        this.showbottom = true
      }else{
        this.showBorder = value;
        this.showbottom = value
      }
    });

  }
  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
    } catch (error) {
      // console.log('error while getting packagename')
    }

  }

  routerSubscriptions() {
    this.router.events.pipe(filter(event =>
      event instanceof NavigationStart)).subscribe(async (event: any) => {
        // if (event instanceof NavigationStart) {
        // this.rootPageDisplayed = event.url.indexOf('tabs') !== -1;
        // if (this.platform.is('ios')) {
        //   this.swipeGesture = !this.rootPageDisplayed;
        // }
       if (!this.previesUrl || (this.previesUrl && this.previesUrl !== '/app/login')){
          this.commonUtilService.addPreviesUrl(this.previesUrl)
        }
        this.previesUrl = event.url
        if (event.url.includes(`${RouterLinks.CREATE_ACCOUNT}`)) {
          this.showBorder = true
          this.isCreateAccount = true
        } else {
          this.isCreateAccount = false
        }

        if (event.url.includes(RouterLinks.PUBLIC_HOME)
          || event.url.includes(RouterLinks.PRIVATE_HOME)) {
          this.isHomePage = true
        } else {
          this.isHomePage = false
        }
        this.showLoginButton = true;
        if (event.url.includes(`${RouterLinks.APP_LOGIN}`) || event.url.includes(`${RouterLinks.FORGOT_PASSWORD}`)){
          this.showPublicNavbar = true;
          this.showNavbar = false;
          this.manageFooter(true);
          this.isNavBarRequired = false;
          this.showLoginButton = false;
          this.showBorder = true
        } else if (event.url.includes(`${RouterLinks.CREATE_ACCOUNT}`)
          || event.url.includes('public/forgot-password')
        ) {
          //this.showPublicNavbar = false
          this.isNavBarRequired = false;
          this.showPublicNavbar = true;
          this.showNavbar = false;
          this.manageFooter(true);
          this.showLoginButton = false;
        } else if (event.url.includes(`${RouterLinks.OBSERVATION_ASSESSMENT}`)
          || event.url.includes(`${RouterLinks.OBSERVATION_RESULTS}`)
          || event.url.includes(`${RouterLinks.VERIFY_MENTEE}`)
          || event.url.includes(`${RouterLinks.OBSERVATION_REPORT}`)
        ) {
          this.showPublicNavbar = false
          this.showNavbar = false
          this.manageFooter(true);
          this.isCommonChatEnabled = false

        } else if (event.url.includes(`${RouterLinks.MENTEE_PROGRESS}`)
          || event.url.includes(`${RouterLinks.VIEW_ATTEMPS}`)
          || event.url.includes(`${RouterLinks.PROFILE_DASHBOARD}`) 
          || event.url.includes(`${RouterLinks.LEARNER_OBSERVATION}`)
        ) {
          this.showPublicNavbar = false
          // this.showNavbar = false
          this.manageFooter(true);
          this.showNavbar = true
        } else if (event.url.includes(`${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`)
          || event.url.includes(`${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`)
          || event.url.includes(`${RouterLinks.MENTOR}/${RouterLinks.OBSERVATION_TRACK}`)
        ) {
          this.isCommonChatEnabled = true
          this.showPublicNavbar = false
          this.isNavBarRequired = true
          this.showNavbar = true
          this.manageFooter(false);
        } else if (event.url.includes(RouterLinks.PRIVATE_HOME)
          || event.url.includes(RouterLinks.SEARCH_PAGE)
          || event.url.includes(RouterLinks.TOC_PAGE)
          || event.url.includes(RouterLinks.COMPETENCY_DASHBOARD)
        ) {
          this.showPublicNavbar = false
          this.isNavBarRequired = true
          this.showNavbar = true
          this.manageFooter(false);
        } else if (event.url.includes(RouterLinks.NEW_TNC)) {
          this.isNavBarRequired = true
          this.showNavbar = true
          this.showPublicNavbar = false
          this.manageFooter(true);
          this.isCommonChatEnabled = false
        } else if (event.url.includes(RouterLinks.NEW_TNC)
          || event.url.includes(RouterLinks.ABOUT_YOU)
        ) {
          this.isNavBarRequired = true
          this.showNavbar = true
          this.showPublicNavbar = false
          this.manageFooter(true);
        } else if (event.url.includes(RouterLinks.PUBLIC_HOME)
          || (event.url.includes(RouterLinks.PUBLIC_TOC_OVERVIEW))) {
          this.showPublicNavbar = true
          this.showNavbar = false
          this.manageFooter(true);
          // if (this.appFramework === 'Ekshamata'){
          //   this.manageFooter(true)
          // }
          this.isNavBarRequired = false
          this.isCommonChatEnabled = false
        } 
        else if (event.url.includes(RouterLinks.PUBLIC_TNC)) {
          this.showPublicNavbar = true
          this.showNavbar = false
          this.manageFooter(true);
          this.isNavBarRequired = false
          this.isCommonChatEnabled = false
        } else if (event.url.includes(RouterLinks.VIEWER)) {
          this.manageFooter(true);
          this.showNavbar = true
          this.isNavBarRequired = false
          this.showPublicNavbar = false
        }
        else if(event.url.includes(RouterLinks.PROFILE_DASHBOARD)){
          // this.manageFooter(true)
          this.hideFooter = true;
        } else if(event.url.includes(RouterLinks.PUBLIC_HOME)){
          this.showBorder = false;

          this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();

          if (this.appFramework === 'Ekshamata'){
            this.manageFooter(true)
          }
          this.manageFooter(true)
        }
        else{
          this.manageFooter(false)
        }

        if (event.url.includes(RouterLinks.PUBLIC_HOME)
          || event.url.includes(RouterLinks.PRIVATE_HOME)
          || event.url.includes(RouterLinks.TOC_PAGE)
          || event.url.includes(RouterLinks.SEARCH_PAGE)
          || event.url.includes(RouterLinks.COMPETENCY_DASHBOARD)
          // || event.url.includes(RouterLinks.PROFILE_DASHBOARD)
          || event.url.includes(RouterLinks.ORG_DETAILS)
          || event.url.includes(RouterLinks.MY_COURSES)
          || event.url.includes(RouterLinks.NOTIFICATION)
        ) {
          this.manageFooter(false);
          this.showUPGovLogo = true
        } else {
          this.showUPGovLogo = false
        }

       if( event.url.includes(RouterLinks.PROFILE_DASHBOARD)){
        this.showUPGovLogo = true
       }
      })
  }

  manageFooter(status: boolean) {
    setTimeout(() => {
      this.hideFooter = status;
    }, 800);
  }

  checkAndroidWebViewVersion() {
    var that = this;
    plugins['webViewChecker'].getCurrentWebViewPackageInfo()
      .then(function (packageInfo) {
        // that.formAndFrameworkUtilService.getWebviewConfig().then(function (webviewVersion: any) {
        //   if (parseInt(packageInfo.versionName.split('.')[0], 10) <= webviewVersion) {
        //     document.getElementById('update-webview-container').style.display = 'block';
        //     that.telemetryGeneratorService.generateImpressionTelemetry(
        //       ImpressionType.VIEW, '',
        //       PageId.UPDATE_WEBVIEW_POPUP,
        //       Environment.HOME);
        //   }
        // }).catch(function (err) {
        //   if (parseInt(packageInfo.versionName.split('.')[0], 10) <= 54) {
        //     document.getElementById('update-webview-container').style.display = 'block';
        //   }
        // });
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  openPlaystore() {
    plugins['webViewChecker'].openGooglePlayPage()
      .then(function () { })
      .catch(function (error) {
        console.error(error);
      });

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.UPDATE_WEBVIEW_CLICKED,
      Environment.HOME,
      PageId.UPDATE_WEBVIEW_POPUP);
  }

  private getSystemConfig() {
    const getSystemSettingsRequest: GetSystemSettingsRequest = {
      id: SystemSettingsIds.HOT_CODE_PUSH_KEY
    };
    this.systemSettingsService.getSystemSettings(getSystemSettingsRequest).toPromise()
      .then((res: SystemSettings) => {
        if (res && res.value) {
          const value = JSON.parse(res.value);
          if (value.deploymentKey) {
            this.preferences.putString(PreferenceKey.DEPLOYMENT_KEY, value.deploymentKey).subscribe();
          }
        }
      }).catch(err => {
        // console.log('error :', err);
      });
  }

  private checkForCodeUpdates() {
    this.preferences.getString(PreferenceKey.DEPLOYMENT_KEY).toPromise().then(deploymentKey => {
      if (codePush != null && deploymentKey) {
        const value = new Map();
        value['deploymentKey'] = deploymentKey;
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.HOTCODE_PUSH_INITIATED,
          Environment.HOME, PageId.HOME, null, value);
        codePush.sync((status => {
          this.syncStatus(status);
        }), {
          deploymentKey
        }, (progress) => {});
      } else {
        this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER, InteractSubtype.HOTCODE_PUSH_KEY_NOT_DEFINED,
          Environment.HOME, PageId.HOME);
      }
    });
  }

  private syncStatus(status) {
    switch (status) {
      case SyncStatus.DOWNLOADING_PACKAGE:
        const value = new Map();
        value['codepushUpdate'] = 'downloading-package';
        break;
      case SyncStatus.INSTALLING_UPDATE:
        const value1 = new Map();
        value1['codepushUpdate'] = 'installing-update';
        break;
      case SyncStatus.ERROR:
        const value2 = new Map();
        value2['codepushUpdate'] = 'error-in-update';
    }
  }

  /**
   * Initializing the event for reloading the Tabs on Signing-In.
   */
  private triggerSignInEvent() {
    this.events.subscribe(EventTopics.SIGN_IN_RELOAD, async (skipNavigation) => {
      const batchDetails = await this.preferences.getString(PreferenceKey.BATCH_DETAIL_KEY).toPromise();
      const limitedSharingContentDetails = this.appGlobalService.limitedShareQuizContent;

      if (!batchDetails && !limitedSharingContentDetails) {
        if (this.routerOutlet) {
          this.routerOutlet.deactivate();
        }
        this.toggleRouterOutlet = false;
      }

      // This setTimeout is very important for reloading the Tabs page on SignIn.
      setTimeout(async () => {
        /* Medatory for login flow
         * eventParams are essential parameters for avoiding duplicate calls to API
         * skipSession & skipProfile should be true here
         * until further change
         */
        const eventParams: EventParams = {
          skipSession: true,
          skipProfile: true
        };
        this.events.publish(AppGlobalService.USER_INFO_UPDATED, eventParams);
        this.toggleRouterOutlet = true;
        // this.reloadSigninEvents();
        this.db.createDb();
        this.events.publish('UPDATE_TABS', skipNavigation);
        if (batchDetails) {
          // await this.localCourseService.checkCourseRedirect();
        } else if (!skipNavigation || !skipNavigation.skipRootNavigation) {
          this.router.navigate([RouterLinks.TABS]);
        }
        // this.segmentationTagService.getPersistedSegmentaion();
      }, 100);
    });
  }

  reloadGuestEvents() {
    this.checkDeviceLocation();
    // this.checkGuestUserType();
  }

  addNetworkTelemetry(subtype: string, pageId: string) {
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      subtype,
      Environment.HOME,
      pageId
    );
  }

  ngAfterViewInit(): void {
    this.platform.resume.subscribe(() => {
      if (!this.appGlobalService.isNativePopupVisible) {
        this.telemetryGeneratorService.generateInterruptTelemetry('resume', '');
      }
      // this.splashScreenService.handleSunbirdSplashScreenActions();
      this.checkForCodeUpdates();
      // this.notificationSrc.handleNotification();
      this.isForeground = true;
      // this.segmentationTagService.getPersistedSegmentaion();// Neo
    });

    this.platform.pause.subscribe(() => {
      if (!this.appGlobalService.isNativePopupVisible) {
        this.telemetryGeneratorService.generateInterruptTelemetry('background', '');
      }
      this.isForeground = false;
      // this.segmentationTagService.persistSegmentation();// Neo
    });
  }

  private handleBackButton() {
    this.platform.backButton.subscribeWithPriority(0, async () => {
      // if (!this.rootPageDisplayed) {
      let openDilogRef = await this.dialog.getDialogById('offlineModal');
      if (!openDilogRef) {
        this.commonUtilService.blockAddUrl = true
        const previesUrl = this.commonUtilService.getPreviesUrl;
        const currentUrl = this.router.url //"/app/download-course"
        if (!navigator.onLine && currentUrl == "/app/download-course") {
          return
        } else {
          this.commonUtilService.addLoader()
          if (previesUrl) {
            const session = await this.authService.getSession().toPromise();
            if (session) {
              const token = jwt_decode(session.access_token);
              const tokenExpiryTime = moment(token.exp * 1000);
              const currentTime = moment(Date.now());
              const duration = moment.duration(tokenExpiryTime.diff(currentTime));
              const hourDifference = duration.asHours();
              this.telemetryGeneratorService.generateBackClickedNewTelemetry(true, previesUrl.split('/')[1], previesUrl, hourDifference)
              if (hourDifference < 2) {
                this.router.navigateByUrl('/public/home')
              } else {
                this.router.navigateByUrl(`${previesUrl}`)
              }
            }
          } else if(this.configSvc?.userProfile) {
            this.router.navigateByUrl('page/home');
          } else {
            // this.location.back();
            let animations: AnimationOptions = {
              animated: true,
              animationDirection: "back"
            }
            this.navCtrl.back(animations)
          }
        }
      } else {
        console.log('Back button is pressed');
        return false;
      }
      // }
    });
  }

  private generateNetworkTelemetry() {
    Network.getStatus().then(val => {
      const value = new Map();
      value['network-type'] = val.connectionType;
      this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
        InteractSubtype.NETWORK_STATUS, Environment.HOME, PageId.SPLASH_SCREEN, undefined, value);
    })
  }

  private subscribeEvents() {
    this.events.subscribe(EventTopics.TAB_CHANGE, (pageId) => {
      this.zone.run(() => {
        this.generateInteractEvent(pageId);
        // Added below code to generate Impression Before Interact for Library,Courses,Profile
        this.generateImpressionEvent(pageId);
      });
    });

    this.translate.onLangChange.subscribe((params) => {
      if (params.lang === 'ur') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    });
    // planned maintenance
    this.eventSubscription = this.eventsBusService.events(EventNamespace.ERROR).pipe(
      filter((event) => event.type === ErrorEventType.PLANNED_MAINTENANCE_PERIOD),
      take(1)
    ).subscribe(() => {
      this.isPlannedMaintenanceStarted = true;
      this.isOnBoardingCompleted = this.appGlobalService.isOnBoardingCompleted;
      if (this.isPlannedMaintenanceStarted) {
        this.telemetryGeneratorService.generateImpressionTelemetry(
          ImpressionType.VIEW,
          '',
          PageId.PLANNED_MAINTENANCE_BANNER,
          this.isOnBoardingCompleted ? Environment.HOME : Environment.ONBOARDING
        );
        let intervalRef;
        const backButtonSubscription = this.platform.backButton.subscribeWithPriority(13, () => {
          backButtonSubscription.unsubscribe();
          this.isPlannedMaintenanceStarted = false;
          if (intervalRef) {
            clearInterval(intervalRef);
            intervalRef = undefined;
          }
        });
        // for timer optional
        // const second = 1000,
        //     minute = second * 60,
        //     hour = minute * 60,
        //     day = hour * 24;
        //
        // const countDown = new Date('Aug 14, 2020 00:00:00').getTime();
        // intervalRef = setInterval(() => {
        //   this.isTimeAvailable = true;
        //   const now = new Date().getTime(),
        //           distance = countDown - now;
        //
        //       document.getElementById('timer').innerText = `${Math.floor((distance % (day)) / (hour))} : ${Math.floor((distance % (hour)) / (minute))} : ${Math.floor((distance % (minute)) / second)}`;
        //
        //     }, second);
      }
    });
    // unplanned maintenance
    // this.events.subscribe('EventTopics:maintenance:unplanned', (data) => {
    //   this.isUnplannedMaintenanceStarted = data.isUnplannedMaintenanceStarted;
    //   if (this.isUnplannedMaintenanceStarted) {
    //     this.timeLeft = '3';
    //     window.document.body.classList.add('show-maintenance');
    //   }
    // });
    this.debuggingService.enableDebugging().subscribe((isDebugMode) => {
      this.events.publish('debug_mode', isDebugMode);
    });
  }

  closeUnPlannedMaintenanceBanner() {
    window.document.body.classList.remove('show-maintenance');
    this.isUnplannedMaintenanceStarted = false;
  }

  private generateInteractEvent(pageId: string) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.TAB_CLICKED,
      Environment.HOME,
      pageId ? pageId.toLowerCase() : PageId.QRCodeScanner);
  }

  private async generateImpressionEvent(pageId: string) {
    pageId = pageId.toLowerCase();
    const env = pageId.localeCompare(PageId.PROFILE) ? Environment.HOME : Environment.USER;
    const corRelationList: Array<CorrelationData> = [];
    if (pageId === PageId.LIBRARY) {
      const currentProfile: Profile = this.appGlobalService.getCurrentUser();
      corRelationList.push({ id: currentProfile.board ? currentProfile.board.join(',') : '', type: CorReleationDataType.BOARD });
      corRelationList.push({ id: currentProfile.medium ? currentProfile.medium.join(',') : '', type: CorReleationDataType.MEDIUM });
      corRelationList.push({ id: currentProfile.grade ? currentProfile.grade.join(',') : '', type: CorReleationDataType.CLASS });
      corRelationList.push({ id: currentProfile.profileType, type: CorReleationDataType.USERTYPE });
    } else if (pageId === PageId.COURSES) {
      const channelId = await this.preferences.getString(PreferenceKey.PAGE_ASSEMBLE_ORGANISATION_ID).toPromise();
      if (channelId) {
        corRelationList.push({ id: channelId, type: CorReleationDataType.SOURCE });
      }
    }

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      pageId ? pageId : PageId.HOME,
      env, undefined, undefined, undefined, undefined,
      corRelationList);
  }

  private async checkDeviceLocation() {
    if (!(await this.commonUtilService.isDeviceLocationAvailable())) {
      const profile = await this.profileService.getActiveSessionProfile({ requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
      if (await this.appGlobalService.getProfileSettingsStatus(profile)) {
        const navigationExtras: NavigationExtras = {
          state: {
            isShowBackButton: false
          }
        };
        await this.router.navigate(['/', RouterLinks.DISTRICT_MAPPING], navigationExtras);
        // this.splashScreenService.handleSunbirdSplashScreenActions();
      }
    }
  }

  private async getSelectedLanguage() {
    const selectedLanguage = await this.preferences.getString(PreferenceKey.SELECTED_LANGUAGE_CODE).toPromise();
    if (selectedLanguage) {
      await this.translate.use(selectedLanguage);
    }
  }

  private async checkAppUpdateAvailable() {
    this.appVersionService.checkNewAppVersion().subscribe((result: any) => {
      // console.log('result for the app update',result)
      if (result) {
        this.events.publish('force_optional_upgrade', result);
      }
    })
  }
  private autoSyncTelemetry() {
    this.telemetryAutoSync.start(30 * 1000).pipe(
      mergeMap(() => {
        return combineLatest([
          this.platform.pause.pipe(tap(() => this.telemetryAutoSync.pause())),
          this.platform.resume.pipe(tap(() => this.telemetryAutoSync.continue()))
        ]);
      })
    ).subscribe();
  }


  private handleAuthAutoMigrateEvents() {
    this.eventsBusService.events(EventNamespace.AUTH).pipe(
      filter((e) => e.type === AuthEventType.AUTO_MIGRATE_SUCCESS || e.type === AuthEventType.AUTO_MIGRATE_FAIL),
    ).subscribe((e) => {
      switch (e.type) {
        case AuthEventType.AUTO_MIGRATE_SUCCESS: {
          this.commonUtilService.showToast('AUTO_MIGRATION_SUCCESS_MESSAGE');
          break;
        }
        case AuthEventType.AUTO_MIGRATE_FAIL: {
          this.commonUtilService.showToast('AUTO_MIGRATION_FAIL_MESSAGE');
          break;
        }
      }
    });
  }

  private handleAuthErrors() {
    this.eventsBusService.events(EventNamespace.ERROR).pipe(
      filter((e) => e.type === ErrorEventType.AUTH_TOKEN_REFRESH_ERROR),
    ).subscribe(() => {
      // this.logoutHandlerService.onLogout();
    });
  }

  qrWalkthroughBackdropClicked() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.WALKTHROUGH_BACKDROP_CLICKED,
      Environment.ONBOARDING,
      PageId.LIBRARY,
    );
  }

  onConfirmationClicked(event) {
    event.stopPropagation();
    this.showWalkthroughBackDrop = false;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.WALKTHROUGH_CONFIRMATION_CLICKED,
      Environment.ONBOARDING,
      PageId.LIBRARY
    );
  }

  private async getDeviceProfile() {
    if (!(await this.commonUtilService.isDeviceLocationAvailable())
      && !(await this.commonUtilService.isIpLocationAvailable())) {
      this.deviceRegisterService.getDeviceProfile().toPromise().then(async (response) => {
        if (response.userDeclaredLocation) {
          if (this.appGlobalService.isGuestUser) {
            await this.preferences.putString(PreferenceKey.GUEST_USER_LOCATION, JSON.stringify(response.userDeclaredLocation)).toPromise();
          }
          await this.preferences.putString(PreferenceKey.DEVICE_LOCATION, JSON.stringify(response.userDeclaredLocation)).toPromise();
        } else if (response.ipLocation) {
          const ipLocationMap = new Map();
          if (response.ipLocation.state) {
            ipLocationMap['state'] = response.ipLocation.state;
            if (response.ipLocation.district) {
              ipLocationMap['district'] = response.ipLocation.district;
            }
          }
          await this.preferences.putString(PreferenceKey.IP_LOCATION, JSON.stringify(ipLocationMap)).toPromise();
        }
      });
    }
  }

  navigateToDownloads() {
    this.isPlannedMaintenanceStarted = false;
    this.router.navigate([RouterLinks.DOWNLOAD_TAB]);
  }


  closePlannedMaintenanceBanner() {
    this.isPlannedMaintenanceStarted = false;
  }

  private async checkCurrentOrientation() {
    const currentOrientation = await this.preferences.getString(PreferenceKey.ORIENTATION).toPromise();
    if (currentOrientation === AppOrientation.LANDSCAPE) {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      this.preferences.putString(PreferenceKey.ORIENTATION, AppOrientation.LANDSCAPE).toPromise();
    } else {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      this.preferences.putString(PreferenceKey.ORIENTATION, AppOrientation.PORTRAIT).toPromise();
    }
  }
  async getOrgNamePhone() {
    this.currentOrgId = this.configSvc.userProfile.rootOrgId;
    let res: any = await this.userHomeSvc.getOrgData();
    this.orgName = res.orgNames.find(obj => obj.channelId === this.currentOrgId);
  }

  async redirectToHelpWidget() {
    await this.detectFramework();
    if (this.appFramework === 'Sphere') {
      this.router.navigate([RouterLinks.GET_HELP]);
      return;
    }

    this.currentOrgId = this.configSvc.userProfile.rootOrgId;
    try {
      const orgData: any = await this.userHomeSvc.getOrgData();
      const orgName = orgData.orgNames.find(obj => obj.channelId === this.currentOrgId);

      let phoneNum = orgName ? (orgName.phone || "tel:0000 000 0000") : "tel:0000 000 0000";

      if (this.appFramework === 'Ekshamata') {        
        window.open(phoneNum);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }


  }

  async detectNetwork() {
    if (!navigator.onLine) {
      this.showOfflineModal();
    }
  }

  async showOfflineModal() {
    let openDilogRef = await this.dialog.getDialogById('offlineModal');
    if (openDilogRef) {
      // await openDilogRef.close();
      // setTimeout(() => {
      //   this.openOfflineModal();
      // }, 1000);
    } else {
      this.openOfflineModal()
    }
  }

  openOfflineModal() {
    const dialogRef = this.dialog.open(OfflineModalComponent, {
      id: 'offlineModal',
      width: '542px',
      disableClose: true,
      panelClass: 'full-width-offline-modal',
      data: {}
    })
  }

  async getAccessToken() {
    const session = await this.authService.getSession().toPromise();
    this.userId = session.userToken;
    return session.access_token;
  }

  async getConnectToSocket(data?: any) {
    const url = `wss://${buildConfig.SITEPATH}`;
    const token = (data &&data.accessToken) ? data!.accessToken : await this.getAccessToken();
    console.log('token is', token);
    const socket = io(url, { 
      auth: { token},
      path: '/apis/socket.io/'
    });

    socket.on('connect', () => {
      console.log(`Connected to the server with ID: ${socket.id}`);
  });

  socket.emit('getNotifications', { userId: (data && data.userId) ? data.userId : this.userId })

  socket.on('notificationsData', (data) => {
    this.appGlobalService.setNumberOfNotifications(data?.notificationData?.length);
    this.events.publish("notificationCountUpdated", data?.notificationData?.length);
  });
  }

  generateStartTelemetry() {
    const telemetryObject = new TelemetryObject('', 'session', undefined);
    this.telemetryGeneratorService.generateStartTelemetry('', telemetryObject);
  }
}

