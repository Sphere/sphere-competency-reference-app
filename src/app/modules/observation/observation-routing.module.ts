import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenteesListComponent } from './components/mentees-list/mentees-list.component';
import { ObservationListComponent } from './components/observation-list/observation-list.component';
import { MenteeProgressTrackerComponent } from './components/mentee-progress-tracker/mentee-progress-tracker.component';
import { RouterLinks } from '../../../app/app.constant';
import { OtpVerifyMenteeComponent } from './components/otp-verify-mentee/otp-verify-mentee.component';
import { ObservationAssessmentComponent } from './components/observation-assessment/observation-assessment.component';
import { ObservationResultsComponent } from './components/observation-results/observation-results.component';
import { ScheduleObservationComponent } from './components/schedule-observation/schedule-observation.component';
import { ViewAttempsComponent } from './components/view-attemps/view-attemps.component';


const routes: Routes = [
    {
        path: RouterLinks.MENTEES_LIST,
        component: MenteesListComponent,
        data: {animation: 'observation'}
    },
    {
        path: RouterLinks.OBSERVATION_TRACK,
        component: ObservationListComponent,
        data: {animation: 'observation'}
    },
    {
        path: RouterLinks.MENTEE_PROGRESS,
        component: MenteeProgressTrackerComponent,
        data: {animation: 'observation'}
    },
    {
        path: RouterLinks.VERIFY_MENTEE,
        component: OtpVerifyMenteeComponent,
        data: {animation: 'observation'}
    },
    {
        path: RouterLinks.OBSERVATION_ASSESSMENT,
        component: ObservationAssessmentComponent,
        data: {animation: 'observation'}
    },
    {
        path: RouterLinks.OBSERVATION_RESULTS,
        component: ObservationResultsComponent,
        data: {animation: 'observation'}
    },
    {
        path: RouterLinks.SCHEDULE,
        component: ScheduleObservationComponent,
        data: {animation: 'observation'}
    },
    {
        path: RouterLinks.VIEW_ATTEMPS,
        component: ViewAttempsComponent,
        data: {animation: 'observation'}
    }
   
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ObservationRoutingModule {}