import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MyBlogComponent } from './components/my-blog.component'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router'
import { BlogsResultModule } from '../blogs-result/blogs-result.module'
import { BtnPageBackModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';

@NgModule({
  declarations: [MyBlogComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    RouterModule,
    MatTabsModule,
    BlogsResultModule,
    MatButtonModule,
    BtnPageBackModule,
  ],
  exports: [MyBlogComponent],
})
export class MyBlogsModule { }
