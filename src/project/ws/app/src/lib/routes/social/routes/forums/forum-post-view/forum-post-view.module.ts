import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router'
import { ForumPostViewComponent } from './components/forum-post-view.component'
import { ForumCardModule } from '../forum-card/forum-card.module'
import { BtnSocialVoteModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-vote/btn-social-vote.module';
import { BtnSocialLikeModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-like/btn-social-like.module';

@NgModule({
  declarations: [ForumPostViewComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    RouterModule,
    ForumCardModule,
  ],
  exports: [ForumPostViewComponent],
})
export class ForumPostViewModule { }
