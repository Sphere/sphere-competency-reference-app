import { Inject, Injectable } from '@angular/core'
import { ActivatedRoute, Data } from '@angular/router'
import { Subject, Observable, Subscription, BehaviorSubject } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { NsContent } from '@ws-widget/collection/src/lib/_services/widget-content.model'
import { NsContentConstants } from '@ws-widget/collection/src/lib/_constants/widget-content.constants'
import { NsAppToc } from '../models/app-toc.model'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { CordovaHttpService } from '../../../../../../../../app/modules/core/services/cordova-http.service'
import { ToastService } from '../../../../../../../../app/manage-learn/core'
import { ModalController } from '@ionic/angular'
import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import * as _ from 'lodash'
import { SqliteService } from '../../../../../../../../app/modules/shared/services/sqlite.service'
import { API_END_POINTS, API_PROTECTED_END_POINTS, API_PROXIES_END_POINTS } from 'app/apiConstants'
const PROXY_SLAG_V8 = '/apis/proxies/v8'

@Injectable()
export class AppTocService extends CordovaHttpService {
  analyticsReplaySubject: Subject<any> = new Subject()
  analyticsFetchStatus: TFetchStatus = 'none'
  private showSubtitleOnBanners = false
  private canShowDescription = false
  public _showComponent = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  showComponent$ = this._showComponent.asObservable()
  batchReplaySubject: Subject<any> = new Subject()
  resumeData: Subject<NsContent.IContinueLearningData | null> = new Subject<NsContent.IContinueLearningData | null>()
  resumeDataSubscription: Subscription | null = null
  gatingEnabled = false
  constructor(
    public http: HttpClient, 
    public toast: ToastService,
    private route: ActivatedRoute,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP,
    private configSvc: ConfigurationsService,
    private sqliteService: SqliteService,
    ) { 
      super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
    
    }
  private data: any

  getcontentForWidget() {
    const temp = this.data
    return temp
  }
  setcontentForWidget(val: any) {
    this.data = val
  }
  clearData() {
    this.data = undefined
  }
  get subtitleOnBanners(): boolean {
    return this.showSubtitleOnBanners
  }
  set subtitleOnBanners(val: boolean) {
    this.showSubtitleOnBanners = val
  }
  get showDescription(): boolean {
    return this.canShowDescription
  }
  set showDescription(val: boolean) {
    this.canShowDescription = val
  }

  updateResumaData(data: any) {
    this.resumeData.next(data)
  }

  showStartButton(content: NsContent.IContent | null): { show: boolean; msg: string } {
    const status = {
      show: false,
      msg: '',
    }
    if (content) {
      if (
        content.artifactUrl && content.artifactUrl.match(/youtu(.)?be/gi) &&
        this.configSvc.userProfile &&
        this.configSvc.userProfile.country === 'China'
      ) {
        status.show = false
        status.msg = 'youtubeForbidden'
        return status
      }
      if (content.resourceType !== 'Certification') {
        status.show = true
        return status
      }
    }
    return status
  }

  initData(data: Data, needResumeData: boolean = false): NsAppToc.IWsTocResponse {
    let content: NsContent.IContent | null = null
    let errorCode: NsAppToc.EWsTocErrorCode | null = null

    if (data.content && data.content.data && data.content.data.identifier) {
      content = data.content.data
      if (needResumeData) {
        this.resumeDataSubscription = this.resumeData.subscribe(
          async (dataResult: any) => {
            if (dataResult && dataResult.length) {
              if(!navigator.onLine){
                console.log('courseId',this.route.snapshot.paramMap.get('id'))
                console.log('data.content.data.identifier',data.content.data.identifier)
                this.sqliteService.mockProgressAPIFormatedList(data.content.data.identifier).then((progressData) => {
                  console.log('data result---',progressData)
                  const existingData =  _.get(progressData, 'result.contentList', [])
                  this.mapCompletionPercentage(content, existingData)
                },(error) => {
                  this.mapCompletionPercentage(content, dataResult)
                })
              }else {
                this.mapCompletionPercentage(content, dataResult)
              }
            }
          },
          () => {
            // tslint:disable-next-line: no-console
            // console.log('error on resumeDataSubscription')
          },
        )
      }
    } else {
      if (data.error) {
        errorCode = NsAppToc.EWsTocErrorCode.API_FAILURE
      } else {
        errorCode = NsAppToc.EWsTocErrorCode.NO_DATA
      }
    }
    console.log("???", content)
    return {
      content,
      errorCode,
    }
  }

 

  mapCompletionPercentage(content: NsContent.IContent | null, dataResult: any) {
    if (content && content.children) {
      content.children.map(child => {
        const foundContent = dataResult.find((el: any) => (el !== undefined && child.identifier && el.contentId === child.identifier))
        if (foundContent) {
          child.completionPercentage = foundContent.completionPercentage
          child.completionStatus = foundContent.status
        } else {
          this.mapCompletionPercentage(child, dataResult)
        }
      })
    }
  }

