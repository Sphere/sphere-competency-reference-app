import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ForumCardComponent } from './forum-card.component'
import { BtnFlagModule } from '../widgets/buttons/btn-flag/btn-flag.module'
import { BtnFlagComponent } from '../widgets/buttons/btn-flag/btn-flag.component'
import { BtnSocialVoteModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-vote/btn-social-vote.module';
import { BtnSocialLikeModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-like/btn-social-like.module';

@NgModule({
  declarations: [ForumCardComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    MatDividerModule,
    BtnFlagModule,

  ],
  exports: [ForumCardComponent],
  providers: [BtnFlagComponent],
})
export class ForumCardModule { }
