import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AceEditorModule } from 'ng2-ace-editor'
import { HandsOnComponent } from './hands-on.component'
import { HandsOnDialogComponent } from './components/hands-on-dialog/hands-on-dialog.component'
import { PipeSafeSanitizerModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.module';
import { PipeDurationTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module';
import { CompletionSpinnerModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/completion-spinner/completion-spinner.module';
@NgModule({
    declarations: [HandsOnComponent, HandsOnDialogComponent],
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatButtonModule,
        MatDialogModule,
        AceEditorModule,
        MatProgressSpinnerModule,
        PipeSafeSanitizerModule,
        PipeDurationTransformModule,
        CompletionSpinnerModule,
    ],
    exports: [
        HandsOnComponent,
    ]
})
export class HandsOnModule { }
