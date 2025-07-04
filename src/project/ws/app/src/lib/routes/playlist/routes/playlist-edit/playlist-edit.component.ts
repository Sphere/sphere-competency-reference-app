import { Component, ViewChild, ElementRef, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms'
import { PLAYLIST_TITLE_MIN_LENGTH, PLAYLIST_TITLE_MAX_LENGTH } from '../../constants/playlist.constant'
import { Location } from '@angular/common'
import { TFetchStatus } from '../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';
import { NsPlaylist } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.model';
import { NsPage } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.model';
import { BtnPlaylistService } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.service';
import { NsContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model';
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'ws-app-playlist-edit',
  templateUrl: './playlist-edit.component.html',
  styleUrls: ['./playlist-edit.component.scss'],
})
export class PlaylistEditComponent implements OnInit {

  @ViewChild('editPlaylistError', { static: true }) editPlaylistErrorMessage!: ElementRef<any>
  @ViewChild('editPlaylistSuccess', { static: true }) editPlaylistSuccess!: ElementRef<any>

  @ViewChild('playlistForm', { static: true }) playlistForm!: ElementRef<any>

  editPlaylistForm: UntypedFormGroup
  createPlaylistStatus: TFetchStatus = 'none'

  playlist: NsPlaylist.IPlaylist = this.route.snapshot.data.playlist.data
  error = this.route.snapshot.data.playlist.error
  type = this.route.snapshot.data.type
  upsertPlaylistStatus: TFetchStatus = 'none'

  selectedContentIds = new Set<string>()
  changedContentIds = new Set<string>()
  removedContentIds = new Set<string>()
  pageNavbar: Partial<NsPage.INavBackground> = this.configurationSvc.pageNavBar

  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private playlistSvc: BtnPlaylistService,
    private snackBar: MatSnackBar,
    private configurationSvc: ConfigurationsService,
    private location: Location
  ) {
    this.editPlaylistForm = this.fb.group({
      title: [
        this.playlist.name || '',
        [Validators.required, Validators.minLength(PLAYLIST_TITLE_MIN_LENGTH), Validators.maxLength(PLAYLIST_TITLE_MAX_LENGTH)],
      ],
      visibility: [NsPlaylist.EPlaylistVisibilityTypes.PRIVATE],
      message: '',
    })
    this.selectedContentIds = new Set<string>(
      (this.playlist && this.playlist.contents || []).map(content => content.identifier),
    )
  }
  ngOnInit(): void {
    this.editPlaylistForm = this.fb.group({
      title: [
        this.playlist.name || '',
        [Validators.required, Validators.minLength(PLAYLIST_TITLE_MIN_LENGTH), Validators.maxLength(PLAYLIST_TITLE_MAX_LENGTH)],
      ],
      visibility: [NsPlaylist.EPlaylistVisibilityTypes.PRIVATE],
      message: '',
    })
  }

  contentChanged(content: Partial<NsContent.IContent>, checked: boolean) {
    if (content && content.identifier) {
      // tslint:disable-next-line: max-line-length
      checked ? this.changedContentIds.add(content.identifier) : this.playlist.contents = this.playlist.contents.filter(item => item.identifier !==  content.identifier)
    }
  }

  editPlaylist() {
    this.upsertPlaylistStatus = 'fetching'
    this.editName()
    // if (this.changedContentIds.size) {
    //   this.playlistSvc.addPlaylistContent(this.playlist, Array.from(this.changedContentIds)).subscribe(
    //     () => {
    //       this.router.navigate([this.router.url.replace('/edit', '')])
    //     },
    //     () => {
    //       this.upsertPlaylistStatus = 'error'
    //       this.snackBar.open(this.editPlaylistErrorMessage.nativeElement.value)
    //     },
    //   )
    // }
  }

  editName() {
    const formValues: { [field: string]: string } = this.editPlaylistForm.getRawValue()
    if (formValues.title && this.playlist) {
      this.playlist.name = formValues.title
      this.playlistSvc.patchPlaylist(this.playlist, Array.from(this.changedContentIds)).subscribe(() => {
        // if (!this.changedContentIds.size) {
        this.snackBar.open(this.editPlaylistSuccess.nativeElement.value)
        // this.router.navigate([this.router.url.replace('/edit', '')])
        this.location.back()
        // }
      })
    }
  }
}
