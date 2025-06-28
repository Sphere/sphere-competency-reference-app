import { Component, ElementRef, Inject, TemplateRef, ViewChild } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NsAutoComplete } from '../../../../../../../../../library/ws-widget/collection/src/lib/_common/user-autocomplete/user-autocomplete.model'
import { NsPlaylist } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.model'
import { BtnPlaylistService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.service'
import { TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants'

@Component({
  selector: 'ws-app-playlist-share-dialog',
  templateUrl: './playlist-share-dialog.component.html',
  styleUrls: ['./playlist-share-dialog.component.scss'],
})
export class PlaylistShareDialogComponent {
  @ViewChild('shareError', { static: true }) shareErrorMessage!: ElementRef<any>
  @ViewChild('contentDeletedError', { static: true }) contentDeletedErrorMessage!: TemplateRef<any>

  users: NsAutoComplete.IUserAutoComplete[] = []
  sharePlaylistStatus: TFetchStatus = 'none'

  constructor(
    private snackBar: MatSnackBar,
    private playlistSvc: BtnPlaylistService,
    private dialogRef: MatDialogRef<PlaylistShareDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      playlist: NsPlaylist.IPlaylist
      deleted: string[]
    },
  ) {}

  sharePlaylist(shareMsg: string, successToast: string) {
    if (this.data.playlist) {
      this.sharePlaylistStatus = 'fetching'
      this.playlistSvc
        .sharePlaylist(
        {
          message: shareMsg,
          users: this.users.map(user => user.wid),
        },
        this.data.playlist.id,
        )
        .subscribe(
          () => {
            this.sharePlaylistStatus = 'done'
            this.snackBar.open(successToast)
            this.dialogRef.close()
          },
          (err: any) => {
            this.sharePlaylistStatus = 'error'
            if (err.error.errorMessage !== 'content.deleted') {
              this.snackBar.open(this.shareErrorMessage.nativeElement.value)
            } else {
              this.snackBar.openFromTemplate(this.contentDeletedErrorMessage)
            }
          },
        )
    }
  }

  updateUsers(users: NsAutoComplete.IUserAutoComplete[]) {
    if (Array.isArray(users)) {
      this.users = users
    }
  }
}
