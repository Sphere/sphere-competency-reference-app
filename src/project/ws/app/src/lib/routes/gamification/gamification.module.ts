import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { GamificationRoutingModule } from './gamification-routing.module'
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserImageModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { PipeNameTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-name-transform/pipe-name-transform.module'
import { PipeCountTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-count-transform/pipe-count-transform.module'

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    GamificationRoutingModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    UserImageModule,
    PipeNameTransformModule,
    PipeCountTransformModule,
  ],
})
export class GamificationModule { }
