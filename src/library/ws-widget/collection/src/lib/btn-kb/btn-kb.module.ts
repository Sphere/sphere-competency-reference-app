import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnKbComponent } from './btn-kb.component'
import { MatDividerModule } from '@angular/material/divider'
import { MatTooltipModule } from '@angular/material/tooltip'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import {MatSelectModule} from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion'
import { BtnKbDialogComponent } from './btn-kb-dialog/btn-kb-dialog.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { MarkAsCompleteModule } from '../_common/mark-as-complete/mark-as-complete.module'
import { BtnKbConfirmComponent } from './btn-kb-confirm/btn-kb-confirm.component'

@NgModule({
    declarations: [BtnKbComponent, BtnKbDialogComponent, BtnKbConfirmComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSelectModule,
        MatExpansionModule,
        MatTooltipModule,
        MarkAsCompleteModule,
        MatDividerModule,
    ],
    exports: [BtnKbComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BtnKbModule { }
