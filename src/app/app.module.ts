// Angular dependencies
import { FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay'
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
// ionic cordova dependencies/plugins
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { SplashScreen } from '@capacitor/splash-screen';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// 3rd party dependencies
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CsContentType } from '@project-sunbird/client-services/services/content';
// app dependencies like directive, sdk, services etc
import { SunbirdSdk } from 'sunbird-sdk';
import {
  AppGlobalService,
  CommonUtilService,
  TelemetryGeneratorService,
} from '../services/index';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { LocationHandler } from '../services/location-handler';
import { CoreModule } from './manage-learn/core/core.module';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import onboarding from './../assets/configurations/config.json';
import { WidgetResolverModule } from '../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { OrgComponent } from '../project/ws/app/src/lib/routes/org/components/org/org.component';
import { BtnFeatureModule } from '../library/ws-widget/collection/src/lib/btn-feature/btn-feature.module'
import { WIDGET_REGISTERED_MODULES, WIDGET_REGISTRATION_CONFIG } from '../library/ws-widget/collection/src/lib/registration.config'
import { SearchModule } from '../project/ws/app/src/public-api';
import { MdePopoverModule } from '@material-extended/mde';
import { PublicModule } from './modules/public/public.module';
import { CoreModule as AastrikCoreModule } from './modules/core/core.module';
import { HomeModule } from './modules/home/home.module';
import { GetHelpModule } from './modules/get-help/get-help.module';
import { AuthModule } from './modules/auth/auth.module';
import { InitService } from '../services/init.service';
import { LoggerService } from '../library/ws-widget/utils/src/lib/services/logger.service';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { SharedModule } from '../project/ws/author/src/lib/modules/shared/shared.module';
import { TncPublicResolverService } from './services/tnc-public-resolver.service';
import { NewTncComponent } from './new-tnc/new-tnc.component';
import { ProfileDashboardModule } from './modules/profile/profile.module';
import { EntryModule } from '@aastrika_npmjs/comptency/entry-module'
import { SelfAssessmentModule } from '@aastrika_npmjs/comptency/self-assessment'
import { CompetencyModule } from '@aastrika_npmjs/comptency/competency'
import { COMPETENCY_REGISTRATION_CONFIG } from './competency/competency.config';
import { SelfAssessmentComponent } from './self-assessment/self-assessment.component';
import { AboutYouModule } from './modules/about-you/about-you.module';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { Deeplinks } from '@awesome-cordova-plugins/deeplinks/ngx';
import { SharedModule as AastrikShareModule } from './modules/shared/shared.module';
import { OrgmoduleModule } from '../project/ws/app/src/lib/routes/orgmodule/orgmodule.module';
import { TncComponent } from '../project/ws/app/src/lib/routes/app-setup/components/tnc/tnc.component';
import { TncAppResolverService } from '../services/tnc-app-resolver.service';
import { Globals } from '../project/ws/app/src/lib/routes/app-setup/globals';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { TelemetryModule } from './modules/telemetry';
import { AppFrameworkDetectorService } from './modules/core/services/app-framework-detector-service.service';
import { HowItWorksVideoComponent } from './how-it-works-video/how-it-works-video.component';
import { SmsRetriever } from '@awesome-cordova-plugins/sms-retriever/ngx'
// AoT requires an exported function for factories
import { ConfigService } from './routes/discussion-forum/wrapper/service/config.service'

import { DiscussionUiModule } from '@aastrika_npmjs/discussions-ui-v8'
import { buildConfig, configuration } from '../../configurations/configuration';

const getBaseHref = (platformLocation: PlatformLocation): string => {
  return platformLocation.getBaseHrefFromDOM()
}
const appInitializer = (initSvc: InitService, logger: LoggerService) => async () => {
  try {
    await initSvc.init()
  } catch (error) {
    logger.error('ERROR DURING APP INITIALIZATION >', error)
  }
}
export function translateHttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

