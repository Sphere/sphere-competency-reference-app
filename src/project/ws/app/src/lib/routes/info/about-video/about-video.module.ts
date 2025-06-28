import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AboutVideoComponent } from './about-video.component'
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router'
import { WidgetResolverModule } from '../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { LocaleTranslatorModule } from '../../../../../../../../library/ws-widget/collection/src/lib/_common/locale-translator/locale-translator.module';
import { BtnPageBackModule } from '../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';

@NgModule({
  declarations: [AboutVideoComponent],
  imports: [
    CommonModule,
    MatRadioModule,
    RouterModule,
    WidgetResolverModule,
    LocaleTranslatorModule,
    MatButtonModule,
    BtnPageBackModule,
    MatToolbarModule,
  ],
  exports: [AboutVideoComponent],
})
export class AboutVideoModule { }
