import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { QnaEditComponent } from './components/qna-edit/qna-edit.component'
import { WidgetResolverModule } from '../../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { BtnPageBackModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
import { EditorQuillModule } from '../../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/editor-quill/editor-quill.module';

@NgModule({
  declarations: [QnaEditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    WidgetResolverModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    BtnPageBackModule,
    EditorQuillModule,
  ],
})
export class QnaEditModule { }
