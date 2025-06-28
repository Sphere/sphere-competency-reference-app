import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { QuickTourComponent } from './quick-tour.component'
import { WidgetResolverModule } from '../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'

@NgModule({
  declarations: [QuickTourComponent],
  imports: [
    CommonModule,
    WidgetResolverModule,
  ],
  exports: [QuickTourComponent],
})
export class QuickTourModule { }
