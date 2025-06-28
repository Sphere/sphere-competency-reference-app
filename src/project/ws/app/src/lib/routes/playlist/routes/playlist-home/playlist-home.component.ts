import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { SafeStyle, DomSanitizer } from '@angular/platform-browser'
import { NsError } from '../../../../../../../../../library/ws-widget/collection/src/lib/models/error-resolver.model'
import { NsPlaylist } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.model'
import { NsPage } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model'
import { NsWidgetResolver } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { ROOT_WIDGET_CONFIG } from '../../../../../../../../../library/ws-widget/collection/src/lib/collection.config'
import { BtnPlaylistService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.service'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'

@Component({
  selector: 'ws-app-playlist-home',
  templateUrl: './playlist-home.component.html',
  styleUrls: ['./playlist-home.component.scss'],
})

export class PlaylistHomeComponent implements OnInit, OnDestroy {
  userName: string | undefined

  EPlaylistTypes = NsPlaylist.EPlaylistTypes
  playlists: NsPlaylist.IPlaylist[] = this.route.snapshot.data.playlists.data
  type: NsPlaylist.EPlaylistTypes = this.route.snapshot.data.type
  error = this.route.snapshot.data.playlists.error

  numNotifications = 0
  playListLogo: SafeStyle | null = null

  playlistsSubscription: Subscription | null = null
  notificationsSubscription: Subscription | null = null
  playListFor = 'me'
  searchPlaylistQuery = ''
  isShareEnabled = false

  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private playlistSvc: BtnPlaylistService,
    private configSvc: ConfigurationsService,
    private router: Router,

  ) {
    if (this.configSvc.userProfile) {
      this.userName = (this.configSvc.userProfile.userName || '').split(' ')[0]
    }
  }

  ngOnInit() {
    this.playListLogo = this.sanitizer.bypassSecurityTrustStyle(
      `url(${this.configSvc.instanceConfig ? this.configSvc.instanceConfig.logos.playListLogo : ''})`,
    )
    this.playListFor = this.router.url.includes('shared') ? 'shared' : 'me'
    // this.configSvc.instanceConfig ? this.configSvc.instanceConfig.logos.playListLogo : ''
    if (this.configSvc.restrictedFeatures) {
      this.isShareEnabled = !this.configSvc.restrictedFeatures.has('share')
    }

    this.playlistsSubscription = this.playlistSvc
      .getPlaylists(this.type)
      .subscribe(
        playlists => {
          this.playlists = playlists
        })
    this.notificationsSubscription = this.playlistSvc
      .getPlaylists(NsPlaylist.EPlaylistTypes.PENDING)
      .subscribe(pending => this.numNotifications = pending.length)
  }

  // ngAfterViewInit() {
  //   this.configSvc.tourGuideNotifier.next(true)
  //   this.tour.data = [[
  //     '#playlist',
  //     '',
  //     'If you prefer, you can turn off this guide',
  //   ],
  //   [
  //     '#search',
  //     'Channel',
  //     'If you prefer, you can turn off this guide',
  //   ],
  //   [
  //     '#myPlaylist',
  //     'Learning',
  //     'If you prefer, you can turn off this guide',
  //   ],
  //   [
  //     '#sharedPlaylist',
  //     'Banners',
  //     'If you prefer, you can turn off this guide',
  //   ],
  //   [
  //     '#createPlaylist',
  //     'Banners',
  //     'If you prefer, you can turn off this guide',
  //   ],
  //   ]
  // }

  goalPlayList(tab: string) {
    if (tab === 'me') {
      this.router.navigate(['/app/playlist/me'])
    } else if (tab === 'shared') {
      this.router.navigate(['/app/playlist/shared'])
    }
  }
  ngOnDestroy() {
    if (this.playlistsSubscription) {
      this.playlistsSubscription.unsubscribe()
    }
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe()
    }
  }
}
