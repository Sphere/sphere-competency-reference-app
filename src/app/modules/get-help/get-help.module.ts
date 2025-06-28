import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {helpWidgetComponent} from './components/help-widget/help-widget.component'
import { getHelpRoutingModule } from './gethelp-routing.module';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [helpWidgetComponent],
  imports: [
    CommonModule,
    IonicModule,
    getHelpRoutingModule,
    TranslateModule.forChild()
  ]
})
export class GetHelpModule { }
