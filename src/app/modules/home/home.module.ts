import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MobileCategoryComponent } from './components/mobile-category/mobile-category.component';
import { MobileDashboardComponent } from './components/mobile-dashboard/mobile-dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { HomeRoutingModule } from './home-routing.module';
import { UserService } from './services/user.service';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { FooterComponent } from '../../../app/components/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../project/ws/author/src/lib/modules/shared/shared.module';
import { MobileCourseRatingViewComponent } from './components/mobile-course-rating-view/mobile-course-rating-view.component';
import { SharedModule as AastrikShareModule } from '../shared/shared.module';
import { SphereMobileDashboardComponent } from './components/sphere-mobile-dashboard/sphere-mobile-dashboard.component';
import { RoleSelectorDashboardComponent } from './components/role-selector-dashboard/role-selector-dashboard.component';
import { ObservationModule } from '../observation/observation.module';
import { AshaHomeComponent } from './components/asha-home/asha-home.component';
import { TelemetryModule } from '../../../app/modules/telemetry'
import { AshaLearningCompletedComponent } from './components/asha-learning-completed/asha-learning-completed.component';
import { AshaLearningComponent } from './components/asha-learning/asha-learning.component';
import { StepperComponent } from './components/stepper/stepper.component';
import { AudioService } from './services/audio.service';
@NgModule({
    declarations: [
        MobileDashboardComponent,
        MobileCategoryComponent,
        HomeComponent,
        FooterComponent,
        SphereMobileDashboardComponent,
        MobileCourseRatingViewComponent,
        RoleSelectorDashboardComponent,
        AshaHomeComponent,
        AshaLearningCompletedComponent,
        AshaLearningComponent,
        StepperComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        HomeRoutingModule,
        MatToolbarModule,
        TranslateModule.forChild(),
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatMenuModule,
        SharedModule,
        AastrikShareModule,
        ObservationModule,
        TelemetryModule
    ],
    providers: [
        UserService,
        AudioService,
        InAppBrowser
    ],
    exports: [
        MobileDashboardComponent,
        MobileCategoryComponent,
        FooterComponent,
        MobileCourseRatingViewComponent,
        SphereMobileDashboardComponent,
        RoleSelectorDashboardComponent    ]
})

export class HomeModule { }