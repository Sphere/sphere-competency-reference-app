import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { EventsRoutingModule } from './events-routing.module'
import { LiveEventsComponent } from './live-events/live-events.component'

// material
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDividerModule } from '@angular/material/divider'
import { MatExpansionModule } from '@angular/material/expansion';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { WidgetResolverModule } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'
import { BtnPageBackModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module'

@NgModule({
  declarations: [LiveEventsComponent],
  imports: [
    CommonModule,
    EventsRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatSnackBarModule,
    WidgetResolverModule,
    BtnPageBackModule,
  ],
})
export class EventsModule {}
