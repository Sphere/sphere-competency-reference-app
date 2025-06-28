import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { NsPlaylist } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.model'
import { BtnPlaylistService } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.service'
import { IResolveResponse } from '../../../../../../../../library/ws-widget/utils/src/lib/resolvers/resolver.model'

import { Observable, of } from 'rxjs'
import { map, catchError, first } from 'rxjs/operators'

@Injectable()
export class PlaylistsResolve
  implements
  Resolve<
  | Observable<IResolveResponse<NsPlaylist.IPlaylist[]>>
  | IResolveResponse<NsPlaylist.IPlaylist[]>
  > {
  constructor(private playlistSvc: BtnPlaylistService) { }

  resolve(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<IResolveResponse<NsPlaylist.IPlaylist[]>> {
    return this.playlistSvc
      .getPlaylists(route.data.type)
      .pipe(
        first(),
        map(data => ({ data, error: null })),
        catchError(error => of({ error, data: null })),
      )
  }
}
