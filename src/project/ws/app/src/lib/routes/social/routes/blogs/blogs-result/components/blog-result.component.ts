import { Component, OnInit, Input } from '@angular/core'
import { MatDialog } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import { DialogSocialDeletePostComponent } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/dialog/dialog-social-delete-post/dialog-social-delete-post.component';
import { NsDiscussionForum } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.model';
import { WsDiscussionForumService } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/ws-discussion-forum.services';
import { TFetchStatus } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/constants/misc.constants';
import { ConfigurationsService } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'ws-app-blog-result',
  templateUrl: './blog-result.component.html',
  styleUrls: ['./blog-result.component.scss'],
})
export class BlogResultComponent implements OnInit {
  @Input() postRequest: NsDiscussionForum.ITimelineRequest | null = null
  @Input() blogMode: 'view' | 'edit' = 'view'

  requestBody: NsDiscussionForum.ITimelineRequest | null = null
  blogResult: NsDiscussionForum.ITimeline = {
    hits: 0,
    result: [],
  }
  postFetchStatus: TFetchStatus = 'none'
  userId = ''
  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private discussionSvc: WsDiscussionForumService,
    private configSvc: ConfigurationsService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
  }

  ngOnInit() {
    if (this.postRequest) {
      this.requestBody = { ...this.postRequest }
      this.fetchTimelineData()
    }
  }

  fetchTimelineData() {
    if (this.postFetchStatus === 'done') {
      return
    }
    this.postFetchStatus = 'fetching'
    if (this.requestBody && this.requestBody.pgNo) {
      (this.requestBody.pgNo as number) += 1
      this.discussionSvc.fetchTimelineData(this.requestBody).subscribe(
        data => {
          if (data.hits && data.result) {
            this.blogResult.hits = data.hits
            this.blogResult.result = [...this.blogResult.result, ...data.result]
            if (data.hits > this.blogResult.result.length) {
              this.postFetchStatus = 'hasMore'
            } else {
              this.postFetchStatus = 'done'
            }
          } else {
            this.postFetchStatus = 'none'
          }
        },
        (_err: any) => {
          this.postFetchStatus = 'error'
        },
      )
    }
  }

  deleteBlog(blogId: string, successMsg: string) {
    const dialogRef = this.dialog.open(DialogSocialDeletePostComponent, {
      data: { postId: blogId },
    })
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.blogResult = {
          hits: this.blogResult.hits - 1,
          result: this.blogResult.result.filter((blog: any) => blog.id !== blogId),
        }
        this.snackBar.open(successMsg)
      }
    })
  }
}
