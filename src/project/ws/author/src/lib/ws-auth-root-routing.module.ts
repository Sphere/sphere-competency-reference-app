import { CreateCourseComponent } from './routing/modules/create/components/create-course/create-course.component'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AuthRootComponent } from './components/root/root.component'
import { ViewerComponent } from './routing/components/viewer/viewer.component'
import { CreateComponent } from './routing/modules/create/components/create/create.component'
import { AuthHomeComponent } from './routing/modules/home/components/home/home.component'
import { ContentAndDataReadMultiLangTOCResolver } from './services/content-and-data-read-multi-lang.service'
import { ContentTOCResolver } from './services/content-resolve.service'
import { InitResolver } from './services/init-resolve.service'

const routes: Routes = [
  {
    path: 'home',
    component: AuthHomeComponent,
    resolve: {
      script: InitResolver,
    },
  },
  {
    path: 'editor',
    loadChildren: () => import('./routing/modules/editor/editor.module').then(m => m.EditorModule),
    data: {
      load: ['ordinals', 'ckeditor', 'meta'],
    },
    resolve: {
      script: InitResolver,
    },
  },
  {
    path: 'editor/:id',
    loadChildren: () => import('./routing/modules/editor/editor.module').then(m => m.EditorModule),
    data: { load: ['ordinals', 'ckeditor', 'meta'] },
    resolve: {
      script: InitResolver,
      contents: ContentAndDataReadMultiLangTOCResolver,
    },
  },
  {
    path: 'my-content',
    loadChildren: () => import('./routing/modules/my-content/my-content.module').then(m => m.MyContentModule),
    data: { load: ['ordinals', 'meta'] },
    resolve: {
      script: InitResolver,
    },
  },
  {
    path: 'create',
    data: {
      load: ['create', 'ordinals'],
      requiredFeatures: ['authoring'],
    },
    component: CreateComponent,
    resolve: {
      script: InitResolver,
    },
  },
  {
    path: 'create-course',
    data: {
      // load: ['create', 'ordinals'],
      requiredFeatures: ['authoring'],
    },
    component: CreateCourseComponent,
    resolve: {
      script: InitResolver,
    },
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'viewer/:id',
    component: ViewerComponent,
    resolve: {
      content: ContentTOCResolver,
    },
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AuthRootComponent,
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class WsAuthorRootRoutingModule {}