  getTocStructure(
    content: NsContent.IContent,
    tocStructure: NsAppToc.ITocStructure,
  ): NsAppToc.ITocStructure {
    if (
      content &&
      !(content.contentType === 'Resource' || content.contentType === 'Knowledge Artifact')
    ) {
      if (content.contentType === 'Course') {
        tocStructure.course += 1
      } else if (content.contentType === 'Collection') {
        tocStructure.learningModule += 1
      }
      content.children.forEach(child => {
        // tslint:disable-next-line: no-parameter-reassignment
        tocStructure = this.getTocStructure(child, tocStructure)
      })
    } else if (
      content &&
      (content.contentType === 'Resource' || content.contentType === 'Knowledge Artifact')
    ) {
      switch (content.mimeType) {
        case NsContent.EMimeTypes.HANDS_ON:
          tocStructure.handsOn += 1
          break
        case NsContent.EMimeTypes.MP3:
          tocStructure.podcast += 1
          break
        case NsContent.EMimeTypes.MP4:
        case NsContent.EMimeTypes.M3U8:
          tocStructure.video += 1
          break
        case NsContent.EMimeTypes.INTERACTION:
          tocStructure.interactiveVideo += 1
          break
        case NsContent.EMimeTypes.PDF:
          tocStructure.pdf += 1
          break
        case NsContent.EMimeTypes.HTML:
          tocStructure.webPage += 1
          break
        case NsContent.EMimeTypes.QUIZ:
          if (content.resourceType === 'Assessment') {
            tocStructure.assessment += 1
          } else {
            tocStructure.quiz += 1
          }
          break
        case NsContent.EMimeTypes.WEB_MODULE:
          tocStructure.webModule += 1
          break
        case NsContent.EMimeTypes.YOUTUBE:
          tocStructure.youtube += 1
          break
        default:
          tocStructure.other += 1
          break
      }
      return tocStructure
    }
    return tocStructure
  }

  filterToc(
    content: NsContent.IContent,
    filterCategory: NsContent.EFilterCategory = NsContent.EFilterCategory.ALL,
  ): NsContent.IContent | null {
    if (content.contentType === 'Resource' || content.contentType === 'Knowledge Artifact') {
      return this.filterUnitContent(content, filterCategory) ? content : null
    }
    const filteredChildren: NsContent.IContent[] = content.children
      .map(childContent => this.filterToc(childContent, filterCategory))
      .filter(unitContent => Boolean(unitContent)) as NsContent.IContent[]
    if (filteredChildren && filteredChildren.length) {
      return {
        ...content,
        children: filteredChildren,
      }
    }
    return null
  }

  filterUnitContent(
    content: NsContent.IContent,
    filterCategory: NsContent.EFilterCategory = NsContent.EFilterCategory.ALL,
  ): boolean {
    switch (filterCategory) {
      case NsContent.EFilterCategory.LEARN:
        return (
          !NsContentConstants.VALID_PRACTICE_RESOURCES.has(content.resourceType) &&
          !NsContentConstants.VALID_ASSESSMENT_RESOURCES.has(content.resourceType)
        )
      case NsContent.EFilterCategory.PRACTICE:
        return NsContentConstants.VALID_PRACTICE_RESOURCES.has(content.resourceType)
      case NsContent.EFilterCategory.ASSESS:
        return NsContentConstants.VALID_ASSESSMENT_RESOURCES.has(content.resourceType)
      case NsContent.EFilterCategory.ALL:
      default:
        return true
    }
  }
  fetchContentAnalyticsClientData(contentId: string) {
    if (this.analyticsFetchStatus !== 'fetching' && this.analyticsFetchStatus !== 'done') {
      this.getContentAnalyticsClient(contentId)
    }
  }
  private getContentAnalyticsClient(contentId: string) {
    this.analyticsFetchStatus = 'fetching'
    const url = `${PROXY_SLAG_V8}/LA/apis/public/v8/mobileApp/kong/la/contentanalytics?content_id=${contentId}&type=course`
    const options = {
      url: url
    }
    this.get(options).subscribe(
      result => {
        this.analyticsFetchStatus = 'done'
        this.analyticsReplaySubject.next(result)
      },
      () => {
        this.analyticsReplaySubject.next(null)
        this.analyticsFetchStatus = 'done'
      },
    )
  }

