import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { MarketingComponent } from './marketing.component'
import { MarketingServicesComponent } from './marketing-services/marketing-services.component'
import { PageComponent } from '../../../../../../../../../library/ws-widget/collection/src/lib/page/page.component'
import { MarketingOfferingResolve } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/marketing-offering.resolve'
import { PageResolve } from '../../../../../../../../../library/ws-widget/utils/src/lib/resolvers/page.resolver'

const BASE_URL = `assets/configurations/${location.host.replace(':', '_')}`
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'brandAssets',
  },
  {
    path: 'offering/:tag',
    component: PageComponent,
    data: {
      pageUrl: `${BASE_URL}/page/marketing-offering.json`,
    },
    resolve: {
      pageData: MarketingOfferingResolve,
    },
  },
  {
    path: 'services',
    component: MarketingServicesComponent,
  },
  {
    path: ':tab',
    component: PageComponent,
    data: {
      pageType: 'page',
      pageKey: 'tab',
    },
    resolve: {
      pageData: PageResolve,
    },
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: MarketingComponent,
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class MarketingRoutingModule { }
