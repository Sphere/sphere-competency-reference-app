import { Component, OnDestroy, OnInit, HostListener, ElementRef, ViewChild, Inject, NgZone, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { BehaviorSubject, Subject, Subscription } from 'rxjs'
import { takeUntil } from 'rxjs/operators';
import { NsAppToc } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { AccessControlService } from '@ws/author/src/public-api'
import { WidgetUserService } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-user.service'
import { AppTocOverviewComponent } from '../../routes/app-toc-overview/app-toc-overview.component'
import * as _ from 'lodash'
import * as moment from 'moment'
import tocData from '../../../../../../../../../assets/configurations/toc.json'
import { AppGlobalService, CommonUtilService, Environment, ImpressionType, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../../../../services'
import { Events } from '../../../../../../../../../util/events';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx'
import { LocalStorageService } from '../../../../../../../../../app/manage-learn/core'
import { AppFrameworkDetectorService } from '../../../../../../../../../app/modules/core/services/app-framework-detector-service.service'
import { ContentService, TelemetryObject } from '@project-sunbird/sunbird-sdk'
import { Network } from '@capacitor/network';
import { DataSyncService } from '../../../../../../../../../app/modules/shared/services/data-sync.service'
import { OnlineSqliteService } from '../../../../../../../../../app/modules/shared/services/online-sqlite.service'
import { CourseOptimisticUiService } from '../../../../../../../../../app/modules/shared/services/course-optimistic-ui.service'
import { TranslateService } from '@ngx-translate/core';
import { OfflineCourseOptimisticService } from '../../../../../../../../../app/modules/shared/services/offline-course-optimistic.service'
import { NsContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model';
import { NsPage } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model';
import { NsWidgetResolver } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model';
import { WidgetContentService } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service';
import { LoggerService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/logger.service';
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { MatSnackBar } from '@angular/material/snack-bar'
import { QuizService } from '../../../../../../../../../project/ws/viewer/src/lib/plugins/quiz/quiz.service'
import { ContentCorodovaService } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service';
export enum ErrorType {
  internalServer = 'internalServer'
  , serviceUnavailable = 'serviceUnavailable',
  somethingWrong = 'somethingWrong',
}
interface ProgressDetails {
  max_size: number;
  current: string[];
  mimeType: string;
}

interface CourseProgress {
  viewCount: null | number;
  progressdetails: ProgressDetails;
  status: number;
  id: number;
  courseId: string;
  contentId: string;
  userId: string;
  batchId: string;
  mimeType: string;
  completionPercentage: number;
  lastReadContentId: string;
}
interface EnrollmentData {
  courseId: string;
  contentId: string;
  batchId: string;
  mimeType: string;
  completionPercentage: number;
  lastReadContentId: string | null;
  status: number;
  batch: any;
}
const flattenItems = (items: any[], key: string | number) => {
  return items.reduce((flattenedItems, item) => {
    flattenedItems.push(item)
    if (Array.isArray(item[key])) {
      // tslint:disable-next-line
      flattenedItems = flattenedItems.concat(flattenItems(item[key], key))
    }
    return flattenedItems
  }, [])
}
@Component({
  selector: 'ws-app-app-toc-home-page',
  templateUrl: './app-toc-home-page.component.html',
  styleUrls: ['./app-toc-home-page.component.scss']
})
export class AppTocHomePageComponent implements OnInit, OnDestroy {
  [x: string]: any
  get enableAnalytics(): boolean {
    if (this.configSvc.restrictedFeatures) {
      return !this.configSvc.restrictedFeatures.has('tocAnalytics')
    }
    return false
  }
  banners: NsAppToc.ITocBanner[] | null | any = null
  content: NsContent.IContent | null = null
  errorCode: NsAppToc.EWsTocErrorCode | null = null
  batchData: NsContent.IBatchListResponse | null = null
  userEnrollmentList = null
  resumeData: any = null
  routeSubscription: Subscription | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  isCohortsRestricted = false
  isInIframe = false
  forPreview = window.location.href.includes('/author/')
  //analytics = this.route.snapshot.data.pageData.data.analytics
  currentFragment = 'overview'
  batchId!: string
  sticky = false
  license = 'CC BY'
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: 'errorResolver',
    widgetSubType: 'errorResolver',
    widgetData: {
      errorType: 'internalServer',
    },
  }
  isAuthor = false
  authorBtnWidget: NsPage.INavLink = {
    actionBtnId: 'feature_authoring',
    config: {
      type: 'mat-button',
    },
  }
  tocConfig: any = null
  elementPosition: any
  batchSubscription: Subscription | null = null
  @ViewChild('stickyMenu', { static: true }) menuElement!: ElementRef

  @ViewChild(AppTocOverviewComponent, { static: true }) wsAppAppTocOverview!: AppTocOverviewComponent
  body: SafeHtml | null = null
  contentParents: { [key: string]: NsAppToc.IContentParentResponse[] } = {}
  discussionConfig: any = {}
  loadDiscussionWidget = false
  routelinK = 'overview'
  result: any
  matspinner = true
  appFramework;
  showUptuLogo = false
  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    const windowScroll = window.pageYOffset
    if (windowScroll >= this.elementPosition - 100) {
      this.sticky = true
    } else {
      this.sticky = false
    }
  }
  enrolledCourse: NsContent.ICourse | undefined
  resumeResource: any = null
  public progressValue$ = new BehaviorSubject<number>(0);
  isSynC = false
  processCoursesDataCalled  = false
   /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  processedBatchId:any
  ashaData: any = {}
  navigateAshaHome = false;
  constructor(
    @Inject('CONTENT_SERVICE') private contentService: ContentService,
    private zone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private contentSvc: WidgetContentService,
    private userSvc: WidgetUserService,
    private tocSvc: AppTocService,
    private loggerSvc: LoggerService,
    private configSvc: ConfigurationsService,
    private domSanitizer: DomSanitizer,
    private authAccessControlSvc: AccessControlService,
    private commonUtilService: CommonUtilService,
    private event: Events,
    private screenOrientation: ScreenOrientation,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private localStorageService: LocalStorageService,
    private dataSyncService: DataSyncService,
    private onlineSqliteService:OnlineSqliteService,
    private courseOptimisticUiService: CourseOptimisticUiService,
    // private sqliteService: SqliteService,
    public translate: TranslateService,
    private offlineCourseOptimisticService:OfflineCourseOptimisticService,
    private snackBar: MatSnackBar,
    public quizService: QuizService,
    public cordovaSrv :ContentCorodovaService,
    private appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    
  ) {
    this.commonUtilService.removeLoader()
    // this.discussiConfig.setConfig()
    if (this.configSvc.userProfile) {
      this.discussionConfig = {
        // menuOptions: [{ route: 'categories', enable: true }],
        userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      }
    }
  }
  async ngOnInit() {
    this.screenOrientation.unlock();
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    // this.commonUtilService.addLoader()
    this.route.queryParamMap.subscribe(queryParams => {
      console.log("queryParams toc", queryParams );
      // if (queryParams.get('data')) {
        this.ashaData = queryParams
         
        if(this.ashaData.params.isAsha == "true"){
          this.navigateAshaHome = true
        }
      // }
    })
    this.checkRoute()
    try {
      this.isInIframe = window.self !== window.top
    } catch (_ex) {
      this.isInIframe = false
    }
    if (this.route) {
      this.routeSubscription = this.route.data.subscribe((data: Data) => {

        // Checking for JSON DATA
        if (data.content.data) {
          if (this.checkJson(data.content.data.creatorDetails)) {
            data.content.data.creatorDetails = JSON.parse(data.content.data.creatorDetails)
          }

          if (this.checkJson(data.content.data.reviewer)) {
            data.content.data.reviewer = JSON.parse(data.content.data.reviewer)
          }
        } else {
          if (localStorage.getItem('url_before_login') || this.appGlobalService.isUserLoggedIn()) {
            const url = localStorage.getItem('url_before_login') || ''
            this.router.navigate([url])
          } else {
            this.router.navigate(['/app/login'])
          }
        }
        this.banners = _.get(tocData, 'banners')
        this.tocSvc.subtitleOnBanners = _.get(tocData, 'subtitleOnBanners', false)
        this.tocSvc.showDescription = _.get(tocData, 'showDescription', false)
        this.tocConfig = tocData
        this.initData(data)
        
      })
    }

    this.currentFragment = 'overview'
    this.route.fragment.subscribe((fragment: string) => {
      this.currentFragment = fragment || 'overview'
    })
    this.batchSubscription = this.tocSvc.batchReplaySubject.subscribe(
      () => {
        this.fetchBatchDetails()
      }
    )
    this.detectFramework();
    if (!navigator.onLine) {
      this.setChildContent();
    }
   this.generateImpressionEvent();
    Network.getStatus().then(async (res: any) => {
      if (res.connectionType) {
        await this.dataSyncService.showSync(this.content.identifier)
      }
    })
    this.event.subscribe('makeAPICall', async (status) => {
      if(status){
        let userId;
        if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
        }
        this.processCoursesDataCalled = false
        await this.fetchAndProcessUserBatchList(userId);
      }
    })
    this.contentSvc._updateEnrollValue$.pipe(takeUntil(this.unsubscribe)).subscribe((res:any)=>{
      if(res){
        this.getUserEnrollmentList()
      }else {
        this.contentSvc.callNavigateBatchId = true
      }
    })
  }

  setChildContent() {
    const option = { contentId: this.content.identifier, hierarchyInfo: null }
    this.contentService.getChildContents(option).toPromise()
      .then((data: any) => {

        this.zone.run(() => {
          if (data && data.children) {
            const updatedChildrenData = this.updateDataRecursively(data)
            this.content.children = updatedChildrenData.children
            this.localStorageService.setLocalStorage('sdk_content' + this.content.identifier, this.content)
          }
        })
      })
      .catch((error) => {
        console.log('child data error-', error);
      });
  }

  private updateDataRecursively(node) {
    if (node.contentData) {
      const updatedNode = {
        ...node,
        ...node.contentData,
        children: _.map(node.children, (child) => this.updateDataRecursively(child))
      };
      if (updatedNode.children.length === 0) {
        delete updatedNode.children;
      }
      return updatedNode;
    }

    const updatedNode = {
      ...node,
      children: _.map(node.children, (child) => this.updateDataRecursively(child))
    };

    if (updatedNode.children.length === 0) {
      delete updatedNode.children;
    }

    return updatedNode;
  };


  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (this.appFramework === 'Ekshamata') {
        this.showUptuLogo = true
      }
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }

  showContents() {
    this.getUserEnrollmentList()
  }
  checkJson(str: any) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
    if(this.unsubscribe){
      this.unsubscribe.next()
      this.unsubscribe.complete()
    }
    
  }

  async initData(data: Data) {
   
    const initData = this.tocSvc.initData(data, true)
    console.log('data.content.data.identifier',initData)
    this.content = initData.content
    console.log(this.content)
    if(this.content){
      let percentage = _.get(this.content,'completionPercentage');
      console.log(">> content >>", this.content, this.content.completionPercentage, percentage);
      if(this.ashaData.params.isAsha == "true"){

        let req = {
          "userid": this.configSvc.userProfile.userId || '',
          "courseid": this.ashaData.params.courseid,
          "batchid": this.ashaData.params.batchId,
          "contentid":  this.content.identifier || data.content.data.identifier ,
          "competencylevel": this.ashaData.params.levelId,
          "completionpercentage": data.content.data.completionPercentage || 0 ,
          "progress": "course"
        }

        let ashaData = {
          "isAsha" : true,
          "courseid": this.ashaData.params.courseid,
          "userid": this.configSvc.userProfile.userId || '',
          "batchid": this.ashaData.params.batchId,
          "contentid":  this.content.identifier,
          "competencylevel": this.ashaData.params.levelId,
          "completionpercentage": 0 ,
          "progress": "course",
          "competencyid": this.ashaData.params.competencyid
        }
        // this.cordovaSrv.setAshaData(ashaData)
        // console.log('req ', req);
        // this.quizService.updateAshaAssessment(req).subscribe((res)=>{
        //   console.log("after update res", res)
        // }, (err) =>{
        //   console.log("after update err", err)
        // })
      }
      this.localStorageService.setLocalStorage('c_content' + this.content.identifier, this.content)
      this.localStorageService.setLocalStorage('sdk_content' + this.content.identifier, this.content)

    }
    this.errorCode = initData.errorCode
    switch (this.errorCode) {
      case NsAppToc.EWsTocErrorCode.API_FAILURE: {
        this.errorWidgetData.widgetData.errorType = ErrorType.internalServer
        break
      }
      case NsAppToc.EWsTocErrorCode.INVALID_DATA: {
        this.errorWidgetData.widgetData.errorType = ErrorType.internalServer
        break
      }
      case NsAppToc.EWsTocErrorCode.NO_DATA: {
        this.errorWidgetData.widgetData.errorType = ErrorType.internalServer
        break
      }
      default: {
        this.errorWidgetData.widgetData.errorType = ErrorType.somethingWrong
        break
      }
    
    }

    this.discussionConfig.contextIdArr = (this.content) ? [this.content.identifier] : []
    if (this.content) {
      this.discussionConfig.categoryObj = {
        category: {
          name: this.content.name,
          pid: '',
          description: this.content.description,
          context: [
            {
              type: 'course',
              identifier: this.content.identifier,
            },
          ],
        },
      }
    }
    this.discussionConfig.contextType = 'course'
    this.matspinner = false
    await this.getUserEnrollmentList()
    this.body = this.domSanitizer.bypassSecurityTrustHtml(
      this.content && this.content.body
        ? this.forPreview
          ? this.authAccessControlSvc.proxyToAuthoringUrl(this.content.body)
          : this.content.body
        : '',
    )
    this.contentParents = {}
    
  }

  
  
  private async getUserEnrollmentList() {
    if (this.content && this.content.identifier && this.content.primaryCategory !== 'Course') {
      return await  this.getContinueLearningData(this.content.identifier)
    }
    this.userEnrollmentList = null;
    let userId;
    if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
    }
    await this.fetchAndProcessUserBatchList(userId); 
  }
  private async fetchAndProcessUserBatchList(userId: string): Promise<void> {
    let courses: NsContent.ICourse[] = [];
  
    if (navigator.onLine) {
      try {
        courses = await this.fetchCoursesFromServer(userId);
        if(courses){
          const isUserEnrolled = _.find(_.get(courses, 'result.courses', []),{'courseId':this.content.identifier})
          const isUserEnrollCourseInLocaStorage = await this.onlineSqliteService.getUserEnrollCourse(this.content.identifier,this.configSvc.userProfile.userId)

          if(isUserEnrolled && isUserEnrollCourseInLocaStorage && isUserEnrollCourseInLocaStorage.result.courses.length ===0){
            await this.insertCourseProgressData(isUserEnrolled.batchId,this.configSvc.userProfile.userId,this.content.identifier)
            await this.insertUserEnrolledData(courses);
          }
          await this.localStorageService.setLocalStorage(this.content.identifier, courses);   
        }
      } catch (error) {
        console.error('Error fetching courses from server or local storage:', error);
      }
    } else {
      try {
        let response:any = await this.offlineCourseOptimisticService.fetchUserEnrolledCourse(this.content.identifier)
        console.log('response of offline ',response)
        if(response.result.courses.length>0){
          courses = response
        }else {
          courses = await this.fetchCoursesFromLocalStorage();
        }
      } catch (error) {
        console.error('Error fetching courses from local storage:', error);
      }
    }
    await this.processCoursesData(courses);
  }

  private async insertCourseProgressData(batchId: string, userId: string, contentId: string): Promise<void> {
    
    try {
      const req: NsContent.IContinueLearningDataReq = {
        request: {
          batchId,
          userId,
          courseId: contentId || '',
          contentIds: [],
          fields: ['progressdetails'],
        },
      };
  
      const data = await this.contentSvc.fetchContentHistoryV2(req).toPromise(); // Convert observable to promise
  
      if (!data?.result?.contentList?.length) {
        console.log('No content progress data found.');
        return;
      }
  
      const isDataInLocalStorage = await this.courseOptimisticUiService.courseProgressRead(contentId);
  
      if (isDataInLocalStorage?.result?.contentList?.length === 0) {
        console.log('Inserting content progress data:', data.result.contentList);
        await this.insertContentReadData(data);
      }
    } catch (error) {
      console.error('Error fetching or inserting course progress data:', error);
    }
  }
  
  // private async insertUserEnrolledData(data: any): Promise<void> {
  //   try {
  //     if (data && data.result && data.result.courses && data.result.courses.length > 0) {
  //       const courseProgressData = await this.courseProgressRead(this.content.identifier);

  //       for (const item of data.result.courses) {
  //         const userId = this.configSvc.userProfile.userId;
  //         // Insert data using courseOptimisticUiService
  //         const courseProgress = courseProgressData.find(
  //           (clProgress: any) => clProgress.courseId === item.courseId
  //         );
  //         const lastProgressItem = courseProgressData
  //         .filter((progress: any) => progress.courseId === item.courseId)
  //         .pop(); // Gets the last object
  //         item.lastReadContentId = lastProgressItem?.contentId || null;
  //         if (courseProgress) {
  //           console.log('both matched ',courseProgress)
  //           const CkContent = await this.localStorageService.getLocalStorage('c_content' + item.courseId);

  //           if (CkContent) {
  //             const leafContentIds = Array.from(this.getLeafNodeIdsWithoutDuplicates([CkContent]));
  //             const unitLevelViewedContents = courseProgressData
  //               .filter(c => (c.status === 1 || c.status === 2) && leafContentIds.includes(c.contentId));
  
  //             const totalCompletionPercentage = unitLevelViewedContents.reduce((sum, c) => sum + c.completionPercentage, 0);
  //             let progress = Math.round((totalCompletionPercentage / (leafContentIds.length * 100)) * 100);
  //             item.completionPercentage = Math.min(Math.max(progress, 0), 100);
              
  //           }
  //         }
  //         await this.courseOptimisticUiService.enrollUser(
  //           item.courseId,
  //           item.contentId,
  //           userId,
  //           item.batchId,
  //           item.mimeType,
  //           item.completionPercentage,
  //           item.lastReadContentId,
  //           item.status,
  //           item.batch
  //         );
  
  //         await this.offlineCourseOptimisticService.enrollUser(
  //           item.courseId,
  //           item.contentId,
  //           userId,
  //           item.batchId,
  //           item.mimeType,
  //           item.completionPercentage,
  //           item.lastReadContentId,
  //           item.status,
  //           item.batch
  //         );
  //       }
  //     } else {
  //       console.log('No valid data to insert.');
  //     }
  //   } catch (error) {
  //     console.error('Error inserting data:', error);
  //   }
  // }
  private async insertUserEnrolledData(data: any): Promise<void> {
    try {
      console.log('insertUserEnrolledData: Start processing enrollment data.');
      if (!this.isValidData(data)) {
        console.log('insertUserEnrolledData: No valid data to insert.');
        return;
      }
  
      const userId = this.configSvc.userProfile.userId;
      console.log(`insertUserEnrolledData: User ID: ${userId}`);
      const courseProgressMap = await this.getCourseProgressMap();
      console.log('insertUserEnrolledData: Course progress map fetched.',courseProgressMap);
      const contentMap = await this.getContentMap(data.result.courses);
      console.log('insertUserEnrolledData: Content map fetched.',contentMap);
      const enrollmentPromises = data.result.courses.map(async (item: any) => {
        const enrollmentData = await this.prepareEnrollmentData(
          item,
          courseProgressMap,
          contentMap
        );
        console.log(`insertUserEnrolledData: Enrollment data prepared for course ID: ${item.courseId}`,enrollmentData );
      
        return this.insertEnrollmentData(enrollmentData, userId);
      });

      await Promise.all(enrollmentPromises);
      
    } catch (error) {
      console.error('Error inserting data:', error);
      throw error;
    }
  }

  private isValidData(data: any): boolean {
    return data?.result?.courses?.length > 0;
  }
  private async getCourseProgressMap(): Promise<Map<string, CourseProgress[]>> {
    console.log('getCourseProgressMap: Fetching course progress data.');
    
    const response = await this.courseOptimisticUiService.courseProgressRead(this.content.identifier);
    const courseProgressData = response?.result?.contentList || []; // Ensure it's an array
  
    if (!Array.isArray(courseProgressData)) {
      console.error('getCourseProgressMap: Unexpected response format', response);
      return new Map();
    }
  
    const progressMap = courseProgressData.reduce((map, progress: CourseProgress) => {
      if (!map.has(progress.courseId)) {
        map.set(progress.courseId, []);
      }
      map.get(progress.courseId)!.push(progress);
      return map;
    }, new Map<string, CourseProgress[]>());
  
    console.log(`getCourseProgressMap: Retrieved ${progressMap.size} course progress records.`);
    return progressMap;
  }
  

  private async getContentMap(courses: any[]): Promise<Map<string, any>> {
    const contentPromises = courses.map(async (course) => {
      const content = await this.localStorageService.getLocalStorage(
        'c_content' + course.courseId
      );
      return { courseId: course.courseId, content };
    });
  
    const contents = await Promise.all(contentPromises);
    return new Map(
      contents
        .filter(({ content }) => content !== null)
        .map(({ courseId, content }) => [courseId, content])
    );
  }

  private async prepareEnrollmentData(
    item: any,
    courseProgressMap: Map<string, CourseProgress[]>,
    contentMap: Map<string, any>
  ): Promise<EnrollmentData> {
    const courseProgress = courseProgressMap.get(item.courseId) || [];
    const lastProgress = courseProgress[courseProgress.length - 1];
    
    let completionPercentage = item.completionPercentage;
    
    const content = contentMap.get(item.courseId);
    if (content && courseProgress.length) {
      completionPercentage = this.calculateCompletionPercentage(
        content,
        courseProgress
      );
    }
  
    return {
      courseId: item.courseId,
      contentId: item.contentId,
      batchId: item.batchId,
      mimeType: item.mimeType,
      completionPercentage,
      lastReadContentId: lastProgress?.contentId || null,
      status: item.status,
      batch: item.batch
    };
  }

  private calculateCompletionPercentage(
    content: any,
    courseProgress: CourseProgress[]
  ): number {
    const leafContentIds = new Set(this.getLeafNodeIdsWithoutDuplicates([content]));
    
    const completedContent = courseProgress.filter(
      c => (c.status === 1 || c.status === 2 || c.status === 0 ) && leafContentIds.has(c.contentId)
    );
  
    const totalCompletionPercentage = completedContent.reduce(
      (sum, c) => sum + c.completionPercentage,
      0
    );
  
    const progress = Math.round(
      (totalCompletionPercentage / (leafContentIds.size * 100)) * 100
    );
    
    return Math.min(Math.max(progress, 0), 100);
  }

  private async insertEnrollmentData(
    data: EnrollmentData,
    userId: string
  ): Promise<void> {
    // Execute both enrollments in parallel
    await Promise.all([
      this.courseOptimisticUiService.enrollUser(
        data.courseId,
        data.contentId,
        userId,
        data.batchId,
        data.mimeType,
        data.completionPercentage,
        data.lastReadContentId,
        data.status,
        data.batch
      ),
      this.offlineCourseOptimisticService.enrollUser(
        data.courseId,
        data.contentId,
        userId,
        data.batchId,
        data.mimeType,
        data.completionPercentage,
        data.lastReadContentId,
        data.status,
        data.batch
      )
    ]);
  }
  
  private async fetchCoursesFromServer(userId: string): Promise<NsContent.ICourse[]> {
    return new Promise<NsContent.ICourse[]>((resolve, reject) => {
      this.userSvc.fetchUserBatchList(userId)
        .subscribe(
         async (courses: NsContent.ICourse[]) => {
           if (courses) {
             resolve(courses);
           }
         },
        (error: any) => {
           reject(error);
         }
        );
    });
  }
  
  private async processCoursesData(courses: NsContent.ICourse[]): Promise<void> {
    if (this.content && this.content.identifier && !this.forPreview) {
      const coursesList = _.get(courses, 'result.courses', []);
      this.enrolledCourse = coursesList.find(course => course.courseId === this.content.identifier);
      await this.processAndSetLocalStorage(courses);
      if (this.enrolledCourse && this.enrolledCourse.batchId) {
        await this.handleEnrolledCourse();
      } else {
        this.commonUtilService.removeLoader();
        this.fetchBatchDetails();
      }
    }
  }

  async checkOfflineandOptimisticProgress() {
    try {
      const optimisticDataResponse = await this.courseOptimisticUiService.getUserEnrollCourse(this.content.identifier, this.configSvc.userProfile.userId);
      console.log('Local Data Response:', optimisticDataResponse);
      const offlineResponse = await this.offlineCourseOptimisticService.fetchUserEnrolledCourse(this.content.identifier);
      console.log('Offline Data Response:', offlineResponse);
      const optimisticCourses = _.get(optimisticDataResponse, 'result.courses', []);
      const offlineCourses = _.get(offlineResponse, 'result.courses', []);
      const optimisticCourse = _.find(optimisticCourses, { courseId: this.content.identifier });
      const offlineCourse = _.find(offlineCourses, { courseId: this.content.identifier });
  
      if (optimisticCourse && offlineCourse) {
        const finalCourseData = optimisticCourse.completionPercentage > offlineCourse.completionPercentage ? optimisticDataResponse : offlineResponse;
        console.log('Final Course Data:', finalCourseData);
        return finalCourseData;
      } else if (optimisticCourse) {
        console.log('Only optimistic course data available:', optimisticCourse);
        return optimisticDataResponse;
      } else if (offlineCourse) {
        console.log('Only offline course data available:', offlineCourse);
        return offlineResponse;
      } else {
        console.log('No valid data found in either local or offline storage.');
        return null;
      }
    } catch (error) {
      console.error('Error checking offline and optimistic progress:', error);
      return null;
    }
  }
  
  private async processAndSetLocalStorage(courses: NsContent.ICourse[]): Promise<void> {
    console.log('check the local percentage and api percentage ')
    try {
      const isCourseAvailableLocally = await this.checkOfflineandOptimisticProgress();
      console.log('isCourseAvailableLocally', isCourseAvailableLocally);
      const coursesList = _.get(isCourseAvailableLocally, 'result.courses', []);
      const courseToCheck = coursesList.find(course => course.courseId === this.content.identifier);
      if (!this.processCoursesDataCalled) {
        this.processCoursesDataCalled = true;
        if(courseToCheck  && courseToCheck.userId===this.configSvc.userProfile.userId){
          const useCourse:any = this.enrolledCourse && this.enrolledCourse.completionPercentage <= courseToCheck.completionPercentage
          ? isCourseAvailableLocally
          : courses;
          await this.processCoursesData(useCourse);
        }else {
          await this.processCoursesData(courses);
        } 
      }
    } catch (error) {
      console.error('Error in processAndSetLocalStorage:', error);
    }
  }
  
  private async handleEnrolledCourse() {
    const currentBatchId = this.getBatchId();
    if (currentBatchId !== this.processedBatchId) {
      this.content.completionPercentage = this.enrolledCourse.completionPercentage || 0;
      this.content.completionStatus = this.enrolledCourse.status || 0;
      this.batchData = {
        content: [this.enrolledCourse.batch],
        enrolled: true,
      };
      if(this.contentSvc.callNavigateBatchId){
        this.navigateWithBatchId();
      }
      this.processedBatchId = currentBatchId;
      if (this.content?.identifier) {
        await this.getContinueLearningData(this.content.identifier, this.enrolledCourse.batchId);

      }
      this.commonUtilService.removeLoader();
    }
  }
 
  private navigateWithBatchId() {
    const batchId = this.getBatchId();
    if (batchId) {
      this.batchId = batchId;
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: { batchId: batchId },
          queryParamsHandling: 'merge',
        }
      );
    }
  }
  private async getContinueLearningData(contentId: string, batchId?: string) {
    // Check if the data is available in local storage
   console.log('call for resume data and resume link')
    if(navigator.onLine){
      const couseLocalProgressData = await this.courseOptimisticUiService.courseProgressRead(contentId)
      console.log('>>>>>>>>couseLocalProgressData',couseLocalProgressData)
      if(couseLocalProgressData && couseLocalProgressData.result.contentList.length >0){
        this.processResumeData(couseLocalProgressData.result.contentList);
        return;
      }
    }else {
      const couseLocalProgressData = await this.offlineCourseOptimisticService.courseProgressRead(contentId)
      console.log('>>>>>>>>offline couseLocalProgressData',couseLocalProgressData)
      if(couseLocalProgressData && couseLocalProgressData.result.contentList.length >0){
        this.processResumeData(couseLocalProgressData.result.contentList);
        return;
      }
    }
    this.resumeData = null;
    let userId;
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || '';
    }

    const req: NsContent.IContinueLearningDataReq = {
      request: {
        batchId,
        userId,
        courseId: contentId || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    };

    this.contentSvc.fetchContentHistoryV2(req).subscribe(
      async (data) => {
        if (data && data.result && data.result.contentList && data.result.contentList.length) {
          const isDataInLocalStorage = await this.courseOptimisticUiService.courseProgressRead(contentId);
          if (isDataInLocalStorage && isDataInLocalStorage.result.contentList.length ===0  
            && data.result.contentList.length>0) {
            console.log('check before inserting the content read  ', data.result.contentList)
            await this.insertContentReadData(data);
          }
          this.processResumeData(data.result.contentList);
          await this.localStorageService.setLocalStorage(this.content.identifier + 'resumeData', data.result.contentList);
          await this.localStorageService.setLocalStorage('PORGRESS_API_MOCK' + this.content.identifier, data);
        } else {
          this.resumeData = null;
        }
      },
      (error: any) => {
        this.loggerSvc.error('CONTENT HISTORY FETCH ERROR >', error);
      }
    );
  }
  async insertContentReadData(data: any) {
    try {
      if (data && data.result && data.result.contentList && data.result.contentList.length > 0) {
        for (const item of data.result.contentList) {
          await this.courseOptimisticUiService.insertCourseProgress(
            item.courseId,
            item.contentId,
            this.configSvc.userProfile.userId,
            item.completionPercentage,
            item.batchId,
            'application/vnd.ekstep.conten',
            item.contentId,
            item.status
          );
          await this.offlineCourseOptimisticService.insertCourseProgress(
            item.courseId,
            item.contentId,
            this.configSvc.userProfile.userId,
            item.completionPercentage,
            item.batchId,
            'application/vnd.ekstep.conten',
            item.contentId,
            item.status
          );
        }
        console.log('Data inserted successfully into onlineCourseProgress table.');
      } else {
        console.log('No valid data to insert.');
      }
    } catch (error) {
      console.error('Error inserting data into SQLite:', error);
    }
  }
  private processResumeData(resumeData: any) {
    this.resumeData = _.map(resumeData, (rr) => {
      const items = _.filter(flattenItems(_.get(this.content, 'children') || [], 'children'), { 'identifier': rr.contentId, primaryCategory: 'Learning Resource' })
      _.set(rr, 'progressdetails.mimeType', _.get(_.first(items), 'mimeType'))
      if (!_.get(rr, 'completionPercentage')) {
        if (_.get(rr, 'status') === 2 || _.get(rr, 'status') === 1) {
          _.set(rr, 'completionPercentage', rr.completionPercentage)
        } else {
          _.set(rr, 'completionPercentage', rr.completionPercentage)
        }
      }
      return rr
    });
    console.log('this.enrolledCourse',this.enrolledCourse)
    const progress = _.map(this.resumeData, 'completionPercentage')
    this.resumeResource = this.resumeData.filter((item: any) => {
      return (item.contentId == (this.enrolledCourse && this.enrolledCourse.lastReadContentId ? this.enrolledCourse.lastReadContentId : ''))
    })
    if(!this.resumeResource){
      this.handleNullResumeResource()
    }
    const totalCount = _.toInteger(_.get(this.content, 'leafNodesCount')) || 1
    if (progress.length < totalCount) {
      const diff = totalCount - progress.length
      if (diff) {
        // tslint:disable-next-line
        _.each(new Array(diff), () => {
          progress.push(0)
        })
      }
    }
    this.tocSvc.updateResumaData(this.resumeData);
  }
  private handleNullResumeResource(){
    console.log('call here ')
  }
  private async fetchCoursesFromLocalStorage(): Promise<NsContent.ICourse[]> {
    const resp = await this.localStorageService.getLocalStorage(this.content.identifier);
    return resp;
  }


  public getBatchId(): string {
    let batchId = ''
    if (this.batchData && this.batchData.content && this.batchData.content.length) {
      for (const batch of this.batchData.content) {
        batchId = batch.batchId
      }
    }
    return batchId
  }
  private processBatchData(batchData: any[]) {
    this.batchData = {
      content: batchData,
      enrolled: false,
    };

    if (this.getBatchId()) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParamsHandling: 'merge',
      });
    }
  }
  redirectTo() {
    this.routelinK = 'discuss'
    this.loadDiscussionWidget = true
    this.tocSvc._showComponent.next({ showComponent: false })
  }
  toggleComponent(cname: string, navigate = true) {
    this.commonUtilService.blockAddUrl = true;
    this.routelinK = '';
    this.generateInteractEvent(cname);
    if (cname === 'overview') {
      if (navigate) {
        this.router.navigate(['/app/toc/' + this.content!.identifier + '/overview'])
      }
      this.routelinK = 'overview'
    } else if (cname === 'chapters') {
      if (this.batchData && !this.batchData.enrolled) {
        this.enrollUser(this.batchData)
      }
      if (navigate) {
        this.router.navigate(['/app/toc/' + this.content.identifier + '/chapters'],
          {
            queryParams: {
              batchId: this.batchData ? this.batchData.content[0].batchId : '',
              contentId: this.content.identifier
            },
            queryParamsHandling: 'merge',
          })
      }
      this.routelinK = 'chapters'
    } else if (cname === 'license') {
      this.routelinK = 'license'
    } else if (cname === 'references') {
      this.routelinK = 'references'
    }

    this.tocSvc._showComponent.next({ showComponent: true })
    this.loadDiscussionWidget = false
  }
  checkRoute() {
    if (_.includes(this.router.url, 'overview')) {
      this.toggleComponent('overview', false)
    } else if (_.includes(this.router.url, 'chapters')) {
      this.toggleComponent('chapters', false)
      this.enrollUser(this.batchData)
    } else if (_.includes(this.router.url, 'references')) {
      this.toggleComponent('references',false)
    }else {
      this.toggleComponent('license', false)
    }
  }

  public async fetchBatchDetails() {
    if (this.content && this.content.identifier) {
      // Check if the data is available in local storage
      this.localStorageService.getLocalStorage(this.content.identifier + 'batchData').then(resp => {
        const batchDataFromLocalStorage = resp
        if (batchDataFromLocalStorage) {
          this.processBatchData(batchDataFromLocalStorage);
        }
        return;
      })
      this.resumeData = null;
      const req = {
        request: {
          filters: {
            courseId: this.content.identifier,
            status: ['0', '1', '2'],
            // createdBy: 'fca2925f-1eee-4654-9177-fece3fd6afc9',
          },
          sort_by: { createdDate: 'desc' },
        },
      };
      this.contentSvc.fetchCourseBatches(req).subscribe(
        (data: NsContent.IBatchListResponse) => {
          if (data.content) {
            const batchList = data.content.filter((obj: any) => obj.endDate >= moment(new Date()).format('YYYY-DD-MM'));
            this.processBatchData(batchList);

            // Store the batchData in local storage
            this.localStorageService.setLocalStorage(this.content.identifier + 'batchData', batchList)
          }
        },
        (error: any) => {
          this.loggerSvc.error('CONTENT HISTORY FETCH ERROR >', error);
        }
      )
    }
  }

  enrollUser(batchData: any) {
    let userId = ''
    if (batchData) {
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
      const req = {
        request: {
          userId,
          courseId: batchData.content[0].courseId,
          batchId: batchData.content[0].batchId,
        },
      }
      this.contentSvc.enrollUserToBatch(req).subscribe((data: any) => {
        if (data && data.result && data.result.response === 'SUCCESS') {
          this.getUserEnrollmentList()
          this.router.navigate(
            [],
            {
              relativeTo: this.route,
              queryParams: { batchId: batchData.content[0].batchId },
              queryParamsHandling: 'merge',
            })
          this.openSnackbar(this.translate.instant('ENROLLED_SUCCESSFULLY'))
          setTimeout(() => {
            const query = this.generateQuery('RESUME')
            this.router.navigate([this.resumeDataLink.url], { queryParams: query })

          }, 500)

        } else {
          this.openSnackbar(this.translate.instant('SOMETHING_WENT_WRONG_TRY_LATER'));
        }
      })
      // .catch((err: any) => {

      //   this.openSnackbar(err.error.params.errmsg)
      // })
    }

  }
  private openSnackbar(primaryMsg: string, duration: number = 2000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
  
  private getLeafNodeIdsWithoutDuplicates(contents: any[]): Set<string> {
    return contents.reduce((acc, content) => {
      if (content.children) {
        this.getLeafNodeIdsWithoutDuplicates(content.children).forEach((c) => acc.add(c));
      } else {
        if (!acc.has(content.identifier)) {
          acc.add(content.identifier);
        }
      }
      return acc;
    }, new Set<string>());
  }

  generateImpressionEvent() {
    this.telemetryGeneratorService.generateImpressionTelemetry(ImpressionType.DETAIL,
      '', PageId.COURSE_DETAIL,
      Environment.HOME,
      this.content?.identifier,
      this.content?.contentType,
      this.content?.version);
  }

  generateInteractEvent(cname: string) {
    const telemetryObject = new TelemetryObject(this.content?.identifier, this.content?.contentType, this.content?.version);
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      `${cname}-clicked`,
      Environment.HOME,
      PageId.COURSE_DETAIL,
      telemetryObject,
    )
  }
}
