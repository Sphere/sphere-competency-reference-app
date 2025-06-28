import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ReplaySubject, Observable, from } from 'rxjs'
import { NsAnalytics } from '../../../../app-toc/models/app-toc-analytics.model'
import { map } from 'rxjs/operators'
import { TFetchStatus } from '../../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants'
import { WidgetContentService } from '../../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service'
import { API_PROTECTED_END_POINTS, API_PROXIES_END_POINTS } from 'app/apiConstants'

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  analyticsFetchStatus: TFetchStatus = 'none'
  private analyticsReplaySubject: ReplaySubject<any> = new ReplaySubject(0)
  constructor(private http: HttpClient, private contentSvc: WidgetContentService) { }

  fetchLearningPathData(): Observable<any> {
    return this.http.get(`${API_PROTECTED_END_POINTS.NAVIGATOR_LP}`)
  }

  fetchFullStackData(): Observable<any> {
    return this.http.get(`${API_PROTECTED_END_POINTS.NAVIGATOR_FS}`)
  }
  fetchNavigatorRoles(): Observable<any> {
    return this.http.get(`${API_PROTECTED_END_POINTS.NAVIGATOR_ROLES}`)
  }
  fetchNavigatorTopics(): Observable<any> {
    return this.http.get(`${API_PROXIES_END_POINTS.NAVIGATOR_LP_DATA}`).pipe(
      map((data: any) => {
        const topics = new Set()
        data.lp_data.forEach((lp: any) => {
          lp.profiles.forEach((profile: any) => {
            profile.technology.forEach((technology: string) => {
              topics.add(technology.trim())
            })
          })
        })
        return Array.from(topics)
      })
    )
  }

  fetchCommonsData(): Observable<any> {
    return this.http.get(`${API_PROXIES_END_POINTS.NAVIGATOR_COMMONS_DATA}`)
  }

  fetchRolesVariantData(roleId: string, variantId: string): Observable<any> {
    return this.http.get(`${API_PROTECTED_END_POINTS.NAVIGATOR_ROLE}/${roleId}/${variantId}`)
  }

  fetchLearningPathIdData(lpId: string): Observable<any> {
    return this.http.get(`${API_PROTECTED_END_POINTS.NAVIGATOR_LP}/${lpId}`)
  }

  fetchBpmData(): Observable<any> {
    return this.http.get(`${API_PROTECTED_END_POINTS.NAVIGATOR_BPM_DATA}`)
  }

  fetchContentAnalyticsData(tagName: string) {
    if (this.analyticsFetchStatus !== 'fetching' && this.analyticsFetchStatus !== 'done') {
      this.getContentAnalytics(tagName)
    }
    return this.analyticsReplaySubject
  }
  getContentAnalytics(tagName: string): Observable<NsAnalytics.IAnalyticsResponse> {
    this.analyticsFetchStatus = 'fetching'
    // tslint:disable-next-line: max-line-length
    const url = `/apis/proxies/v8/LA/LA/apis/public/v8/mobileApp/kong/participants?aggsSize=1000&endDate=${this.endDate}&startDate=${this.startDate}&from=0&refinementfilter=${encodeURIComponent('"source":["Wingspan","Learning Hub"]')}$${encodeURIComponent(`"topics": ["${tagName}"]`)}`
    // this.http
    //   .get(url)
    //   .subscribe(
    //     result => {
    //       this.analyticsFetchStatus = 'done'
    //       this.analyticsReplaySubject.next(result)
    //     },
    //     () => {
    //       this.analyticsReplaySubject.next(null)
    //       this.analyticsFetchStatus = 'done'
    //     },
    // )
    return this.http.get<NsAnalytics.IAnalyticsResponse>(url)
  }

  fetchImageForContentID(contentId: string): Observable<any> {
    if (contentId) {
      const ids: string[] = []
      ids.push(contentId)
      return this.contentSvc.fetchMultipleContent(ids)
    }
    return from([''])

  }

  fetchImageForContentIDs(contentIds: string[]): Observable<any> {
    return this.contentSvc.fetchMultipleContent(contentIds)
  }

  private get endDate() {
    return `${new Date().getFullYear()}-${`0${new Date().getMonth() + 1}`.slice(-2)}-${`0${new Date().getDate()}`.slice(-2)}`
  }
  private get startDate() {
    return `2018-04-01`
  }
}
