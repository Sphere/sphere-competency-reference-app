import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { SbPopoverComponent } from './popups/sb-popover/sb-popover.component';
import { IonicRatingModule } from 'ionic4-rating';
import { ContentRatingAlertComponent } from './content-rating-alert/content-rating-alert.component';
import { FileSizePipe } from '../../pipes/file-size/file-size';
import { UpgradePopoverComponent } from './popups/upgrade-popover/upgrade-popover.component';
import { ConfirmAlertComponent } from './confirm-alert/confirm-alert.component';
import { ImportPopoverComponent } from './popups/import-popover/import-popover.component';
import { ShowVendorAppsComponent} from '../../app/components/show-vendor-apps/show-vendor-apps.component';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { ShowCertificateComponent } from './show-certificate-component/show-certificate-component.component';
import { AppPublicNavBarComponent } from './app-public-nav-bar/app-public-nav-bar.component';
import { AppNavBarComponent } from './app-nav-bar/app-nav-bar.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { WidgetResolverModule } from '../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { TncRendererComponent } from './tnc-renderer/tnc-renderer.component';
import { PipeSafeSanitizerModule } from '../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.module';
import { SearchModule } from '../../project/ws/app/src/lib/routes/search/search.module';
import { BtnFeatureModule } from '../../library/ws-widget/collection/src/lib/btn-feature/btn-feature.module';
import { RouterModule } from '@angular/router';
import { MdePopoverModule } from '@material-extended/mde'
import { ImageCacheModule } from '../../library/ws-widget/utils/src/lib/directives/image-cache/image-cache.module';
import { ProgressSyncBarComponent } from './../modules/shared/components/progress-sync-bar/progress-sync-bar.component';
import { NotificationComponent } from './notification/notification.component';

@NgModule({
    declarations: [
        SbPopoverComponent,
        ContentRatingAlertComponent,
        UpgradePopoverComponent,
        ConfirmAlertComponent,
        ImportPopoverComponent,
        ShowVendorAppsComponent,
        ShowCertificateComponent,
        AppPublicNavBarComponent,
        AppNavBarComponent,
        TncRendererComponent,
        ProgressSyncBarComponent,
        NotificationComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        MdePopoverModule,
        RouterModule,
        ReactiveFormsModule,
        IonicModule,
        ReactiveFormsModule,
        PipesModule,
        IonicRatingModule,
        TranslateModule.forChild(),
        MatToolbarModule,
        WidgetResolverModule,
        MatIconModule,
        MatExpansionModule,
        MatMenuModule,
        PipeSafeSanitizerModule,
        SearchModule,
        BtnFeatureModule,
        ImageCacheModule
    ],
    exports: [

        SbPopoverComponent,
        ContentRatingAlertComponent,
        UpgradePopoverComponent,
        ConfirmAlertComponent,
        ImportPopoverComponent,
        ShowVendorAppsComponent,
        ShowCertificateComponent,
        AppPublicNavBarComponent,
        TncRendererComponent,
        AppNavBarComponent,
        ProgressSyncBarComponent,
        NotificationComponent
    ],
    providers: [FileSizePipe, ScreenOrientation]
})
export class ComponentsModule { }
