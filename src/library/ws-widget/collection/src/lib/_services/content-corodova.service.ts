import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { Observable, Subject, BehaviorSubject } from 'rxjs'

import { DataService } from 'app/modules/core/services/data.service'
import { AuthService } from 'sunbird-sdk';
import { buildConfig } from '../../../../../../../configurations/configuration'
import { API_END_POINTS, API_END_POINTS_S3 } from 'app/apiConstants';

@Injectable({
  providedIn: 'root',
})
export class ContentCorodovaService extends DataService {
  private messageSource = new Subject<any>()
  public currentMessage = this.messageSource.asObservable()
  public _updateValue = new BehaviorSubject<any>(undefined)
  
  // Observable navItem stream
  updateValue$ = this._updateValue.asObservable()
  // Initialize with a default value (e.g., false)
  private isAshaSubject = new BehaviorSubject<any>(false);
   // Observable to expose to other components
   isAsha$ = this.isAshaSubject.asObservable();

   private currentAshaCardSubject = new BehaviorSubject<any>(false);
   // Observable to expose to other components
   isCurrentAshaCard$ = this.currentAshaCardSubject.asObservable();

  constructor(
    public http: HttpClient,
    @Inject('AUTH_SERVICE') public authService: AuthService,
  ) {
    super(http,authService)
    this.baseUrl = 'https://'+buildConfig.SITEPATH
  }
  getLiveSearchResults(lang:string|string[], sourceName?: string[]): Observable<any> {
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'],lang : lang, sourceName: sourceName
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    const options = {
      url: API_END_POINTS.SEARCH_V6PUBLIC_GET_COURSES,
      data: req,
    };
    return this.post(options)
  }
  getLiveSearchResultsSphere(lang:string|string[], identifier?: string[]): Observable<any> {
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'],lang : lang, identifier: identifier
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    const options = {
      url: API_END_POINTS.SEARCH_V6PUBLIC_GET_COURSES,
      data: req,
    };
    return this.post(options)
  }

  getSearchResultsByIds(identifiers: string[]): Observable<any> {
    const req = {
      request: {
        filters: {
          primaryCategory: ['Course'], contentType: ['Course'], status: ['Live'],
          identifier: identifiers
        },
      }, query: '', sort: [{ lastUpdatedOn: 'desc' }],
    }
    const options = {
      url: API_END_POINTS.SEARCH_V6PUBLIC_GET_COURSES,
      data: req
    };
    return this.post(options)
  }

  getHomeStaticContent(){
   return this.http.get(API_END_POINTS_S3.STATIC_CONTENT);
  }

  getAshaCompetencyCorses(data){
    const req = data
    let options = {
      url: API_END_POINTS.SEARCH_V6PUBLIC_GET_COURSES,
      data : req
    }
    // return this.http.post<any>(API_END_POINTS.SEARCH_V6PUBLIC, req)
    return this.post(options)
  }

   // Method to update the isAsha value
   setAshaData(data) {
    console.log("set data", data)
    this.isAshaSubject.next(data);
  }

  getAshaData(){
    return  this.isAshaSubject.getValue();
  }


  setAshaCardData(data) {
    this.currentAshaCardSubject.next(data);
  }

  getAshaCardData(){
    return this.currentAshaCardSubject.getValue();
  }
 

}

