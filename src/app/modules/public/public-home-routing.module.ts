import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicHomeComponent } from './components/public-home/public-home.component';
import { PublicTocOverviewComponent } from './components/public-toc-overview/public-toc-overview.component';
import { PublicTocComponent } from './components/public-toc/public-toc.component';

const routes: Routes = [
    {
        path: '',
        component: PublicHomeComponent
    },
    {
      path: 'public/toc',
      component: PublicTocComponent,
      children: [
        {
          path: 'overview',
          component: PublicTocOverviewComponent,
        },
      ],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicHomeRoutingModule {}