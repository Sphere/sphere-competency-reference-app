import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHowDoesWorkComponent } from './components/mobile-how-does-work/mobile-how-does-work.component';
import { ScrollService } from './services/scroll.service';
import { SphereFooterComponent } from './components/sphere-footer/sphere-footer.component';
import { MobileCourseViewComponent } from '../home/components/mobile-course-view/mobile-course-view.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogModule} from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { VideoPopupComponent } from './components/how-does-it-works-popup/how-does-it-works-popup.component';
import { CardComponent } from './components/course-card/course-card.component';
import { CardService } from './services/card.service';
import { NoResultComponent } from './components/no-result/no-result.component';
import { ConfirmPopUpComponent } from './components/confirm-modal/confirm-modal.component';
import { OfflineModalComponent } from './components/offline-modal/offline-modal.component';
import { EkshamataFooterComponent } from './components/ekshamata-footer/ekshamata-footer.component';
import { ImageCacheModule } from '../../../library/ws-widget/utils/src/lib/directives/image-cache/image-cache.module'
import { IonicModule } from '@ionic/angular';
import { SkeletonCardComponent } from '../../../app/components/skeleton/skeleton-card/skeleton-card.component';
import { SkeletonCarouselComponent } from '../../../app/components/skeleton/skeleton-carousel/skeleton-carousel.component';
import { SkeletonMyCourseCardComponent } from '../../../app/components/skeleton/skeleton-my-course-card/skeleton-my-course-card.component';
import { SqliteService } from './services/sqlite.service';
import { OnlineSqliteService } from './services/online-sqlite.service';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { DataSyncService } from './services/data-sync.service';
import { CarouselComponentComponent } from './components/carousel-component/carousel-component.component';
import { CourseOptimisticUiService } from './services/course-optimistic-ui.service';
import { SkeletonMentorCardComponent } from '../../../app/components/skeleton/skeleton-mentor-cards/skeleton-mentor-cards.component';
import { VideoPopUpQuizComponent } from './components/video-pop-up-quiz/video-pop-up-quiz.component';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

@NgModule({
    declarations: [
        MobileHowDoesWorkComponent,
        SphereFooterComponent,
        MobileCourseViewComponent,
        VideoPopupComponent,
        ConfirmPopUpComponent,
        NoResultComponent,
        CardComponent,
        OfflineModalComponent,
        VideoPopUpQuizComponent,
        EkshamataFooterComponent,
        SkeletonCardComponent,
        SkeletonCarouselComponent,
        CarouselComponentComponent,
        SkeletonMyCourseCardComponent,
        SkeletonMentorCardComponent
    ],
    imports: [
        IonicModule,
        CommonModule,
        MatProgressBarModule,
        MatDialogModule,
        MatIconModule,
        TranslateModule.forChild(),
        ImageCacheModule,
        MatListModule,
        MatRadioModule,
        FormsModule
    ],
    exports: [
        MobileHowDoesWorkComponent,
        VideoPopupComponent,
        ConfirmPopUpComponent,
        SphereFooterComponent,
        MobileCourseViewComponent,
        NoResultComponent,
        CardComponent,
        TranslateModule,
        EkshamataFooterComponent,
        SkeletonCardComponent,
        SkeletonCarouselComponent,
        CarouselComponentComponent,
        SkeletonMyCourseCardComponent,
        SkeletonMentorCardComponent
    ],
    providers: [ScrollService, CardService, SqliteService, DataSyncService, OnlineSqliteService, SQLite, CourseOptimisticUiService,
        ScreenOrientation
    ]
})
export class SharedModule { }
