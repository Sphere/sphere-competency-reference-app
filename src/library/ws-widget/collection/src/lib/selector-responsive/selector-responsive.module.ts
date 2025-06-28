import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SelectorResponsiveComponent } from './selector-responsive.component'
import { LayoutModule } from '@angular/cdk/layout'
import { WidgetResolverModule } from '../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'

@NgModule({
    declarations: [SelectorResponsiveComponent],
    imports: [CommonModule, LayoutModule, WidgetResolverModule],
    exports: [SelectorResponsiveComponent]
})
export class SelectorResponsiveModule {}
