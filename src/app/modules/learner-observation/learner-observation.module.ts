import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SharedModule as  SharedModuleWP } from '../../../project/ws/author/src/lib/modules/shared/shared.module';
import { LearnerObservationRoutingModule } from './learner-observation-routing.module';
import { LearnerObservationDashboardComponent } from './learner-observation-dashboard/learner-observation-dashboard.component';
import { ObservationModule } from '../observation/observation.module';
import { LearnerObservationScheduleComponent } from './components/learner-observation-schedule/learner-observation-schedule.component';
import { LearnerObservationCompletedComponent } from './components/learner-observation-completed/learner-observation-completed.component';
import { TranslateModule } from '@ngx-translate/core';
import { LearnerObservationReporteComponent } from './components/learner-observation-report/learner-observation-report.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    LearnerObservationDashboardComponent,
    LearnerObservationCompletedComponent,
    LearnerObservationScheduleComponent,
    LearnerObservationReporteComponent
  ],
  imports: [
    CommonModule,
    SharedModuleWP,
    SharedModule,
    LearnerObservationRoutingModule,
    ObservationModule,
    MatTabsModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatInputModule,
    IonicModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    TranslateModule,
  ]
})
export class LearnerObservationModule { }
