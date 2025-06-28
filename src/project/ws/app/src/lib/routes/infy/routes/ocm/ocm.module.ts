import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AdoptionDashboardComponent } from './routes/adoption-dashboard/adoption-dashboard.component'
import { ChangeChampionsComponent } from './routes/change-champions/change-champions.component'
import { CoCreateComponent } from './routes/co-create/co-create.component'
import { FeedbackComponent } from './routes/feedback/feedback.component'
import { OcmHomeComponent } from './routes/ocm-home/ocm-home.component'
import { SentientProgramsComponent } from './routes/sentient-programs/sentient-programs.component'
import { WhatNextComponent } from './routes/what-next/what-next.component'
import { AboutComponent } from './routes/about/about.component'
import { InfluenceChangeComponent } from './routes/influence-change/influence-change.component'
import { SearchResultsStripComponent } from './routes/search-results-strip/search-results-strip.component'
import { ToDoListComponent } from './routes/to-do-list/to-do-list.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { OcmRoutingModule } from './ocm-routing.module'
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PipeNameTransformModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-name-transform/pipe-name-transform.module'
import { WidgetResolverModule } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'
import { UserImageModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { BtnPageBackModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module'

@NgModule({
  declarations: [
    AdoptionDashboardComponent,
    ChangeChampionsComponent,
    CoCreateComponent,
    FeedbackComponent,
    OcmHomeComponent,
    SentientProgramsComponent,
    WhatNextComponent,
    AboutComponent,
    InfluenceChangeComponent,
    SearchResultsStripComponent,
    ToDoListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatTabsModule,
    MatDatepickerModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatButtonModule,
    MatRadioModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    OcmRoutingModule,
    PipeNameTransformModule,
    WidgetResolverModule,
    UserImageModule,
    BtnPageBackModule,
  ],
})
export class OcmModule {}
