import { Inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { ISocialSearchRequest, ISocialSearchResult, ISearchAutoComplete } from '../models/search.model'
import { map } from 'rxjs/operators'
import { DataService } from '../../../../../../../../app/modules/core/services/data.service'
import { AuthService } from 'sunbird-sdk';
import _ from 'lodash'
import { buildConfig } from '../../../../../../../../../configurations/configuration'
import { NSSearch } from '../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-search.model'
import { API_END_POINTS, API_PROTECTED_END_POINTS, API_PROXIES_END_POINTS } from 'app/apiConstants'


// const facetsOb = {
//   facets: [
//     {
//       values: [
//         {
//           name: 'learning resource',
//           count: 59,
//         },
//         {
//           name: 'course',
//           count: 18,
//         },
//         {
//           name: 'asset',
//           count: 20,
//         },
//       ],
//       name: 'primaryCategory',
//     },
//     {
//       values: [
//         {
//           name: 'application/vnd.ekstep.html-archive',
//           count: 4,
//         },
//         {
//           name: 'image/png',
//           count: 2,
//         },
//         {
//           name: 'text/x-url',
//           count: 12,
//         },
//         {
//           name: 'image/jpeg',
//           count: 22,
//         },
//         {
//           name: 'application/pdf',
//           count: 20,
//         },
//         {
//           name: 'application/vnd.ekstep.content-collection',
//           count: 18,
//         },
//         {
//           name: 'application/vnd.ekstep.ecml-archive',
//           count: 3,
//         },
//         {
//           name: 'video/x-youtube',
//           count: 2,
//         },
//         {
//           name: 'video/mp4',
//           count: 13,
//         },
//         {
//           name: 'audio/mpeg',
//           count: 1,
//         },
//       ],
//       name: 'mimeType',
//     },
//   ],
// }

@Injectable({
  providedIn: 'root',
})
export class SearchApiService extends DataService {
  constructor(
    public http: HttpClient,
    @Inject('AUTH_SERVICE') public authService: AuthService,
  ) {
    super(http, authService)
    this.baseUrl = 'https://'+buildConfig.SITEPATH;
  }

  get userId(): any {
      return
  }
  // private messageSource = new BehaviorSubject<any>([''])
  // public currentMessage = this.messageSource.asObservable()
  getSearchResults(request: ISocialSearchRequest): Observable<ISocialSearchResult> {
    return this.http.post<ISocialSearchResult>(API_PROTECTED_END_POINTS.SOCIAL_VIEW_SEARCH_RESULT, request)
  }

  // changeMessage(message: string) {
  //   this.messageSource.next(message)
  //   setTimeout(() => {
  //     this.messageSource.next('set time out')
  //   }, 1000)
  // }

  getSearchAutoCompleteResults(params: { q: string, l: string }): Observable<ISearchAutoComplete[]> {
    return this.http.get<ISearchAutoComplete[]>(API_PROXIES_END_POINTS.CONTENT_SEARCH_V6, { params })
  }

  // getSearchV6Results(body: NSSearch.ISearchV6Request): Observable<NSSearch.ISearchV6ApiResult> {
  //   return this.http.post<NSSearch.ISearchV6ApiResult>(API_END_POINTS.SEARCH_V6PUBLIC, body)
  //     .pipe(map((res: NSSearch.ISearchV6ApiResult) => {
  //       for (const filter of res.filters) {
  //         if (filter.type === 'catalogPaths') {
  //           if (filter.content.length === 1) {
  //             filter.content = filter.content[0].children || []
  //           }
  //           break
  //         }
  //       }
  //       return res
  //     }))
  // }

  getSearchCompetencyCourses(body: any, ashaUser?: any): Observable<any> {
    // tslint:disable-next-line:max-line-length
    const req = body
    let options = {
      url: ashaUser == "true" ? API_END_POINTS.SEARCH_V6PUBLIC_GET_COURSES : API_END_POINTS.GET_CORUSES,
      data : req
    }
    // return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
    return this.post(options)
  }

  getSearchV6Results(body: NSSearch.ISearchV6RequestV2, searchconfig: any, getCourses = ''): Observable<NSSearch.ISearchV6ApiResultV2> {

    let options = {
      url: getCourses === '' ? API_END_POINTS.SEARCH_V6PUBLIC : API_END_POINTS.GET_CORUSES,
      data: getCourses === '' ? body : {
        "request": {
          "facets": [
            "learningMode",
            "duration",
            "complexityLevel",
            "catalogPaths",
            "sourceShortName",
            "region",
            "concepts",
            "lastUpdatedOn"
          ],
          "fields": [
          ],
          "filters": {
            "contentType": [
              "Course"
            ],
            "status": [
              "Live"
            ],
            "lang": _.get(body, 'request.filters.lang', ''),
          },
          "query": _.get(body, 'request.query', ''),
          "sort_by": {
            "lastUpdatedOn": ""
          }
        }
      }
    };
    if (getCourses !== '') {
      options['header'] = {
        'Content-Type': 'application/json'
      }
    }
    return this.post(options)
      .pipe(map((res: NSSearch.ISearchV6ApiResultV2) => {
        const tempArray = Array()
        if (res.result.content.length > 0) {
          searchconfig.forEach((ele: any) => {
            const temp: NSSearch.IFacet = {
              displayName: '',
              type: '',
              content: [],
            }

            temp.displayName = ele.displayname
            temp.type = ele.name
            if (ele.values.length > 0) {
              ele.values.forEach((subEle: any) => {
                temp.content.push({
                  displayName: subEle.name,
                  type: subEle.name,
                  count: subEle.count,
                  id: '',
                })
              })
            }
            tempArray.push(temp)
          })
        }
        res.filters = tempArray
        for (const filter of res.filters) {
          if (filter.type === 'catalogPaths') {
            if (filter.content.length === 1) {
              filter.content = filter.content[0].children || []
            }
            break
          }
        }
        return res
      }))
  }

  // getSearch(body: any): Observable<any> {
  //   const data = {
  //     locale: [
  //       'en',
  //     ],
  //     query: '',
  //     request: {
  //       query: '',
  //       filters: {
  //         primaryCategory: body.request.filters.contentType,
  //         status: [
  //           'Draft',
  //           'Live',
  //         ],
  //         visibility: 'default',
  //         contentType: body.request.filters.contentType,
  //       },
  //       sort_by: {
  //         lastUpdatedOn: 'desc',
  //       },
  //       facets: [
  //         'primaryCategory',
  //         'mimeType',
  //       ],
  //     },
  //   }
  //   data.request.query = body.request.query
  //   return this.http.post<any>(API_END_POINTS.SEARCH_AUTO_COMPLETE, data)
  // }

  getSearchRecomended(body: NSSearch.ISearchV6RequestV2): Observable<any> {
    let options = {
      url: API_END_POINTS.SEARCH_V6PUBLIC_GET_COURSES_RECOMENTED,
      data : body
    }
    // return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC_GET_COURSES_RECOMENTED, body)
    return this.post(options)
    .pipe(map((res: any) => {

      if (res.result.content.length > 0) {
        console.log("v6", res)
        return res
      }


    }))
     
  }

}