export const authService = () => {
  return SunbirdSdk.instance.authService;
};
export const pageAssembleService = () => {
  return SunbirdSdk.instance.pageAssembleService;
};
export const dbService = () => {
  return SunbirdSdk.instance.dbService;
};
export const courseService = () => {
  return SunbirdSdk.instance.courseService;
};
export const sharedPreferences = () => {
  return SunbirdSdk.instance.sharedPreferences;
};
export const apiService = () => {
  return SunbirdSdk.instance.apiService;
};
export const profileService = () => {
  return SunbirdSdk.instance.profileService;
};
export const deviceRegisterService = () => {
  return SunbirdSdk.instance.deviceRegisterService;
};
export const groupService = () => {
  return SunbirdSdk.instance.groupService;
};
export const frameworkService = () => {
  return SunbirdSdk.instance.frameworkService;
};
export const frameworkUtilService = () => {
  return SunbirdSdk.instance.frameworkUtilService;
};
export const systemSettingsService = () => {
  return SunbirdSdk.instance.systemSettingsService;
};
export const telemetryService = () => {
  return SunbirdSdk.instance.telemetryService;
};
export const contentService = () => {
  return SunbirdSdk.instance.contentService;
};
export const contentFeedbackService = () => {
  return SunbirdSdk.instance.contentFeedbackService;
};
export const eventsBusService = () => {
  return SunbirdSdk.instance.eventsBusService;
};
export const deviceInfo = () => {
  return SunbirdSdk.instance.deviceInfo;
};
export const playerService = () => {
  return SunbirdSdk.instance.playerService;
};
export const formService = () => {
  return SunbirdSdk.instance.formService;
};
export const downloadService = () => {
  return SunbirdSdk.instance.downloadService;
};

export function storageService() {
  return SunbirdSdk.instance.storageService;
}
export function networkQueueService() {
  return SunbirdSdk.instance.networkQueueService;
}
export function notificationService() {
  return SunbirdSdk.instance.notificationService;
}
export function errorLoggerService() {
  return SunbirdSdk.instance.errorLoggerService;
}
export function searchHistoryService() {
  return SunbirdSdk.instance.searchHistoryService;
}
export function networkInfoService() {
  return SunbirdSdk.instance.networkInfoService;
}
export function codePushExperimentService() {
  return SunbirdSdk.instance.codePushExperimentService;
}
export function faqService() {
  return SunbirdSdk.instance.faqService;
}
export function archiveService() {
  return SunbirdSdk.instance.archiveService;
}
export const discussionService = () => {
  return SunbirdSdk.instance.discussionService;
};
export const segmentationService = () => {
  return SunbirdSdk.instance.segmentationService;
};

export const debuggingService = () => {
  return SunbirdSdk.instance.debuggingService;
};

export const notificationServiceV2 = () => {
  return SunbirdSdk.instance.notificationServiceV2;
};

export const certificateService = () => {
  return SunbirdSdk.instance.certificateService;
};

export function sdkDriverFactory(): any {
  return [{
    provide: 'SDK_CONFIG',
    useFactory: authService
  }, {
    provide: 'AUTH_SERVICE',
    useFactory: authService
  }, {
    provide: 'DB_SERVICE',
    useFactory: dbService
  }, {
    provide: 'COURSE_SERVICE',
    useFactory: courseService
  }, {
    provide: 'SHARED_PREFERENCES',
    useFactory: sharedPreferences
  }, {
    provide: 'API_SERVICE',
    useFactory: apiService
  }, {
    provide: 'PAGE_ASSEMBLE_SERVICE',
    useFactory: pageAssembleService
  }, {
    provide: 'GROUP_SERVICE',
    useFactory: groupService
  }, {
    provide: 'PROFILE_SERVICE',
    useFactory: profileService
  }, {
    provide: 'DEVICE_REGISTER_SERVICE',
    useFactory: deviceRegisterService
  }, {
    provide: 'DB_SERVICE',
    useFactory: dbService
  }, {
    provide: 'FRAMEWORK_SERVICE',
    useFactory: frameworkService
  }, {
    provide: 'FRAMEWORK_UTIL_SERVICE',
    useFactory: frameworkUtilService
  }, {
    provide: 'PAGE_ASSEMBLE_SERVICE',
    useFactory: pageAssembleService
  }, {
    provide: 'FORM_SERVICE',
    useFactory: formService
  }, {
    provide: 'SYSTEM_SETTINGS_SERVICE',
    useFactory: systemSettingsService
  }, {
    provide: 'TELEMETRY_SERVICE',
    useFactory: telemetryService
  }, {
    provide: 'CONTENT_SERVICE',
    useFactory: contentService
  }, {
    provide: 'CONTENT_FEEDBACK_SERVICE',
    useFactory: contentFeedbackService
  }, {
    provide: 'EVENTS_BUS_SERVICE',
    useFactory: eventsBusService
  }, {
    provide: 'DEVICE_INFO',
    useFactory: deviceInfo
  }, {
    provide: 'PLAYER_SERVICE',
    useFactory: playerService
  }, {
    provide: 'DOWNLOAD_SERVICE',
    useFactory: downloadService
  }, {
    provide: 'STORAGE_SERVICE',
    useFactory: storageService
  }, {
    provide: 'NETWORK_ENQUE_SERVICES',
    useFactory: networkQueueService
  },{
    provide: 'NOTIFICATION_SERVICE',
    useFactory: notificationService
  }, {
    provide: 'ERROR_LOGGER_SERVICE',
    useFactory: errorLoggerService
  }, {
    provide: 'SEARCH_HISTORY_SERVICE',
    useFactory: searchHistoryService
  }, {
    provide: 'CODEPUSH_EXPERIMENT_SERVICE',
    useFactory: codePushExperimentService
  }, {
    provide: 'NETWORK_INFO_SERVICE',
    useFactory: networkInfoService
  }, {
    provide: 'FAQ_SERVICE',
    useFactory: faqService
  }, {
    provide: 'ARCHIVE_SERVICE',
    useFactory: archiveService
  }, {
    provide: 'DISCUSSION_SERVICE',
    useFactory: discussionService
  }, {
    provide: 'SEGMENTATION_SERVICE',
    useFactory: segmentationService
  }, {
    provide: 'DEBUGGING_SERVICE',
    useFactory: debuggingService
  }, {
    provide: 'NOTIFICATION_SERVICE_V2',
    useFactory: notificationServiceV2
  }, {
    provide: 'CERTIFICATE_SERVICE',
    useFactory: certificateService
  }];
}

