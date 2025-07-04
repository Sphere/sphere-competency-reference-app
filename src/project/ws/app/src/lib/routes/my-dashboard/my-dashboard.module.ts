import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MyDashboardHomeComponent } from './components/my-dashboard-home/my-dashboard-home.component'
import { MyDashboardRoutingModule } from './my-dashboard-routing.module'
import { BtnPageBackModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';

@NgModule({
  declarations: [MyDashboardHomeComponent],
  imports: [
    CommonModule,
    MyDashboardRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    BtnPageBackModule,
  ], exports: [MyDashboardHomeComponent],
})
export class MyDashboardModule { }
