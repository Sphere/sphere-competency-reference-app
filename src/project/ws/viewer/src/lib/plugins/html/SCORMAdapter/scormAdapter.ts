/* tslint:disable */
import { Injectable } from '@angular/core'
import { Storage, IScromData } from './storage'
import { errorCodes } from './errors'
import _ from 'lodash'
import { HttpBackend, HttpClient } from '@angular/common/http'
import { ActivatedRoute, Router } from '@angular/router'
import * as dayjs from 'dayjs'
import { ViewerDataService } from 'project/ws/viewer/src/lib/viewer-data.service'
import { Subscription } from 'rxjs'
import { ViewerUtilService } from '../../../viewer-util.service'
import { OfflineCourseOptimisticService } from '../../../../../../../../app/modules/shared/services/offline-course-optimistic.service'
import { SqliteService } from '../../../../../../../../app/modules/shared/services/sqlite.service'
import { ConfigurationsService } from '../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { EnqueueService } from '../../../../../../../../library/ws-widget/utils/src/lib/services/enqueue.service'
import { WidgetContentService } from '../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { NsContent } from '../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { API_PROTECTED_END_POINTS, API_PROXIES_END_POINTS } from 'app/apiConstants'

//import { ViewerDataService } from '../../../viewer-data.service'
@Injectable({
  providedIn: 'root',
})
export class SCORMAdapterService {
  id = ''
  scromSubscription: Subscription | null = null
  isScromChangeSubjectInProgress: boolean = false;
  constructor(
    private store: Storage,
    private http: HttpClient,
    handler: HttpBackend,
    private activatedRoute: ActivatedRoute,
    private configSvc: ConfigurationsService,
    private viewerDataSvc: ViewerDataService,
    private router: Router,
    private enqueueService: EnqueueService,
    private viewerSvc: ViewerUtilService,
    private contentSvc: WidgetContentService,
    private offlineCourseOptimisticService:OfflineCourseOptimisticService,
    private sqliteService:SqliteService
  ) {
    this.http = new HttpClient(handler)
  }

  set contentId(id: string) {
    this.store.key = id
    this.id = id
  }

  get contentId() {
    return this.id
  }

  LMSInitialize() {
    this.store.contentKey = this.contentId
    this.store.setItem('Initialized', true)
    return true
  }

  LMSFinish() {
    if (!this._isInitialized()) {
      this._setError(301)
      return false
    }
    this.viewerDataSvc.scromChangeSubject.next(
      {
        'completed': true,
        'batchId':
          this.activatedRoute.snapshot.queryParamMap.get('batchId'),
        'collectionId': this.activatedRoute.snapshot.queryParams.collectionId
        , 'collectionType': this.activatedRoute.snapshot.queryParams.collectionType,
      }
    )
    let _return = this.LMSCommit()
    this.store.setItem('Initialized', false)
    this.store.clearAll()
    return _return
  }

  LMSGetValue(element: any) {
    if (!this._isInitialized()) {
      this._setError(301)
      return false
    }
    let value = this.store.getItem(element)
    if (!value) {
      this._setError(201)
      return ""
    }
    return value
  }

  LMSSetValue(element: any, value: any) {
    if (!this._isInitialized()) {
      this._setError(301)
      return false
    }
    this.store.setItem(element, value)
    return this.store.getItem(element)
  }

  public emitScromChangeSubject(completed: boolean,percent:any) {
    if (!this.isScromChangeSubjectInProgress) {
      this.isScromChangeSubjectInProgress = true;
      const couseLocalProgressData = this.updateOfflineLocalProgressData(this.activatedRoute.snapshot.queryParams.collectionId,percent,this.contentId,2)
      return couseLocalProgressData
    }
  }

  LMSCommit() {
    const data = this.store.getAll();

    if (!data) {
      return false;
    }

    if (!navigator.onLine && this.getPercentage(data) === 100) {
        let req: any;
        if (this.configSvc.userProfile) {
          req = {
            request: {
              userId: this.configSvc.userProfile.userId || '',
              contents: [
                {
                  contentId: this.contentId,
                  batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
                  courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
                  status: this.getStatus(data) || 2,
                  lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                  completionPercentage: this.getPercentage(data) || 0,
                  progressdetails: data,
                },
              ],
            },
          };
        }
        return this.enqueueService.scromEnqueue(req)
          .then((response) => {
            console.log('enqueue-response scrom- ', response);
            this.emitScromChangeSubject(true,this.getPercentage(data));
            return true;
          })
          .catch((error) => {
            // Handle any errors from scromEnqueue
            console.error('Error in scromEnqueue:', error);
            return false;
          });
      }
    return true;
  }

  async updateOfflineLocalProgressData(collectionId: string, percent: number,identifier:any,status): Promise<void> {
    let userId
      if (this.configSvc.userProfile) {
        userId = this.configSvc.userProfile.userId || ''
      }
    await this.offlineCourseOptimisticService.insertCourseProgress(collectionId, this.contentId, userId, percent, this.activatedRoute.snapshot.queryParams.batchId, 'SCORM', this.contentId,  status)
    const couseLocalProgressData = await this.offlineCourseOptimisticService.courseProgressRead(collectionId)
    await this.offlineCourseOptimisticService.updateLastReadContentId(collectionId, identifier, couseLocalProgressData);
    await this.sqliteService.updateResumeData(collectionId)
    this.contentSvc.changeMessage(
      {
        type: 'scrom',
        progressData: couseLocalProgressData.result
      }
    )
    this.isScromChangeSubjectInProgress = false
  }

