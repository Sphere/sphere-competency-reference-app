import { NgModule , CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';

@NgModule({
    declarations: [],
    imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, TranslateModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [],
    providers: [
        FileOpener,
        AndroidPermissions,
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule,
        HTTP
    ]
})
export class SharedModule {}
