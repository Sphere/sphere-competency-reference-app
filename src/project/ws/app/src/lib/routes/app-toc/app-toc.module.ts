import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { AppTocRoutingModule } from './app-toc-routing.module'
import { NgCircleProgressModule } from 'ng-circle-progress'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
// comps
import { AppTocContentsComponent } from './routes/app-toc-contents/app-toc-contents.component'
import { AppTocHomeComponent } from './components/app-toc-home/app-toc-home.component'
import { AppTocOverviewComponent } from './components/app-toc-overview/app-toc-overview.component'
import { AppTocContentCardComponent } from './components/app-toc-content-card/app-toc-content-card.component'
import { AppTocHomeComponent as AppTocHomeRootComponent } from './routes/app-toc-home/app-toc-home.component'
import { AppTocBannerComponent } from './components/app-toc-banner/app-toc-banner.component'
import { OfflineConfirmModalComponent } from './components/offline-confirm-modal/offline-confirm-modal.component'
import { CourseDownloadCompletionModalComponent } from './components/course-download-completion-modal/course-download-completion-modal.component'
import { UserWhatsappModalComponent } from './components/user-whatsapp-modal/user-whatsapp-modal.component'
import { ProgressComponent } from './components/progress/progress.component';
// services
import { AppTocService } from './services/app-toc.service'
import { AppTocResolverService } from './resolvers/app-toc-resolver.service'
import { ProfileResolverService } from './../user-profile/resolvers/profile-resolver.service'
import { TranslateModule } from '@ngx-translate/core';
// custom modules
import { WidgetResolverModule } from '../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'
import { DiscussionUiModule } from '@aastrika_npmjs/discussions-ui-v8'
import { AppTocHomeDirective } from './routes/app-toc-home/app-toc-home.directive'