export const sunbirdSdkServicesProvidersFactory: () => Provider[] = sdkDriverFactory;

export const sunbirdSdkFactory =
  () => {
    return async () => {
      const buildConfigValues = buildConfig

      await SunbirdSdk.instance.init({
        platform: 'cordova',
        fileConfig: {
        },
        apiConfig: {
          debugMode: configuration.debug,
          host: buildConfigValues['BASE_URL'],
          user_authentication: {
            redirectUrl: buildConfigValues['OAUTH_REDIRECT_URL'],
            authUrl: '/auth/realms/sunbird/protocol/openid-connect',
            mergeUserHost: buildConfigValues['MERGE_ACCOUNT_BASE_URL'],
            autoMergeApiPath: '/migrate/user/account'
          },
          api_authentication: {
            mobileAppKey: buildConfigValues['MOBILE_APP_KEY'],
            mobileAppSecret: buildConfigValues['MOBILE_APP_SECRET'],
            mobileAppConsumer: buildConfigValues['MOBILE_APP_CONSUMER'],
            channelId: buildConfigValues['CHANNEL_ID'],
            producerId: buildConfigValues['PRODUCER_ID'],
            producerUniqueId: buildConfigValues['APPLICATION_ID']
          },
          cached_requests: {
            timeToLive: 2 * 60 * 60 * 1000
          }
        },
        eventsBusConfig: {
          debugMode: true
        },
        dbConfig: {
          dbName: 'GenieServices.db'
        },
        deviceRegisterConfig: {
          apiPath: '/api/v3/device'
        },
        contentServiceConfig: {
          apiPath: '/api/content/v2',
          searchApiPath: '/api/content/v1',
          contentHeirarchyAPIPath: '/api/collection/v1',
          questionSetReadApiPath: '/api/questionset/v1',
          questionReadApiPath: '/api/question/v1/'
        },
        courseServiceConfig: {
          apiPath: '/api/course/v1'
        },
        formServiceConfig: {
          apiPath: '/api/data/v1/form',
          formConfigDirPath: '/data/form',
        },
        frameworkServiceConfig: {
          channelApiPath: '/api/channel/v1',
          frameworkApiPath: '/api/framework/v1',
          frameworkConfigDirPath: '/data/framework',
          channelConfigDirPath: '/data/channel',
          searchOrganizationApiPath: '/api/org/v2',
          systemSettingsDefaultChannelIdKey: 'custodianOrgId',
          overriddenDefaultChannelId: onboarding.overriddenDefaultChannelId
        },
        profileServiceConfig: {
          profileApiPath: '/api/user/v1',
          profileApiPath_V2: '/api/user/v2',
          profileApiPath_V5: '/api/user/v2',
          tenantApiPath: '/v1/tenant',
          otpApiPath: '/api/otp/v2',
          searchLocationApiPath: '/api/data/v1',
          locationDirPath: '/data/location'
        },
        pageServiceConfig: {
          apiPath: '/api/data/v1',
        },
        appConfig: {
          maxCompatibilityLevel: 5,
          minCompatibilityLevel: 1
        },
        systemSettingsConfig: {
          systemSettingsApiPath: '/api/data/v1',
          systemSettingsDirPath: '/data/system',
        },
        telemetryConfig: {
          apiPath: '/apis/public/v8/publicTelemetry',
          telemetrySyncBandwidth: 200,
          telemetrySyncThreshold: 200,
          telemetryLogMinAllowedOffset: 86400000
        },
        sharedPreferencesConfig: {
        },
        certificateServiceConfig: {
          apiPath: '/api/certreg/v2',
          apiPathLegacy: '/api/certreg/v1',
          rcApiPath: '/api/rc/${schemaName}/v1',
        },
        playerConfig: {
          showEndPage: false,
          endPage: [{
            template: 'assessment',
            contentType: [CsContentType.SELF_ASSESS]
          }],
          splash: {
            webLink: '',
            text: '',
            icon: '',
            bgImage: 'assets/icons/splacebackground_1.png'
          },
          overlay: {
            enableUserSwitcher: false,
            showUser: false
          },
          plugins: [
            {
              id: 'org.sunbird.player.endpage',
              ver: '1.1',
              type: 'plugin'
            }
          ]
        },
        errorLoggerConfig: {
          errorLoggerApiPath: '/api/data/v1/client/logs'
        },
        faqServiceConfig: {
          faqConfigDirPath: '/data/faq'
        }
      });

      window['sunbird'] = SunbirdSdk.instance;
    };
  };
