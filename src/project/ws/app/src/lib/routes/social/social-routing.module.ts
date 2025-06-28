import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { PostFetchResolverService } from './resolvers/post-fetch-resolver.service'
import { SocialTimelineResolverService } from './resolvers/social-timeline-resolver.service'
import { BlogEditComponent } from './routes/blogs/blogs-edit/components/blog-edit.component'
import { BlogViewComponent } from './routes/blogs/blogs-view/components/blog-view.component'
import { MyBlogComponent } from './routes/blogs/my-blogs/components/my-blog.component'
import { RecentBlogComponent } from './routes/blogs/recent-blogs/components/recent-blog.component'
import { QnaEditComponent } from './routes/qna/qna-edit/components/qna-edit/qna-edit.component'
import { QnaHomeComponent } from './routes/qna/qna-home/components/qna-home/qna-home.component'
import { QnaViewComponent } from './routes/qna/qna-view/components/qna-view/qna-view.component'

const routes: Routes = [
  {
    path: 'blogs',
    component: RecentBlogComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    }
  },
  {
    path: 'blogs/me',
    pathMatch: 'full',
    redirectTo: 'blogs/me/drafts',
    data: {
      requiredFeatures: ['BLOGS'],
    },
  },
  {
    path: 'blogs/me/:tab',
    component: MyBlogComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    },
  },
  {
    path: 'blogs/:id',
    component: BlogViewComponent,
    data: {
      requiredFeatures: ['BLOGS'],
    },
  },
  {
    path: 'qna',
    component: QnaHomeComponent,
    resolve: {
      resolveData: SocialTimelineResolverService,
    },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    data: {
      postKind: ['Query'],
      type: 'all',
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
  },
  {
    path: 'qna/edit',
    component: QnaEditComponent,
    data: {
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
  },
  {
    path: 'qna/edit/:id',
    component: QnaEditComponent,
    resolve: {
      resolveData: PostFetchResolverService,
    },
    data: {
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
  },
  {
    path: 'forums',
    loadChildren: () => import('./routes/forums/forum-home.module').then(m => m.ForumHomeModule)
    // component: ForumHomeComponent
  },
  {
    path: 'socialSearch',
    loadChildren: () => import('./routes/socialSearch/social-search.module').then(m => m.SocialSearchModule)
    // component: ForumHomeComponent
  },
  {
    path: 'qna/:id',
    component: QnaViewComponent,
    resolve: {
      resolveData: PostFetchResolverService,
    },
    data: {
      requiredFeatures: ['QUESTION_AND_ANSWER'],
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SocialRoutingModule {}
