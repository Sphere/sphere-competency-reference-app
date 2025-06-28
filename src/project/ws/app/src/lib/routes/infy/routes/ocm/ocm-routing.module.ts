import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { OcmHomeComponent } from './routes/ocm-home/ocm-home.component'
import { PageResolve } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.resolver'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OcmHomeComponent,
    data: {
      pageType: 'feature',
      pageKey: 'ocm',
    },
    resolve: {
      ocmJson: PageResolve,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OcmRoutingModule { }
