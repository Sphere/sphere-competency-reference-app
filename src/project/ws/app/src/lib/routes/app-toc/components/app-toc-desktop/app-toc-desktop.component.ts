import { Component, Input, OnChanges, OnDestroy, OnInit, HostListener, Inject, NgZone } from '@angular/core'
import { MatDialog } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser'
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router'
import { UtilityService } from '@ws-widget/utils/src/lib/services/utility.service'
import { AccessControlService } from '@ws/author'
import { EMPTY, Observable, of, Subscription, throwError } from 'rxjs'
import { NsAnalytics } from '../../models/app-toc-analytics.model'
import { NsAppToc, NsCohorts } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { AppTocDialogIntroVideoComponent } from '../app-toc-dialog-intro-video/app-toc-dialog-intro-video.component'
import { MobileAppsService } from '../../../../../../../../../services/mobile-apps.service'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import * as dayjs from 'dayjs'
import * as  lodash from 'lodash'
import { CreateBatchDialogComponent } from '../create-batch-dialog/create-batch-dialog.component'
import * as moment from 'moment';
import tocData from '../../../../../../../../../assets/configurations/toc.json'
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common'
import { AppTocDesktopModalComponent } from '../app-toc-desktop-modal/app-toc-desktop-modal.component'
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { buildConfig } from '../../../../../../../../../../configurations/configuration'
import { Content, ContentImport, ContentImportRequest, ContentImportResponse, ContentService, CourseService, DownloadEventType, DownloadProgress, DownloadService, DownloadTracking, EventsBusEvent, EventsBusService, LogLevel, Rollup, StorageService } from '@project-sunbird/sunbird-sdk'
import { CommonUtilService, Environment, ErrorType, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../../../../services'
import { OfflineConfirmModalComponent } from '../offline-confirm-modal/offline-confirm-modal.component'
import { LocalStorageService } from '../../../../../../../../../app/manage-learn/core'
import { ViewerUtilService } from '../../../../../../../viewer/src/lib/viewer-util.service'
import { ConfirmmodalComponent } from '../../../../../../../../../project/ws/viewer/src/lib/plugins/quiz/confirm-modal-component';
import { TranslateService } from '@ngx-translate/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Network } from '@capacitor/network'
import { Device } from '@awesome-cordova-plugins/device/ngx'
import { QuizService } from '../../../../../../../../../project/ws/viewer/src/lib/plugins/quiz/quiz.service'
import { NsContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model';
import { NsPlaylist } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.model';
import { NsGoal } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.model';
import { TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { WidgetContentService } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service';
import { viewerRouteGenerator } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/viewer-route-util';
import { CourseDownloadCompletionModalComponent } from '../course-download-completion-modal/course-download-completion-modal.component';
import { ContentCorodovaService } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service';
import {Events} from '../../../../../../../../../util/events';
import { UserWhatsappModalComponent } from '../user-whatsapp-modal/user-whatsapp-modal.component';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { AppFrameworkDetectorService } from '../../../../../../../../../app/modules/core/services/app-framework-detector-service.service';
@Component({
  selector: 'ws-app-app-toc-desktop',
  templateUrl: './app-toc-desktop.component.html',
  styleUrls: ['./app-toc-desktop.component.scss'],
  providers: [AccessControlService],
})
export class AppTocDesktopComponent implements OnInit, OnChanges, OnDestroy {
  @Input() banners: NsAppToc.ITocBanner | null = null
  @Input() content: NsContent.IContent | null = null
  @Input() resumeData: NsContent.IContinueLearningData | null = null
  @Input() analytics: NsAnalytics.IAnalytics | null = null
  @Input() forPreview = false
  @Input() batchData!: any
  @Input() resumeResource: NsContent.IContinueLearningData | null = null
  @Input() ashaData?: any;
  @Input() navigateAshaHome?: boolean;


  batchControl = new UntypedFormControl('', Validators.required)
  contentTypes = NsContent.EContentTypes
  isTocBanner = true
  issueCertificate = false
  // contentProgress = 0
  bannerUrl: SafeStyle | null = null
  routePath = 'overview'
  validPaths = new Set(['overview', 'contents', 'analytics'])
  routerParamSubscription: Subscription | null = null
  routeSubscription: Subscription | null = null
  firstResourceLink: { url: string; queryParams: { [key: string]: any } } | null = null
  resumeDataLink: { url: string; queryParams: { [key: string]: any } } | null = null
  isAssessVisible = false
  isPracticeVisible = false
  editButton = false
  reviewButton = false
  analyticsDataClient: any = null
  btnPlaylistConfig: NsPlaylist.IBtnPlaylist | null = null
  btnGoalsConfig: NsGoal.IBtnGoal | null = null
  isRegistrationSupported = false
  checkRegistrationSources: Set<string> = new Set([
    'SkillSoft Digitalization',
    'SkillSoft Leadership',
    'Pluralsight',
  ])
  isUserRegistered = false
  actionBtnStatus = 'wait'
  showIntranetMessage = false
  showTakeAssessment: NsAppToc.IPostAssessment | null = null
  externalContentFetchStatus: TFetchStatus = 'done'
  registerForExternal = false
  isGoalsEnabled = false
  contextId?: string
  contextPath?: string
  tocConfig: any = null
  cohortResults: {
    [key: string]: { hasError: boolean; contents: NsCohorts.ICohortsContent[], count: Number }
  } = {}
  identifier: any
  cohortTypesEnum = NsCohorts.ECohortTypes
  // learnersCount:Number
  defaultSLogo = ''
  disableEnrollBtn = false
  batchId!: string
  displayStyle = 'none'
  enrolledCourse: any
  lastCourseID: any
  certificateMsg?: any
  contentDetail?: Content;
  isCourseDownloading: boolean = false;
  courseDownloadingStatusPer: any = 30;
  downloadSize = 0;
  downloadIdentifiers = new Set();
  downloadIdentifiersObj: any = [];
  public rollUpMap: { [key: string]: Rollup } = {};
  trackDownloads$: Observable<DownloadTracking>;
  private eventSubscription: Subscription;
  courseDownloaded: boolean = false;
  faultyIdentifiers: Array<any> = [];
  averageRating: any = ''
  totalRatings: any = ''
  stars: number[] = [1, 2, 3, 4, 5];
  isTablet = false;
  appFramework: string;
  constructor(
    @Inject('STORAGE_SERVICE') private storageService: StorageService,
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    @Inject('COURSE_SERVICE') private courseService: CourseService,
    @Inject('DOWNLOAD_SERVICE') private downloadService: DownloadService,
    @Inject('EVENTS_BUS_SERVICE') private eventBusService: EventsBusService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private tocSvc: AppTocService,
    private configSvc: ConfigurationsService,
    private contentSvc: WidgetContentService,
    private utilitySvc: UtilityService,
    private mobileAppsSvc: MobileAppsService,
    private snackBar: MatSnackBar,
    public createBatchDialog: MatDialog,
    private iab: InAppBrowser,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private commonUtilService: CommonUtilService,
    private localStorageService: LocalStorageService,
    private viewSvc: ViewerUtilService,
    public quizService: QuizService,
    private contentRatingSvc : ContentCorodovaService,
    // private authAccessService: AccessControlService,
    @Inject(DOCUMENT) public document: Document,
    private zone: NgZone,
    private translate: TranslateService,
    private androidPermissions: AndroidPermissions,
    private device: Device,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private event: Events
  ) {
  }
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    window.location.href = '/page/home'
    // console.log('this.content', this.content)
  }

  async ngOnInit() {
    this.isTablet = await this.commonUtilService.isTablet();
    this.enrollApi();
    this.route.data.subscribe(data => {
      this.tocConfig = tocData
      if (this.content && this.isPostAssessment) {
        this.tocSvc.fetchPostAssessmentStatus(this.content.identifier).subscribe(res => {
          const assessmentData = res.result
          for (const o of assessmentData) {
            if (o.contentId === (this.content && this.content.identifier)) {
              this.showTakeAssessment = o
              break
            }
          }
        })
      }
    })
    this.getCourseID()
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig && instanceConfig.logos && instanceConfig.logos.defaultSourceLogo) {
      this.defaultSLogo = instanceConfig.logos.defaultSourceLogo
    }

    if (this.configSvc.restrictedFeatures) {
      this.isGoalsEnabled = !this.configSvc.restrictedFeatures.has('goals')
    }
    this.routeSubscription = this.route.queryParamMap.subscribe(qParamsMap => {
      const contextId = qParamsMap.get('contextId')
      const contextPath = qParamsMap.get('contextPath')
      if (contextId && contextPath) {
        this.contextId = contextId
        this.contextPath = contextPath
      }
    })
    if (this.configSvc.restrictedFeatures) {
      this.isRegistrationSupported = this.configSvc.restrictedFeatures.has('registrationExternal')
      this.showIntranetMessage = !this.configSvc.restrictedFeatures.has(
        'showIntranetMessageDesktop',
      )
    }

    this.checkRegistrationStatus()
    this.routerParamSubscription = this.router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationEnd) {
        this.assignPathAndUpdateBanner(routerEvent.url)
      }
    })

    if (this.configSvc.restrictedFeatures) {
      this.isGoalsEnabled = !this.configSvc.restrictedFeatures.has('goals')
    }

    if (this.content) {
      this.btnPlaylistConfig = {
        contentId: this.content.identifier,
        contentName: this.content.name,
        contentType: this.content.contentType,
        mode: 'dialog',
      }
      this.btnGoalsConfig = {
        contentId: this.content.identifier,
        contentName: this.content.name,
        contentType: this.content.contentType,
      }

      this.readCourseRatingSummary();
    }
    this.trackDownloads$ = this.downloadService.trackDownloads({ groupBy: { fieldPath: 'rollUp.l1', value: this.content?.identifier } }).pipe();
    this.subscribeSdkEvent();
   // this.generateImpressionEvent();
    this.courseDownloaded = await this.isCourseDownloaded(this.content?.identifier)
    this.getAverageRating();
    this.event.subscribe('refreshCourseRating', () => {
      this.readCourseRatingSummary();
    })
  }

  // ngAfterViewInit() {
  //   console.log("after view Init")
  //   if (this.content) {
  //     const req = {
  //       "userid": this.configSvc.userProfile.userId || '',
  //       "courseid": this.ashaData.params.courseid,
  //       "batchid": this.ashaData.params.batchId,
  //       "contentid": this.content.identifier,
  //       "competencylevel": this.ashaData.params.levelId,
  //       "completionpercentage": this.content.completionPercentage || _.get(this.content, 'completionPercentage'),
  //       "progress": "course"
  //     };

  //     console.log('req  toc', req);

  //     this.quizService.updateAshaAssessment(req).subscribe(
  //       (res) => {
  //         console.log("tocres", res);
  //       },
  //       (err) => {
  //         console.log("toc err", err);
  //       }
  //     );
  //   }
  // }

  async setConfirmDialogStatus(percentage: any) {
    this.contentSvc.showConformation = percentage;
    const type = (percentage !== 100) ? 'RESUME' : 'START'
    this.generateStartTelemetry(type, this.content.identifier);
    await this.detectFramework()
    if (
      this.content.issueCertification === true &&
      this.configSvc.userProfile &&
-     this.configSvc.userProfile?.phone?.trim() && this.appFramework ==='Sphere'
    ) {
      this.openUserWhatsAppOptInModal();
    }
    
  }
  get showIntranetMsg() {
    if (this.isMobile) {
      return true
    }
    return this.showIntranetMessage
  }

  get showStart() {
    return this.tocSvc.showStartButton(this.content)
  }

  get isPostAssessment(): boolean {
    if (!(this.tocConfig)) {
      return false
    }
    if (this.content) {
      return (
        this.content.contentType === NsContent.EContentTypes.COURSE &&
        this.content.learningMode === 'Instructor-Led'
      )
    }
    return false
  }

  get isMobile(): boolean {
    return this.utilitySvc.isMobile
  }

  get showSubtitleOnBanner() {
    return this.tocSvc.subtitleOnBanners
  }
  openDownloadCompletionModal(identifier?: string): void {
    const dialogRef = this.dialog.open(CourseDownloadCompletionModalComponent, {
      width: '542px',
      panelClass: 'course-download-completion-modal',
      disableClose: true,
      data: {
        message: 'Course download is complete!',
        identifier
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if(res.event =='YES'){
        this.router.navigate([`app/download-course`])
      }
    });
  }

  async detectFramework () {
    try {
      this.appFramework =  await this.appFrameworkDetectorService.detectAppFramework();
    }
    catch (error) {
      // console.log('error while getting packagename')
    }

  }
  // Modal opening function with RxJS
  openUserWhatsAppOptInModal(): void {
    console.log('issueCertificate', this.issueCertificate);
    
    this.tocSvc.getUserWhatsAppContent().pipe(
      catchError(error => {
        console.error('Error fetching WhatsApp consent:', error);
        if (error.status === 404) {
          // If no record exists, assume the user has not opted in
          return of({ is_opted_in: false,found: false });
        }
        return throwError(() => error);
      }),
      tap((userData: any) => {
        console.log('WhatsApp Opt-In Status Response:', userData);
      }),
      filter((userData: any) => userData.hasOwnProperty('found') && userData.found === false), // Only proceed if user has not opted in
      switchMap(() => {
        const dialogRef = this.dialog.open(UserWhatsappModalComponent, {
          width: '542px',
          panelClass: 'user-whatsup-optin-modal',
          disableClose: true,
          data: {
            maskedPhoneNumber: this.configSvc.userProfile.phone,
          }
        });
        return dialogRef.afterClosed();
      }),
      // Check if result exists before proceeding
      filter((result: any) => result !== undefined && result !== null),
      // Now check for is_opted_in property safely
      filter((result: any) => result.hasOwnProperty('is_opted_in')),
      switchMap((result: any) => {
        console.log('User choice:', result.is_opted_in ? 'Opted In' : 'Opted Out');
        const req = {
          is_opted_in: result.is_opted_in,
          opt_in_channel: this.appFramework
        };
        
        return this.tocSvc.updateUserWhatsAppOptInStatus(req).pipe(
          tap(() => {
            console.log('API called with:', result.is_opted_in);
          }),
          catchError(error => {
            console.error('Error updating WhatsApp opt-in status:', error);
            return throwError(() => error);
          })
        );
      }),
      catchError(error => {
        console.error('Error in WhatsApp opt-in process:', error);
        return EMPTY;
      })
    ).subscribe();
  }
  
  async downloadContent(identifiers, size) {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      const networkType = (await Network.getStatus().then()).connectionType;
      this.generateInteractTelemetry('download', identifiers);
      if (networkType === 'wifi') {
        await this.startDownload(size);
      }else if (networkType === 'cellular') {
        const dialogRef = this.dialog.open(OfflineConfirmModalComponent, {
          width: '542px',
          panelClass: 'offline-close-modal',
          disableClose: true,
          data: {
            data: 'CONGRATULATIONS_COMPLETED_COURSE',
            size: size || 0,
            identifiers
          }
        });
        dialogRef.afterClosed().subscribe(async (res: any) => {
          if (res) {
            await this.startDownload(size);
          }
        });
      }
     
    } else {
      console.log('Check your network');
    }
  }
  async startDownload(size) {
    await this.beforeDownloadEnrollUser();
    this.isCourseDownloading = true;
    this.courseDownloadingStatusPer = 0;
    this.dialog.closeAll();
    await this.getContentsSize(this.content.children);
    const permissionsToCheck = [
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
    ];
    const hasAllPermissions = await this.checkPermissions(permissionsToCheck);
    if (hasAllPermissions) {
      await this.downloadContentDetails();
    } else {
      this.requestPermissions();
    }
  }

  async checkPermissions(permissions) {
    const permissionStatus = await Promise.all(
      permissions.map(async permission => {
        const status = await this.androidPermissions.checkPermission(permission);
        return status.hasPermission;
      })
    );
    return permissionStatus.every(permissionGranted => permissionGranted);
  }

  async downloadContentDetails() {
    try {
      const data: any = await this.contentService.getContentDetails({ contentId: this.content?.identifier }).toPromise();
      console.log('getContentDetails ap-to-desktop data', data);
      if (data && data.sizeOnDevice === 0 && !data.isAvailableLocally) {
        await this.importContent([this.content?.identifier], false);
      }
    } catch (error) {
      await this.importContent([this.content?.identifier], false);
      console.log('getContentDetails ap-to-desktop error', error);
    }
    this.importContent(Array.from(this.downloadIdentifiers), true);
  }

  requestPermissions() {
    const androidVersion = parseInt(this.device.version, 10);
    const permissionsAndroid13Plus = [
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
    ];
    const permissionsBelowAndroid13 = [
      this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
    ];
    const permissions = androidVersion >= 13 ? permissionsAndroid13Plus : permissionsBelowAndroid13;
    this.androidPermissions.requestPermissions(permissions).then(
      async (result) => {
        console.log('Permissions granted:', result.hasPermission);
        if (result.hasPermission) {
          await this.downloadContentDetails();
        }
      },
      err => {
        console.error('Permissions denied:', err);
      }
    );
  }

  async beforeDownloadEnrollUser() {
    if (!this.batchData?.enrolled) {
      let userId = ''
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req = {
        request: {
          userId,
          courseId: this.batchData.content[0].courseId,
          batchId: this.batchData.content[0].batchId,
        },
      }
      this.contentSvc.enrollUserToBatch(req).subscribe((data: any) => {
        if (data && data.result && data.result.response === 'SUCCESS') {
          this.contentSvc._updateEnrollValue.next(true)
        }
      });
    }
  }
  cancelDownloadContent(identifiers, size) {
    console.log('Cross click emitted with cancel:');
    this.contentService.cancelImport(identifiers)
    this.isCourseDownloading = false;
    this.courseDownloadingStatusPer = 0;
    this.downloadService.cancelAll()
  }

  onCrossClicked(eventData: { cancel: boolean }) {
    if (eventData.cancel) {
      console.log('Cross click emitted with cancel:', eventData.cancel);
      this.downloadService.cancelAll()
    }
  }

  // resumeBtn() {
  //   if(localStorage.getItem(`resume_URL`)){
  //     this.resumeDataLink.url = localStorage.getItem(`resume_URL`)
  //       // console.log(resume_URL)
  //       //location.href = resume_URL
  //       //this.router.navigateByUrl(`${resume_URL}`)
  //   } else {
  //     // console.log(this.lastCourseID)
  //     this.resumeDataLink = viewerRouteGenerator(
  //       this.lastCourseID.content.identifier,
  //       this.lastCourseID.content.mimeType,
  //       this.isResource ? undefined : this.lastCourseID.content.identifier,
  //       this.isResource ? undefined : this.lastCourseID.content.contentType,
  //       this.forPreview,
  //       'Learning Resource',
  //       this.getBatchId(),
  //     )
  //     // console.log(this.resumeDataLink)
  //      const query = this.generateQuery('RESUME')
  //      // console.log(query)
  //      // console.log(this.resumeDataLink)
  // tslint:disable-next-line:max-line-length
  //     let url = this.resumeDataLink.url+'?primaryCategory='+query.primaryCategory+'&collectionId='+query.collectionId+'&collectionType='+query.collectionType+'&batchId='+query.batchId

  //   }
  // }

  ngOnChanges() {
    this.assignPathAndUpdateBanner(this.router.url)
    if (this.content) {
      // this.content.status = 'Deleted'
      this.fetchExternalContentAccess()
      //this.modifySensibleContentRating()
      this.getAverageRating()
      this.assignPathAndUpdateBanner(this.router.url)
      this.getLearningUrls()
    }
    if (this.resumeData && this.content) {
      if (this.resumeResource.length || (Array.isArray(this.resumeData) && this.resumeData.length)) {
      const resumeDataV2 = this.getResumeDataFromList()
      this.resumeDataLink = viewerRouteGenerator(
        resumeDataV2.identifier,
        resumeDataV2.mimeType,
        this.isResource ? undefined : this.content.identifier, 
        this.isResource ? undefined : this.content.contentType,
        this.forPreview,
        // this.content.primaryCategory
        'Learning Resource',
        this.getBatchId()
      )
     }
    }
    this.batchControl.valueChanges.subscribe((batch: NsContent.IBatch) => {
      this.disableEnrollBtn = true
      let userId = ''
      if (batch) {
        if (this.configSvc.userProfile) {
          userId = this.configSvc.userProfile.userId || ''
        }
        const req = {
          request: {
            userId,
            courseId: batch.courseId,
            batchId: batch.batchId,
          },
        }
        this.contentSvc.enrollUserToBatch(req).subscribe((data: any) => {
          if (data && data.result && data.result.response === 'SUCCESS') {
            this.batchData = {
              content: [batch],
              enrolled: true,
            }
            this.router.navigate(
              [],
              {
                relativeTo: this.route,
                queryParams: { batchId: batch.batchId },
                queryParamsHandling: 'merge',
              })
            this.openSnackbar(this.translate.instant('USER_SUCCESSFULLY_CREATED'))
            this.disableEnrollBtn = false
          } else {
            this.openSnackbar(this.translate.instant('SOMETHING_WENT_WRONG_TRY_LATER'));
            this.disableEnrollBtn = false
          }
        })
      }
    })
  }
  private getBatchId(): string {
    let batchId = ''
    if (this.batchData && this.batchData.content) {
      for (const batch of this.batchData.content) {
        batchId = batch.batchId
      }
    }
    return batchId
  }

  public handleEnrollmentEndDate(batch: any) {
    const enrollmentEndDate = dayjs(lodash.get(batch, 'enrollmentEndDate')).format('YYYY-MM-DD')
    const systemDate = dayjs()
    return enrollmentEndDate ? dayjs(enrollmentEndDate).isBefore(systemDate) : false
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  downloadCertificate(content: any) {
    // is enrolled?
    if (this.batchData.enrolled) {
      let userId = ''
      let duration: number
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      this.generateInteractTelemetry('download-certificate', content.identifier)
      if (localStorage.getItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`)) {

        const customerDate = moment(localStorage.getItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`))
        const dateNow = moment(new Date())
        duration = dateNow.diff(customerDate, 'minutes')
      }

      if (this.content && this.content.identifier && content.completionPercentage === 100) {
        const req = {
          request: {
            courseId: this.content.identifier,
            batchId: this.getBatchId(),
            userIds: [userId],
          },
        }
        // if course is complete

        // check if certificate is already generated
        this.contentSvc.fetchUserBatchList(userId).subscribe(
          (courses: NsContent.ICourse[]) => {
            // let enrolledCourse: NsContent.ICourse | undefined
            if (this.content && this.content.identifier && !this.forPreview) {

              if (courses && courses.length) {
                this.enrolledCourse = courses.find(course => {
                  const identifier = this.content && this.content.identifier || ''
                  if (course.courseId !== identifier) {
                    return undefined
                  }
                  return course
                })
                if (this.enrolledCourse && this.enrolledCourse.issuedCertificates.length > 0) {
                  this.displayStyle = 'block'
                  // tslint:disable-next-line: max-line-length
                  this.certificateMsg = 'Our certificate download will begin shortly. If it does not start after 3 minutes, please allow popups in the browser and try again or write to support@aastrika.org'
                  this.sendApi()
                  // trigger this.downloadCertificate

                } else {
                  // trigger request
                  // check for exisitng request
                  if (localStorage.getItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`) && duration <= 30) {
                    this.displayStyle = 'block'
                    // tslint:disable-next-line: max-line-length
                    this.certificateMsg = `You have already requested a certificate. Please check after ${30 - duration} minutes!`
                  } else {
                    this.contentSvc.processCertificate(req).subscribe((response: any) => {
                      if (response.responseCode === 'OK') {
                        // this.sendApi()
                        // tslint:disable-next-line: max-line-length
                        localStorage.setItem(`certificate_downloaded_${this.content ? this.content.identifier : ''}`, moment(new Date()).toString())
                        this.displayStyle = 'block'
                        // tslint:disable-next-line: max-line-length
                        this.certificateMsg = `Your request for certificate has been successfully processed. Please download it after 30 minutes.`
                      } else {
                        this.displayStyle = 'block'
                        this.certificateMsg = 'Unable to request certificate at this moment. Please try later!'
                      }
                    },
                      err => {
                        this.displayStyle = 'block'
                        /* tslint:disable-next-line */
                        // console.log(err.error.params.errmsg)
                        // this.openSnackbar(err.error.params.errmsg)
                        this.certificateMsg = `Your request for certificate has been successfully processed. Please download it after 30 minutes.`
                      });
                  }
                }

              }
            }
          })

      } else {
        // tslint:disable-next-line:max-line-length
        this.certificateMsg = 'You have not finished all modules of the course. It is mandatory to complete all modules before you can request a certificate'
        this.displayStyle = 'block'
      }
    } else {
      // tslint:disable-next-line: max-line-length
      this.certificateMsg = 'Please enroll by clicking the Start button, finish all modules and then request for the certificate'
      this.displayStyle = 'block'
    }

  }

  enrollApi() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        // let enrolledCourse: NsContent.ICourse | undefined
        if (this.content && this.content.identifier && !this.forPreview) {
          // tslint:disable-next-line:no-this-assignment
          if (courses && courses.length) {
            this.enrolledCourse = courses.find(course => {
              const identifier = this.content && this.content.identifier || ''
              if (course.courseId !== identifier) {
                return undefined
              }
              return course
            })
            if (this.enrolledCourse && this.enrolledCourse.issuedCertificates.length > 0) {
              this.issueCertificate = true
            }
            if (this.enrolledCourse) {
              this.resumeData = this.enrolledCourse.lastReadContentId
            }
          }
        }
      })
  }

  sendApi() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        // let enrolledCourse: NsContent.ICourse | undefined
        if (this.content && this.content.identifier && !this.forPreview) {
          // tslint:disable-next-line:no-this-assignment
          const self = this
          if (courses && courses.length) {
            this.enrolledCourse = courses.find(course => {
              const identifier = this.content && this.content.identifier || ''
              if (course.courseId !== identifier) {
                return undefined
              }
              return course
            })
            if (this.enrolledCourse && this.enrolledCourse.issuedCertificates.length > 0) {
              const certID = this.enrolledCourse.issuedCertificates[0].identifier || '';
              const url = `https://${buildConfig.SITEPATH}/apis/public/v8/appCertificateDownload/download?certificateId=${certID}&access_key=key`;
              const target = '_system';
              const options = 'location=yes';
              this.iab.create(url, target, options);
            } else {
              this.displayStyle = 'block'
            }
          }
        }
      })
  }

  closePopup() {
    this.generateInteractTelemetry('close-popup', this.content.identifier);
    this.displayStyle = 'none';
  }

  getCourseID() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    this.contentSvc.fetchUserBatchList(userId).subscribe(
      (courses: NsContent.ICourse[]) => {
        if (this.content && this.content.identifier && !this.forPreview) {
          if (courses && courses.length) {
            this.lastCourseID = courses.find(course => {
              const identifier = this.content && this.content.identifier || ''
              if (course.courseId !== identifier) {
                return undefined
              }
              return course
            })
          }
        }
      })
  }

  get showInstructorLedMsg() {
    return (
      this.showActionButtons &&
      this.content &&
      this.content.learningMode === 'Instructor-Led' &&
      !this.content.children.length &&
      !this.content.artifactUrl
    )
  }

  get isHeaderHidden() {
    return this.isResource && this.content && !this.content.artifactUrl.length
  }

  // get showStart() {
  //   return this.content && this.content.resourceType !== 'Certification'
  // }

  get showActionButtons() {
    return (
      this.actionBtnStatus !== 'wait' &&
      this.content &&
      this.content.status !== 'Deleted' &&
      this.content.status !== 'Expired'
    )
  }

  get showButtonContainer() {
    return (
      this.actionBtnStatus === 'grant' &&
      !(this.isMobile && this.content && this.content.isInIntranet) &&
      !(
        this.content &&
        this.content.contentType === 'Course' &&
        this.content.children.length === 0 &&
        !this.content.artifactUrl
      ) &&
      !(this.content && this.content.contentType === 'Resource' && !this.content.artifactUrl)
    )
  }

  get isResource() {
    if (this.content) {
      const isResource = this.content.contentType === NsContent.EContentTypes.KNOWLEDGE_ARTIFACT ||
        this.content.contentType === NsContent.EContentTypes.RESOURCE || !this.content.children.length
      if (isResource) {
        this.mobileAppsSvc.sendViewerData(this.content)
      }
      return isResource
    }
    return false
  }

  showOrgprofile(orgId: string) {
    this.router.navigate(['/app/org-details'], { queryParams: { orgId } })
  }

  async ngOnDestroy() {
    this.tocSvc.analyticsFetchStatus = 'none'
    if (this.routerParamSubscription) {
      this.routerParamSubscription.unsubscribe()
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    this.contentSvc._updateEnrollValue.next(undefined);
    this.event.unsubscribe('refreshCourseRating');
  }
  private getResumeDataFromList() {
    this.resumeResource = (this.resumeResource && this.resumeResource.length) ? this.resumeResource : this.resumeData;
    const lastItem = this.resumeResource && this.resumeResource.pop()
    return {
      identifier: lastItem ? lastItem.contentId : '',
      mimeType: lastItem ? lastItem.progressdetails && lastItem.progressdetails.mimeType : '',

    }
  }

  private modifySensibleContentRating() {
    if (
      this.content &&
      this.content.averageRating &&
      typeof this.content.averageRating !== 'number'
    ) {
      this.content.averageRating = (this.content.averageRating as any)[this.configSvc.rootOrg || '']
    }
    if (this.content && this.content.totalRating && typeof this.content.totalRating !== 'number') {
      this.content.totalRating = (this.content.totalRating as any)[this.configSvc.rootOrg || '']
    }
  }

  getAverageRating(){
    this.contentRatingSvc.getSearchResultsByIds([this.content.identifier]).subscribe((res)=>{
      console.log("current course", res.result.content[0], res.result.content[0].averageRating)
     
        this.averageRating = res.result.content[0].averageRating;
       
        this.totalRatings = res.result.content[0].totalNumberOfRatings
      
    })

    // console.log("rating", this.averageRating)
  }
  private getLearningUrls() {
    if (this.content) {
      // if (!this.forPreview) {
      //   this.progressSvc.getProgressFor(this.content.identifier).subscribe(data => {
      //     this.contentProgress = data
      //   })
      // }
      // this.progressSvc.fetchProgressHashContentsId({
      //   "contentIds": [
      //     "lex_29959473947367270000",
      //     "lex_5501638797018560000"
      //   ]
      // }
      // ).subscribe(data => {
      //   // console.log("DATA: ", data)
      // })
      this.isPracticeVisible = Boolean(
        this.tocSvc.filterToc(this.content, NsContent.EFilterCategory.PRACTICE),
      )
      this.isAssessVisible = Boolean(
        this.tocSvc.filterToc(this.content, NsContent.EFilterCategory.ASSESS),
      )
      const firstPlayableContent = this.contentSvc.getFirstChildInHierarchy(this.content)
      this.firstResourceLink = viewerRouteGenerator(
        firstPlayableContent.identifier,
        firstPlayableContent.mimeType,
        this.isResource ? undefined : this.content.identifier,
        this.isResource ? undefined : this.content.contentType,
        this.forPreview,
        this.content.primaryCategory,
        this.getBatchId(),
      )
    }
  }
  private assignPathAndUpdateBanner(url: string) {
    const path = url.split('/').pop()
    if (path && this.validPaths.has(path)) {
      this.routePath = path
      this.updateBannerUrl()
    }
  }
  private updateBannerUrl() {
    if (this.banners) {
      this.bannerUrl = this.sanitizer.bypassSecurityTrustStyle(
        `url(${this.banners[this.routePath]})`,
      )
    }
  }
  playIntroVideo() {
    if (this.content) {
      this.dialog.open(AppTocDialogIntroVideoComponent, {
        data: this.content.introductoryVideo,
        height: '350px',
        width: '620px',
      })
    }
  }
  get sanitizedIntroductoryVideoIcon() {
    if (this.content && this.content.introductoryVideoIcon) {
      return this.sanitizer.bypassSecurityTrustStyle(`url(${this.content.introductoryVideoIcon})`)
    }
    return null
  }
  private fetchExternalContentAccess() {
    if (this.content && this.content.registrationUrl) {
      if (!this.forPreview) {
        this.externalContentFetchStatus = 'fetching'
        this.registerForExternal = false
        this.tocSvc.fetchExternalContentAccess(this.content.identifier).subscribe(
          data => {
            this.externalContentFetchStatus = 'done'
            this.registerForExternal = data.hasAccess
          },
          _ => {
            this.externalContentFetchStatus = 'done'
            this.registerForExternal = false
          },
        )
      } else {
        this.externalContentFetchStatus = 'done'
        this.registerForExternal = true
      }
    }
  }
  getRatingIcon(ratingIndex: number): 'star' | 'star_border' | 'star_half' {
    if (this.content && this.content.averageRating) {
      const avgRating = this.content.averageRating
      const ratingFloor = Math.floor(avgRating)
      if (ratingIndex <= ratingFloor) {
        return 'star'
      }
      if (ratingFloor === ratingIndex - 1 && avgRating % 1 > 0) {
        return 'star_half'
      }
    }
    return 'star_border'
  }

  private checkRegistrationStatus() {
    const source = (this.content && this.content.sourceShortName) || ''
    if (
      !this.forPreview &&
      !this.isRegistrationSupported &&
      this.checkRegistrationSources.has(source)
    ) {
      this.contentSvc
        .getRegistrationStatus(source)
        .then(res => {
          if (res.hasAccess) {
            this.actionBtnStatus = 'grant'
          } else {
            this.actionBtnStatus = 'reject'
            if (res.registrationUrl && this.content) {
              this.content.registrationUrl = res.registrationUrl
            }
          }
        })
        .catch(_err => { })
    } else {
      this.actionBtnStatus = 'grant'
    }
  }

  generateQuery(type: 'RESUME' | 'START_OVER' | 'START'): { [key: string]: string } {
    console.log("resume clicked  ", type, this.firstResourceLink);
    
    if (this.firstResourceLink && (type === 'START' || type === 'START_OVER')) {
      let qParams: { [key: string]: string } = {
        ...this.firstResourceLink.queryParams,
        viewMode: type,
        batchId: this.getBatchId(),
      }
      if (this.contextId && this.contextPath) {
        qParams = {
          ...qParams,
          collectionId: this.contextId,
          collectionType: this.contextPath,
        }
      }
      if (this.forPreview) {
        delete qParams.viewMode
      }
      return qParams
    }
    if (this.resumeDataLink && type === 'RESUME') {
      let qParams: { [key: string]: string } = {
        ...this.resumeDataLink.queryParams,
        batchId: this.getBatchId(),
        viewMode: 'RESUME',
      }
      if (this.contextId && this.contextPath) {
        qParams = {
          ...qParams,
          collectionId: this.contextId,
          collectionType: this.contextPath,
        }
      }
      if (this.forPreview) {
        delete qParams.viewMode
      }
      return qParams
    }
    if (this.forPreview) {
      return {}
    }
    return {
      batchId: this.getBatchId(),
      viewMode: type,
    }
  }

  get isInIFrame(): boolean {
    try {
      return window.self !== window.top
    } catch (e) {
      return true
    }
  }


  async enrollUser(batchData: any) {
    await this.detectFramework()
    if(this.content.issueCertification === true &&
      this.configSvc.userProfile &&
      this.configSvc.userProfile?.phone?.trim() && this.appFramework ==='Sphere'){
      this.openUserWhatsAppOptInModal()
    }
    
    let userId = ''
    if (batchData) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req = {
        request: {
          userId,
          courseId: batchData[0].courseId,
          batchId: batchData[0].batchId,
        },
      }
      this.contentSvc.enrollUserToBatch(req).subscribe((data: any) => {

        if (data && data.result && data.result.response === 'SUCCESS') {
          // this.batchData = {
          //   content: [data],
          //   enrolled: true,
          // }
          this.contentSvc.showConformation = 0
          this.router.navigate(
            [],
            {
              relativeTo: this.route,
              queryParams: { batchId: batchData[0].batchId },
              queryParamsHandling: 'merge',
            })
          this.openSnackbar(this.translate.instant('ENROLLED_SUCCESSFULLY'))
          this.disableEnrollBtn = false
          this.contentSvc._updateEnrollValue.next(true)
          this.contentSvc.callNavigateBatchId = false
          setTimeout(() => {
            console.log("resumeData ", this.resumeData, this.resumeDataLink);
            
            if (this.resumeData && this.resumeDataLink) {
              const query = this.generateQuery('RESUME')
              this.router.navigate([this.resumeDataLink.url], { queryParams: query })
            } else if (this.firstResourceLink) {
              const query = this.generateQuery('START')
              this.router.navigate([this.firstResourceLink.url], { queryParams: query })
            }
          }, 500)

        } else {
          this.openSnackbar(this.translate.instant('SOMETHING_WENT_WRONG_TRY_LATER'))
          this.disableEnrollBtn = false
        }
      }, (err) => {
        this.generateErrorTelemetry(err, 'enrolled-failed')
      })
    }

  }
  openDialog(content: any): void {
    // const dialogRef = this.createBatchDialog.open(CreateBatchDialogComponent, {
    this.createBatchDialog.open(CreateBatchDialogComponent, {
      // height: '400px',
      width: '600px',
      data: { content },
    })
    // dialogRef.componentInstance.xyz = this.configSvc
    // dialogRef.afterClosed().subscribe((_result: any) => {
    //   if (!this.batchId) {
    //     this.tocSvc.updateBatchData()
    //   }
    // })
  }

  openDetails(content: any, tocConfig: any) {
    this.generateInteractTelemetry('DETAILS', content?.identifier)
    this.dialog.open(AppTocDesktopModalComponent, {
      width: '600px',
      data: { content, tocConfig, type: 'DETAILS' },
      disableClose: true
    })
  }

  generateInteractTelemetry(event, identifier: string) {
    const value = new Map();
    value['identifier'] = identifier;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      event === 'DETAILS' ? InteractSubtype.COURSE_DETAILS_CLICKED : `${event}-clicked`,
      Environment.COURSE,
      PageId.COURSE_TOC,
      undefined,
      value
    )
  }
  openCompetency(content: any) {
    this.dialog.open(AppTocDesktopModalComponent, {
      width: '600px',
      data: { competency: content.competencies_v1, type: 'COMPETENCY' },
    })
  }
  /**
  * Function to get import content api request params
  *
  * @param identifiers contains list of content identifier(s)
  */
  getImportContentRequestBody(identifiers: Array<string>, isChild: boolean): Array<ContentImport> {
    const requestParams = [];
    const folderPath = this.storageService.getStorageDestinationDirectoryPath();
    // const folderPath = cordova.file.dataDirectory;

    console.log('folderPath-', folderPath);
    identifiers.forEach((value, index) => {
      requestParams.push({
        isChildContent: isChild,
        destinationFolder: folderPath,
        contentId: value,
        correlationData: [],
        rollUp: undefined
      });
    });

    return requestParams;
  }

  /**
   * Function to get import content api request params
   *
   * @param identifiers contains list of content identifier(s)
   */
  async importContent(identifiers, isChild: boolean) {
    this.downloadIdentifiersObj = [];
    this.faultyIdentifiers = []
    const contentImportRequest: ContentImportRequest = {
      contentImportArray: this.getImportContentRequestBody(identifiers, isChild),
      contentStatusArray: ['Live'],
      fields: ['appIcon', 'name', 'subject', 'size', 'gradeLevel']
    };
    console.log('contentImportRequest-', contentImportRequest);
    this.contentService.importContent(contentImportRequest).toPromise()
      .then((data: ContentImportResponse[]) => {

        console.log('download course data -', data)
        if (data && data[0].status === -1) {
          this.isCourseDownloading = false;
          // this.courseDownloadingStatusPer = 0;
        }
        if (isChild) {
          this.isCourseDownloading = true;
          data.map((_id) => {
            this.downloadIdentifiersObj.push({ id: _id.identifier, progress: 0 });
          })
          data.forEach((value) => {
            if (value.status === -1) {
              this.faultyIdentifiers.push(value.identifier);
            }
          })
        }
      })
      .catch((error) => {
        console.log('error while loading content details', error);
      });
  }

  async getContentsSize(data?) {
    console.log('getContentsSize-', data);
    if (data) {
      for (const value of data) {
        if (value.children) {
          await this.getContentsSize(value.children);
        }
        this.downloadIdentifiers.add(value.identifier);
      }
    }
    return Promise.resolve();
  }

  async syncProgress() {
    let userId = '';
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const loader = await this.commonUtilService.getLoader();
    this.generateLogEvent(InteractSubtype.SYNC_PROGRESS_INITIATE);
    let batchId = this.getBatchId();
    await loader.present();
    this.courseService.syncCourseProgress({
      courseId: this.identifier,
      userId: userId,
      batchId: batchId
    }).toPromise()
      .then(async () => {
        this.generateLogEvent(InteractSubtype.SYNC_PROGRESS_SUCCESS);
        await loader.dismiss();
        this.commonUtilService.showToast('FRMELEMNTS_MSG_SYNC_COURSE_PROGRESS_SUCCESS');
      }).catch(async (err) => {
        console.log('sync erro-', err)
        await loader.dismiss();
        this.generateLogEvent(InteractSubtype.SYNC_PROGRESS_FAILED);
        this.commonUtilService.showToast('ERROR_TECHNICAL_PROBLEM');
      });
  }

  private generateLogEvent(message: string) {
    this.telemetryGeneratorService.generateLogEvent(
      LogLevel.INFO,
      message,
      Environment.COURSE,
      'api_call',
      []
    );
  }

  subscribeSdkEvent() {
    this.eventSubscription = this.eventBusService.events().subscribe((event: EventsBusEvent) => {
      this.zone.run(async () => {
        if (event.type === DownloadEventType.PROGRESS) {
          const downloadEvent = event as DownloadProgress;

          // let temp = await Array.from(this.downloadIdentifiers);
          // let findIndex = temp.indexOf(downloadEvent.payload.identifier);
          // if (findIndex>-1) {
          //   this.downloadIdentifiersObj[findIndex].progress = downloadEvent.payload.progress;
          // }
          this.downloadIdentifiersObj.map((_row, _i) => {
            if (_row.id == downloadEvent.payload.identifier) {
              this.downloadIdentifiersObj[_i].progress = downloadEvent.payload.progress
            }
          })
          let doneDownload = this.downloadIdentifiersObj.filter((_res) => _res.progress == 100);
          const faultyarrayLength = this.faultyIdentifiers.length

          this.courseDownloadingStatusPer = Math.floor(((doneDownload.length + faultyarrayLength) / (this.downloadIdentifiersObj.length)) * 100);

          if (this.courseDownloadingStatusPer > 99) {
            this.isCourseDownloading = false;
            await this.saveDownloadCourseStatus(this.content.identifier)
            this.openDownloadCompletionModal(this.content.identifier)
          }
        }
      });
    });
  }
  public async saveDownloadCourseStatus(courseId) {

    try {
      const existingDownloadedCourseStatus = await this.localStorageService.getLocalStorage('DOWNLOAD_COURSE_STATUS') || [];
      if (existingDownloadedCourseStatus) {
        const existingCourseIndex = _.findIndex(existingDownloadedCourseStatus, { 'courseId': courseId });

        if (existingCourseIndex !== -1) {
          // Update existing status if the course ID is found
          _.set(existingDownloadedCourseStatus[existingCourseIndex], 'downloaded', true);
        } else {
          // Add a new status if the course ID is not found
          this.addNewStatusToDownloadedCourseStatus(courseId, existingDownloadedCourseStatus);
        }
      }
    } catch (error) {
      // Add a new status if the course ID is not found
      this.addNewStatusToDownloadedCourseStatus(courseId);
    }
  }

  private async addNewStatusToDownloadedCourseStatus(courseId, existingDownloadedCourseStatus?: any) {
    if (existingDownloadedCourseStatus) {
      existingDownloadedCourseStatus.push({ courseId, downloaded: true });
      await this.localStorageService.setLocalStorage('DOWNLOAD_COURSE_STATUS', existingDownloadedCourseStatus);
      this.courseDownloaded = await this.isCourseDownloaded(this.content.identifier);
    } else {
      let downloadedCourseStatus: any = [];
      downloadedCourseStatus.push({ courseId, downloaded: true });
      await this.localStorageService.setLocalStorage('DOWNLOAD_COURSE_STATUS', downloadedCourseStatus);
      this.courseDownloaded = await this.isCourseDownloaded(this.content.identifier);
      console.log('isCourseDownloaded', this.courseDownloaded);
    }

  }


  public async isCourseDownloaded(courseId) {
    try {
      const downloadedCourseStatus = await this.localStorageService.getLocalStorage('DOWNLOAD_COURSE_STATUS') || [];
      if (downloadedCourseStatus) {
        const courseStatus = _.find(downloadedCourseStatus, { 'courseId': courseId });
        return courseStatus ? courseStatus.downloaded === true : false;
      }
    } catch (error) {
      return false
    }

  }

  getStarImage(index: number): string {
    const fullStarUrl = '/assets/icons/toc_star.png'
    const halfStarUrl = '/assets/icons/Half_star1.svg'
    const emptyStarUrl = '/assets/icons/empty_star.png'

    const decimalPart = this.averageRating - Math.floor(this.averageRating) // Calculate the decimal part of the average rating

    if (index + 1 <= Math.floor(this.averageRating)) {
      return fullStarUrl // Full star
    } else if (decimalPart >= 0.1 && decimalPart <= 0.9 && index === Math.floor(this.averageRating)) {
      return halfStarUrl // Half star
    } else {
      return emptyStarUrl // Empty star
    }
  }

  readCourseRatingSummary() {
    if (this.content) {

      let req
      req = { activityId: this.content.identifier }
      this.viewSvc.readCourseRatingSummary(req).subscribe((data) => {
        if (data && data.result && data.result.message === 'Successful') {
          if (data.result.response) {
            let res = data.result.response
            this.averageRating = (res.sum_of_total_ratings / res.total_number_of_ratings).toFixed(1)
            this.totalRatings = res.total_number_of_ratings
          }
        } else {
          this.disableEnrollBtn = false
        }
      },
        (err: any) => {
          console.log("err", err)
        })
    }

  }

  openRating(data: any) {
    let userId = ''
    if (data) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      let req
      if (this.content) {
        req = {
          request: {
            userId: [userId],
            activityId: data,
            activityType: "Course",
          },
        }
      }
      // this.loader.changeLoad.next(true)

      this.viewSvc.readCourseRating(req).subscribe((res: any) => {
        if (res && res.params.status === 'success') {
          const courseData = {
            courseId: data,
            courseRating: res.result
          }
          // this.loader.changeLoad.next(false)

          const dialogRef = this.dialog.open(ConfirmmodalComponent, {
            id: 'confirmModal',
            width: '300px',
            height: 'auto',
            panelClass: 'overview-modal',
            data: { request: courseData },
            disableClose: false,
          })

          dialogRef.afterClosed().subscribe((data: { event: any, ratingsForm: UntypedFormGroup, rating: number }) => {
            if (data && data.event && data.event === "CONFIRMED")
              this.readCourseRatingSummary()
          })


        } else {
          // this.loader.changeLoad.next(false)

          this.openSnackbar(this.translate.instant('SOMETHING_WENT_WRONG_TRY_LATER'))
          this.disableEnrollBtn = false
        }
      }, (err: any) => {
        // this.loader.changeLoad.next(false)
        console.log("err", err)
        this.openSnackbar(this.translate.instant('SOMETHING_WENT_WRONG_TRY_LATER'))
      })
    }

  }

  generateStartTelemetry(type, identifier) {
    const value = new Map();
    value['identifier'] = identifier;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      type === 'RESUME' ? InteractSubtype.RESUME_CLICKED : InteractSubtype.START_CLICKED,
      Environment.COURSE,
      PageId.COURSE_DETAIL
    );
  }

    generateErrorTelemetry(error: any, status) {
        this.telemetryGeneratorService.generateErrorTelemetry(
           Environment.COURSE,
           status,
           ErrorType.SYSTEM,
           PageId.COURSE_DETAIL,
           JSON.stringify(error)
        )
    }
}