@NgModule({
  declarations: [
    AppComponent,
    OrgComponent,
    NewTncComponent,
    SelfAssessmentComponent,
    TncComponent,
    HowItWorksVideoComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ComponentsModule,
    HttpClientModule,
    AboutYouModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (translateHttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot({
      scrollPadding: false,
      scrollAssist: true,
      // autoFocusAssist: false
    }),
    IonicStorageModule.forRoot(),
    TelemetryModule.forRoot(),
    CoreModule,
    DiscussionUiModule.forRoot(ConfigService),
    ...WIDGET_REGISTERED_MODULES,
    WidgetResolverModule.forRoot(WIDGET_REGISTRATION_CONFIG),
    SearchModule,
    BtnFeatureModule,
    MdePopoverModule,
    PublicModule,
    AastrikCoreModule,
    HomeModule,
    GetHelpModule,
    AastrikShareModule,
    AuthModule,
    SharedModule,
    ProfileDashboardModule,
    EntryModule.forRoot(COMPETENCY_REGISTRATION_CONFIG),
    SelfAssessmentModule,
    CompetencyModule.forRoot(COMPETENCY_REGISTRATION_CONFIG),
    OrgmoduleModule,
    RouterModule
  ],
  providers: [
    AppGlobalService,
    StatusBar,
    EmailComposer,
    AppVersion,
    Deeplinks,
    {
      deps: [InitService, LoggerService],
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true
    },
    LocalNotifications,
    SocialSharing,
    File,
    FileTransferObject,
    FileOpener,
    FileTransfer,
    TelemetryGeneratorService,
    CommonUtilService,
    Device,
    LocationHandler,
    SQLite,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 5000 },
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ...sunbirdSdkServicesProvidersFactory(),
    { provide: APP_INITIALIZER, useFactory: sunbirdSdkFactory, deps: [], multi: true },
    {
      deps: [InitService, LoggerService],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
    },
    {
      deps: [InitService, LoggerService],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
    },
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
    TncPublicResolverService,
    TncAppResolverService,
    Globals,
    SmsRetriever
  ],
  bootstrap: [AppComponent],
  exports: [],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {
  appFramework: string;
  constructor(
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private translate: TranslateService,
  ) {
    this.detectFramework();

  }

  async detectFramework() {
    try {
      await SplashScreen.hide({fadeOutDuration: 10});
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      let lang = this.appFramework === 'Ekshamata' ? 'en' : 'en'
      this.translate.setDefaultLang(lang);
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }
}
declare global {
  interface Window {
    fcWidget?: any
  }
}
