import { Component, OnInit, Input, Output, EventEmitter, Inject, NgZone, ChangeDetectorRef } from '@angular/core'
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignupService } from '../../services/signup/signup.service'
import { AppGlobalService, InteractSubtype, Environment, CommonUtilService, PageId, TelemetryGeneratorService } from '../../../../../services'
import { SignInError, AuthService, SharedPreferences, InteractType } from '@project-sunbird/sunbird-sdk'
import { UserService } from '../../../../../app/modules/home/services/user.service'
import { Router } from '@angular/router'
import * as _ from 'lodash-es';
import { RouterLinks } from '../../../../../app/app.constant'
import { TranslateService } from '@ngx-translate/core'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
 
 
@Component({
  selector: "ws-login-otp",
  templateUrl: "./login-otp.component.html",
  styleUrls: ["./login-otp.component.scss"],
})
export class LoginOtpComponent implements OnInit {
  // [x: string]: any
  loginOtpForm: UntypedFormGroup;
  @Input() preferedLanguage: any;
  @Input() signUpdata: any;
  @Input() loginData: any;
  @Input() showbackButton?: any;
  @Input() trigerrNavigation?: any;
  @Input() showLogOutIcon?: any;
  @Output() redirectToParent = new EventEmitter();
  @Output() showCreateAccount = new EventEmitter<any>();
  @Output() showOtpPage = new EventEmitter();
  emailPhoneType: any = "phone";
  loginVerification = false;
  emailOrMobile;
  resendTimerText = "10:00";
  interval: any = null;
  resendTimer = 600;
  defaultLanguage: string = '';
 
  // redirectUrl = ''
  constructor(
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private ngZone: NgZone,
    @Inject("AUTH_SERVICE") private authService: AuthService,
    @Inject("SHARED_PREFERENCES") private preferences: SharedPreferences,
    private userHomeSvc: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private userProfileSvc: UserProfileService,
     private appFrameworkDetectorService: AppFrameworkDetectorService,
  ) {
    this.loginOtpForm = this.fb.group({
      // code: new FormControl('', [Validators.required]),
      OTPCHRone: new UntypedFormControl("", [Validators.required]),
      // OTPCHRtwo: new UntypedFormControl('', [Validators.required]),
      // OTPCHRthree: new UntypedFormControl('', [Validators.required]),
      // OTPCHRfour: new UntypedFormControl('', [Validators.required]),
    });
  }
 
