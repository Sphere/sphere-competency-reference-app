import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { QnaViewComponent } from './components/qna-view/qna-view.component'
import { QnaReplyComponent } from './components/qna-reply/qna-reply.component'
import { WidgetResolverModule } from '../../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { BtnPageBackModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
import { BtnSocialVoteModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-vote/btn-social-vote.module';
import { BtnSocialLikeModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-like/btn-social-like.module';
import { EditorQuillModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/editor-quill/editor-quill.module';
import { UserImageModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module';
import { PipeLimitToModule } from '../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.module';
import { PipeSafeSanitizerModule } from '../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.module';

@NgModule({
  declarations: [QnaViewComponent, QnaReplyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    WidgetResolverModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    BtnPageBackModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    EditorQuillModule,
    UserImageModule,
    PipeLimitToModule,
    PipeSafeSanitizerModule,
  ],
})
export class QnaViewModule { }
