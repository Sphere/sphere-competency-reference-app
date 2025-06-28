import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { TrainingContentRoutingModule } from './training-content-routing.module'
import { HomeComponent } from './components/home/home.component'
import { TrainingHeaderComponent } from './components/training-header/training-header.component'
import { TrainingsListComponent } from './components/trainings-list/trainings-list.component'
import { TrainingDetailsComponent } from './components/training-details/training-details.component'
import { TrainingsRegisteredComponent } from './components/trainings-registered/trainings-registered.component'
import { TrainingCardComponent } from './components/training-card/training-card.component'
import { TrainingsUpcomingComponent } from './components/trainings-upcoming/trainings-upcoming.component'
import { TrainingFilterDialogComponent } from './components/training-filter-dialog/training-filter-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TrainingContentService } from './services/training-content.service'
import { TrainingModule } from '../../training.module'
import { TrainingShareDialogComponent } from './components/training-share-dialog/training-share-dialog.component'
import { TrainingNominateDialogComponent } from './components/training-nominate-dialog/training-nominate-dialog.component'
import { TrainingCountResolver } from './resolvers/training-count.resolver'
import { TrainingPrivilegesResolver } from '../../resolvers/training-privileges.resolver'
import { TranslateModule } from '@ngx-translate/core'
import { DisplayContentTypeModule } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/_common/display-content-type/display-content-type.module';
import { PipeConciseDateRangeModule } from '../../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-concise-date-range/pipe-concise-date-range.module';
import { UserAutocompleteModule } from '../../../../../../../../../../../library/ws-widget/collection/src/lib/_common/user-autocomplete/user-autocomplete.module';

@NgModule({
    declarations: [
        HomeComponent,
        TrainingHeaderComponent,
        TrainingsListComponent,
        TrainingDetailsComponent,
        TrainingsRegisteredComponent,
        TrainingCardComponent,
        TrainingsUpcomingComponent,
        TrainingFilterDialogComponent,
        TrainingShareDialogComponent,
        TrainingNominateDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TrainingContentRoutingModule,
        TrainingModule,
        DisplayContentTypeModule,
        PipeConciseDateRangeModule,
        UserAutocompleteModule,
        MatDividerModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatBadgeModule,
        MatTooltipModule,
        MatChipsModule,
        TranslateModule.forChild(),
    ],
    providers: [TrainingContentService, TrainingCountResolver, TrainingPrivilegesResolver]
})
export class TrainingContentModule {}
