import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AboutHomeComponent } from './components/about-home.component'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { BtnPageBackModule } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
import { HorizontalScrollerModule } from '../../../../../../../../library/ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.module';
import { WidgetResolverModule } from '../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { PipeSafeSanitizerModule } from '../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.module';

@NgModule({
  declarations: [AboutHomeComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,

    BtnPageBackModule,
    HorizontalScrollerModule,
    WidgetResolverModule,
    PipeSafeSanitizerModule,

  ],
  exports: [AboutHomeComponent],
})
export class AboutModule { }
