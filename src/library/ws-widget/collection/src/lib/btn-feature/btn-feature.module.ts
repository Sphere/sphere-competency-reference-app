import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BtnFeatureComponent } from './btn-feature.component'
import { RouterModule } from '@angular/router'
import { TelemetryModule } from '../../../../../../app/modules/telemetry'
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { WidgetUrlResolverDirective } from './widget-url-resolver.directive'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
    declarations: [BtnFeatureComponent, WidgetUrlResolverDirective],
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatCardModule,
        MatMenuModule,
        MatRippleModule,
        MatBadgeModule,
        TranslateModule,
        TelemetryModule
    ],
    exports: [BtnFeatureComponent]
})
export class BtnFeatureModule {}
