import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MarketingComponent } from './marketing.component'
import { MarketingRoutingModule } from './marketing-routing.module'
import { MarketingServicesModule } from './marketing-services/marketing-services.module'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { PageModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/page/page.module'
import { BtnPageBackModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module'

@NgModule({
  declarations: [MarketingComponent],
  imports: [
    CommonModule,
    MarketingRoutingModule,
    MarketingServicesModule,
    PageModule,
    BtnPageBackModule,

    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
  ],
})
export class MarketingModule { }
