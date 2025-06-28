import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CardDetailComponent } from './components/card-detail/card-detail.component'
import { CompetencyHomeComponent } from './components/competency-home/competency-home.component'
import { AchievementsComponent } from './components/achievements/achievements.component'
import { BadgesModule } from './../badges/badges.module'
import { HorizontalScrollerModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.module';
import { WidgetResolverModule } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';

@NgModule({
  declarations: [CardDetailComponent, CompetencyHomeComponent, AchievementsComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HorizontalScrollerModule,

    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    WidgetResolverModule,
    BadgesModule,
  ],
  exports: [CompetencyHomeComponent, AchievementsComponent],
})
export class CompetencyModule { }
