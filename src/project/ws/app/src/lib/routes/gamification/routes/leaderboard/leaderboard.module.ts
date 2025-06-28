import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { LeaderboardRoutingModule } from './leaderboard-routing.module'
import { LeaderboardHomeComponent } from './components/leaderboard-home/leaderboard-home.component'
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { LeaderboardItemComponent } from '../leaderboard-item/leaderboard-item.component'
import { CardListComponent } from '../card-list/card-list.component'
import { CardListItemComponent } from '../card-list-item/card-list-item.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { UserImageModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module';
import { PipeNameTransformModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-name-transform/pipe-name-transform.module';
import { PipeCountTransformModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-count-transform/pipe-count-transform.module';

@NgModule({
  declarations: [LeaderboardHomeComponent,
    LeaderboardItemComponent,
    CardListComponent,
    CardListItemComponent,
  ],
  imports: [
    CommonModule,
    LeaderboardRoutingModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    UserImageModule,
    PipeNameTransformModule,
    FormsModule,
    ReactiveFormsModule,
    PipeCountTransformModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [DatePipe],
})
export class LeaderboardModule { }
