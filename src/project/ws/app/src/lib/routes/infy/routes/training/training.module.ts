import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material/toolbar';
import { TrainingRoutingModule } from './training-routing.module'
import { HomeComponent } from './components/home/home.component'
import { TrainingTypeComponent } from './components/training-type/training-type.component'
import { BtnPageBackModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';

@NgModule({
  declarations: [HomeComponent, TrainingTypeComponent],
  imports: [CommonModule, TrainingRoutingModule, MatToolbarModule, BtnPageBackModule],
  exports: [TrainingTypeComponent],
})
export class TrainingModule {}
