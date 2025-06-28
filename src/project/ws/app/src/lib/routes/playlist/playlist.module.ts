import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlaylistCardComponent } from './components/playlist-card/playlist-card.component'
import { PlaylistContentDeleteDialogComponent } from './components/playlist-content-delete-dialog/playlist-content-delete-dialog.component'
import { PlaylistContentDeleteErrorDialogComponent } from './components/playlist-content-delete-error-dialog/playlist-content-delete-error-dialog.component'
import { PlaylistDeleteDialogComponent } from './components/playlist-delete-dialog/playlist-delete-dialog.component'
import { PlaylistShareDialogComponent } from './components/playlist-share-dialog/playlist-share-dialog.component'
import { FilterPlaylistPipe } from './pipes/filter-playlist.pipe'
import { PlaylistRoutingModule } from './playlist-routing.module'
import { PlaylistCreateComponent } from './routes/playlist-create/playlist-create.component'
import { PlaylistDetailComponent } from './routes/playlist-detail/playlist-detail.component'
import { PlaylistEditComponent } from './routes/playlist-edit/playlist-edit.component'
import { PlaylistHomeComponent } from './routes/playlist-home/playlist-home.component'
import { PlaylistNotificationComponent } from './routes/playlist-notification/playlist-notification.component'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { BtnPlaylistModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-playlist/btn-playlist.module';
import { BtnPageBackModule } from '../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';
import { WidgetResolverModule } from '../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { DisplayContentTypeModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/display-content-type/display-content-type.module';
import { PickerContentModule } from '../../../../../../../library/ws-widget/collection/src/lib/picker-content/picker-content.module';
import { PipeDurationTransformModule } from '../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-duration-transform/pipe-duration-transform.module';
import { TreeCatalogModule } from '../../../../../../../library/ws-widget/collection/src/lib/tree-catalog/tree-catalog.module';
import { DefaultThumbnailModule } from '../../../../../../../library/ws-widget/utils/src/lib/directives/default-thumbnail/default-thumbnail.module';
import { DisplayContentsModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/display-contents/display-contents.module';
import { UserImageModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module';
import { UserAutocompleteModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/user-autocomplete/user-autocomplete.module';
import { TourModule } from '../../../../../../../library/ws-widget/collection/src/lib/_common/tour-guide/tour-guide.module';
import { ContentPickerV2Module } from '../../../../../../../library/ws-widget/collection/src/lib/_common/content-picker-v2/content-picker-v2.module';
@NgModule({
    declarations: [
        PlaylistCardComponent,
        PlaylistContentDeleteDialogComponent,
        PlaylistDeleteDialogComponent,
        PlaylistHomeComponent,
        PlaylistEditComponent,
        PlaylistNotificationComponent,
        PlaylistDetailComponent,
        FilterPlaylistPipe,
        PlaylistCreateComponent,
        PlaylistShareDialogComponent,
        PlaylistContentDeleteErrorDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PlaylistRoutingModule,
        BtnPlaylistModule,
        BtnPageBackModule,
        WidgetResolverModule,
        DisplayContentTypeModule,
        PickerContentModule,
        PipeDurationTransformModule,
        DragDropModule,
        // EmailInputModule,
        TreeCatalogModule,
        DefaultThumbnailModule,
        DisplayContentsModule,
        UserImageModule,
        UserAutocompleteModule,
        TourModule,
        ContentPickerV2Module,
        // material imports
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        MatRippleModule,
        MatButtonModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatMenuModule,
        MatDialogModule,
        MatCardModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatTooltipModule,
        MatProgressBarModule,
    ]
})
export class PlaylistModule { }
