import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IntranetSelectorComponent } from './intranet-selector.component'
import { WidgetResolverModule } from '../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'

@NgModule({
    declarations: [IntranetSelectorComponent],
    imports: [
        CommonModule,
        WidgetResolverModule,
    ]
})
export class IntranetSelectorModule { }
