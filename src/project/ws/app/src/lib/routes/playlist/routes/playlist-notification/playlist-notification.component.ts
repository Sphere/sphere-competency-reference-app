import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar';
import { NsPlaylist } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.model';
import { TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';
import { NsPage } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model';
import { BtnPlaylistService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.service';
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'ws-app-playlist-notification',
  templateUrl: './playlist-notification.component.html',
  styleUrls: ['./playlist-notification.component.scss'],
})
export class PlaylistNotificationComponent implements OnInit {
  @ViewChild('errorAccept', { static: true }) errorAcceptMessage!: ElementRef<any>
  @ViewChild('errorReject', { static: true }) errorRejectMessage!: ElementRef<any>
  defaultThumbnail = ''
  playlists: NsPlaylist.IPlaylist[] = this.route.snapshot.data.playlists.data

  acceptRejectPlaylistStatus: { [id: string]: TFetchStatus } = {}

  pageNavbar: Partial<NsPage.INavBackground> = this.configurationSvc.pageNavBar
  constructor(
    private route: ActivatedRoute,
    private playlistSvc: BtnPlaylistService,
    private configurationSvc: ConfigurationsService,
    private snackBar: MatSnackBar,
  ) {
    const instanceConfig = this.configurationSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
  }

  ngOnInit() {
    this.reFetchPlaylists()
  }

  reFetchPlaylists() {
    this.playlistSvc
      .getPlaylists(NsPlaylist.EPlaylistTypes.PENDING)
      .subscribe(
        (sharedPlaylist: NsPlaylist.IPlaylist[]) => {
          this.playlists = sharedPlaylist
        },
      )
  }

  get isFetchingPlaylists() {
    return this.playlistSvc.isFetchingPlaylists
  }

  acceptPlaylist(playlistId: string) {
    this.acceptRejectPlaylistStatus[playlistId] = 'fetching'
    this.playlistSvc.acceptPlaylist(playlistId).subscribe(
      () => {
        this.acceptRejectPlaylistStatus[playlistId] = 'done'
        this.reFetchPlaylists()
      },
      () => {
        this.acceptRejectPlaylistStatus[playlistId] = 'error'
        this.snackBar.open(this.errorAcceptMessage.nativeElement.value)
      },
    )
  }

  rejectPlaylist(playlistId: string) {
    this.acceptRejectPlaylistStatus[playlistId] = 'fetching'
    this.playlistSvc.rejectPlaylist(playlistId).subscribe(
      () => {
        this.acceptRejectPlaylistStatus[playlistId] = 'done'
        this.reFetchPlaylists()
      },
      () => {
        this.acceptRejectPlaylistStatus[playlistId] = 'error'
        this.snackBar.open(this.errorRejectMessage.nativeElement.value)
      },
    )
  }
}
