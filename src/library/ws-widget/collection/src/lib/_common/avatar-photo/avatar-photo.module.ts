import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { WidgetResolverModule } from '../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.module'
import { AvatarPhotoComponent } from './avatar-photo.component'

@NgModule({
    declarations: [AvatarPhotoComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatRippleModule,
        WidgetResolverModule,
    ],
    exports: [AvatarPhotoComponent]
})
export class AvatarPhotoModule { }
