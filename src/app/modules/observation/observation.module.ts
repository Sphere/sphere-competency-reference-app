import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenteesListComponent } from './components/mentees-list/mentees-list.component';
import { ObservationListComponent } from './components/observation-list/observation-list.component';
import { MenteeProgressTrackerComponent } from './components/mentee-progress-tracker/mentee-progress-tracker.component';
import { ObservationRoutingModule } from './observation-routing.module';
import { MentorCardsComponent } from './components/mentor-cards/mentor-cards.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core'; // For date-related functionalities
import { OtpVerifyMenteeComponent } from './components/otp-verify-mentee/otp-verify-mentee.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ObservationAssessmentComponent } from './components/observation-assessment/observation-assessment.component';
import { ObservationResultsComponent } from './components/observation-results/observation-results.component';
import { ViwerObservationQuestionsComponent } from './components/viwer-observation-questions/viwer-observation-questions.component';
import { SharedModule } from '../../../project/ws/author/src/lib/modules/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ObservationModalComponent } from './components/observation-modal/observation-modal.component';
import { ScheduleObservationComponent } from './components/schedule-observation/schedule-observation.component';
import { ScheduleDashboardComponent } from './components/schedule-dashboard/schedule-dashboard.component';
import { ViewAttempsComponent } from './components/view-attemps/view-attemps.component';

@NgModule({
    declarations: [
        MenteesListComponent,
        ObservationListComponent,
        MenteeProgressTrackerComponent,
        MentorCardsComponent,
        OtpVerifyMenteeComponent,
        ObservationAssessmentComponent,
        ObservationResultsComponent,
        ViwerObservationQuestionsComponent,
        ObservationModalComponent,
        ScheduleObservationComponent,
        ScheduleDashboardComponent,
        ViewAttempsComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        ObservationRoutingModule,
        MatTabsModule,
        MatIconModule,
        MatExpansionModule,
        ReactiveFormsModule,
        FormsModule,
        MatProgressBarModule,
        MatInputModule,
        MatCheckboxModule,
        MatRadioModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        SharedModule,
        TranslateModule,
        MatDialogModule,
        MatNativeDateModule
    ],
    exports: [
        MenteesListComponent,
        ObservationListComponent,
        MenteeProgressTrackerComponent,
        MentorCardsComponent,
        OtpVerifyMenteeComponent,
        ObservationAssessmentComponent,
        ObservationResultsComponent,
        ViwerObservationQuestionsComponent,
        ObservationModalComponent,
        ScheduleObservationComponent,
        ScheduleDashboardComponent,
        ViewAttempsComponent
    ]
})
export class ObservationModule { }
