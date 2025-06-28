import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router'
import { ForumCardModule } from '../forum-card/forum-card.module'
import { BtnFlagModule } from '../widgets/buttons/btn-flag/btn-flag.module'
import { BtnModeratorModule } from '../widgets/buttons/btn-moderator/btn-moderator.module'
import { DialogBoxModeratorModule } from '../widgets/Dialog-Box/dialog-box-moderator/dialog-box-moderator.module'
import { MyforumPostComponent } from './components/myforum-post.component'
import { BtnPageBackModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
import { BtnSocialVoteModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-vote/btn-social-vote.module';
import { BtnSocialLikeModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-like/btn-social-like.module';

@NgModule({
  declarations: [MyforumPostComponent],
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
    DialogBoxModeratorModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatChipsModule,
    MatFormFieldModule,
    BtnModeratorModule,
    MatListModule,
    MatDialogModule,
    BtnFlagModule,
    ForumCardModule,
  ],
})
export class MyforumPostModule { }
