import { Component, OnInit, Input } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import { NsDiscussionForum } from '../../../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.model';
import { ConfigurationsService } from '../../../../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { DialogSocialDeletePostComponent } from '../../../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/dialog/dialog-social-delete-post/dialog-social-delete-post.component';

@Component({
  selector: 'ws-app-qna-item',
  templateUrl: './qna-item.component.html',
  styleUrls: ['./qna-item.component.scss'],
})
export class QnaItemComponent implements OnInit {

  @Input() item!: NsDiscussionForum.ITimelineResult
  userId = ''
  showSocialLike = false
  ePostStatus = NsDiscussionForum.EPostStatus
  isSocialLike = false
  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
  }

  ngOnInit() {
    this.showSocialLike = (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('socialLike')) || false
  }

  deletePost(successMsg: string) {
    const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
      data: { postId: this.item.id },
    })
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.snackBar.open(successMsg)
        this.item.status = NsDiscussionForum.EPostStatus.INACTIVE
      }
    })
  }
}
