import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild, AfterViewInit, HostListener, Inject } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { MobileAppsService } from '../../../../../../../services/mobile-apps.service'
import { SCORMAdapterService } from './SCORMAdapter/scormAdapter'
// import { Interval, Observable, Subscription } from 'rxjs'
import { ViewerUtilService } from '../../../../../../../project/ws/viewer/src/lib/viewer-util.service'
import { CordovaHttpService } from '../../../../../../../app/modules/core/services/cordova-http.service'
import { InAppBrowser, InAppBrowserEvent, InAppBrowserObject, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { AuthService, Rollup, TelemetryObject } from 'sunbird-sdk';
import { ViewerDataService } from '../../viewer-data.service'
import appsConfig from 'assets/configurations/apps.json';
import { PlayerStateService } from '../../player-state.service'
import { Subject } from 'rxjs'
import * as _ from 'lodash'
import { File } from '@awesome-cordova-plugins/file/ngx';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { buildConfig } from '../../../../../../../../configurations/configuration'
import { OnlineSqliteService } from '../../../../../../../app/modules/shared/services/online-sqlite.service'
import { CourseOptimisticUiService } from '../../../../../../../app/modules/shared/services/course-optimistic-ui.service'
import { CommonUtilService } from '../../../../../../../services/common-util.service'
import { Events } from '../../../../../../../util/events'
import { NsContent } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { TFetchStatus } from '../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { EventService } from '../../../../../../../library/ws-widget/utils/src/lib/services/event.service'
import { WidgetContentService } from '../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { Capacitor } from '@capacitor/core';
import { ActivatedRoute, Router } from '@angular/router'
import { Environment, Mode, PageId, TelemetryGeneratorService } from '../../../../../../../services'
import { ContentUtil } from '../../../../../../../util/content-util'

@Component({
  selector: 'viewer-plugin-html',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
})
export class HtmlComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  // private mobileOpenInNewTab!: any
  @ViewChild('iframeElem', { static: false }) iframeElem!: ElementRef<HTMLIFrameElement>
  @ViewChild('mobileOpenInNewTab', { read: ElementRef, static: false }) mobileOpenInNewTab !: ElementRef<HTMLAnchorElement>
  @Input() htmlContent: NsContent.IContent | null = null
  iframeUrl: SafeResourceUrl | null = null
  offlineiframeUrl: any | null = null
  isOfflineScromUrl = false
  public unsubscribe = new Subject<void>()
  showIframeSupportWarning = false
  showIsLoadingMessage = false
  showUnBlockMessage = false
  pageFetchStatus: TFetchStatus | 'artifactUrlMissing' = 'fetching'
  isUserInIntranet = false
  intranetUrlPatterns: string[] | undefined = []
  isIntranetUrl = false
  progress = 100
  iframeName = `piframe_${Date.now()}`
  urlContains = ''
  mimeType = ''
  scromURL: string
  contentData: any
  @HostListener('window:blur', ['$event'])
  globalBrowser: InAppBrowserObject | null = null;
  private exitSubscription: any;
  public scromProgressCheckCalled = false
  loadingMessage: string = "Please wait! Content requested is loading";
  telemetryObject: any;
  public objRollup: Rollup;
  onBlur(): void {
    if (this.urlContains.includes('youtube') && this.htmlContent !== null) {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
      setTimeout(() => {
        const data2 = {
          current: 10,
          max_size: 10,
          mime_type: this.mimeType,
        }
        // @ts-ignore: Object is possibly 'null'.
        this.viewerSvc.realTimeProgressUpdate(this.htmlContent.identifier, data2, collectionId, batchId).subscribe((data) => {
          this.contentSvc.changeMessage(
            {
              type: 'youtube',
              progressData: data.result
            }
          )
        })
      }, 50)
    }
  }

  constructor(
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private domSanitizer: DomSanitizer,
    public mobAppSvc: MobileAppsService,
    private scormAdapterService: SCORMAdapterService,
    // private http: HttpClient,
    private router: Router,
    private configSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
    private events: EventService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private activatedRoute: ActivatedRoute,
    private iab: InAppBrowser,
    private cordovaHttpService: CordovaHttpService,
    private viewerDataSvc: ViewerDataService,
    private playerStateService: PlayerStateService,
    private screenOrientation: ScreenOrientation,
    private file: File,
    private onlineSqliteService:OnlineSqliteService,
    private courseOptimisticUiService: CourseOptimisticUiService,
    private commonUtilService:CommonUtilService,
    private event: Events,
    private telemetryGeneratorService: TelemetryGeneratorService
    
  ) {
    (window as any).API = this.scormAdapterService
    window.addEventListener('message', this.receiveMessage.bind(this))
  }

  ngOnInit() {
    this.commonUtilService.addLoader(3000, 'Please wait! Content requested is loading')
  }
  ngAfterViewInit() {
    if(navigator.onLine && this.htmlContent.mimeType === 'application/vnd.ekstep.html-archive'){
      this.scromProgressCheckCalled = false
      this.openSCORMPlayer()
    }
    
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.receiveMessage.bind(this));
    window.removeEventListener('message', this.receiveMessage.bind(this),false);
    this.commonUtilService.removeLoader()
  }


  public async openSCORMPlayer() {
    const options: InAppBrowserOptions = {
      location: 'yes', // Set to 'no' if you don't want the in-app browser's location bar to show    
      clearcache: 'yes',
      cleardata: 'yes',
      clearsessioncache: 'yes',
      zoom: 'no', // Set to 'yes' if you want to allow zooming in the in-app browser 
      closeButtonCaption: 'exit',
      fullscreen: 'yes',
      hideurlbar: 'yes',
      hidenavigationbuttons: 'yes'
    };
    const session = await this.authService.getSession().toPromise();
    console.log(this.scromURL, session.userToken, this.activatedRoute.snapshot.queryParams, this.htmlContent.identifier)
    const url = this.constructScormURL(this.scromURL, session.access_token,
      this.activatedRoute.snapshot.queryParams.collectionId,
      this.activatedRoute.snapshot.queryParams.batchId, this.htmlContent.identifier,
      this.htmlContent.name,this.htmlContent!.parent ? this.htmlContent.parent : undefined)
    const target = '_blank';
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    this.loadingMessage = "Message for InAppBrowser loading";
    console.log('.....................this.htmlContent', this.htmlContent)
    await this.checkContentEntryPoint()
    this.generateStartEvent()
    this.globalBrowser = this.iab.create(url, target, options);
    this.globalBrowser.on('exit').subscribe(() => {
      this.screenOrientation.unlock();
      setTimeout(()=>{
        this.handlePlayerStateNavigation()
      })
    })
    
    this.globalBrowser.on('message').subscribe(async (event: any) => {
      const receivedMessage = event.data;
      console.log('Message from InAppBrowser:', receivedMessage);
      if (receivedMessage.action === 'close') {
        this.screenOrientation.unlock();
        await this.courseOptimisticUiService.insertCourseProgress(this.activatedRoute.snapshot.queryParams.collectionId,
          this.htmlContent.identifier, this.configSvc.userProfile.userId,100, this.activatedRoute.snapshot.queryParams.batchId,
          'scorm', this.htmlContent.identifier,2)
        const couseLocalProgressData = await this.courseOptimisticUiService.courseProgressRead(this.activatedRoute.snapshot.queryParams.collectionId)
        console.log('couseLocalProgressData>>>>', couseLocalProgressData)
        await this.courseOptimisticUiService.updateLastReadContentId(this.activatedRoute.snapshot.queryParams.collectionId, this.htmlContent.identifier, couseLocalProgressData);
        this.contentSvc.changeMessage({
          type: 'scorm',
          progressData: couseLocalProgressData.result
        });
        if (!this.scromProgressCheckCalled) {
          await this.scromProgressCheck(receivedMessage.percentage);
          this.scromProgressCheckCalled = true;
        }
      }
    })
    this.globalBrowser.on('loadstart').subscribe((event: InAppBrowserEvent) => {
      this.commonUtilService.addLoader(20000, 'Please wait! Content requested is loading');
      if (event.url === `${url}#close`) {
        this.globalBrowser.close();
        this.scromProgressCheck()
      }
    });
    this.globalBrowser.on('beforeload').subscribe((event: InAppBrowserEvent) => {
      this.commonUtilService.addLoader(20000, 'Please wait beforereload ! Content requested is loading');

    })
  }

  generateStartEvent() {
    this.telemetryObject = {
      id: this.htmlContent.identifier,
      type: this.htmlContent.contentType,
      version: this.htmlContent.version,
    };
    this.objRollup = ContentUtil.generateRollUp('', this.htmlContent.identifier);
    this.telemetryGeneratorService.generateStartTelemetry(
      PageId.SCROM_CONTENT,
      this.telemetryObject,
      this.objRollup
    );
  }
  async checkContentEntryPoint() {
    if (this.htmlContent && this.htmlContent.entryPoint && !this.htmlContent.entryPoint.includes('index_lms.html')) {
      await this.courseOptimisticUiService.insertCourseProgress(
        this.activatedRoute.snapshot.queryParams.collectionId,
        this.htmlContent.identifier,
        this.configSvc.userProfile.userId,
        100,
        this.activatedRoute.snapshot.queryParams.batchId,
        this.htmlContent.identifier,
        'scorm',
        2
      );
      
      const courseLocalProgressData = await this.courseOptimisticUiService.courseProgressRead(
        this.activatedRoute.snapshot.queryParams.collectionId
      );
      console.log('courseLocalProgressData>>>>', courseLocalProgressData);
      
      await this.courseOptimisticUiService.updateLastReadContentId(
        this.activatedRoute.snapshot.queryParams.collectionId,
        this.htmlContent.identifier,
        courseLocalProgressData
      );
      
      const data1 = {
        current: 1,
        max_size: 1,
        mime_type: this.htmlContent.mimeType,
      };
      
      this.viewerSvc.realTimeProgressUpdate(
        this.htmlContent.identifier,
        data1,
        this.activatedRoute.snapshot.queryParams.collectionId,
        this.activatedRoute.snapshot.queryParams.batchId
      ).subscribe((data) => {
        // Handle the response if needed
      });
    }
  }
  
  constructScormURL(scromURL, userToken, collectionId, batchId, htmlIdentifier, htmlName, parent) {
    const baseURL = 'https://'+buildConfig.SITEPATH+'/public/scrom-player';
    const authorizationToken = appsConfig.API.secret_key;
    const userTokenParam = `userToken=${userToken}`;
    const courseIdParam = `courseId=${collectionId}`;
    const batchIdParam = `batchId=${batchId}`;
    const authorizationParam = `Authorization=${authorizationToken}`;
    const identifierParam = `identifier=${htmlIdentifier}`;
    const htmlNameParam = `htmlName=${htmlName}`;
    const parentParam = `parent=${parent}`;
    const fullURL = `${baseURL}?scormUrl=${scromURL}&${userTokenParam}&${courseIdParam}&${batchIdParam}&${authorizationParam}&${identifierParam}&${htmlNameParam}&${parentParam}`;
    return fullURL;
  }
  async scromProgressCheck(percentage?: any) {
    const userProfile = this.configSvc.userProfile;
    const userId = userProfile?.userId || '';

    const queryParams = this.activatedRoute.snapshot.queryParams;
    const batchId = queryParams.batchId;
    const courseId = queryParams.collectionId || '';
    if (percentage === 100) {
      setTimeout(()=>{
        this.globalBrowser.close()
        this.screenOrientation.unlock();
      },500)
    } else {
      //this.handlePlayerStateNavigation();
    }
  }

  private async handlePlayerStateNavigation() {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const collectionId = queryParams.collectionId;
    const courseId = this.htmlContent.identifier;
    const userId = this.configSvc.userProfile.userId;
    const batchId = queryParams.batchId;
    if(this.htmlContent.mimeType === 'text/x-url'){
      await this.courseOptimisticUiService.insertCourseProgress(collectionId, courseId, userId, 100, batchId, 'embed', courseId, 2);
      const courseLocalProgressData = await this.courseOptimisticUiService.courseProgressRead(collectionId);
      console.log('handlePlayerStateNavigation link', courseLocalProgressData);
      await this.courseOptimisticUiService.updateLastReadContentId(collectionId, courseId, courseLocalProgressData);
      const data1 = {
        current: 1,
        max_size: 1,
        mime_type: this.htmlContent.mimeType,
      }
      this.viewerSvc
      .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId).subscribe((data) => {})
    }
    const contentPerentage = await this.courseOptimisticUiService.isContentIdExistsWithPercentage(collectionId, userId, courseId);
    this.generateEndEvent()
    if (!contentPerentage.exists && contentPerentage.completionPercentage === 0) {
      await this.handleZeroCompletionScorm(collectionId, courseId, userId, batchId);
    } else if (contentPerentage.exists && contentPerentage.completionPercentage > 0 && contentPerentage.completionPercentage !== 100) {
      await this.handleZeroCompletionWithoutInsert(collectionId, courseId, userId, batchId);
    } else if (contentPerentage.exists && contentPerentage.completionPercentage === 100) {
      this.handleCompletion100Percent(batchId, queryParams);
    }
  }
  
  private async handleZeroCompletionScorm(collectionId: string, courseId: string, userId: string, batchId: string) {
    await this.courseOptimisticUiService.insertCourseProgress(collectionId, courseId, userId, 5, batchId, 'scorm', courseId, 2);
    const courseLocalProgressData = await this.courseOptimisticUiService.courseProgressRead(collectionId);
    console.log('handlePlayerStateNavigation scorm', courseLocalProgressData);
    await this.courseOptimisticUiService.updateLastReadContentId(collectionId, courseId, courseLocalProgressData);
    await this.onlineSqliteService.updateResumeData(collectionId);
    this.screenOrientation.unlock();
    this.globalBrowser.close();
    this.navigateWithQueryParams();
   
  }
  generateEndEvent() {
    this.telemetryGeneratorService.generateEndTelemetry(
      'SCROM',
      Mode.PLAY,
      PageId.SCROM_CONTENT,
      Environment.COURSE,
      this.htmlContent.duration,
      this.telemetryObject,
      this.objRollup);
  }
  
  private async handleZeroCompletionWithoutInsert(collectionId, courseId, userId, batchId) {
    await this.courseOptimisticUiService.insertCourseProgress(collectionId, courseId, userId, 5, batchId, 'scorm', courseId, 2);
    const courseLocalProgressData = await this.courseOptimisticUiService.courseProgressRead(collectionId);
    console.log('handlePlayerStateNavigation scorm', courseLocalProgressData);
    await this.courseOptimisticUiService.updateLastReadContentId(collectionId, courseId, courseLocalProgressData);
    await this.onlineSqliteService.updateResumeData(collectionId);
    this.screenOrientation.unlock();
    this.globalBrowser.close();
    this.navigateWithQueryParams();
    
  }
  
  private handleCompletion100Percent(batchId: string, queryParams: any) {
    setTimeout(() => {
      const viewerData = {
        completed: true,
        batchId,
        collectionId: queryParams.collectionId,
        collectionType: queryParams.collectionType,
      };
      this.viewerDataSvc.scromChangeSubject.next(viewerData);
    });
  }
  

  private navigateWithQueryParams() {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const collectionId = queryParams.collectionId;
    const courseId = this.htmlContent.identifier;
    const userId = this.configSvc.userProfile.userId;
    const batchId = queryParams.batchId;
    this.event.publish('callVieweToc', {
      batchId : queryParams.batchId,
      collectionId: queryParams.collectionId,
      collectionType: queryParams.collectionType,
    })
    // this.router.navigate(['']);
    // const navigationSubscription = this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationStart) {
    //     this.commonUtilService.addLoader(20000);
    //   } else if (event instanceof NavigationEnd) {
    //     navigationSubscription.unsubscribe();
    //   }
    // });
  
    // const currentId = this.activatedRoute.snapshot.queryParams.collectionId; 
    // console.log('navigating to course toc page ',currentId);
    // this.router.navigateByUrl(`/app/toc/${currentId}`).then(()=>{
    //   this.router.navigate(['overview'], { relativeTo: this.activatedRoute }).then(()=>{
    //     this.commonUtilService.removeLoader();
    //   })
    // })
    // this.router.navigate(['/app/toc', currentId, 'overview'], {
    //   queryParams: {
    //     primaryCategory: 'Course',
    //     batchId: this.activatedRoute.snapshot.queryParams.batchId
    //   }
    // }).then(() => {
      
    // });
  }
  


  executeForms() {
    if (this.urlContains.includes('docs.google') && this.htmlContent !== null) {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
      setTimeout(() => {
        const data2 = {
          current: 10,
          max_size: 10,
          mime_type: this.mimeType,
        }
        // @ts-ignore: Object is possibly 'null'.
        this.viewerSvc.realTimeProgressUpdate(this.htmlContent.identifier, data2, collectionId, batchId).subscribe((data) => {
          this.contentSvc.changeMessage(
            {
              type: 'docs.google',
              progressData: data.result
            }
          )
        })
      }, 50)
    }
  }
  async ngOnChanges() {
    if (this.htmlContent && this.htmlContent.identifier) {
      this.urlContains = this.htmlContent.artifactUrl
    }

    if (this.urlContains.includes('docs.google') && this.htmlContent !== null) {
      this.executeForms()
    }

    if (this.htmlContent && this.htmlContent.identifier && this.htmlContent.mimeType === 'application/vnd.ekstep.html-archive') {
      //this.contentSvc.changeMessage('scorm')
      this.scormAdapterService.contentId = this.htmlContent.identifier
      // this.scormAdapterService.loadData()
      this.scormAdapterService.loadDataV2()
    }

    this.isIntranetUrl = false
    this.progress = 100
    this.pageFetchStatus = 'fetching'
    this.showIframeSupportWarning = false
    this.intranetUrlPatterns = this.configSvc.instanceConfig
      ? this.configSvc.instanceConfig.intranetIframeUrls
      : []

    let iframeSupport: boolean | string | null =
      this.htmlContent && this.htmlContent.isIframeSupported
    if (this.htmlContent && this.htmlContent.artifactUrl) {
      if (this.htmlContent.artifactUrl.startsWith('http://') && this.htmlContent.isExternal) {
        this.htmlContent.isIframeSupported = 'No'
      }
      if (typeof iframeSupport !== 'boolean') {
        iframeSupport = this.htmlContent.isIframeSupported.toLowerCase()
        if (iframeSupport === 'no') {
          this.showIframeSupportWarning = true
          setTimeout(
            () => {
              this.openInNewTab()
            },
            3000,
          )
          setInterval(
            () => {
              this.progress -= 1
            },
            30,
          )
        } else if (iframeSupport === 'maybe') {
          this.showIframeSupportWarning = true
        } else {
          this.showIframeSupportWarning = false
          if (this.htmlContent.mimeType === 'text/x-url') {
            const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
              this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
            const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
              this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
            const data1 = {
              current: 1,
              max_size: 1,
              mime_type: this.htmlContent.mimeType,
            }

            setTimeout(() => {
              if (this.htmlContent) {
                this.viewerSvc
                  .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId).subscribe((data) => {
                    // this.contentSvc.changeMessage(
                    //   {
                    //     type: 'html',
                    //     progressData: data.result
                    //   }
                    // )
                  })
              }
            }, 50)
          }
        }
      }
      if (this.intranetUrlPatterns && this.intranetUrlPatterns.length) {
        this.intranetUrlPatterns.forEach(iup => {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            if (this.htmlContent.artifactUrl.startsWith(iup)) {
              this.isIntranetUrl = true
            }
          }
        })
      }

      this.showIsLoadingMessage = false

      if (this.htmlContent.isIframeSupported !== 'No') {
        setTimeout(
          () => {
            if (this.pageFetchStatus === 'fetching' && !this.urlContains.includes('docs.google')) {
              this.showIsLoadingMessage = true
            }
          },
          3000,
        )
      }

      if (this.htmlContent.mimeType === 'application/vnd.ekstep.html-archive') {
        this.mimeType = this.htmlContent.mimeType
        if (this.htmlContent.status !== 'Live') {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            if(!navigator.onLine){
              const basePath = Capacitor.convertFileSrc(this.htmlContent.basePath); // Converts to an accessible URL
              const artifactPath = Capacitor.convertFileSrc(this.htmlContent.contentData.entryPoint.substring(1));
              const filePath = `${basePath}/${artifactPath}`;
              this.offlineiframeUrl =  this.domSanitizer.bypassSecurityTrustResourceUrl(filePath)
              this.isOfflineScromUrl = true
            }else {
              this.contentSvc
              .fetchHierarchyContent(this.htmlContent.identifier)
              .toPromise()
              .then((res: any) => {

                let url = res['result']['content']['streamingUrl']
                if (res['result']['content']['entryPoint']) {
                  url = url + res['result']['content']['entryPoint']

                }
                this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url)
              })
              .catch((err: any) => {
                /* tslint:disable-next-line */
                // console.log(err)
              })
            }
            
          }
        } else {
          if (this.htmlContent && this.htmlContent.artifactUrl) {
            if(!navigator.onLine){
              const basePath = Capacitor.convertFileSrc(this.htmlContent.basePath); // Converts to an accessible URL
              const entryPoint = Capacitor.convertFileSrc(this.htmlContent.contentData.entryPoint.substring(1)); // Converts artifact URL
              const filePath = `${basePath}/${entryPoint}`;
              this.offlineiframeUrl =  this.domSanitizer.bypassSecurityTrustResourceUrl(filePath)
              this.isOfflineScromUrl = true
            }else {
            const streamingUrl = this.htmlContent.streamingUrl.substring(51)
            const entryPoint = this.htmlContent.entryPoint || ''
            const newUrl = `https://${buildConfig.SITEPATH}/apis/public/v8/mobileApp/getContents/${streamingUrl}${entryPoint}`
            this.scromURL = newUrl
            this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(`${newUrl}`)
            }
            
          }
        }

        if (this.htmlContent.entryPoint && this.htmlContent.entryPoint.includes('lms') === false) {
          const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
            this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
          const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
            this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
          const data1 = {
            current: 1,
            max_size: 1,
            mime_type: this.mimeType,
          }

          setTimeout(() => {
            if (this.htmlContent) {
              this.viewerSvc
                .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId).subscribe((data) => {
                  this.contentSvc.changeMessage(
                    {
                      type: 'html',
                      progressData: data.result
                    }
                  )
                }
                )
            }
          }, 50)
        }

      } else {
        this.mimeType = this.htmlContent.mimeType
        this.iframeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
          this.htmlContent.artifactUrl)
        this.scromURL = this.htmlContent.artifactUrl
      }

    } else if (this.htmlContent && this.htmlContent.artifactUrl === '') {
      this.iframeUrl = null
      this.pageFetchStatus = 'artifactUrlMissing'
    } else {
      this.iframeUrl = null
      this.pageFetchStatus = 'error'
    }
  }

  // backToDetailsPage() {
  //   this.router.navigate([
  //     `/app/toc/${this.htmlContent ? this.htmlContent.identifier : ''}/overview`,
  //   ])
  // }

  backToDetailsPage() {
    this.router.navigate(
      [`/app/toc/${this.htmlContent ? this.htmlContent.identifier : ''}/overview`],
      { queryParams: { primaryCategory: this.htmlContent ? this.htmlContent.primaryCategory : '' } })
  }

  raiseTelemetry(data: any) {
    if (this.htmlContent) {
      /* tslint:disable-next-line */
      // console.log(this.htmlContent.identifier)
      this.events.raiseInteractTelemetry(data.event, 'scrom', {
        contentId: this.htmlContent.identifier,
        ...data,
      })
    }
  }
  receiveMessage(msg: any) {
    if (msg.data) {
      const messageData = msg.data;
      console.log('Received message from iframe:', messageData);
      if (messageData && messageData.lmsFinishResult !== undefined) {
        const lmsFinishResult = messageData.lmsFinishResult;
        console.log('Received LMSFinish result:', lmsFinishResult);
        this.scromProgressCheck()
      } else {
        this.raiseTelemetry(messageData);
      }
    } else {
      this.raiseTelemetry({
        event: msg.message,
        id: msg.id,
      });
    }
  }


  openInNewTab() {
    if (this.htmlContent) {
      const collectionId = this.activatedRoute.snapshot.queryParams.collectionId ?
        this.activatedRoute.snapshot.queryParams.collectionId : this.htmlContent.identifier
      const batchId = this.activatedRoute.snapshot.queryParams.batchId ?
        this.activatedRoute.snapshot.queryParams.batchId : this.htmlContent.identifier
      const data1 = {
        current: 1,
        max_size: 1,
        mime_type: this.mimeType,
      }

     setTimeout(() => {
        if (this.htmlContent) {
          this.viewerSvc
            .realTimeProgressUpdate(this.htmlContent.identifier, data1, collectionId, batchId).subscribe((data) => {
              this.contentSvc.changeMessage(
                {
                  type: 'html',
                  progressData: data.result
                }
              )
            })
        }
      }, 50)

      if (this.mobAppSvc && this.mobAppSvc.isMobile) {
       // window.open(this.htmlContent.artifactUrl)
        setTimeout(
          () => {
            this.mobileOpenInNewTab.nativeElement.click()
          },
          0,
        )
      } else {
        const width = window.outerWidth
        const height = window.outerHeight
        const isWindowOpen = this.cordovaHttpService.checkTokenValidation().subscribe((session) => {
          const browser: any = this.iab.create(this.htmlContent.artifactUrl, '_system');
          browser.show();
        })
        // const isWindowOpen = window.open(
        //   this.htmlContent.artifactUrl,
        //   '_blank',
        //   `toolbar=yes,
        //      scrollbars=yes,
        //      resizable=yes,
        //      menubar=no,
        //      location=no,
        //      addressbar=no,
        //      top=${(15 * height) / 100},
        //      left=${(2 * width) / 100},
        //      width=${(65 * width) / 100},
        //      height=${(70 * height) / 100}`,
        // )
        if (isWindowOpen === null) {
          const msg = 'The pop up window has been blocked by your browser, please unblock to continue.'
          this.snackBar.open(msg)
        }
      }
    }
  }
  dismiss() {
    this.showIframeSupportWarning = false
    this.isIntranetUrl = false
  }

  onIframeLoadOrError(evt: 'load' | 'error', iframe?: HTMLIFrameElement, event?: any) {
    if (evt === 'error') {
      this.pageFetchStatus = evt
    }
    if (evt === 'load' && iframe && iframe.contentWindow) {
      if (event && iframe.onload) {
        iframe.onload(event)
      }
      iframe.onload = (data => {
        if (data.target) {
          this.pageFetchStatus = 'done'
          this.showIsLoadingMessage = false
        }
      })
    }
  }
}
