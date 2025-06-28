import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; // MatOptionModule is part of @angular/material/core
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ProfileRoutingModule } from './profile-routing.module';
import { ConfigService } from './services/config.service';
import { MobileProfileDashboardComponent } from './components/mobile-profile-dashboard/mobile-profile-dashboard.component';
import { ProfileSelectComponent } from './components/profile-select/profile-select.component';
import { MobileAboutPopupComponent } from './components/mobile-about-popup/mobile-about-popup.component';
import { CertificateReceivedComponent } from './components/certificate-received/certificate-received.component';
import { EducationListComponent } from './components/education-list/education-list.component';
import { EducationEditComponent } from './components/education-edit/education-edit.component';
import { WorkInfoListComponent } from './components/work-info-list/work-info-list.component';
import { WorkInfoEditComponent } from './components/work-info-edit/work-info-edit.component';
import { PersonalDetailEditComponent } from './components/personal-detail-edit/personal-detail-edit.component';
import { LanguageDialogComponent } from './components/language-dialog/language-dialog.component';
import { DropdownDobComponent } from './components/dropdown-dob/dropdown-dob.component';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import {MatDividerModule} from '@angular/material/divider';
import { SelfAssessmentModule } from '@aastrika_npmjs/comptency/self-assessment'
import { CompetencyModule } from '@aastrika_npmjs/comptency/competency'
import { EntryModule } from '@aastrika_npmjs/comptency/entry-module'
import { COMPETENCY_REGISTRATION_CONFIG } from '../../../app/competency/competency.config';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderService } from '@ws/author';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../../project/ws/author/src/lib/modules/shared/shared.module';
import { PersonalDetailsListComponent } from './components/personal-details-list/personal-details-list.component';
import { OrgDetailsListComponent } from './components/org-details-list/org-details-list.component';
import { OrgDetailsEditComponent } from './components/org-details-edit/org-details-edit.component';
import { DownloadCourseComponent } from './components/download-course/download-course.component';
import { SharedModule as AastrikShareModule } from '../shared/shared.module';
import { ImageCacheModule } from '../../../library/ws-widget/utils/src/lib/directives/image-cache/image-cache.module';
import { ProfileModalComponent } from './components/profile-modal/profile-modal.component';
import { NotificationSettingComponent } from './components/notification-setting/notification-setting.component';


@NgModule({
    declarations: [
        MobileProfileDashboardComponent,
        ProfileSelectComponent,
        MobileAboutPopupComponent,
        CertificateReceivedComponent,
        EducationListComponent,
        EducationEditComponent,
        WorkInfoListComponent,
        WorkInfoEditComponent,
        PersonalDetailEditComponent,
        LanguageDialogComponent,
        DropdownDobComponent,
        PersonalDetailsListComponent,
        OrgDetailsListComponent,
        OrgDetailsEditComponent,
        DownloadCourseComponent,
        ProfileModalComponent,
        NotificationSettingComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        ReactiveFormsModule,
        ProfileRoutingModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatDatepickerModule,
        EntryModule.forRoot(COMPETENCY_REGISTRATION_CONFIG),
        SelfAssessmentModule,
        CompetencyModule,
        FormsModule,
        MatRadioModule,
        MatListModule,
        MatSelectModule,
        TranslateModule.forChild(),
        AuthModule,
        SharedModule,
        AastrikShareModule,
        ImageCacheModule
    ],
    providers: [
        ConfigService,
        LoaderService,
    ],
    exports: [
        MobileProfileDashboardComponent,
        ProfileSelectComponent,
        MobileAboutPopupComponent,
        CertificateReceivedComponent,
        EducationListComponent,
        EducationEditComponent,
        WorkInfoListComponent,
        WorkInfoEditComponent,
        PersonalDetailEditComponent,
        LanguageDialogComponent,
        DropdownDobComponent,
        DownloadCourseComponent,
        ProfileModalComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ProfileDashboardModule { }