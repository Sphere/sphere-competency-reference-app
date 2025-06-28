import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { LayoutModule } from '@angular/cdk/layout'
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core'; // `MatRippleModule` is not available in Angular Material, consider removing it
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { PipeSafeSanitizerModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.module'
import { MyFeedbackRoutingModule } from './my-feedback-routing.module'
import { HomeComponent } from './components/home/home.component'
import { FeedbackListComponent } from './components/feedback-list/feedback-list.component'
import { FeedbackThreadComponent } from './components/feedback-thread/feedback-thread.component'
import { FeedbackThreadItemComponent } from './components/feedback-thread-item/feedback-thread-item.component'
import { MyFeedbackService } from './services/my-feedback.service'
import { FeedbackFilterDialogComponent } from './components/feedback-filter-dialog/feedback-filter-dialog.component'
import { FeedbackTypeComponent } from './components/feedback-type/feedback-type.component'
import { FeedbackThreadHeaderComponent } from './components/feedback-thread-header/feedback-thread-header.component'
import { FeedbackSummaryResolver } from '../../resolvers/feedback-summary.resolver'
import { FeedbackConfigResolver } from '../../resolvers/feedback-config.resolver'
import { TranslateModule } from '@ngx-translate/core'
import { UserImageModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module';
import { DisplayContentTypeModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/_common/display-content-type/display-content-type.module';
import { BtnContentFeedbackV2Module } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/btn-content-feedback-v2.module';

@NgModule({
    declarations: [
        HomeComponent,
        FeedbackListComponent,
        FeedbackThreadComponent,
        FeedbackThreadItemComponent,
        FeedbackFilterDialogComponent,
        FeedbackTypeComponent,
        FeedbackThreadHeaderComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LayoutModule,
        MatListModule,
        MatIconModule,
        MatDividerModule,
        MatRippleModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatTooltipModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatBadgeModule,
        MatTabsModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatChipsModule,
        MatMenuModule,
        PipeSafeSanitizerModule,
        UserImageModule,
        DisplayContentTypeModule,
        BtnContentFeedbackV2Module,
        MyFeedbackRoutingModule,
        TranslateModule.forChild(),
    ],
    providers: [MyFeedbackService, FeedbackSummaryResolver, FeedbackConfigResolver]
})
export class MyFeedbackModule {}
