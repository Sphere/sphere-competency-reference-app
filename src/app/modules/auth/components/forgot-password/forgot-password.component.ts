import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Router } from '@angular/router';
import { SignupService } from '../../services/signup/signup.service';
import { AlertModalComponent} from './../alert-modal/alert-modal.component'
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Events } from '../../../../../util/events';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { Environment, ErrorType, PageId, TelemetryGeneratorService } from '../../../../../services';
@Component({
  selector: 'wc-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements AfterViewChecked {
  passwordForm: UntypedFormGroup
  email: any
  emailOrMobile = ''
  showEmailsection = true; // true
  showOtpPwd = false // false
  showSetPassword = false; // false
  emailForm: UntypedFormGroup
  otpForm: UntypedFormGroup;
  @ViewChild('resend', { static: false }) resend!: ElementRef
  showResend = false
  key = ''
  resendOTPbtn: any = '';
  counter: any
  disableResendButton = false
  resendOtpCounter = 1
  maxResendTry = 4
  sendOtpLoader = false;
  resendOtpLoader = false;
  verifyOtpLoader = false;
  setPasswordLoader = false;
  navigateToEkshmataHome: boolean = false;
  appFramework: string;
  emitNavigateBack: boolean = false;

  constructor(
    private router: Router, 
    private signupService: SignupService,
    private fb: UntypedFormBuilder, 
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private inAppBrowser: InAppBrowser,
    private translate: TranslateService,
    private events: Events,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.passwordForm = this.fb.group({
      password: new UntypedFormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]),
      confirmPassword: new UntypedFormControl('', [
        Validators.required
      ]),
    }, { validators: this.passwordMatchValidator })

    this.emailForm = this.fb.group({
      userInput: new UntypedFormControl('', [Validators.required, Validators.pattern(/^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/)]),
    })
    this.otpForm = this.fb.group({
      OTPCHRone: new UntypedFormControl('', [Validators.required]),
      OTPCHRtwo: new UntypedFormControl('', [Validators.required]),
      OTPCHRthree: new UntypedFormControl('', [Validators.required]),
      OTPCHRfour: new UntypedFormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    this.detectFramework();
  }
  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if(this.appFramework === 'Sphere'){
        this.emitNavigateBack = true
        this.navigateToEkshmataHome = false
      }else if (this.appFramework === 'Ekshamata')
      {
        this.navigateToEkshmataHome = true
        this.emitNavigateBack = false
      }
    } catch (error) {
      console.log('error while getting packagename')
    }
  }

  passwordMatchValidator(formGroup: UntypedFormGroup): { [key: string]: any } | null {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    if (confirmPassword.value == '') {
      confirmPassword.setErrors({ required: true });
      return { required: true };
    }else if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  initOptForm(){
    if(this.key == 'phone'){
      this.otpForm = this.fb.group({
        OTPCHRone: new UntypedFormControl('', [Validators.required]),
        OTPCHRtwo: new UntypedFormControl('', [Validators.required]),
        OTPCHRthree: new UntypedFormControl('', [Validators.required]),
        OTPCHRfour: new UntypedFormControl('', [Validators.required]),
      })
    } else {
      this.otpForm = this.fb.group({
        OTPCHRone: new UntypedFormControl('', [Validators.required]),
        // OTPCHRtwo: new FormControl('', [Validators.required]),
        // OTPCHRthree: new FormControl('', [Validators.required]),
        // OTPCHRfour: new FormControl('', [Validators.required]),     
        // OTPCHRfive: new FormControl('', [Validators.required]),     
        // OTPCHRsix: ['']     
      })
    }
    this.otpForm.reset();
  }

  gotoToSendOTPScreen(){
    this.emailForm.reset();
    this.otpForm.reset();
    this.passwordForm.reset();
    this.showEmailsection = true;
    this.showOtpPwd = false;
    this.showSetPassword = false;
  }

  ngAfterViewChecked() {
    // To show the Resend button after 30s
    setTimeout(() => {
      this.showResend = true
    }, 1000)
  }

  forgotPassword(resendOTP?: string) {
    if (resendOTP) {
      this.resendOtpCounter = this.resendOtpCounter + 1
      if (this.resendOtpCounter >= this.maxResendTry) {
        this.disableResendButton = false
        this.openSnackbar('Maximum retry limit exceeded please try again.')
        return
      }
      this.resendOtpLoader = true;
    }else{
      this.sendOtpLoader = true;
    }

    // let phone = ''
    this.emailOrMobile = this.emailForm.value.userInput

    // phone = this.emailOrMobile
    // phone = phone.replace(/[^0-9+#]/g, '')
    const requestBody = {
      userName: this.emailOrMobile.trim(),
    }
    // Allow only indian mobile numbers
    if(/^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(this.emailOrMobile)){
      this.key = 'email'
    } else {
      this.key = 'phone'
    } 
    this.signupService.forgotPassword(requestBody).subscribe(
      (res: any) => {
        if (res.message) {
          this.openSnackbar(res.message);
          this.resendOtpEnablePostTimer();
          this.showEmailsection = false;
          this.showOtpPwd = true;
          this.showSetPassword = false;
          this.initOptForm();
          this.resendOtpLoader = false;
          this.sendOtpLoader = false;
        }
      },
      (error: any) => {
        this.openSnackbar(error.error.message);
        this.resendOtpLoader = false;
        this.sendOtpLoader = false;
        this.generateErrorTelemetry(error);
      }
    )
  }

  resetForm() {
    this.router.navigate(['/home'])
  }

  handleEnterKey() {
    if (this.otpForm.valid && !this.verifyOtpLoader) {
      this.onSubmitOtp(); // Call your submit method
    }
  }

  onSubmitOtp() {
    this.verifyOtpLoader = true;
    let userOTP = '';
    if(this.key == 'email'){
      userOTP = this.otpForm.value.OTPCHRone.toString()
      //   +
      //   this.otpForm.value.OTPCHRtwo+
      //   this.otpForm.value.OTPCHRthree+
      //   this.otpForm.value.OTPCHRfour+
      //   this.otpForm.value.OTPCHRfive;
      // if(this.otpForm.value.OTPCHRsix !== null && this.otpForm.value.OTPCHRsix !== undefined ){
      //   userOTP += this.otpForm.value.OTPCHRsix;
      // }
    }else{
      userOTP = 
        this.otpForm.value.OTPCHRone.toString()+
        this.otpForm.value.OTPCHRtwo.toString()+
        this.otpForm.value.OTPCHRthree.toString()+
        this.otpForm.value.OTPCHRfour.toString()
    }
    const requestBody = {
      key: this.emailOrMobile,
      type: this.key,
      otp: userOTP,
    }
    this.signupService.setPasswordWithOtp(requestBody).subscribe(
      (res: any) => {
        if(res.response == 'SUCCESS'){
          this.showEmailsection = false;
          // this.showOtpPwd = false;
          this.verifyOtpLoader = false;
          this.openSetPassword(res);
        } else{
          this.openSnackbar(this.translate.instant('SOMETHING_WENT_WRONG_TRY_LATER'));
          // this.openSnackbar('Something went wrong, Please try again later');
        }
      },
      (error: any) => {
        this.openSnackbar(error.error.message || 'Something went wrong');
        this.verifyOtpLoader = false;
      }
    )
  }

  openSetPassword(_data){
    let self = this;
    let setPasswordURL = _data.link;
    let successURL = 'https://sphere.aastrika.org/';

    const options: InAppBrowserOptions = {
      location: 'yes',
      hidenavigationbuttons: 'yes',
      hidden: 'no',
      hideurlbar: 'yes',
      clearcache: 'yes',
      clearsessioncache: 'yes',
      zoom: 'yes',
      hardwareback: 'yes',
      mediaPlaybackRequiresUserAction: 'no',
      shouldPauseOnSuspend: 'no',
      closebuttoncaption: 'Close',
      disallowoverscroll: 'no',
      toolbar: 'yes',
      enableViewportScale: 'no',
      allowInlineMediaPlayback: 'no',
      presentationstyle: 'pagesheet',
      fullscreen: 'yes',  // Only for iOS
    };

    const browser = this.inAppBrowser.create(setPasswordURL, '_blank', options);

    browser.on('loadstart').subscribe(event => {
      if (event.url === successURL) {
        this.showOtpPwd = false;
        browser.close();
        self.showSuccessAlert();
      } else {
        this.showEmailsection = true;
        this.showOtpPwd = false;
        this.showSetPassword = false;
      }
    });
  }

  onKeyUp(event: KeyboardEvent, nextInput: HTMLInputElement) {
    const target = event.target as HTMLInputElement;
    if((event.key === 'Backspace')){
      //
    } else if (target.value.length === 1 && nextInput) {
      nextInput.focus()
    }
  }

  resendOtpEnablePostTimer() {
    this.counter = 600;
    const interval = setInterval(() => {
      // this.resendOTPbtn = `${(this.counter)})`
      this.counter--;
      if (this.counter < 0) {
        this.resendOTPbtn = ''
        clearInterval(interval)
        this.disableResendButton = false
      }else{
        let minutes: any = Math.floor(this.counter / 60);
        minutes = minutes.toString().padStart(2, '0');
        let seconds: any = this.counter % 60;
        seconds = seconds.toString().padStart(2, '0');
        this.resendOTPbtn = minutes + ':' + seconds;
      }
    }, 1000)
  }

  private openSnackbar(primaryMsg: string, duration: number = 2000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  gotoHome() {
    this.router.navigate(['/public/home']);
  }

  updatePassword(){
    this.setPasswordLoader = true;
    setTimeout(() => {
      this.setPasswordLoader = false
    }, 3000);
    this.showSuccessAlert();
  }

  showSuccessAlert(){
    const confirmdialog = this.dialog.open(AlertModalComponent, {
      panelClass: 'auth-alert-modal',
      disableClose: true,
      data: {
        type: 'fgPassword',
        msg: 'PASSWORD_UPDATED_SUCCESSFULLY',
        btnText: 'CLICK_HERE_TO_LOGIN'
      },
    })
    confirmdialog.afterClosed().subscribe((res: any) => {
      if(res.event == 'CONFIRMED'){
        setTimeout(() => {
          this.events.publish('triggerPublicLoginEvent');
        }, 1000);
      }
      this.router.navigate(['/public/home']);
    })
  }

  generateErrorTelemetry(error: any) {
    this.telemetryGeneratorService.generateErrorTelemetry(
       Environment.HOME,
      'forgot-password',
       ErrorType.SYSTEM,
       PageId.LOGIN,
       JSON.stringify(error)
    )
  }
}