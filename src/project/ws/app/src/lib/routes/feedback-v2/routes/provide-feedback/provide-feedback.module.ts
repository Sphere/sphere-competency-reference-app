import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BtnContentFeedbackV2Module } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-feedback-v2/btn-content-feedback-v2.module'
import { FeedbackApiService } from '../../apis/feedback-api.service'
import { FeedbackConfigResolver } from '../../resolvers/feedback-config.resolver'
import { FeedbackSummaryResolver } from '../../resolvers/feedback-summary.resolver'
import { ContentRequestComponent } from './components/content-request/content-request.component'
import { FeedbackComponent } from './components/feedback/feedback.component'
import { HomeComponent } from './components/home/home.component'
import { ServiceRequestComponent } from './components/service-request/service-request.component'
import { ProvideFeedbackRoutingModule } from './provide-feedback-routing.module'

@NgModule({
  declarations: [
    HomeComponent,
    FeedbackComponent,
    ContentRequestComponent,
    ServiceRequestComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProvideFeedbackRoutingModule,
    BtnContentFeedbackV2Module,
    MatButtonModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatBadgeModule,
  ],
  providers: [FeedbackApiService, FeedbackSummaryResolver, FeedbackConfigResolver],
})
export class ProvideFeedbackModule { }
