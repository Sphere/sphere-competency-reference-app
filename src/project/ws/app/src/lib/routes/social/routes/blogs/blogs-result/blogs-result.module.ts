import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BlogResultComponent } from './components/blog-result.component'
import { RouterModule } from '@angular/router'
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PipeSafeSanitizerModule } from '../../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.module';
import { DialogSocialDeletePostModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/dialog/dialog-social-delete-post/dialog-social-delete-post.module';
import { BtnPageBackModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';

@NgModule({
  declarations: [BlogResultComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PipeSafeSanitizerModule,
    DialogSocialDeletePostModule,
    BtnPageBackModule,
  ],
  exports: [BlogResultComponent],
})
export class BlogsResultModule {}
