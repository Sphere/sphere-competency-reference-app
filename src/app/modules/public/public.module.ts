import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PublicHomeComponent } from './components/public-home/public-home.component';
import { PublicHomeRoutingModule } from './public-home-routing.module';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MobilePageComponent } from './components/mobile-page/mobile-page.component';
import { MobileHomeComponent } from './components/mobile-home/mobile-home.component';
import { WidgetResolverModule } from '../../../library/ws-widget/resolver/src/lib/widget-resolver.module'
import { PublicLicenseComponent } from './components/public-license/public-license.component';
import { PublicTocComponent } from './components/public-toc/public-toc.component';
import { PublicTocBannerComponent } from './components/public-toc-banner/public-toc-banner.component';
import { PublicTocOverviewComponent } from './components/public-toc-overview/public-toc-overview.component';
import { PipeDurationTransformModule } from '../../../library/ws-widget/utils/src/public-api';
// import { FooterComponent } from '@app/app/components/footer/footer.component';
import { MobileTrustedByPageComponent } from './components/mobile-trusted-by-page/mobile-trusted-by-page.component';
import { SphereMobilePageComponent } from './components/sphere-mobile-page/sphere-mobile-page.component';
import { SphereMobileHomeComponent } from './components/sphere-mobile-home/sphere-mobile-home.component';
import {SharedModule} from '../shared/shared.module'
import { SharedModule as AastrikShareModule } from '../shared/shared.module';
import { ComponentsModule } from '../../../app/components/components.module';
import { UserImageModule } from '../../../library/ws-widget/collection/src/lib/_common/user-image/user-image.module';
import { WIDGET_REGISTERED_MODULES, WIDGET_REGISTRATION_CONFIG } from '../../../library/ws-widget/collection/src/lib/registration.config';

@NgModule({
    declarations: [
        PublicHomeComponent,
        MobilePageComponent,
        MobileHomeComponent,
        PublicLicenseComponent,
        PublicTocComponent,
        PublicTocBannerComponent,
        PublicTocOverviewComponent,
        // FooterComponent,
        MobileTrustedByPageComponent,
        SphereMobilePageComponent,
        SphereMobileHomeComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCardModule,
        MatTabsModule,
        MatDividerModule,
        ReactiveFormsModule,
        PublicHomeRoutingModule,
        PipeDurationTransformModule,
        UserImageModule,
        SharedModule,
        // MatToolbarModule,
        ...WIDGET_REGISTERED_MODULES,
        WidgetResolverModule.forRoot(WIDGET_REGISTRATION_CONFIG),
        TranslateModule.forChild(),
        AastrikShareModule,
        ComponentsModule
    ],
    exports: [
        MobilePageComponent,
        MobileHomeComponent,
        PublicTocComponent,
        PublicTocBannerComponent,
        PublicTocOverviewComponent,
        MobileTrustedByPageComponent,
        SphereMobilePageComponent,
        SphereMobileHomeComponent
        // FooterComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PublicModule { }
