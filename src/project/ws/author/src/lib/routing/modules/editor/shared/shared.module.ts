import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedModule } from '@ws/author/src/lib/modules/shared/shared.module'
import { AceEditorModule } from 'ng2-ace-editor'
import { CatalogSelectModule } from '../shared/components/catalog-select/catalog-select.module'
import { AceEditorComponent } from './components/ace-editor/ace-editor.component'
import { AuthEditorActionButtonsComponent } from './components/auth-editor-action-buttons/auth-editor-action-buttons.component'
import { AuthLanguageSelectBarComponent } from './components/auth-language-select-bar/auth-language-select-bar.component'
import { AuthPickerComponent } from './components/auth-picker/auth-picker.component'
import { EditMetaComponent } from './components/edit-meta/edit-meta.component'
import { PlainCKEditorComponent } from './components/plain-ckeditor/plain-ckeditor.component'
import { MatQuillComponent } from './components/rich-text-editor/my-own.component'
import { QuillComponent } from './components/rich-text-editor/quill.component'
import { DragDropDirective } from './directives/drag-drop.directive'
import { UploadService } from './services/upload.service'
import { BaseComponent } from './components/editor/base/base.component'
import { EditMetaV2Component } from './components/editor/edit-meta-v2/edit-meta-v2.component'
import { DefaultThumbnailModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/directives/default-thumbnail/default-thumbnail.module'
import { PipeDurationTransformModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module'
import { DisplayContentTypeModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/_common/display-content-type/display-content-type.module'

@NgModule({
    declarations: [
        MatQuillComponent,
        QuillComponent,
        PlainCKEditorComponent,
        EditMetaComponent,
        DragDropDirective,
        AceEditorComponent,
        AuthLanguageSelectBarComponent,
        AuthPickerComponent,
        AuthEditorActionButtonsComponent,
        BaseComponent,
        EditMetaV2Component,
    ],
    imports: [
        CommonModule,
        DefaultThumbnailModule,
        PipeDurationTransformModule,
        DisplayContentTypeModule,
        SharedModule,
        AceEditorModule,
        CatalogSelectModule,
    ],
    exports: [
        MatQuillComponent,
        QuillComponent,
        PlainCKEditorComponent,
        EditMetaComponent,
        DragDropDirective,
        AceEditorComponent,
        AuthEditorActionButtonsComponent,
        AuthPickerComponent,
    ],
    providers: [UploadService]
})
export class EditorSharedModule {}
