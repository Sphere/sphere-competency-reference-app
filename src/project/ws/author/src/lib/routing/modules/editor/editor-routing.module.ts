import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { InitResolver } from '@ws/author/src/lib/services/init-resolve.service'
import { EditorComponent } from './components/editor/editor.component'

const routes: Routes = [
  {
    path: '',
    component: EditorComponent,
    children: [
      {
        path: 'curate',
        loadChildren: () => import('./routing/modules/curate/curate.module').then(m => m.CurateModule),
      },
      {
        path: 'upload',
        loadChildren: () => import('./routing/modules/upload/upload.module').then(m => m.UploadModule),
      },
      {
        path: 'collection',
        data: {
          load: ['collection', 'create'],
        },
        resolve: {
          script: InitResolver,
        },
        loadChildren: () => import('./routing/modules/collection/collection.module').then(m => m.CollectionModule),
      },
      {
        path: 'quiz',
        loadChildren: () => import('./routing/modules/quiz/quiz.module').then(m => m.QuizModule),
      },
      {
        path: 'assessment',
        loadChildren: () => import('./routing/modules/quiz/quiz.module').then(m => m.QuizModule)
      },
      {
        path: 'web-module',
        loadChildren: () => import('./routing/modules/web-page/web-page.module').then(m => m.WebPageModule)
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditorRoutingModule { }
