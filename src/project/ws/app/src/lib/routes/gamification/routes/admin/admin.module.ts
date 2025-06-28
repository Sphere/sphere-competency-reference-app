import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AdminRoutingModule } from './admin-routing.module'
import { AdminComponent } from './components/admin/admin.component'
import { ExcelService } from './components/excel.service'
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { UserImageModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module'
import { FormsModule } from '@angular/forms'
import { PipeNameTransformModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-name-transform/pipe-name-transform.module'
import { PipeCountTransformModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-count-transform/pipe-count-transform.module'
import { ConfigurationsComponent } from './components/configurations/configurations.component'

@NgModule({
  declarations: [AdminComponent,
    ConfigurationsComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    UserImageModule,
    PipeNameTransformModule,
    FormsModule,
    PipeCountTransformModule,
    MatFormFieldModule,
    MatInputModule, MatSidenavModule, MatMenuModule,
  ],
  providers: [ExcelService],
})
export class AdminModule { }
