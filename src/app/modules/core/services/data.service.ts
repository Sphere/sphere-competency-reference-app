import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { mergeMap } from 'rxjs/operators'
import { of as observableOf, throwError as observableThrowError, Observable } from 'rxjs';
import * as jwt_decode from "jwt-decode";
import * as moment from 'moment'
import { AuthService } from 'sunbird-sdk';
/**
 * DataService to make http call
 *
 * @author Aman Kumar Sharma <amankumar.sharma@tarento.com>
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {
  /**
 * Contains base Url for api end points
 */
  baseUrl: string;
  /**
 * angular HttpClient
 */
  http: HttpClient;
  constructor(http: HttpClient, @Inject('AUTH_SERVICE') public authService: AuthService) {
    this.http = http
  }
  /**
   * for making get api calls
   *
   * @param requestParam interface
   */
  get(requestParam: any): Observable<any> {
    const httpOptions: any = {
      headers: requestParam.header ? requestParam.header : this.getHeader(),
      params: requestParam.param,
      observe: 'response'
    };
    return this.http.get(this.baseUrl + requestParam.url, httpOptions).pipe(
      mergeMap(({ body, headers }: any) => {
        if (body.status === 200 || body.status === 'success' || 
        body.responseCode === 'OK' || body.status_code === 200 ) {
          return observableOf(body);
        }else {
          return observableThrowError(body);
        }
      }));
  }
  /**
  * for making post api calls
  *
  * @param requestParam interface
  */
  post(requestParam: any) {
    this.checkTokenValidation()
    const httpOptions: any = {
      headers: requestParam.header ? this.getHeader(requestParam.header) : this.getHeader(),
      params: requestParam.param
    }
    // // console.log('log in data service',requestParam)
    return this.http.post(this.baseUrl + requestParam.url, requestParam.data, httpOptions).pipe(
      mergeMap((data: any) => {
        if (data.status === 200 || data.status === 'success' || data.responseCode === 'OK' || data.status_code === 200) {
          return observableOf(data);
        } else {
          return observableThrowError(data);
        }

      })
    )
  }

  checkTokenValidation(): Observable<any> {
    return this.authService.getSession().pipe(
      mergeMap(tokens => {
        if (tokens) {
          const token = jwt_decode(tokens.access_token);
          const tokenExpiryTime = moment(token.exp * 1000);
          console.log(tokenExpiryTime)
          const currentTime = moment(Date.now());
          const duration = moment.duration(tokenExpiryTime.diff(currentTime));
          const hourDifference = duration.asHours();
          if (hourDifference < 2) {
            return this.authService.refreshSession().pipe(
              mergeMap(refreshData => {
                return this.authService.getSession()
              })
            )
          } else {
            return this.authService.getSession()
          }
        } else {
          return observableOf({})
        }
      })
    )
  }
  delete(requestParam: any): Observable<any> {
    const httpOptions: any = {
      headers: requestParam.header ? requestParam.header : this.getHeader(),
      params: requestParam.param,
      observe: 'response'
    };
    return this.http.delete(this.baseUrl + requestParam.url, httpOptions).pipe(
      mergeMap(({ body, headers }: any) => {
        if (body.responseCode !== 'OK') {
          return observableThrowError(body);
        }
        return observableOf(body);
      }));
  }
  /**
   * for preparing headers
   */
  private getHeader(headers?: any): any {

    const default_headers = {
      'Accept': 'application/json',

    };

    if (headers) {
      return { ...default_headers, ...headers };
    } else {
      return { ...default_headers };
    }
  }
}
