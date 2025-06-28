import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PlayerBriefComponent } from './player-brief.component'
import { PipeCountTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-count-transform/pipe-count-transform.module'
import { PipeDurationTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module'
import { DisplayContentTypeModule } from '../display-content-type/display-content-type.module'
import { UserContentRatingModule } from '../user-content-rating/user-content-rating.module'
import { UserImageModule } from '../user-image/user-image.module'
import { BtnMailUserModule } from '../../btn-mail-user/btn-mail-user.module'
import { MarkAsCompleteModule } from '../mark-as-complete/mark-as-complete.module'
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [PlayerBriefComponent],
  imports: [
    CommonModule,
    PipeCountTransformModule,
    PipeDurationTransformModule,
    DisplayContentTypeModule,
    MatDividerModule,
    MatChipsModule,
    MatIconModule,
    UserContentRatingModule,
    MatCardModule,
    UserImageModule,
    BtnMailUserModule,
    MatButtonModule,
    MarkAsCompleteModule,
  ],
  exports: [PlayerBriefComponent],
})
export class PlayerBriefModule { }
