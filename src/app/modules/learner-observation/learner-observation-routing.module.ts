import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LearnerObservationDashboardComponent } from './learner-observation-dashboard/learner-observation-dashboard.component';
import { LearnerObservationScheduleComponent } from './components/learner-observation-schedule/learner-observation-schedule.component';
import { LearnerObservationCompletedComponent } from './components/learner-observation-completed/learner-observation-completed.component';
import { LearnerObservationReporteComponent } from './components/learner-observation-report/learner-observation-report.component';
import { RouterLinks } from '../../../app/app.constant';
const routes: Routes = [
  {
    path: '', // Empty path for lazy-loaded module resolves to /my-courses
    component: LearnerObservationDashboardComponent,
    children: [
      { path: '', redirectTo: 'scheduled', pathMatch: 'full' },
      { path: 'scheduled', component: LearnerObservationScheduleComponent },

      { path: 'completed', component: LearnerObservationCompletedComponent }
    ]
  },
  {
    path: RouterLinks.OBSERVATION_REPORT,
    component: LearnerObservationReporteComponent,
  }
  
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearnerObservationRoutingModule { }
