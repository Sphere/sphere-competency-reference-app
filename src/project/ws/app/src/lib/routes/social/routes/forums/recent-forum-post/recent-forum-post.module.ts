import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
// tslint:disable-next-line: max-line-length
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion'
import { MatListModule } from '@angular/material/list'
import { RouterModule } from '@angular/router'
import { ForumCardModule } from '../forum-card/forum-card.module'
import { BtnFlagModule } from '../widgets/buttons/btn-flag/btn-flag.module'
import { RecentForumPostComponent } from './components/recent-forum-post.component'
import { BtnPageBackModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
import { BtnSocialVoteModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-vote/btn-social-vote.module';
import { BtnSocialLikeModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-like/btn-social-like.module';

@NgModule({
  declarations: [RecentForumPostComponent],
  imports: [

    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    BtnPageBackModule,
    BtnPageBackModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatFormFieldModule,
    BtnFlagModule,
    ForumCardModule,
  ],

  exports: [RecentForumPostComponent],
})
export class RecentForumPostModule {
  constructor() {
    // // console.log('success in reaching recent forum post module')
  }
}
