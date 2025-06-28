import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { AuthRoutingModule } from './auth-routing.module';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { LoginComponent } from './components/login/login.component';
import { LoginOtpComponent } from './components/login-otp/login-otp.component';
import { WidgetResolverModule } from '../../../library/ws-widget/resolver/src/lib/widget-resolver.module';
import { WIDGET_REGISTERED_MODULES, WIDGET_REGISTRATION_CONFIG } from '../../../library/ws-widget/collection/src/lib/registration.config';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { HeaderComponent } from './components/header/header.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectionComponent } from './components/Language/language-selection/language-selection.component';
import { SharedModule } from '../../../project/ws/author/src/lib/modules/shared/shared.module';
import { AlertModalComponent } from './components/alert-modal/alert-modal.component';

@NgModule({
    declarations: [
        CreateAccountComponent,
        LoginComponent,
        LoginOtpComponent,
        ForgotPasswordComponent,
        HeaderComponent,
        LanguageSelectionComponent,
        AlertModalComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatRadioModule,
        ReactiveFormsModule,
        ...WIDGET_REGISTERED_MODULES,
        WidgetResolverModule.forRoot(WIDGET_REGISTRATION_CONFIG),
        TranslateModule.forChild(),
        AuthRoutingModule,
        SharedModule
    ],
    exports: [
        LoginOtpComponent,
        LanguageSelectionComponent,
    ]
})
export class AuthModule {}
