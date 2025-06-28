import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { YourLocationComponent } from './your-location/your-location.component';
import { AlmostDoneComponent } from './almost-done/almost-done.component';
import { DropdownDobComponent } from './dropdown-dob/dropdown-dob.component';
import { YourBackgroundComponent } from './your-background/your-background.component';
import { WhatsappNotificationComponent } from './whatsapp-notification/whatsapp-notification.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../project/ws/author/src/lib/modules/shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: YourLocationComponent
  }
];

@NgModule({
  declarations: [
    AlmostDoneComponent,
    DropdownDobComponent,
    YourBackgroundComponent,
    YourLocationComponent,
    WhatsappNotificationComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    IonicModule,
    TranslateModule.forChild(),

    SharedModule
  ],
  exports: [RouterModule]
})
export class AboutYouModule { }