  fetchContentAnalyticsData(contentId: string) {
    if (this.analyticsFetchStatus !== 'fetching' && this.analyticsFetchStatus !== 'done') {
      this.getContentAnalytics(contentId)
    }
  }
  private getContentAnalytics(contentId: string) {
    this.analyticsFetchStatus = 'fetching'
    // tslint:disable-next-line: max-line-length
    const url = `${PROXY_SLAG_V8}/LA/LA/apis/public/v8/mobileApp/kong/Users?refinementfilter=${encodeURIComponent(
      '"source":["Wingspan","Learning Hub"]',
    )}$${encodeURIComponent(`"courseCode": ["${contentId}"]`)}`
    const options = {
      url: url,
    };
    this.get(options).subscribe(
      result => {
        this.analyticsFetchStatus = 'done'
        this.analyticsReplaySubject.next(result)
      },
      () => {
        this.analyticsReplaySubject.next(null)
        this.analyticsFetchStatus = 'done'
      },
    )
  }
  public getUserWhatsAppContent() {
    const options = {
      url: `${API_END_POINTS.GET_WHATSUP_CONTENT}`
    }
    return this.getWithHandleError(options)
  }

  public updateUserWhatsAppOptInStatus(data: any) {
    const options = {
      url: `${API_END_POINTS.UPDATE_WHATSUP_CONTENT}`,
      payload: data
    }
    return this.post(options)
  }
  clearAnalyticsData() {
    if (this.analyticsReplaySubject) {
      this.analyticsReplaySubject.unsubscribe()
    }
  }

  fetchContentParents(contentId: string): Observable<NsContent.IContentMinimal[]> {
    const options = {
      url: `${API_PROTECTED_END_POINTS.CONTENT_PARENTS}/${contentId}`
    }
    return this.get(options)
  }
  fetchContentWhatsNext(
    contentId: string,
    contentType?: string,
  ): Observable<NsContent.IContentMinimal[]> {
    if (contentType) {
      const options = {
        url: `${API_PROTECTED_END_POINTS.CONTENT_NEXT}/${contentId}?contentType=${contentType}`
      }
      return this.get(options)
    }
    const options = {
      url: `${API_PROTECTED_END_POINTS.CONTENT_NEXT}/${contentId}?ts=${new Date().getTime()}`
    }
    return this.get(options)
  }

  fetchMoreLikeThisPaid(contentId: string): Observable<NsContent.IContentMinimal[]> {
    const options = {
      url: `${API_PROTECTED_END_POINTS.CONTENT_NEXT
      }/${contentId}?exclusiveContent=true&ts=${new Date().getTime()}`
    }
    return this.get(options)
  }

  fetchMoreLikeThisFree(contentId: string): Observable<NsContent.IContentMinimal[]> {
    const options = {
      url: `${API_PROTECTED_END_POINTS.CONTENT_NEXT
      }/${contentId}?exclusiveContent=false&ts=${new Date().getTime()}`
    }
    return this.get(options)
  }

  // fetchContentCohorts(
  //   cohortType: NsCohorts.ECohortTypes,
  //   contentId: string,
  // ): Observable<NsCohorts.ICohortsContent[]> {
  //   const options = {
  //     url: ''//API_END_POINTS.COHORTS(cohortType, contentId)
  //   }
  //   return this.get(options)
  // }
  fetchExternalContentAccess(contentId: string): Observable<{ hasAccess: boolean }> {
    const options = {
      url: API_PROTECTED_END_POINTS.EXTERNAL_CONTENT(contentId)
    }
    return this.get(options)
  }
  // fetchCohortGroupUsers(groupId: number) {
  //   const options = {
  //     url: API_END_POINTS.COHORTS_GROUP_USER(groupId)
  //   }
  //   return this.get(options)
  // }
  fetchMoreLikeThis(contentId: string, contentType: string): Observable<any> {
    const options = {
      url: API_PROTECTED_END_POINTS.RELATED_RESOURCE(contentId, contentType)
    }
    return this.get(options)
  }

  fetchPostAssessmentStatus(contentId: string) {
    const options = {
      url: API_PROTECTED_END_POINTS.POST_ASSESSMENT(contentId)
    }
    return this.get(options)
  }

  fetchContentParent(contentId: string, data: NsAppToc.IContentParentReq, forPreview = false) {
    let options: any;
    if(forPreview){
      const url = API_END_POINTS.CONTENT_AUTH_PARENT(
        contentId,
        this.configSvc.rootOrg || '',
        this.configSvc.org ? this.configSvc.org[0] : '',
      )
      options = {
        url: url,
        payload: data
      }
    }
    else{
      options = {
        url: API_PROTECTED_END_POINTS.CONTENT_PARENT(contentId),
        payload: data
      }
    }
    return this.post(options)
  }

  createBatch(batchData: any) {
    const options = {
      url: API_PROXIES_END_POINTS.BATCH_CREATE,
      payload: { request: batchData }
    }
    return this.post(options)
  }
  updateBatchData() {
    this.batchReplaySubject.next()
  }

  getNode(): boolean {
    return this.gatingEnabled
  }

  setNode(value: any) {
    this.gatingEnabled = value
  }
}
