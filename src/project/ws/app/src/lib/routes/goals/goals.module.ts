import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GoalsRoutingModule } from './goals-routing.module'
import { GoalDeleteDialogComponent } from './components/goal-delete-dialog/goal-delete-dialog.component'
import { GoalAcceptDialogComponent } from './components/goal-accept-dialog/goal-accept-dialog.component'
import { GoalRejectDialogComponent } from './components/goal-reject-dialog/goal-reject-dialog.component'
import { GoalCardComponent } from './components/goal-card/goal-card.component'
import { GoalCreateComponent } from './routes/goal-create/goal-create.component'
import { GoalTrackComponent } from './routes/goal-track/goal-track.component'
import { GoalHomeComponent } from './routes/goal-home/goal-home.component'
import { GoalNotificationComponent } from './routes/goal-notification/goal-notification.component'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { GoalMeComponent } from './routes/goal-me/goal-me.component'
import { GoalOthersComponent } from './routes/goal-others/goal-others.component'
import { GoalCreateCommonComponent } from './components/goal-create-common/goal-create-common.component'
import { GoalCreateCustomComponent } from './components/goal-create-custom/goal-create-custom.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { GoalCommonCardComponent } from './components/goal-common-card/goal-common-card.component'
import { GoalTrackAcceptComponent } from './components/goal-track-accept/goal-track-accept.component'
import { GoalTrackRejectComponent } from './components/goal-track-reject/goal-track-reject.component'
import { GoalAcceptCardComponent } from './components/goal-accept-card/goal-accept-card.component'
import { GoalDeadlineTextComponent } from './components/goal-deadline-text/goal-deadline-text.component'
import { GoalShareDialogComponent } from './components/goal-share-dialog/goal-share-dialog.component'
import { GoalSharedDeleteDialogComponent } from './components/goal-shared-delete-dialog/goal-shared-delete-dialog.component'
import { GoalTrackPendingComponent } from './components/goal-track-pending/goal-track-pending.component'
import { NoAccessDialogComponent } from './components/no-access-dialog/no-access-dialog.component'
import { BtnPageBackModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module'
import { DisplayContentTypeModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/display-content-type/display-content-type.module'
import { DisplayContentsModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/display-contents/display-contents.module'
import { EmailInputModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/email-input/email-input.module'
import { PickerContentModule } from '../../../../../../../library/ws-widget/collection/src/lib/picker-content/picker-content.module'
import { PipeDurationTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module'
import { UserAutocompleteModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-autocomplete/user-autocomplete.module'

@NgModule({
    declarations: [
        GoalDeleteDialogComponent,
        GoalAcceptDialogComponent,
        GoalRejectDialogComponent,
        GoalCardComponent,
        GoalCreateComponent,
        GoalTrackComponent,
        GoalHomeComponent,
        GoalNotificationComponent,
        GoalMeComponent,
        GoalOthersComponent,
        GoalCreateCommonComponent,
        GoalCreateCustomComponent,
        GoalCommonCardComponent,
        GoalTrackAcceptComponent,
        GoalTrackRejectComponent,
        GoalAcceptCardComponent,
        GoalDeadlineTextComponent,
        GoalShareDialogComponent,
        GoalSharedDeleteDialogComponent,
        GoalTrackPendingComponent,
        NoAccessDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        GoalsRoutingModule,
        BtnPageBackModule,
        DisplayContentTypeModule,
        DisplayContentsModule,
        PipeDurationTransformModule,
        EmailInputModule,
        PickerContentModule,
        // Material Imports
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonToggleModule,
        MatCardModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatListModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatToolbarModule,
        MatMenuModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatTabsModule,
        UserAutocompleteModule,
        MatChipsModule,
        MatCheckboxModule,
        MatTableModule,
    ]
})
export class GoalsModule { }
