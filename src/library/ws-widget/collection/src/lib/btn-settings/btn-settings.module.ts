import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import {MatSlideToggleModule} from '@angular/material/slide-toggle'
import { MatListModule } from '@angular/material/list'
import { BtnSettingsComponent } from './btn-settings.component'

@NgModule({
    declarations: [BtnSettingsComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatListModule,
        MatTooltipModule,
    ],
    exports: [BtnSettingsComponent]
})
export class BtnSettingsModule { }
