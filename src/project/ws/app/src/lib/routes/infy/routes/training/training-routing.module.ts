import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HomeComponent } from './components/home/home.component'

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./routes/training-dashboard/training-dashboard.module').then(m => m.TrainingDashboardModule)
  },
  {
    path: ':contentId',
    loadChildren: () => import('./routes/training-content/training-content.module').then(m => m.TrainingContentModule)
  },
  {
    path: '',
    redirectTo: 'dashboard',
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class TrainingRoutingModule {}
