import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PlaylistHomeComponent } from './routes/playlist-home/playlist-home.component'
import { PlaylistCreateComponent } from './routes/playlist-create/playlist-create.component'
import { PlaylistsResolve } from './resolvers/playlists.resolve'
import { PlaylistDetailComponent } from './routes/playlist-detail/playlist-detail.component'
import { PlaylistResolve } from './resolvers/playlist.resolve'
import { PlaylistEditComponent } from './routes/playlist-edit/playlist-edit.component'
import { PlaylistNotificationComponent } from './routes/playlist-notification/playlist-notification.component'
import { NsPlaylist } from '../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.model'
import { PageResolve } from '../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.resolver'
const routes: Routes = [
  {
  },
  {
    path: 'me',
    component: PlaylistHomeComponent,
    data: {
      type: NsPlaylist.EPlaylistTypes.ME,
      pageType: 'feature',
      pageKey: 'playlist',
    },
    resolve: {
      pageData: PageResolve,
      playlists: PlaylistsResolve,
    },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'me/:id',
    component: PlaylistDetailComponent,
    data: { type: NsPlaylist.EPlaylistTypes.ME },
    resolve: {
      playlist: PlaylistResolve,
    },
  },
  {
    path: 'me/:id/edit',
    component: PlaylistEditComponent,
    data: { type: NsPlaylist.EPlaylistTypes.ME },
    resolve: {
      playlist: PlaylistResolve,
    },
  },
  {
    path: 'shared',
    component: PlaylistHomeComponent,
    data: {
      type: NsPlaylist.EPlaylistTypes.SHARED,
      pageType: 'feature',
      pageKey: 'playlist',
    },
    resolve: {
      pageData: PageResolve,
      playlists: PlaylistsResolve,
    },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'shared/:id',
    component: PlaylistDetailComponent,
    data: { type: NsPlaylist.EPlaylistTypes.SHARED },
    resolve: {
      playlist: PlaylistResolve,
    },
  },
  {
    path: 'shared/:id/edit',
    component: PlaylistEditComponent,
    data: { type: NsPlaylist.EPlaylistTypes.SHARED },
    resolve: {
      playlist: PlaylistResolve,
    },
  },
  {
    path: 'create',
    component: PlaylistCreateComponent,
  },
  {
    path: 'notification',
    component: PlaylistNotificationComponent,
    data: { type: NsPlaylist.EPlaylistTypes.PENDING },
    resolve: {
      playlists: PlaylistsResolve,
    },
    runGuardsAndResolvers: 'paramsChange',
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [PlaylistsResolve, PlaylistResolve],
})
export class PlaylistRoutingModule { }
