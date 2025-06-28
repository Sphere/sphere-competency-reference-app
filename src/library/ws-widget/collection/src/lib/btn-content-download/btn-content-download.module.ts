import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnContentDownloadComponent } from './btn-content-download.component'
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
    declarations: [BtnContentDownloadComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
    ],
    exports: [BtnContentDownloadComponent]
})
export class BtnContentDownloadModule { }
