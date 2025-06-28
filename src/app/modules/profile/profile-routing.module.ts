import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EducationEditComponent } from './components/education-edit/education-edit.component';
import { EducationListComponent } from './components/education-list/education-list.component';
import { MobileProfileDashboardComponent } from './components/mobile-profile-dashboard/mobile-profile-dashboard.component';
import { PersonalDetailEditComponent } from './components/personal-detail-edit/personal-detail-edit.component';
import { WorkInfoEditComponent } from './components/work-info-edit/work-info-edit.component';
import { WorkInfoListComponent } from './components/work-info-list/work-info-list.component';
import { PersonalDetailsListComponent } from './components/personal-details-list/personal-details-list.component';
import { OrgDetailsListComponent } from './components/org-details-list/org-details-list.component';
import { OrgDetailsEditComponent } from './components/org-details-edit/org-details-edit.component';
import { CertificateReceivedComponent } from './components/certificate-received/certificate-received.component';
import { CompetencyDashboardComponent } from '@aastrika_npmjs/comptency/competency';
import { DownloadCourseComponent } from './components/download-course/download-course.component';
import { NotificationSettingComponent } from './components/notification-setting/notification-setting.component';


const routes: Routes = [
  {
    path: '',
    component: MobileProfileDashboardComponent
  },
  {
    path: 'app/profile-view',
    component: MobileProfileDashboardComponent,
  },
  {
    path: 'hi/app/profile-view',
    component: MobileProfileDashboardComponent,
  },
  {
    path: 'app/education-list',
    component: EducationListComponent,
  },
  {
    path: 'app/education-edit',
    component: EducationEditComponent,
  },
  {
    path: 'app/workinfo-list',
    component: WorkInfoListComponent,
  },
  {
    path: 'app/workinfo-edit',
    component: WorkInfoEditComponent,
  },
  {
    path: 'app/personal-detail-edit',
    component: PersonalDetailEditComponent,
  },
  {
    path: 'app/personal-detail-list',
    component: PersonalDetailsListComponent,
  },
  {
    path: 'app/organization-list',
    component: OrgDetailsListComponent,
  },
  {
    path: 'app/organization-edit',
    component: OrgDetailsEditComponent,
  },
  {
    path: 'app/certificate-list',
    component: CertificateReceivedComponent,
  },
  {
    path: 'app/passbook',
    component: CompetencyDashboardComponent,
  },
  {
    path: 'app/download-course',
    component: DownloadCourseComponent,
  },
  {
    path: 'app/notification-setting',
    component: NotificationSettingComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }