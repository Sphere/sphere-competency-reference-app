import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { NsTnc } from '../models/tnc.model'
import { HttpClient } from '@angular/common/http';
import tncConfig from 'assets/configurations/tnc.config.json'
import { IResolveResponse } from '../../library/ws-widget/utils/src/lib/resolvers/resolver.model'

@Injectable()
export class TncPublicResolverService implements Resolve<Observable<IResolveResponse<NsTnc.ITnc>> | IResolveResponse<NsTnc.ITnc>> {

  constructor(
    private http: HttpClient,
  ) { }

  resolve(): Observable<IResolveResponse<NsTnc.ITnc>> {
    return this.getPublicTnc().pipe(
      map(data => ({ data, error: null })),
      catchError(error => of({ error, data: null })),
    )
  }
  getPublicTnc(locale?: string): Observable<any> {
    return of(tncConfig)
  }
}
