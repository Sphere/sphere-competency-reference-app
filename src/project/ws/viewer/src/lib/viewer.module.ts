import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgCircleProgressModule } from 'ng-circle-progress'
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatTreeModule } from '@angular/material/tree';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ViewerRoutingModule } from './viewer-routing.module'
import { ViewerComponent } from './viewer.component'
import { ViewerTocComponent } from './components/viewer-toc/viewer-toc.component'
import { ViewerTopBarModule } from './components/viewer-top-bar/viewer-top-bar.module'
import { FilterResourcePipe } from './pipes/filter-resource.pipe'
import { BtnMailUserModule } from './../../../../../library/ws-widget/collection/src/lib/btn-mail-user/btn-mail-user.module'
import { UserImageModule } from './../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { AppTocModule } from '@ws/app'
// import { ConfirmmodalComponent } from './plugins/quiz/confirm-modal-component'
import { File } from '@awesome-cordova-plugins/file/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { TranslateModule } from '@ngx-translate/core'
import { ReactiveFormsModule } from '@angular/forms';
import { PipeDurationTransformModule } from '../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module';
import { PipeLimitToModule } from '../../../../../library/ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.module';
import { DefaultThumbnailModule } from '../../../../../library/ws-widget/utils/src/lib/directives/default-thumbnail/default-thumbnail.module';
import { BtnPageBackModule } from '../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
import { BtnFullscreenModule } from '../../../../../library/ws-widget/collection/src/lib/btn-fullscreen/btn-fullscreen.module';
import { WidgetResolverModule } from '../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { DisplayContentTypeModule } from '../../../../../library/ws-widget/collection/src/lib/_common/display-content-type/display-content-type.module';
import { BtnContentDownloadModule } from '../../../../../library/ws-widget/collection/src/lib/btn-content-download/btn-content-download.module';
import { BtnContentLikeModule } from '../../../../../library/ws-widget/collection/src/lib/btn-content-like/btn-content-like.module';
import { BtnContentShareModule } from '../../../../../library/ws-widget/collection/src/lib/btn-content-share/btn-content-share.module';
import { BtnGoalsModule } from '../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.module';
import { BtnPlaylistModule } from '../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.module';
import { BtnContentFeedbackModule } from '../../../../../library/ws-widget/collection/src/lib/btn-content-feedback/btn-content-feedback.module';
import { BtnContentFeedbackV2Module } from '../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/btn-content-feedback-v2.module';
import { DisplayContentTypeIconModule } from '../../../../../library/ws-widget/collection/src/lib/_common/display-content-type-icon/display-content-type-icon.module';
import { PipePartialContentModule } from '../../../../../library/ws-widget/utils/src/lib/pipes/pipe-partial-content/pipe-partial-content.module';
import { PlayerBriefModule } from '../../../../../library/ws-widget/collection/src/lib/_common/player-brief/player-brief.module';

@NgModule({
    declarations: [ViewerComponent, ViewerTocComponent, FilterResourcePipe],
    imports: [
        CommonModule,
        MatCardModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatListModule,
        MatTreeModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        ViewerRoutingModule,
        // ErrorResolverModule,
        PipeDurationTransformModule,
        PipeLimitToModule,
        DefaultThumbnailModule,
        BtnPageBackModule,
        BtnFullscreenModule,
        WidgetResolverModule,
        DisplayContentTypeModule,
        BtnContentDownloadModule,
        BtnContentLikeModule,
        BtnContentShareModule,
        BtnGoalsModule,
        BtnPlaylistModule,
        BtnContentFeedbackModule,
        BtnContentFeedbackV2Module,
        DisplayContentTypeIconModule,
        PipePartialContentModule,
        MatTabsModule,
        PlayerBriefModule,
        ViewerTopBarModule,
        FormsModule,
        BtnMailUserModule,
        UserImageModule,
        AppTocModule,
        TranslateModule,
        NgCircleProgressModule.forRoot({}),
        ReactiveFormsModule
    ],
    providers: [File, HTTP]
})
export class ViewerModule { }
