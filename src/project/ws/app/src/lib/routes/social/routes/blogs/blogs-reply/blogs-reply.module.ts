import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BlogReplyComponent } from './components/blog-reply.component'
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BtnFlagModule } from '../../forums/widgets/buttons/btn-flag/btn-flag.module'
import { UserImageModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module';
import { PipeSafeSanitizerModule } from '../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.module';
import { BtnSocialVoteModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-vote/btn-social-vote.module';
import { BtnSocialLikeModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-like/btn-social-like.module';
import { BtnPageBackModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
import { EditorQuillModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/editor-quill/editor-quill.module';

@NgModule({
  declarations: [BlogReplyComponent],
  imports: [
    CommonModule,
    MatCardModule,
    UserImageModule,
    MatMenuModule,
    MatIconModule,
    PipeSafeSanitizerModule,
    MatButtonModule,
    BtnFlagModule,

    BtnSocialVoteModule,
    BtnSocialLikeModule,
    BtnPageBackModule,
    EditorQuillModule,
  ],
  exports: [BlogReplyComponent],
})
export class BlogsReplyModule { }
