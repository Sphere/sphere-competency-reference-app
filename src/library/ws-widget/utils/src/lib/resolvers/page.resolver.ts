import { HttpClient } from '@angular/common/http'
import { Inject, Injectable, LOCALE_ID } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { forkJoin, Observable, of } from 'rxjs'
import { catchError, map, mergeMap } from 'rxjs/operators'
import { ConfigurationsService } from '../services/configurations.service'
import { JSON_MAP } from './page.constant'
import { NsPage } from './page.model'
import { IResolveResponse } from './resolver.model'
import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import { CordovaHttpService } from '../../../../../../app/modules/core/services/cordova-http.service'
import { ModalController } from '@ionic/angular'
import { HTTP } from '@awesome-cordova-plugins/http/ngx'
import { ToastService } from '../../../../../../app/manage-learn/core'
@Injectable({
  providedIn: 'root',
})
export class PageResolve extends CordovaHttpService implements Resolve<IResolveResponse<NsPage.IPage>> {
  public baseUrl = this.configSvc.sitePath
  constructor(
    private configSvc: ConfigurationsService,
    public http: HttpClient,
    @Inject(LOCALE_ID) private locale: string,
    public toast: ToastService,
    public modalController: ModalController,
    @Inject('AUTH_SERVICE') public authService: AuthService,
    @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
    @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
    public ionicHttp: HTTP
  ) {
    super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
   }
  resolve(
    route: ActivatedRouteSnapshot,
  ): Observable<any> | IResolveResponse<NsPage.IPage> {
    if (route.data.pageUrl) {
      return this.getData(route.data.pageUrl)
    }
    if (route.data.pageType === 'feature' && route.data.pageKey) {
    
      return this.getData(`${this.baseUrl}/feature/${route.data.pageKey}`)
    }
    if (
      route.data.pageType === 'page' &&
      route.data.pageKey &&
      route.paramMap.has(route.data.pageKey)
    ) {
      return this.getData(`${this.baseUrl}/page/${route.paramMap.get(route.data.pageKey)}`)
    }
    if (
      route.data.pageType === 'public' &&
      route.data.pageKey) {
      return this.getData(`${this.baseUrl}/page/public-home`)
    }
    if (
      route.data.pageType === 'page' &&
      route.data.pageKey &&
      route.data.pageKey === 'toc'
    ) {
      return this.getData(`${this.baseUrl}/page/${route.data.pageKey}`)
    }
    return {
      data: null,
      error: 'CONFIGURATION_ERROR_PAGE_URL_NOT_FORMED',
    }
  }

  private setS3Cookie(contentId: string): Observable<any> {
    const options = {
      url: `/apis/protected/v8/content/setCookie`,
      payload: { contentId }
    }
    const res= this.post(options).pipe(
      catchError(_err => of(true)),
    )
    return res
  }

  private getContent(id: string) {
    const options = {
      url: `/apis/protected/v8/content/${id}?hierarchyType=minimal`,
      payload: ['status', 'artifactUrl']
    }
    const res = this.post(options)
    return res
  }

  private getData(url: string) {
    const id = (url.split('/').pop() as string).split('.')[0] || ''
    const equivalentId = id.startsWith('lex_auth_') ? id : JSON_MAP[id]
    if (equivalentId) {
      return forkJoin([this.setS3Cookie(equivalentId), this.getContent(equivalentId)]).pipe(
        mergeMap(([_, v]) => {
          if (v.status === 'Expired' || v.status === 'Deleted' || !v.artifactUrl) {
            return of({ data: null, error: 'NoContent' })
          }
          const options = {
            url: `${v.artifactUrl}?ts=${new Date().getTime()}`
          }
          return this.get(options)
            .pipe(
              map(data => ({ data, error: null })),
              catchError(err => of({ data: null, error: err })),
            )
        }),
        catchError(err => of({ data: null, error: err })),
      )
    }

    // tslint:disable-next-line: no-non-null-assertion
    if (this.configSvc.userProfile && this.configSvc.userProfile!.language) {
      // tslint:disable-next-line: no-non-null-assertion
      this.locale = this.configSvc.userProfile!.language
    } else {
      this.locale = 'en'
    }

    if (location.href.indexOf('hi/public-home') > -1) {
      this.locale = 'hi'
    }
    
    const pageRequest = [
      (equivalentId ? this.setS3Cookie(equivalentId) : of(true)).pipe(
        mergeMap(() =>
          this.get({url: `${url}.json`}).pipe(
            map(data => ({ data, error: null })),
            catchError(err => of({ data: null, error: err })),
          ),
        ),
      ),
      this.locale === 'en' || this.locale === 'en-US' ?
        of({ data: undefined as any, error: null }) :
        this.get({url: `${url}.${this.locale}.json`}).pipe(
          map(data => ({ data, error: null })),
          catchError(err => of({ data: null, error: err })),
        ),
    ]
    
    return forkJoin(pageRequest).pipe(
      map(
        ([general, withLocale]): IResolveResponse<NsPage.IPage> => {
          if (withLocale.data) {
            return withLocale
          }
          return general
        },
      ),
    )
    
  }
}