import { AppTocOverviewComponent as AppTocOverviewRootComponent } from './routes/app-toc-overview/app-toc-overview.component'
import { AppTocCertificationModule } from './routes/app-toc-certification/app-toc-certification.module'
import { AccessControlService } from '../../../../../author/src/public-api'
import { LicenseComponent } from './components/license/license.component'
import { AllDiscussionWidgetComponent } from './routes/widget/all-discussion-widget/all-discussion-widget.component'
import { AppTocHomePageComponent } from './components/app-toc-home-page/app-toc-home-page.component'
import { AppTocDesktopComponent } from './components/app-toc-desktop/app-toc-desktop.component'
import { AssessmentDetailComponent } from './components/assessment-detail/assessment-detail.component'
import { AppTocDialogIntroVideoComponent } from './components/app-toc-dialog-intro-video/app-toc-dialog-intro-video.component'
import { AppTocOverviewDirective } from './routes/app-toc-overview/app-toc-overview.directive'
import { RetainScrollDirective } from './components/app-toc-home/retain-scroll.directive'
import { AppTocDesktopModalComponent } from './components/app-toc-desktop-modal/app-toc-desktop-modal.component'
import { CreateBatchDialogComponent } from './components/create-batch-dialog/create-batch-dialog.component'
import { SharedModule } from '../../../../../../../project/ws/author/src/lib/modules/shared/shared.module'
import { SharedModule as AastrikShareModule } from '../../../../../../../app/modules/shared/shared.module';
import { ConfirmmodalComponent } from '../../../../../../../project/ws/viewer/src/lib/plugins/quiz/confirm-modal-component'
import { DisplayContentTypeModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/display-content-type/display-content-type.module'
import { DisplayContentTypeIconModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/display-content-type-icon/display-content-type-icon.module'
import { PipeDurationTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module'
import { PipeSafeSanitizerModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.module'
import { PipeLimitToModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.module'
import { PipeNameTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-name-transform/pipe-name-transform.module'
import { PipeCountTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-count-transform/pipe-count-transform.module'
import { PipePartialContentModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-partial-content/pipe-partial-content.module'
import { PipeContentRouteModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/pipe-content-route/pipe-content-route.module'
import { BtnContentDownloadModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-download/btn-content-download.module'
import { BtnContentLikeModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-like/btn-content-like.module'
import { BtnContentFeedbackModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback/btn-content-feedback.module'
import { BtnContentFeedbackV2Module } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/btn-content-feedback-v2.module'
import { BtnGoalsModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-goals/btn-goals.module'
import { BtnPlaylistModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.module'
import { BtnMailUserModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-mail-user/btn-mail-user.module'
import { BtnPageBackModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module'
import { HorizontalScrollerModule } from '../../../../../../../library/ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.module'
import { UserImageModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { DefaultThumbnailModule } from '../../../../../../../library/ws-widget/utils/src/lib/directives/default-thumbnail/default-thumbnail.module'
import { ContentProgressModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/content-progress/content-progress.module'
import { UserContentRatingModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-content-rating/user-content-rating.module'
import { BtnKbModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-kb/btn-kb.module'
import { MarkAsCompleteModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/mark-as-complete/mark-as-complete.module'
import { PlayerBriefModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/player-brief/player-brief.module'
import { CardContentModule } from '../../../../../../../library/ws-widget/collection/src/lib/card-content/card-content.module'
import { BtnContentShareModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-content-share/btn-content-share.module'
import { UserAutocompleteModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-autocomplete/user-autocomplete.module'
import { ProfileImageModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/profile-image/profile-image.module'
import { PipeContentRoutePipe } from '../../../../../../../library/ws-widget/collection/src/lib/_common/pipe-content-route/pipe-content-route.pipe'
import { AppTocHomePageService } from './services/app-toc-home-page.service'
@NgModule({
    declarations: [
        AppTocContentsComponent,
        AppTocOverviewComponent,
        AppTocContentCardComponent,
        AppTocHomeComponent,
        AppTocHomePageComponent,
        AppTocBannerComponent,
        AppTocDesktopComponent,
        AssessmentDetailComponent,
        AppTocDialogIntroVideoComponent,
        AllDiscussionWidgetComponent,
        AppTocOverviewDirective,
        AppTocOverviewRootComponent,
        AppTocHomeRootComponent,
        AppTocHomeDirective,
        RetainScrollDirective,
        LicenseComponent,
        AppTocDesktopModalComponent,
        CreateBatchDialogComponent,
        OfflineConfirmModalComponent,
        CourseDownloadCompletionModalComponent,
        UserWhatsappModalComponent,
        ProgressComponent,
        ConfirmmodalComponent,
        CourseDownloadCompletionModalComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppTocRoutingModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatCardModule,
        MatChipsModule,
        MatTooltipModule,
        MatRadioModule,
        MatTabsModule,
        FormsModule,
        MatCardModule,
        MatListModule,
        MatDividerModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSelectModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        DisplayContentTypeModule,
        DisplayContentTypeIconModule,
        PipeDurationTransformModule,
        PipeSafeSanitizerModule,
        PipeLimitToModule,
        PipeNameTransformModule,
        PipeCountTransformModule,
        PipePartialContentModule,
        PipeContentRouteModule,
        BtnGoalsModule,
        BtnContentDownloadModule,
        BtnContentLikeModule,
        BtnContentFeedbackModule,
        BtnContentFeedbackV2Module,
        BtnGoalsModule,
        BtnPlaylistModule,
        BtnMailUserModule,
        BtnPageBackModule,
        HorizontalScrollerModule,
        UserImageModule,
        DefaultThumbnailModule,
        WidgetResolverModule,
        ContentProgressModule,
        UserContentRatingModule,
        BtnKbModule,
        AppTocCertificationModule,
        MarkAsCompleteModule,
        PlayerBriefModule,
        CardContentModule,
        BtnContentShareModule,
        UserAutocompleteModule,
        ProfileImageModule,
        NgCircleProgressModule.forRoot({}),
        DiscussionUiModule,
        TranslateModule.forChild(),
        SharedModule,
        AastrikShareModule
    ],
    providers: [
        AppTocService,
        AppTocHomePageService,
        AccessControlService,
        AppTocResolverService,
        ProfileResolverService,
        PipeContentRoutePipe
    ],
    exports: [
        AssessmentDetailComponent,
        AllDiscussionWidgetComponent,
        CreateBatchDialogComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppTocModule { }
