import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResourceCollectionComponent } from './resource-collection.component'
import { ViewSubmissionComponent } from './components/view-submission/view-submission.component'
import { TranslateModule } from '@ngx-translate/core'
import { PlayerPdfModule } from '../../../../../../../library/ws-widget/collection/src/lib/player-pdf/player-pdf.module';
import { PlayerVideoModule } from '../../../../../../../library/ws-widget/collection/src/lib/player-video/player-video.module';

@NgModule({
    declarations: [ResourceCollectionComponent, ViewSubmissionComponent],
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatDialogModule,
        MatCardModule,
        MatPaginatorModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatIconModule,
        MatToolbarModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        PlayerPdfModule,
        PlayerVideoModule,
        TranslateModule.forChild(),
    ],
    exports: [
        ResourceCollectionComponent,
    ]
})
export class ResourceCollectionModule { }
