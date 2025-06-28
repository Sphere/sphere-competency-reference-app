import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { BtnContentDownloadModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback/btn-content-feedback.module'
import { BtnContentLikeModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.module'
import { DisplayContentTypeModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/display-content-type/display-content-type.module'
import { UserImageModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { UserContentRatingModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-content-rating/user-content-rating.module'
import { BtnContentFeedbackV2Module } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/btn-content-feedback-v2.module'
import { PlayerBriefModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/player-brief/player-brief.module'

import { PipeDurationTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module'
import { PipeLimitToModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.module'
import { PipePartialContentModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-partial-content/pipe-partial-content.module'

import { WidgetResolverModule } from '../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'

import { AudioComponent } from './audio.component'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [AudioComponent],
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule,
    WidgetResolverModule,
    PipeLimitToModule,
    PipePartialContentModule,
    PipeDurationTransformModule,
    BtnContentDownloadModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    UserImageModule,
    BtnContentFeedbackModule,
    DisplayContentTypeModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    PlayerBriefModule,
  ],
  exports: [AudioComponent],
})
export class AudioModule { }
