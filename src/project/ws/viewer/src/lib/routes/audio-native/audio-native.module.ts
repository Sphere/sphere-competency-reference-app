import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatDividerModule} from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule} from '@angular/material/card'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { AudioNativeModule as AudioNativeViewContainerModule } from '../../route-view-container/audio-native/audio-native.module'

import { AudioNativeComponent } from './audio-native.component'
import { BtnContentDownloadModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-download/btn-content-download.module'
import { BtnContentFeedbackModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback/btn-content-feedback.module'
import { BtnContentFeedbackV2Module } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/btn-content-feedback-v2.module'
import { BtnContentLikeModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-like/btn-content-like.module'
import { BtnContentShareModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-share/btn-content-share.module'
import { BtnGoalsModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.module'
import { DefaultThumbnailModule } from '../../../../../../../library/ws-widget/utils/src/lib/directives/default-thumbnail/default-thumbnail.module'
import { DisplayContentTypeModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/display-content-type/display-content-type.module'
import { PipeDurationTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module'
import { PipeLimitToModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.module'
import { PipePartialContentModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-partial-content/pipe-partial-content.module'
import { UserContentRatingModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-content-rating/user-content-rating.module'
import { UserImageModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { WidgetResolverModule } from '../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'
import { PipeSafeSanitizerModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.module'

@NgModule({
  declarations: [AudioNativeComponent],
  imports: [
    AudioNativeViewContainerModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentFeedbackV2Module,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    CommonModule,
    DefaultThumbnailModule,
    DisplayContentTypeModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatSnackBarModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    RouterModule,
    UserContentRatingModule,
    UserImageModule,
    WidgetResolverModule,
    PipeSafeSanitizerModule,
  ],
})
export class AudioNativeModule { }
