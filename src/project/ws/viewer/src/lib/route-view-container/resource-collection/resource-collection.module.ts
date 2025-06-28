import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatDialogModule } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { MatTableModule} from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatCardModule} from '@angular/material/card'
import { MatTabsModule } from '@angular/material/tabs'
import { MatFormFieldModule} from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { ResourceCollectionRoutingModule } from './resource-collection-routing.module'
import { ResourceCollectionComponent } from './resource-collection.component'

import { WebModuleModule as PluginWebModuleModule } from '../../plugins/web-module/web-module.module'
import { ResourceCollectionModule as PluginResourceCollectionModule } from '../../plugins/resource-collection/resource-collection.module'

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


@NgModule({
  declarations: [ResourceCollectionComponent],
  imports: [
    CommonModule,
    ResourceCollectionRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatPaginatorModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    PluginResourceCollectionModule,
    PluginWebModuleModule,
    BtnContentDownloadModule,
    BtnContentFeedbackModule,
    BtnContentLikeModule,
    BtnContentShareModule,
    BtnGoalsModule,
    BtnPlaylistModule,
    DisplayContentTypeModule,
    UserImageModule,
    UserContentRatingModule,
    BtnContentFeedbackV2Module,
    PlayerBriefModule,
    PipeDurationTransformModule,
    PipeLimitToModule,
    PipePartialContentModule,
    WidgetResolverModule,
  ],
  exports: [
    ResourceCollectionComponent,
  ],
})
export class ResourceCollectionModule { }
