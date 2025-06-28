import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LanguageSelectorComponent } from './language-selector.component'
import { MatSelectModule } from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
    declarations: [LanguageSelectorComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [LanguageSelectorComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LanguageSelectorModule { }
