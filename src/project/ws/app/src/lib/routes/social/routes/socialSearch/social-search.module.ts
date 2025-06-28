import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SocialSearchComponent } from './social-search.component'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router'
import { SocialSearchRoutingModule } from './social-search-routing.module'
import { ForumHandlerService } from '../forums/service/EmitterService/forum-handler.service'
import { SearchFilterDisplayComponent } from './widgets/search-filter-display/search-filter-display.component'
import { BtnSocialVoteModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-vote/btn-social-vote.module';
import { BtnSocialLikeModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/discussion-forum/actionBtn/btn-social-like/btn-social-like.module';
import { BtnPageBackModule } from '../../../../../../../../../library/ws-widget/collection/src/lib/btn-page-back/btn-page-back.module';

@NgModule({
  declarations: [SocialSearchComponent, SearchFilterDisplayComponent],
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatRadioModule,
    MatCardModule,
    BtnSocialVoteModule,
    BtnSocialLikeModule,
    SocialSearchRoutingModule,
    MatProgressSpinnerModule,
    BtnPageBackModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatMenuModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatListModule,
    RouterModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatDividerModule,

  ],
  providers: [ForumHandlerService],
  exports: [SocialSearchComponent],
})
export class SocialSearchModule {
  constructor() {
    // // console.log('Social Search Module Called')
  }

}
