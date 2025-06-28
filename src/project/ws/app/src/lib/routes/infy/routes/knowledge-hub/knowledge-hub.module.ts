import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { KnowledgeHubRoutingModule } from './knowledge-hub-routing.module'
import { KhubHomeComponent } from './routes/khub-home/khub-home.component'
import { KhubViewComponent } from './routes/khub-view/khub-view.component'
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ItemsListComponent } from './components/items-list/items-list.component'
import { ProjectSnapshotComponent } from './components/project-snapshot/project-snapshot.component'
import { TopicTaggerComponent } from './components/topic-tagger/topic-tagger.component'
import { SearchModule } from '../../../search/search.module'
import { AppTocModule } from '../../../app-toc/app-toc.module'
import { BtnPageBackModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module'
import { HorizontalScrollerModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.module'
import { PipeLimitToModule } from '../../../../../../../../../library/ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.module'
import { WidgetResolverModule } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'
import { BtnContentShareModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-content-share/btn-content-share.module'

@NgModule({
  declarations: [
    KhubHomeComponent,
    KhubViewComponent,
    ItemsListComponent,
    ProjectSnapshotComponent,
    TopicTaggerComponent,
  ],
  imports: [
    CommonModule,
    KnowledgeHubRoutingModule,
    BtnPageBackModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    SearchModule,
    HorizontalScrollerModule,
    MatCardModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatFormFieldModule,
    PipeLimitToModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    // ErrorResolverModule,
    WidgetResolverModule,
    BtnContentShareModule,
    AppTocModule,
  ],
})
export class KnowledgeHubModule { }
