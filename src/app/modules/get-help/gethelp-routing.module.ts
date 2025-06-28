import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {helpWidgetComponent} from './components/help-widget/help-widget.component'
const routes: Routes = [
    {
        path: '',
        component: helpWidgetComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class getHelpRoutingModule {}