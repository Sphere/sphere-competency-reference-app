import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MyLearningRoutingModule } from './my-learning-routing.module'
import { HomeComponent } from './routes/home/home.component'
import { TranslateModule } from '@ngx-translate/core'
import { CardContentModule } from '../../../../../../../library/ws-widget/collection/src/lib/card-content/card-content.module';
import { WidgetResolverModule } from '../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { BtnPageBackModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MyLearningRoutingModule,
    MatCardModule,
    MatSidenavModule,
    CardContentModule,
    MatToolbarModule,
    WidgetResolverModule,
    MatButtonModule,
    MatIconModule,
    BtnPageBackModule,
    MatProgressSpinnerModule,
  ],
})
export class MyLearningModule {}
