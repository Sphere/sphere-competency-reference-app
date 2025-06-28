import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule } from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import { LogoutComponent } from './logout.component'
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [LogoutComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        TranslateModule.forChild(),
    ]
})
export class LogoutModule { }
