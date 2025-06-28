import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefrenceVideoComponent } from './components/refrence-video/refrence-video.component';
import { PlayerVideoModule } from '../../../library/ws-widget/collection/src/lib/player-video/player-video.module';
import { RefrencePlayerRoutingModule } from './reference-routing.module';
import { SharedModule } from '../../../project/ws/author/src/lib/modules/shared/shared.module';

@NgModule({
  declarations: [RefrenceVideoComponent],
  imports: [
    CommonModule,
    PlayerVideoModule,
    SharedModule,
    RefrencePlayerRoutingModule
  ]
})
export class ReferencePlayerModule { }
