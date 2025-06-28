import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QnaHomeComponent } from './components/qna-home/qna-home.component'
import { QnaItemComponent } from './components/qna-item/qna-item.component'
import { TranslateModule } from '@ngx-translate/core'
import { WidgetResolverModule } from '../../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { BtnPageBackModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
import { PipeLimitToModule } from '../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.module';
import { PipeCountTransformModule } from '../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-count-transform/pipe-count-transform.module';
import { DialogSocialDeletePostModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/dialog/dialog-social-delete-post/dialog-social-delete-post.module';

@NgModule({
  declarations: [QnaHomeComponent, QnaItemComponent],
  imports: [
    CommonModule,
    RouterModule,
    WidgetResolverModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    BtnPageBackModule,
    // ErrorResolverModule,
    PipeLimitToModule,
    PipeCountTransformModule,
    DialogSocialDeletePostModule,
    TranslateModule.forChild(),
  ],
})
export class QnaHomeModule { }
