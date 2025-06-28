import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatTreeModule } from '@angular/material/tree';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MarketingServicesComponent } from './marketing-services.component'
import { PentagonModule } from '../pentagon/pentagon.module'
import { WidgetResolverModule } from '../../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';

@NgModule({
  declarations: [MarketingServicesComponent],
  imports: [
    CommonModule,
    MatTreeModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatListModule,
    PentagonModule,
    WidgetResolverModule,
  ],
  exports: [MarketingServicesComponent],
})
export class MarketingServicesModule { }
