import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { ConfigurationsService } from '../../../../utils/src/lib/services/configurations.service'
import { Observable, of, throwError, BehaviorSubject } from 'rxjs'
import { catchError, retry, map } from 'rxjs/operators'
import { NsContentStripMultiple } from '../content-strip-multiple/content-strip-multiple.model'
import { NsContent } from './widget-content.model'
import { NSSearch } from './widget-search.model'

import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import { CordovaHttpService } from 'app/modules/core/services/cordova-http.service'
import { ModalController } from '@ionic/angular'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { ToastService } from 'app/manage-learn/core'
import { buildConfig } from '../../../../../../../configurations/configuration'
import { API_END_POINTS, API_PROTECTED_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class WidgetContentService extends CordovaHttpService {
  public messageSource = new BehaviorSubject<any>(undefined)
  public currentMessage = this.messageSource.asObservable()
  public _updateValue = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  updateValue$ = this._updateValue.asObservable()
  public _updateEnrollValue = new BehaviorSubject<any>(undefined)
  // Observable navItem stream
  _updateEnrollValue$ = this._updateEnrollValue.asObservable()
  _showConformation: boolean = true
  _callNavigateBatchId : boolean = false
  private _collectionId: string = '';
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP,
    public configSvc: ConfigurationsService
  ) {
    super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
    this.baseUrl = 'https://'+buildConfig.SITEPATH
  }

  fetchMarkAsCompleteMeta(identifier: string) {
    const options = {
      url: API_PROTECTED_END_POINTS.MARK_AS_COMPLETE_META(identifier),
    };
    return this.get(options).pipe(
      map(response => {
        return response
      }),
    )

  }
  changeMessage(message: any) {
    this.messageSource.next(message)
  }

  // getFilteredCourseSearchResults(contentId:string): Observable<any> {
  //   const req = {
  //     request: {
  //       filters: {
  //         primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'],
  //         identifier:contentId
  //       },
  //     }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
  //   }
  //   const options = {
  //     url: API_END_POINTS.SEARCH_V6PUBLIC,
  //     payload: req,
  //   };
  //   return this.post(options)
  // }


  // tslint:disable-next-line:max-line-length
  fetchUserBatchList(userId: string | undefined): Observable<NsContent.ICourse[]> {
    const options = {
      url: API_END_POINTS.FETCH_USER_ENROLLMENT_LIST(userId),
    };
    return this.get(options).pipe(
      map(
        (data: any) => data.result.courses
      ),
    )
  }

 

  fetchHierarchyContent(contentId: string): Observable<NsContent.IContent> {
    const url = `${API_END_POINTS.COURSE_HIERARCHY}/${contentId}?hierarchyType=detail`
    const options = {
      url: url,
    };
    return this.get(options).pipe(
      retry(1),
    )
  }

  readContentV2(id: string): Observable<NsContent.IContent> {
    //  api/content/v1/read/do_11403571833375129614%27
    // let url = `/apis/proxies/v8/action/content/v3/read/${id}`;
    let url = `api/content/v1/read/${id}`;
    const options = {
      url: url,
    };
    return this.get(options).pipe(
      retry(1),
    )
  }

  processCertificate(req: any): Observable<any> {
    const url = `/apis/proxies/v8/course/batch/cert/v1/issue/`
    const options = {
      url: url,
      payload: req,
    };
    return this.post(options)
  }

  downloadCertificateAPI(certificateId: string): Observable<any> {
    const url = `/apis/proxies/v8/certreg/v2/certs/download/${certificateId}`
    const options = {
      url: url,
    };
    return this.get(options).pipe(
      retry(1),
    )
  }

  getCertificateAPI(certificateId: string): Observable<any> {
    const url = `/apis/proxies/v8/certreg/v2/certs/download/${certificateId}`
    const options = {
      url: url,
    };
    const apiData = this.get(options).pipe(
      retry(1), map(res => this._updateValue.next({ [certificateId]: res.result.printUri }))
    )
    return apiData
  }
  getMobileCertificateAPI(certificateId: string,userId:any): Observable<any> {
    const url = `/apis/public/v8/mobileApp/certificateDownload?userId=${userId}&certificateId=${certificateId}`;
    const options = {
      url: url,
    };
    const apiData = this.get(options).pipe(
      retry(1), map(res => this._updateValue.next({ [certificateId]: res.data.printUri }))
    )
    return apiData
  }
  fetchGeneralAndRcCertificates(userId: string | undefined): Observable<NsContent.ICourse[]> {
    const options = {
      url: API_END_POINTS.FETCH_GENERAL_RC_CERTIFICATE(userId),
    };
    return this.get(options).pipe(
      map(
        (data: any) => data
      ),
    )
  }

  fetchContent(
    contentId: string,
    hierarchyType: 'all' | 'minimal' | 'detail' = 'detail',
    _additionalFields: string[] = [],
    primaryCategory?: string | null,
  ): Observable<NsContent.IContent> {
    let url = ''
    if (primaryCategory && this.isResource(primaryCategory)) {
      url = `${API_END_POINTS.USER_READ_CONTENT}/${contentId}`
    } else {
      url = `${API_END_POINTS.COURSE_HIERARCHY}/${contentId}?hierarchyType=${hierarchyType}`
    }
    const options = {
      url: url,
    };
    return this.get(options).pipe(
      retry(1),
    )
  }

  isResource(primaryCategory: string) {
    if (primaryCategory) {
      const isResource = primaryCategory === NsContent.EResourcePrimaryCategories.LEARNING_RESOURCE
      return isResource
    }
    return false
  }

  fetchAuthoringContent(contentId: string): Observable<NsContent.IContent> {
    const url = `${API_END_POINTS.AUTHORING_CONTENT}/${contentId}`
    const options = {
      url: url,
    };
    return this.get(options).pipe(
      retry(1),
    )
  }
  fetchMultipleContent(ids: string[]): Observable<NsContent.IContent[]> {
    const url = `${API_PROTECTED_END_POINTS.MULTIPLE_CONTENT}/${ids.join(',')}`
    const options = {
      url: url,
    };
    return this.get(options)
  }
  fetchCollectionHierarchy(type: string, id: string, pageNumber: number = 0, pageSize: number = 1) {
    const url = `${API_PROTECTED_END_POINTS.COLLECTION_HIERARCHY(
      type,
      id,
    )}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    const options = {
      url: url,
    };
    return this.get(
      options
    )
  }
  enrollUserToBatch(req: any) {
    // console.log('Enoroll req: ', req)
    const options = {
      url: API_END_POINTS.ENROLL_BATCH,
      payload: req,
    };
    return this.post(options)
  }

  fetchContentLikes(contentIds: { content_id: string[] }) {
    const options = {
      url: API_PROTECTED_END_POINTS.CONTENT_LIKES,
      payload: contentIds,
    }
    return this.post(options).toPromise()
  }
  fetchContentRatings(contentIds: { contentIds: string[] }) {
    const options = {
      url: `${API_PROTECTED_END_POINTS.CONTENT_RATING}/rating`,
      payload: contentIds,
    }
    return this.post(options).toPromise()
  }

  fetchContentHistory(contentId: string): Observable<NsContent.IContinueLearningData> {
    const options = {
      url: `${API_PROTECTED_END_POINTS.CONTENT_HISTORY}/${contentId}`,
    }
    return this.get(options)
  }

  fetchContentHistoryV2(req: NsContent.IContinueLearningDataReq): Observable<NsContent.IContinueLearningData> {
    req.request.fields = ['progressdetails']
    const options = {
      url: `${API_END_POINTS.CONTENT_HISTORYV2}`,
      payload: req,
    };
    return this.post(options)
  }
  async continueLearning(id: string, collectionId?: string, collectionType?: string): Promise<any> {
    return new Promise(async resolve => {
      if (collectionType &&
        collectionType.toLowerCase() === 'playlist') {
        const reqBody = {
          contextPathId: collectionId ? collectionId : id,
          resourceId: id,
          data: JSON.stringify({
            timestamp: Date.now(),
            contextFullPath: [collectionId, id],
          }),
          dateAccessed: Date.now(),
          contextType: 'playlist',
        }
        await this.saveContinueLearning(reqBody).toPromise().catch().finally(() => {
          resolve(true)
        }
        )
      } else {
        const reqBody = {
          contextPathId: collectionId ? collectionId : id,
          resourceId: id,
          data: JSON.stringify({ timestamp: Date.now() }),
          dateAccessed: Date.now(),
        }
        await this.saveContinueLearning(reqBody).toPromise().catch().finally(() => {
          resolve(true)
        })
      }
    })
  }
  saveContinueLearning(content: NsContent.IViewerContinueLearningRequest): Observable<any> {
    const url = API_PROTECTED_END_POINTS.USER_CONTINUE_LEARNING
    const options = {
      url: url,
      payload: content,
    };
    return this.post(options)
  }

  setS3Cookie(
    contentId: string,
    // _path: string,
  ): Observable<any> {
    const options = {
      url: API_PROTECTED_END_POINTS.SET_S3_COOKIE,
      payload: { contentId },
    };
    return this.post(options).pipe(catchError(_err => of(true)))
  }

  setS3ImageCookie(): Observable<any> {
    const options = {
      url: API_PROTECTED_END_POINTS.SET_S3_IMAGE_COOKIE,
      payload: {},
    };
    return this.post(options).pipe(catchError(_err => of(true)))
  }

  fetchManifest(url: string): Observable<any> {
    const options = {
      url: API_PROTECTED_END_POINTS.FETCH_MANIFEST,
      payload: { url },
    };
    return this.post(options)
  }
  fetchWebModuleContent(url: string): Observable<any> {
    const options = {
      url: API_PROTECTED_END_POINTS.FETCH_WEB_MODULE_FILES,
      payload: { url: encodeURIComponent(url) },
    };
    return this.get(options)
  }
  search(req: NSSearch.ISearchRequest): Observable<NSSearch.ISearchApiResult> {
    req.query = req.query || ''
    const options = {
      url: API_PROTECTED_END_POINTS.CONTENT_SEARCH_V5,
      payload: { request: req, },
    };
    return this.post(options)
  }

  searchRegionRecommendation(
    req: NSSearch.ISearchOrgRegionRecommendationRequest,
  ): Observable<NsContentStripMultiple.IContentStripResponseApi> {
    req.query = req.query || ''
    req.preLabelValue =
      (req.preLabelValue || '') +
      ((this.configSvc.userProfile && this.configSvc.userProfile.country) || '')
    req.filters = {
      ...req.filters,
      labels: [req.preLabelValue || ''],
    }
    const options = {
      url: API_PROTECTED_END_POINTS.CONTENT_SEARCH_REGION_RECOMMENDATION,
      payload: { request: req },
    };
    return this.post(options)
  }
  searchV6(req: NSSearch.ISearchV6Request) {
    req.query = req.query || ''
    req.sort = [
      {
        lastUpdatedOn: 'desc',
      },
    ]
    const options = {
      url: API_END_POINTS.GET_CORUSES,
      payload: req,
    };
    return this.post(options)
  }

  publicContentSearch(req: NSSearch.ISearchV6Request, defaultLang = '') {
    req.query = req.query || ''
    req.request.filters['lang'] = defaultLang
    const options = {
      url: API_END_POINTS.GET_CORUSES,
      payload: req,
    };
    return this.post(options)
  }
  fetchContentRating(contentId: string): Observable<{ rating: number }> {
    const url = `${API_PROTECTED_END_POINTS.CONTENT_RATING}/${contentId}`
    const options = {
      url: url,
    };
    return this.get(options)
  }
  deleteContentRating(contentId: string): Observable<any> {
    const options = {
      url: `${API_PROTECTED_END_POINTS.CONTENT_RATING}/${contentId}`,
    }
    return this.delete(options)
  }
  addContentRating(contentId: string, data: { rating: number }): Observable<any> {
    const options = {
      url: `${API_PROTECTED_END_POINTS.CONTENT_RATING}/${contentId}`,
      payload: data,
    };
    return this.post(options)
  }

  getFirstChildInHierarchy(content: NsContent.IContent): NsContent.IContent {
    if (!(content.children || []).length) {
      return content
    }
    if (
      content.contentType === 'Learning Path' &&
      !(content.artifactUrl && content.artifactUrl.length)
    ) {
      const child = content.children[0]
      return this.getFirstChildInHierarchy(child)
    }
    if (
      content.contentType === 'Resource' ||
      content.contentType === 'Knowledge Artifact' ||
      content.contentType === 'Learning Path'
    ) {
      return content
    }
    const firstChild = content.children[0]
    const resultContent = this.getFirstChildInHierarchy(firstChild)
    return resultContent
  }

  getRegistrationStatus(source: string): Promise<{ hasAccess: boolean; registrationUrl?: string }> {
    const url = `${API_PROTECTED_END_POINTS.REGISTRATION_STATUS}/${source}`
    const options = {
      url: url,
    };
    return this.get(options).toPromise()
  }

  fetchConfig(url: string) {
    const options = {
      url: url,
    };
    return this.get(options)
  }

  loginAuth(req: any): Observable<any> {
    const options = {
      url: API_END_POINTS.LOGIN_USER,
      payload: req,
    };
    return this.post(options).pipe(retry(1),
      map(
        (data: any) => data
      )
    )
  }
  googleAuthenticate(req: any): Observable<any> {
    const options = {
      url: API_END_POINTS.GOOGLE_AUTHENTICATE,
      payload: req,
    };
    return this.post(options).pipe(catchError(this.handleErrors))
  }
  handleErrors(error: HttpErrorResponse) {
    return throwError(error)
  }
  fetchCourseBatches(req: any): Observable<NsContent.IBatchListResponse> {
    const options = {
      url: API_END_POINTS.COURSE_BATCH_LIST,
      payload: req,
    };
    return this.post(options).pipe(
      retry(1),
      map(
        (data: any) => data.result.response
      )
    )
  }

  getLatestCourse() {
    const url = `${API_END_POINTS.LATEST_HOMEPAGE_COURSE}`
    const options = {
      url: url,
    };
    return this.get(options)
  }

  getLiveSearchResults(lang : string): Observable<any> {
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'],lang: lang
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    const options = {
      url: API_END_POINTS.SEARCH_V6PUBLIC,
      payload: req,
    };
    return this.post(options)
  }

  getFilteredCourseSearchResults(contentId:string): Observable<any> {
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'],
          identifier:contentId
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    const options = {
      url: API_END_POINTS.SEARCH_V6PUBLIC,
      payload: req,
    };
    return this.post(options)
  }

  set showConformation(completionPersentage: any) {
    this._showConformation = completionPersentage !== 100 ? true : false
  }

  get showConformation() {
    return this._showConformation;
  }
  set callNavigateBatchId(value: boolean) {
    this._callNavigateBatchId = value;
  }

  get callNavigateBatchId(): boolean {
    return this._callNavigateBatchId;
  }
  get collectionId(): string {
    return this._collectionId;
  }

  // Setter for collectionId
  set collectionId(newCollectionId: string) {
    this._collectionId = ''
    console.log('Setting collectionId to:', newCollectionId);
    this._collectionId = newCollectionId;
  }
}
