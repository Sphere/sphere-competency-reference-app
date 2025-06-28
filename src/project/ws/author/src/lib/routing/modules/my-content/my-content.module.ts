import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { ContentCardComponent } from './components/content-card/content-card.component'
import { MyContentComponent } from './components/my-content/my-content.component'
import { MyContentRoutingModule } from './my-content-routing.module'
import { MyContentService } from './services/my-content.service'
import { ContentCardV2Component } from './components/content-card-v2/content-card-v2.component'
import { PipeContentRouteModule } from '../../../../../../../../library/ws-widget/collection/src/lib/_common/pipe-content-route/pipe-content-route.module'
import { PipeDurationTransformModule } from '../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module'

@NgModule({
  declarations: [MyContentComponent, ContentCardComponent, ContentCardV2Component],
  imports: [CommonModule, SharedModule, MyContentRoutingModule, PipeContentRouteModule, PipeDurationTransformModule],
  providers: [MyContentService],
})
export class MyContentModule {}
