import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LearningComponent } from './routes/learning/learning.component'
// material modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { TileComponent } from './components/tile/tile.component'
import { FeatureUsageComponent } from './routes/feature-usage/feature-usage.component'
import { ProgressSpinnerComponent } from './components/progress-spinner/progress-spinner.component'
import { PlansComponent } from './routes/plans/plans.component'
import { WidgetResolverModule } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { HorizontalScrollerModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.module';
import { DefaultThumbnailModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/directives/default-thumbnail/default-thumbnail.module';
import { PipeLimitToModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.module';
@NgModule({
  declarations: [
    LearningComponent,
    TileComponent,
    FeatureUsageComponent,
    ProgressSpinnerComponent,
    PlansComponent],
  imports: [
    CommonModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatRippleModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatGridListModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSelectModule,
    RouterModule,
    WidgetResolverModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    HorizontalScrollerModule,
    DefaultThumbnailModule,
    MatStepperModule,
    MatTableModule,
    PipeLimitToModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class AnalyticsModule { }