  LMSGetLastError() {
    const newErrors = JSON.parse(this.store.getItem('errors') || '[]')
    if (newErrors && newErrors.length > 0) {
      return newErrors.pop()
    }
    return ""
  }

  LMSGetErrorString(errorCode: number) {
    let error = errorCodes[errorCode]
    if (!error) return ""
    return error[errorCode]["errorString"]
  }

  LMSGetDiagnostic(errorCode: number) {
    let error = errorCodes[errorCode]
    if (!error) return ""
    return error[errorCode]["diagnostic"]
  }

  _isInitialized() {
    let initialized = this.store.getItem('Initialized')
    return initialized
  }

  _setError(errorCode: number) {
    let errors = this.store.getItem('errors')
    if (!errors) errors = '[]'
    const newErrors = JSON.parse(errors)
    if (newErrors && typeof (newErrors) === 'object') {
      newErrors.push(errorCode)
    }
    this.store.setItem('errors', errors)
  }
  loadDataAsync() {
    return this.http.get<any>(API_PROTECTED_END_POINTS.SCROM_FETCH + '/' + this.contentId)
  }

  downladFile(url: any) {
    return this.http.get(url, { responseType: 'blob' })
  }

  loadDataV2() {
    let userId
    if (this.configSvc.userProfile) {
      userId = this.configSvc.userProfile.userId || ''
    }
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        userId,
        batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
        courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
        contentIds: [],
        fields: ['progressdetails'],
      },
    }
    this.http.post<NsContent.IContinueLearningData>(
      `${API_PROXIES_END_POINTS.SCROM_FETCH_PROGRESS}/${req.request.courseId}`, req
    ).subscribe(
      data => {
        // tslint:disable-next-line: no-console
        // console.log(data)
        if (data && data.result && data.result.contentList.length) {
          for (const content of data.result.contentList) {
            // tslint:disable-next-line: no-console
            // console.log('loading state for ', content)
            if (content.contentId === this.contentId && content.progressdetails) {
              const data = content.progressdetails
              const loadDatas: IScromData = {
                "cmi.core.exit": data["cmi.core.exit"],
                "cmi.core.lesson_status": data["cmi.core.lesson_status"],
                "cmi.core.session_time": data["cmi.core.session_time"],
                "cmi.suspend_data": data["cmi.suspend_data"],
                Initialized: data["Initialized"],
                // errors: data["errors"]
              }
              // tslint:disable-next-line: no-console
              // console.log('loaded data', loadDatas)
              this.store.setAll(loadDatas)
            }
          }
        }
      },
    )
  }

  loadData() {
    this.http.get<any>(API_PROTECTED_END_POINTS.SCROM_FETCH + '/' + this.contentId).subscribe((response) => {
      const data = response.result.data
      const loadDatas: IScromData = {
        "cmi.core.exit": data["cmi.core.exit"],
        "cmi.core.lesson_status": data["cmi.core.lesson_status"],
        "cmi.core.session_time": data["cmi.core.session_time"],
        "cmi.suspend_data": data["cmi.suspend_data"],
        Initialized: data["Initialized"],
        // errors: data["errors"]
      }
      this.store.setAll(loadDatas)
    }, (error) => {
      if (error) {
        // // console.log(error)
        this._setError(101)
      }
    })
  }
  addData(postData: IScromData) {
    this.http.post(API_PROTECTED_END_POINTS.SCROM_ADD_UPDTE + '/' + this.contentId, postData, {
      headers: {
        'content-type': 'application/json'
      }
    })
    return this.http.post(API_PROTECTED_END_POINTS.SCROM_ADD_UPDTE + '/' + this.contentId, postData)
  }

  getStatus(postData: any): number {
    try {
      if (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed') {
        return 2
      }
      return 1
    } catch (e) {
      // tslint:disable-next-line: no-console
      // console.log('Error in getting completion status', e)
      return 1
    }
  }
  getPercentage(postData: any): number {
    try {
      if (postData["cmi.core.lesson_status"] === 'completed' || postData["cmi.core.lesson_status"] === 'passed') {
        return 100
      }
      return 0
    } catch (e) {
      // tslint:disable-next-line: no-console
      // console.log('Error in getting completion status', e)
      return 0
    }
  }
  addDataV2(postData: IScromData) {
    let req: any
    if (this.configSvc.userProfile) {
      req = {
        request: {
          userId: this.configSvc.userProfile.userId || '',
          contents: [
            {
              contentId: this.contentId,
              batchId: this.activatedRoute.snapshot.queryParamMap.get('batchId') || '',
              courseId: this.activatedRoute.snapshot.queryParams.collectionId || '',
              status: this.getStatus(postData) || 2,
              lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
              progressdetails: postData,
              completionPercentage: this.getPercentage(postData) || 0
            },
          ],
        },
      }

    } else {
      req = {}
    }
    return this.http.patch(`${API_PROXIES_END_POINTS.SCROM_UPDTE_PROGRESS}/${this.contentId}`, req)
  }
  ngOnDestroy() {
    if (this.scromSubscription) {
      this.scromSubscription.unsubscribe()
    }
  }
}