  ngOnInit() {
    if (this.signUpdata || this.loginData) {
      let phone = this.signUpdata
        ? this.signUpdata.value.emailOrMobile
        : this.loginData.value.username;
      this.emailOrMobile = this.signUpdata
        ? this.signUpdata.value.emailOrMobile
        : this.loginData.value.username;
      phone = phone.replace(/[^0-9+#]/g, "");
      if (phone.length >= 10) {
        this.emailPhoneType = "phone";
      } else {
        this.emailPhoneType = "email";
      }
    }
    if (window.location.href.includes("email-otp")) {
      this.emailPhoneType = "email";
    }
    if (this.loginData) {
      this.loginVerification = true;
    }
 
    this.initOptForm();
    this.startTimer();
  }
 
  initOptForm() {
    if (this.emailPhoneType == "phone") {
      this.loginOtpForm = this.fb.group({
        OTPCHRone: new UntypedFormControl("", [Validators.required]),
        OTPCHRtwo: new UntypedFormControl("", [Validators.required]),
        OTPCHRthree: new UntypedFormControl("", [Validators.required]),
        OTPCHRfour: new UntypedFormControl("", [Validators.required]),
      });
    } else {
      this.loginOtpForm = this.fb.group({
        OTPCHRone: new UntypedFormControl("", [Validators.required]),
        // OTPCHRtwo: new UntypedFormControl('', [Validators.required]),
        // OTPCHRthree: new UntypedFormControl('', [Validators.required]),
        // OTPCHRfour: new UntypedFormControl('', [Validators.required]),
        // OTPCHRfive: new UntypedFormControl('', [Validators.required]),
        // OTPCHRsix: ['']
      });
    }
    this.loginOtpForm.reset();
  }
 
  redirectToSignUp() {
    this.redirectToParent.emit("true");
  }
 
  redirectToMobileLogin() {
    this.redirectToParent.emit("true");
  }
 
  handleEnterKey() {
    if (this.loginOtpForm.valid) {
      this.verifyOtp(); // Call your submit method
    }
  }
 
  async verifyOtp() {
    let request: any = [];
    let phone = this.signUpdata.value.emailOrMobile;
    phone = phone.replace(/[^0-9+#]/g, "");
    // at least 10 in number
    if (phone.length >= 10) {
      let userOTP =
        this.loginOtpForm.value.OTPCHRone.toString() +
        this.loginOtpForm.value.OTPCHRtwo.toString() +
        this.loginOtpForm.value.OTPCHRthree.toString() +
        this.loginOtpForm.value.OTPCHRfour.toString();
      request = {
        mobileNumber: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        // otp: this.loginOtpForm.value.code,
        otp: userOTP,
        userId: localStorage.getItem(`userUUID`),
      };
    } else if (
      /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)$/.test(
        this.signUpdata.value.emailOrMobile
      )
    ) {
      let userOTP = this.loginOtpForm.value.OTPCHRone.toString();
      //   +
      //   this.loginOtpForm.value.OTPCHRtwo+
      //   this.loginOtpForm.value.OTPCHRthree+
      //   this.loginOtpForm.value.OTPCHRfour+
      //   this.loginOtpForm.value.OTPCHRfive
      // if(this.loginOtpForm.value.OTPCHRsix !== null && this.loginOtpForm.value.OTPCHRsix !== undefined ){
      //   userOTP += this.loginOtpForm.value.OTPCHRsix;
      // }
      request = {
        email: this.signUpdata.value.emailOrMobile,
        password: this.signUpdata.value.password,
        otp: userOTP,
        // otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
      };
    }
    this.signupService.autoValidateOtp(request).subscribe(
      async (res: any) => {
        this.openSnackbar(
          this.translate.instant("OTP_IS_SUCCESSFULLY_VALIDATED")
        );
 
        sessionStorage.setItem("login-btn", "clicked");
 
        res["userToken"] = localStorage.getItem(`userUUID`);
 
        this.login(res);
        this.userHomeSvc.resetUserProfile();
        this.cdr.markForCheck();
      },
      (err: any) => {
        this.openSnackbar(this.translate.instant("OTP_ERROR_MESSGE"));
      }
    );
  }

  async getDefaultLanguage(){
    try {
      const appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (appFramework === 'Ekshamata') {
        this.defaultLanguage = 'hi'
      } else {
        this.defaultLanguage = 'en'
      }
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }
 
 async updateUserProfile(res) {
    const appFramework = await this.appFrameworkDetectorService.detectAppFramework();
    const reqUpdate = {
      request: {
        userId: res.userId,
        profileDetails: {
          profileLocation: `${appFramework}/validate-otp`,
          profileReq: {
            id: res.userId,
            userId: res.userId,
            personalDetails: {
              ...res.profileDetails.profileReq.personalDetails,
              profileLocation: `${appFramework}/validate-otp`,
            },
          },
           preferences: {
              language:  this.preferedLanguage.id ?  this.preferedLanguage.id : this.defaultLanguage,
            }
        }
      },
    };
  this.userProfileSvc
      .updateProfileDetails(reqUpdate)
      .subscribe(async (res: any) => {
        if (res) {
          console.log("update api res", res)
          await this.refreshProfileDataAfterUpdate();
        }
      });
 
  }

  public async refreshProfileDataAfterUpdate() {
    const that = this;
    return new Promise<any>((resolve, reject) => {
      that.authService.getSession().toPromise()
        .then((session: any) => {
          if (session) {
            this.userHomeSvc.userReadCall(session.userToken).subscribe(async (res) => {
              console.log("read api res after update ", res);
              await this.userHomeSvc.setUserProfile(res)
                if (_.get(res, 'result.response')) {
                  that.router.navigateByUrl('page/home');
                }
              });
            resolve('');
          } else {
            reject('session is null');
          }
        });
    });
  }
 
  async loginVerifyOtp() {
    let request: any = [];
    const username = this.loginData.value.username;
    if (!username.includes("@")) {
      request = {
        mobileNumber: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
      };
    } else {
      request = {
        email: this.loginData.value.username,
        password: this.loginData.value.password,
        otp: this.loginOtpForm.value.code,
        userId: localStorage.getItem(`userUUID`),
      };
    }
    this.signupService.validateOtp(request).subscribe(
      async (res: any) => {
        console.log("loginVerifyOtp- ", res);
        this.openSnackbar(res.message);
        this.router.navigate([RouterLinks.PRIVATE_HOME]);
        // location.href = '/page/home'
        return res;
      },
      (err: any) => {
        this.openSnackbar(err.error.error || err.error.message);
      }
    );
  }
 
  startTimer() {
    let self = this;
    if (self.interval) {
      clearInterval(self.interval);
    }
    this.interval = setInterval(() => {
      self.resendTimer--;
      if (self.resendTimer == 0) {
        clearInterval(self.interval);
        self.interval = null;
      }
      let minutes: any = Math.floor(self.resendTimer / 60);
      minutes = minutes.toString().padStart(2, "0");
      let seconds: any = self.resendTimer % 60;
      seconds = seconds.toString().padStart(2, "0");
      self.resendTimerText = minutes + ":" + seconds;
    }, 1000);
  }
 
  resendOTP(emailPhoneType: string) {
    let requestBody;
 
    let OTPMsg = this.translate.instant("OTP_RE_SENT_ON") + " ";
    let emailText = this.translate.instant("EMAIL") + " ";
    let phoneText = this.translate.instant("PHONE") + " ";
 
    if (emailPhoneType === "email") {
      requestBody = {
        email: this.signUpdata
          ? this.signUpdata.value.emailOrMobile
          : this.loginData.value.username,
      };
      OTPMsg = OTPMsg + emailText + requestBody.email;
    } else {
      requestBody = {
        mobileNumber: this.signUpdata
          ? this.signUpdata.value.emailOrMobile
          : this.loginData.value.username,
      };
      OTPMsg = OTPMsg + phoneText + requestBody.email;
    }
    this.signupService.generateOtp(requestBody).subscribe(
      (res: any) => {
        this.openSnackbar(OTPMsg);
      },
      (err: any) => {
        this.openSnackbar(`OTP Error`, +err.error.message);
      }
    );
  }
 
  public openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    });
  }
 
  async login(data) {
    this.appGlobalService.resetSavedQuizContent();
 
    if (!this.commonUtilService.networkInfo.isNetworkAvailable) {
      // this.valueChange.emit(true);
    } else {
      this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.SIGNIN_OVERLAY_CLICKED,
        Environment.HOME,
        "profile",
        null
      );
 
      this.generateLoginInteractTelemetry(
        InteractType.TOUCH,
        InteractSubtype.LOGIN_INITIATE,
        ""
      );
      // const that = this;
 
      // this.authUtillService.startSession(data)
      // .then(
      //   that.ngZone.run(async () => {
      //           await this.refreshProfileData();
      //           that.preferences.putString('SHOW_WELCOME_TOAST', 'true').toPromise().then();
      //         })
      // )
 
      const that = this;
      // const webviewSessionProviderConfigloader = await this.commonUtilService.getLoader();
 
      // let webviewLoginSessionProviderConfig: WebviewSessionProviderConfig;
      // let webviewMigrateSessionProviderConfig: WebviewSessionProviderConfig;
 
      // await webviewSessionProviderConfigloader.present();
      // try {
      //   webviewLoginSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('login');
      //   webviewMigrateSessionProviderConfig = await this.formAndFrameworkUtilService.getWebviewSessionProviderConfig('migrate');
 
      //   await webviewSessionProviderConfigloader.dismiss();
      // } catch (e) {
      //   await webviewSessionProviderConfigloader.dismiss();
      //   this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
      //   return;
      // }
      // this.authService.setSession(
      //   new WebviewLoginSessionProvider(
      //     webviewLoginSessionProviderConfig,
      //     webviewMigrateSessionProviderConfig
      //   )
      // )
      //   .toPromise()
      //   .then(async () => {
      //     this.commonUtilService.addLoader(5000)
      //   })
      // console.log("put string", data)
      this.preferences
        .putString("oauth_token", JSON.stringify(data))
        .toPromise()
        .then(async () => {
          if (!this.appGlobalService.signinOnboardingLoader) {
          }
          // await webviewSessionProviderConfigloader.present();
          that.ngZone.run(async () => {
            await this.refreshProfileData();
            that.preferences
              .putString("SHOW_WELCOME_TOAST", "true")
              .toPromise()
              .then();
          });
        })
        .catch(async (err) => {
          // await webviewSessionProviderConfigloader.dismiss();
          if (err instanceof SignInError) {
            this.commonUtilService.showToast(err.message);
          } else {
            this.commonUtilService.showToast("ERROR_WHILE_LOGIN");
          }
        });
    }
  }
  public async refreshProfileData() {
    const that = this;
    return new Promise<any>((resolve, reject) => {
      that.authService
        .getSession()
        .toPromise()
        .then((session: any) => {
          if (session) {
            this.userHomeSvc
              .userReadCall(session.userToken)
              .subscribe(async (res) => {
                console.log("read api res", res)
                let userProfile = _.get(res, 'result.response')
                await this.updateUserProfile(userProfile)            
              });
            resolve("");
          } else {
            reject("session is null");
          }
        });
    });
  }
  public generateLoginInteractTelemetry(interactType, interactSubtype, uid) {
    const valuesMap = new Map();
    valuesMap["UID"] = uid;
    this.telemetryGeneratorService.generateInteractTelemetry(
      interactType,
      interactSubtype,
      Environment.HOME,
      PageId.LOGIN,
      undefined,
      valuesMap
    );
  }
 
  backScreen() {
    this.showCreateAccount.emit(true);
  }
 
  onKeyUp(event: KeyboardEvent, nextInput: HTMLInputElement) {
    const target = event.target as HTMLInputElement;
    if (event.key === "Backspace") {
      //
    } else if (target.value.length === 1 && nextInput) {
      nextInput.focus();
    }
  }
}