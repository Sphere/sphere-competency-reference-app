import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { Inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { noop, Observable, BehaviorSubject } from 'rxjs'
import * as dayjs from 'dayjs'
import { NsContent } from '../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { CordovaHttpService } from '../../../../../app/modules/core/services/cordova-http.service'
import { ToastService, LocalStorageService } from '../../../../../app/manage-learn/core'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { ModalController } from '@ionic/angular'
import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import * as _ from 'lodash';
import { localStorageConstants } from '../../../../../app/manage-learn/core/constants/localStorageConstants';
import { SqliteService } from '../../../../../app/modules/shared/services/sqlite.service'
import { buildConfig } from '../../../../../../configurations/configuration'

@Injectable({
  providedIn: 'root',
})
export class ViewerUtilService extends CordovaHttpService {
  API_ENDPOINTS = {
    setS3Cookie: `/apis/v8/protected/content/setCookie`,
    // PROGRESS_UPDATE: `/apis/proxies/v8/content-progres`,
    // PROGRESS_UPDATE: `/api/course/v1/content/state/update`,
    PROGRESS_UPDATE: '/apis/public/v8/mobileApp/v2/updateProgress',
    SCORM_UPDATE: `/apis/proxies/v8/getContents/`,
    COURSE_RATING: `/apis/public/v8/mobileApp/ratings/upsert`,
    READ_COURSE_RATING: `apis/public/v8/mobileApp/ratings/v2/read`,
    READ_COURSE_RATING_SUMMARY: (courseId) => `apis/public/v8/mobileApp/ratings/summary?courseId=${courseId}`
  }
  downloadRegex = new RegExp(`(/content-store/.*?)(\\\)?\\\\?['"])`, 'gm')
  authoringBase = '/apis/authContent/'
  competencyAsessment = new BehaviorSubject<any>(false)
  competencyAsessment$ = this.competencyAsessment.asObservable()
  constructor(
    public http: HttpClient,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP,
    private configservice: ConfigurationsService,
    private localStorageService: LocalStorageService,
    private sqliteService: SqliteService,

  ) {
    super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
    !this.baseUrl ? 'https://'+buildConfig.SITEPATH : '';
  }

  private currentResource = new BehaviorSubject<NsContent.IContent | null>(null)
  castResource = this.currentResource.asObservable()

  editResourceData(newResource: any) {
    this.currentResource.next(newResource)
  }

  async fetchManifestFile(url: string) {
    this.setS3Cookie(url)
    const manifestFile = await this.http
      .get<any>(url)
      .toPromise()
      .catch((_err: any) => { })
    return manifestFile
  }

  private async setS3Cookie(contentId: string) {
    const options = {
      url: this.API_ENDPOINTS.setS3Cookie,
      payload: { contentId },
    };
    await this.post(options)
      .toPromise()
      .catch((_err: any) => { })
    return
  }

  calculatePercent(current: any, max: number, mimeType?: string): number {
    try {
      // const temp = [...current]
      const temp = current
      if (temp && max) {
        if (
          mimeType === NsContent.EMimeTypes.MP4 ||
          mimeType === NsContent.EMimeTypes.M3U8 ||
          mimeType === NsContent.EMimeTypes.MP3 ||
          mimeType === NsContent.EMimeTypes.M4A
        ) {
          const percent = (current / max) * 100
          return Math.ceil(percent)
          // if (percent <= 5) {
          //   // if percentage is less than 5% make it 0
          //   percent = 0
          // } else if (percent >= 95) {
          //   // if percentage is greater than 95% make it 100
          //   percent = 100
          // }
        } if (mimeType === NsContent.EMimeTypes.TEXT_WEB) {
          return 100
        } if (mimeType === NsContent.EMimeTypes.ZIP) {
          return 100

        } if (mimeType === NsContent.EMimeTypes.PDF) {

          const latest = parseFloat(temp.slice(-1) || '0')
          // const latest = parseFloat(temp[temp.length - 1] || '0')
          const percentMilis = (latest / max) * 100
          const percent = parseFloat(percentMilis.toFixed(2))
          return percent
        }
        return 2

      }
      return 0
    } catch (e) {
      // tslint:disable-next-line: no-console
      // console.log('Error in calculating percentage', e)
      return 0
    }
  }

  getStatus(current: number, max: number, mimeType: string) {
    try {
      const percentage = this.calculatePercent(current, max, mimeType)
      // for videos and audios
      if (
        mimeType === NsContent.EMimeTypes.MP4 ||
        mimeType === NsContent.EMimeTypes.M3U8 ||
        mimeType === NsContent.EMimeTypes.MP3 ||
        mimeType === NsContent.EMimeTypes.M4A
      ) {
        if (Math.ceil(percentage) <= 1) {
          return 0
        }
        // if percentage is less than 6% then make status started
        if (Math.ceil(percentage) >= 5 && Math.ceil(percentage) <= 6) {
          return 1
        }
        // if percentage is greater than 95% then make status complete
        if (Math.ceil(percentage) >= 95) {
          return 2
        }
      } else if (mimeType === NsContent.EMimeTypes.TEXT_WEB) {
        // if (current === 1) {
        //   return 0
        // }
        // if (current === 5) {
        //   return 1
        // }
        // if (current === 10) {
        //   return 2
        // }
        return 2
      } else if (mimeType === NsContent.EMimeTypes.PDF) {
        if (percentage <= 25) {
          return 0
        } if (percentage > 26 && percentage <= 75) {
          return 1
        }
        return 2

      } else if (mimeType === NsContent.EMimeTypes.ZIP) {
        return 2
      } else {
        return 1
      }
      return 0
    } catch (e) {
      // tslint:disable-next-line: no-console
      // console.log('Error in getting completion status', e)
      return 1
    }
  }

  realTimeProgressUpdate(contentId: string, request: any, collectionId?: string, batchId?: string): Observable<any> {
    return new Observable((observer) => {
      if (this.configservice.userProfile) {
        this.checkResourceIdAndCourseId(contentId, collectionId, request.mime_type)
          .then((checkCollectionId) => {
            let courseId = checkCollectionId ? checkCollectionId : collectionId;
            let percentage = this.calculatePercent(request.current, request.max_size, request.mime_type);
            if (percentage > 95) {
              percentage = 100;
            }
  
            const req = {
              request: {
                userId: this.configservice.userProfile.userId || '',
                contents: [
                  {
                    contentId,
                    batchId,
                    status: this.getStatus(request.current, request.max_size, request.mime_type),
                    courseId: courseId,
                    lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
                    progressdetails: {
                      max_size: request.max_size,
                      current: request.current,
                      mimeType: request.mime_type,
                    },
                    completionPercentage: percentage,
                  },
                ],
              },
            };
  
            const options = {
              url: `${this.API_ENDPOINTS.PROGRESS_UPDATE}`,
              payload: req,
            };
  
            this.post(options).subscribe(
              (response) => {
                observer.next(response);
                observer.complete();
              },
              (error) => {
                observer.error(error);
              }
            );
          })
          .catch((err) => {
            console.error("Error in checkResourceIdAndCourseId:", err);
            observer.error(err);
          });
      } else {
        observer.error(new Error("User profile is not available"));
      }
    });
  }
  

  realTimeProgressUpdateQuiz(contentId: string, collectionId?: string, batchId?: string, status?: number) {
    let req: any
    if (this.configservice.userProfile) {
      req = {
        request: {
          userId: this.configservice.userProfile.userId || '',
          contents: [
            {
              contentId,
              batchId,
              status: status || 2,
              courseId: collectionId,
              lastAccessTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss:SSSZZ'),
            },
          ],
        },
      }
    } else {
      req = {}
    }
    const options = {
      url: `${this.API_ENDPOINTS.PROGRESS_UPDATE}/${contentId}`,
      payload: req,
    };
    this.patch(options)
      .subscribe(noop, noop)
  }
  public async generateProgressAPIBySqllite(contentId, batchId, courseId, collectionId, mimeType, completionPercentage?: any) {
    let percentage: any
    const mockResponse = {
      id: "api.content.state.read",
      ver: "v1",
      ts: "2023-12-26 11:41:00:967+0000",
      params: {
        resmsgid: null,
        msgid: "ca467790-6210-4eb2-86b8-e9b1144fee41",
        err: null,
        status: "success",
        errmsg: null
      },
      responseCode: "OK",
      result: {
        contentList: []
      }
    };
    if (completionPercentage !== undefined && completionPercentage !== null) {
      percentage = completionPercentage;
    } else {
      percentage = 100;
    }
    console.log('completionPercentage', percentage)
    try {
      const existingData: any = await this.sqliteService.fetchDataByCourseId(courseId);
      console.log('progressData', existingData);
      if (existingData && existingData.length > 0) {
        const contentExists = existingData.some(item => item.contentId === contentId);
        if (!contentExists) {
          await this.handleUpdateData(courseId, contentId, percentage, batchId, mimeType, mockResponse);
        } else {
          await this.handleUpdateData(courseId, contentId, percentage, batchId, mimeType, mockResponse);
        }
      } else {
        await this.handleUpdateData(courseId, contentId, percentage, batchId, mimeType, mockResponse);
      }
    } catch (error) {
      console.error(error);
      /* Regardless of whether an error occurs, insert data into SQLite */
      //await this.sqliteService.insertData(courseId, contentId, this.configservice.userProfile.userId, percentage, batchId, mimeType);
    }
    return mockResponse;
  }
  public async getFilteredContent(contentId, courseId) {
    const mockResponse = await this.sqliteService.mockProgressAPIFormatedList(courseId);

    if (mockResponse && mockResponse.result && mockResponse.result.contentList) {
      const filteredContent = _.filter(mockResponse.result.contentList, { 'contentId': contentId });
      return {
        mockResponse: mockResponse,
        filteredContent: filteredContent
      };
    } else {
      return {
        mockResponse: mockResponse,
        filteredContent: []
      };
    }
  }


  private async handleUpdateData(courseId, contentId, percentage, batchId, mimeType, mockResponse) {
    //await this.sqliteService.insertData(courseId, contentId, this.configservice.userProfile.userId, percentage, batchId, mimeType);
    const newExistingData: any = await this.sqliteService.fetchDataByCourseId(courseId);
    console.log('progressData', newExistingData);
    const updatedData = this.generateUpdatedData(newExistingData, mimeType);
    console.log('updatedData', updatedData);
    const uniqueUpdatedData = _.uniqBy(updatedData, 'contentId');
    mockResponse.result.contentList = uniqueUpdatedData;
    await this.localStorageService.setLocalStorage(courseId + 'resumeData', mockResponse.result.contentList);
    await this.updateLastReadContentId(courseId, contentId, mockResponse);
  }

  private generateUpdatedData(dataList, mimeType) {
    return _.map(dataList, data =>
      _.merge({
        viewCount: null,
        progressdetails: (mimeType === 'application/pdf' || mimeType === 'video/mp4') ? {
          max_size: 546.2,
          current: ["519.04202"],
          mimeType
        } : null,
        status: 2
      }, data)
    );
  }

  public async updateLastReadContentId(courseId, contentId, mockResponse?: any) {
    const courses = await this.localStorageService.getLocalStorage(courseId);
    if (courses) {
      const coursesList = _.get(courses, 'result.courses', []);
      const courseToUpdate = coursesList.find(course => course.courseId === courseId);

      if (courseToUpdate) {
        courseToUpdate.lastReadContentId = contentId;

        const sdkContent = await this.localStorageService.getLocalStorage('sdk_content' + courseId);

        if (sdkContent) {
          const leafContentIds = Array.from(this.getLeafNodeIdsWithoutDuplicates([sdkContent]));
          const unitLevelViewedContents = mockResponse?.result?.contentList
            .filter(c => c.status === 2 && c.completionPercentage == 100 && leafContentIds.includes(c.contentId))
            .map(c => c.contentId);

          courseToUpdate.completionPercentage = Math.round((unitLevelViewedContents.length / leafContentIds.length) * 100);
        }
        await this.localStorageService.setLocalStorage(courseId, courses);
      }
    }
  }


  public async setLocalStorageOnError(key, value) {
    await this.localStorageService.setLocalStorage(key, value);
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
  scormUpdate(artifactUrl: string): Observable<any> {
    const options = {
      url: `${this.API_ENDPOINTS.SCORM_UPDATE}${artifactUrl}`,
      payload: { responseType: 'text' as 'json' },
    };
    return this.get(options)
    // return this.http.get(`${this.API_ENDPOINTS.SCORM_UPDATE}${artifactUrl}`, { responseType: 'text' as 'json' })
  }
  getContent(contentId: string): Observable<NsContent.IContent> {
    const url = `/apis/authApi/action/content/hierarchy/${contentId}?rootOrg=${this.configservice.rootOrg || 'aastar'}&org=${this.configservice.activeOrg || 'dopt'}`
    const options = {
      url: url,
    };
    return this.get(options)
  }

  getAuthoringUrl(url: string): string {
    return url
      // tslint:disable-next-line:max-line-length
      ? `/apis/authContent/${url.includes('/content-store/') ? new URL(url).pathname.slice(1) : encodeURIComponent(url)}`
      : ''
  }
  getCompetencyAuthoringUrl(url: string): string {
    return `apis/public/v8/mobileApp/v1/assessment/content${url}`
  }
  regexDownloadReplace = (_str = '', group1: string, group2: string): string => {
    return `${this.authoringBase}${encodeURIComponent(group1)}${group2}`
  }

  replaceToAuthUrl(data: any): any {
    return JSON.parse(
      JSON.stringify(data).replace(
        this.downloadRegex,
        this.regexDownloadReplace,
      ),
    )
  }

  downloadContent(url) {
    return this.http.get(url, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    })
  }

  submitCourseRating(req: any) {
    const options = {
      url: this.API_ENDPOINTS.COURSE_RATING,
      payload: req
    };
    return this.post(options)
  }
  readCourseRating(req: any) {
    const options = {
      url: this.API_ENDPOINTS.READ_COURSE_RATING,
      payload: req
    };
    return this.post(options)

  }
  readCourseRatingSummary(req: any) {
    const options = {
      url: this.API_ENDPOINTS.READ_COURSE_RATING_SUMMARY(req.activityId),
      payload: req
    };
    return this.get(options)
  }

  checkResourceIdAndCourseId(resourceId: any, courseId: any, playerType?: any): Promise<any> {
    if (resourceId === courseId) {
      console.log('playerType', playerType);
      return this.localStorageService.getLocalStorage(localStorageConstants.COLLECTION_DATA)
        .then((collectionData: any) => {
          if (collectionData) {
            console.log('collectionData', collectionData);
            return collectionData.identifier;
          }
          return null;
        })
        .catch((err) => {
          console.error(err);
          return null; 
        });
    }
    return Promise.resolve(null);
  }
  
  

}
