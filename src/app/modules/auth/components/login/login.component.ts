import { Component, HostListener, Inject, NgZone, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import _ from 'lodash';
import { RouterLinks } from '../../../../../app/app.constant';
import { AppGlobalService, CommonUtilService, Environment, ImpressionType, InteractSubtype, PageId, TelemetryGeneratorService, ErrorCode } from '../../../../../services';
import { SignInError, AuthService, SharedPreferences, InteractType, ErrorType } from '@project-sunbird/sunbird-sdk';
import { UserService } from '../../../../../app/modules/home/services/user.service'
import appsConfig from './../../../../../assets/configurations/apps.json';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { TranslateService } from '@ngx-translate/core';
import { SmsRetriever } from '@awesome-cordova-plugins/sms-retriever/ngx';
import { LocalStorageService } from '../../../../../app/manage-learn/core';
import { AlertModalComponent} from './../alert-modal/alert-modal.component'
import { Platform } from '@ionic/angular';
import { Events } from '../../../../../util/events';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  spherFormBuilder: UntypedFormBuilder;
  loginForm: UntypedFormGroup;
  loginWithOTPForm: UntypedFormGroup;
  loginWithPasswordForm: UntypedFormGroup;
  otpCodeForm: UntypedFormGroup;
  loginSelected: string = 'otp';
  userID: string = '';
  loginID: string = '';
  isAPIInProgress = false;
  isOTPSent: boolean = false;
  isResendInprogress = false;
  resendTimerText = '10:00';
  resendTimer = 600;
  interval: any = null;
  retryMsg = 'Something is wrong, Please try again after some time.';
  emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  appFramework: string;
  showPassword = false;
  appId: string = '';
  hash: any;
  key = '';
  emailOrMobile = '';
  verifyOtpLoader = false;
  navigateToEkshmataHome: boolean = false;
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.router.navigate(['/public/home']);
  }
  constructor(
    formBuilder: UntypedFormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private loginService: LoginService,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    @Inject('SHARED_PREFERENCES') private preferences: SharedPreferences,
    @Inject('AUTH_SERVICE') private authService: AuthService,
    private ngZone: NgZone,
    private userHomeSvc: UserService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private translate: TranslateService,
    private smsRetriever: SmsRetriever,
    private localStorageService: LocalStorageService,
    private event: Events
  ) {
    this.spherFormBuilder = formBuilder;
    this.smsRetriever
      .getAppHash()
      .then((res: any) => console.log(res))
      .catch((error: any) => console.error(error));
  }

  ngOnInit() {
    this.initializeFormFields();
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
      minutes = minutes.toString().padStart(2, '0');
      let seconds: any = self.resendTimer % 60;
      seconds = seconds.toString().padStart(2, '0');
      self.resendTimerText = minutes + ':' + seconds;
    }, 1000);
  }
  managePasswordView() {
    this.showPassword = !this.showPassword;
  }

  manageLoginType(event) {
    this.loginSelected = event.detail.value;
    this.generateInteractTelemetry(this.loginSelected);
    if (event.detail.value == 'otp') {
      this.loginForm = this.spherFormBuilder.group({
        loginId: new UntypedFormControl('', [
          Validators.required,
          Validators.pattern(
            /^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/
          ),
        ]),
      });
    } else {
      this.loginForm = this.spherFormBuilder.group({
        loginId: new UntypedFormControl('', [
          Validators.required,
          Validators.pattern(
            /^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/
          ),
        ]),
        loginPassword: new UntypedFormControl('', [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g
          ),
        ]),
      });
    }
    this.loginForm.reset();
  }

  createAccount() {
    this.generateInteractTelemetry('createAccount');
    this.router.navigate([RouterLinks.CREATE_ACCOUNT]);
  }

  initializeFormFields() {
    this.loginForm = this.spherFormBuilder.group({
      loginId: new UntypedFormControl('', [
        Validators.required,
        Validators.pattern(
          /^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/
        ),
      ]),
    });

    this.otpCodeForm = this.spherFormBuilder.group({
      // otpCode: new FormControl('', [Validators.required]),
      OTPCHRone: new UntypedFormControl('', [Validators.required]),
      // OTPCHRtwo: new UntypedFormControl('', [Validators.required]),
      // OTPCHRthree: new UntypedFormControl('', [Validators.required]),
      // OTPCHRfour: new UntypedFormControl('', [Validators.required]),
    });
    this.detectFramework();
    this.getappToken();
  }

  initOptForm() {
    if (this.key == 'phone') {
      this.otpCodeForm = this.spherFormBuilder.group({
        OTPCHRone: new UntypedFormControl('', [Validators.required]),
        OTPCHRtwo: new UntypedFormControl('', [Validators.required]),
        OTPCHRthree: new UntypedFormControl('', [Validators.required]),
        OTPCHRfour: new UntypedFormControl('', [Validators.required]),
      });
    } else {
      this.otpCodeForm = this.spherFormBuilder.group({
        OTPCHRone: new UntypedFormControl('', [Validators.required]),
        // OTPCHRtwo: new UntypedFormControl('', [Validators.required]),
        // OTPCHRthree: new UntypedFormControl('', [Validators.required]),
        // OTPCHRfour: new UntypedFormControl('', [Validators.required]),
        // OTPCHRfive: new UntypedFormControl('', [Validators.required]),
        // OTPCHRsix: ['']
      });
    }
    this.otpCodeForm.reset();
  }

  submitForm() {
    this.loginID = this.loginForm.value.loginId.trim();
    if (this.loginSelected == 'otp') {
      this.sendOtp();
    } else {
      this.userLogin();
    }
  }

  async getappToken() {
    this.hash = await this.smsRetriever.getAppHash();
    console.log('App Hash:', this.hash);
  }

  sendOtp() {
    let param = {
      userEmail: '',
      userPhone: '',
      appId: this.appId,
      token: this.hash,
    };

    let OTPMsg = this.translate.instant('OTP_SENT_ON') + ' ';
    let emailText = this.translate.instant('EMAIL') + ' ';
    let phoneText = this.translate.instant('PHONE') + ' ';

    if (this.emailPattern.test(this.loginID)) {
      this.key = 'email';
      param.userEmail = this.loginID.toLowerCase();
      OTPMsg = OTPMsg + emailText + this.loginID;
      this.emailOrMobile = param.userEmail || this.loginID.toLowerCase();
    } else {
      this.key = 'phone';
      param.userPhone = this.loginID;
      OTPMsg = OTPMsg + phoneText + this.loginID;
      this.emailOrMobile = param.userPhone || this.loginID;
    }
    this.isAPIInProgress = true;

    this.loginService.sendOTP(param).subscribe(
      (_res: any) => {
        if (_res && _res.userId) {
          this.userID = _res.userId;
          this.isAPIInProgress = false;
          this.isOTPSent = true;
          this.initOptForm();
          this.startLookingForOtp();
          this.startTimer();

          this.commonUtilService.showToast(OTPMsg);
        } else {
          this.commonUtilService.showToast(this.retryMsg);
          this.isAPIInProgress = false;
        }
      },
      (_err) => {
        // this.commonUtilService.showToast(_err.error?.msg || _err.error.message);
        const userAlert = this.dialog.open(AlertModalComponent, {
          panelClass: 'auth-alert-modal',
          disableClose: true,
          data: {
            type: 'lgAlert',
            msg:
              this.appFramework === 'Ekshamata'
                ? 'User doesn’t exist.'
                : _err.error?.msg || _err.error.message,
            disableCrBtn: this.appFramework === 'Ekshamata' ? true : false,
          },
        });

        userAlert.afterClosed().subscribe((res: any) => {
          if (res.event == 'CREATEACCOUNT') {
            this.router.navigate(['app/create-account']);
          }
        });
        // this
        this.isAPIInProgress = false;
      }
    );
  }

  resendOtp() {
    let param = {
      userEmail: '',
      userPhone: '',
      userId: this.userID,
      appId: this.appId,
      token: this.hash,
    };
    let OTPMsg = this.translate.instant('OTP_RE_SENT_ON') + ' ';
    let emailText = this.translate.instant('EMAIL') + ' ';
    let phoneText = this.translate.instant('PHONE') + ' ';

    if (this.emailPattern.test(this.loginID)) {
      param.userEmail = this.loginID.toLowerCase();
      OTPMsg = OTPMsg + emailText + this.loginID;
    } else {
      param.userPhone = this.loginID;
      OTPMsg = OTPMsg + phoneText + this.loginID;
    }

    this.isResendInprogress = true;

    this.loginService.resendOTP(param).subscribe(
      (_res: any) => {
        this.isResendInprogress = false;
        if (_res) {
          this.startLookingForOtp();
          this.startTimer();
          // OTP successfully re-sent on email u6@yopmail.com
          this.commonUtilService.showToast(OTPMsg);
        } else {
          this.commonUtilService.showToast(this.retryMsg);
        }
      },
      (_err) => {
        this.commonUtilService.showToast(_err.error?.msg || _err.error.message);
        this.isResendInprogress = false;
      }
    );
  }

  handleEnterKey() {
    if (this.otpCodeForm.valid && !this.verifyOtpLoader) {
      this.userLogin(); // Call your submit method
    }
  }

  userLogin() {
    this.verifyOtpLoader = true;
    let param: any = {};

    if (this.emailPattern.test(this.loginID)) {
      this.key = 'email';
      param.userEmail = this.loginID.toLowerCase();
      this.emailOrMobile = param.userEmail || this.loginID.toLowerCase();
    } else {
      this.key = 'phone';
      param.userPhone = this.loginID;
      this.emailOrMobile = param.userPhone || this.loginID;
    }

    if (this.loginSelected == 'otp') {
      param.typeOfLogin = 'otp';
      // param.otp = this.otpCodeForm.value.otpCode;
      let userOTP = '';
      if (this.key == 'email') {
        userOTP = this.otpCodeForm.value.OTPCHRone.toString();
        //   +
        //   this.otpCodeForm.value.OTPCHRtwo+
        //   this.otpCodeForm.value.OTPCHRthree+
        //   this.otpCodeForm.value.OTPCHRfour+
        //   this.otpCodeForm.value.OTPCHRfive;
        // if(this.otpCodeForm.value.OTPCHRsix !== null && this.otpCodeForm.value.OTPCHRsix !== undefined ){
        //   userOTP += this.otpCodeForm.value.OTPCHRsix;
        // }
      } else {
        userOTP =
          this.otpCodeForm.value.OTPCHRone.toString() +
          this.otpCodeForm.value.OTPCHRtwo.toString() +
          this.otpCodeForm.value.OTPCHRthree.toString() +
          this.otpCodeForm.value.OTPCHRfour.toString();
        console.log('>>', userOTP);
      }

      param.otp = userOTP;
    } else {
      param.typeOfLogin = 'password';
      param.userPassword = this.loginForm.value.loginPassword;
    }
    this.isAPIInProgress = true;
    console.log('>>', param);
    this.loginService.userLogin(param).subscribe(
      (_res: any) => {
        if (_res) {
          if (this.loginSelected == 'otp') {
            this.login(_res);
            this.isAPIInProgress = false;
            this.verifyOtpLoader = false;
          } else {
            this.fetchUserDetails(_res);
          }
        } else {
          this.isAPIInProgress = false;
          this.verifyOtpLoader = false;
          this.commonUtilService.showToast(this.retryMsg);
        }
      },
      (_err) => {
        // this.commonUtilService.showToast(_err.error?.msg || _err.error.message);
        this.telemetryGeneratorService.generateErrorTelemetry(
          Environment.HOME,
          ErrorCode.ERR_USER_LOGIN,
          ErrorType.SYSTEM,
          PageId.LOGIN,
          JSON.stringify(_err)
        );
        const userAlert = this.dialog.open(AlertModalComponent, {
          panelClass: 'auth-alert-modal',
          disableClose: true,
          data: {
            type: 'lgAlert',
            msg: _err.error?.msg || _err.error.message,
            disableCrBtn: this.appFramework === 'Ekshamata' ? true : false,
          },
        });

        userAlert.afterClosed().subscribe((res: any) => {
          if (res.event == 'CREATEACCOUNT') {
            this.router.navigate(['app/create-account']);
          }
        });
        this.isAPIInProgress = false;
        this.verifyOtpLoader = false;
      }
    );
  }

  login(res) {
    this.userHomeSvc.resetUserProfile();
    let response: any = res.token;
    this.appGlobalService.resetSavedQuizContent();

    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SIGNIN_OVERLAY_CLICKED,
      Environment.HOME,
      'profile',
      null
    );
    response['status'] = 200;
    response['userToken'] = this.userID;
    this.event.publish('user-loggedIn', {
      accessToken: response.access_token,
      userId: this.userID,
    });
    this.generateLoginInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.LOGIN_INITIATE,
      this.userID
    );
    let that = this;
    this.preferences
      .putString('oauth_token', JSON.stringify(response))
      .toPromise()
      .then(async () => {
        that.ngZone.run(async () => {
          await this.refreshProfileData();
          that.preferences
            .putString('SHOW_WELCOME_TOAST', 'true')
            .toPromise()
            .then();
        });
      })
      .catch(async (err) => {
        if (err instanceof SignInError) {
          this.commonUtilService.showToast(err.message);
        } else {
          this.commonUtilService.showToast('ERROR_WHILE_LOGIN');
        }
      });
    this.isAPIInProgress = false;
  }

  // async getAppHash() {
  //   try {
  //     const hash = await this.smsRetriever.getAppHash();
  //     console.log('App Hash:', hash);
  //     this.appHash = hash;
  //     // Start listening for SMS after getting the hash
  //     this.startSMSListener();
  //   } catch (error) {
  //     console.error('Error getting App Hash', error);
  //   }
  // }

  async startLookingForOtp() {
    try {
      const hash = await this.smsRetriever.getAppHash();
      console.log('App Hash:', hash);

      this.smsRetriever
        .startWatching()
        .then((res: any) => {
          console.log('SMS Retriever Started', res);
          this.handleSMS(res.Message);
          // this.smsRetriever.onSMSReceived().subscribe((message: any) => {
          //   console.log('SMS Received', message);
          //   this.handleSMS(message);
          // });
        })
        .catch((error: any) =>
          console.error('Error starting SMS Retriever', error)
        );
      document.addEventListener('onSMSReceived', (e: any) => {
        console.log('SMS Received', e.data);
        this.handleSMS(e.data);
      });
    } catch (error) {
      console.error('Error getting App Hash', error);
    }
  }

  handleSMS(message: string) {
    // Extract OTP from the message and use it for your login logic
    const otp = this.extractOTP(message);
    console.log('Extracted OTP:', otp);
    // You can now set this OTP in your form or handle login logic
    this.otpCodeForm.controls['otpCode'].setValue(otp);
  }

  extractOTP(message: string): string {
    // Extract the OTP from the message using a regex or specific logic
    const otpMatch = message.match(/\d{4,6}/); // Assuming OTP is 4 to 6 digits
    return otpMatch ? otpMatch[0] : '';
  }

  // processSMS(data) {
  //   // Design your SMS with App hash so the retriever API can read the SMS without READ_SMS permission
  //   // Attach the App hash to SMS from your server, Last 11 characters should be the App Hash
  //   // After that, format the SMS so you can recognize the OTP correctly
  //   // Here I put the first 6 character as OTP
  //   const message = data.Message;
  //   console.log('otp message', message);
  //   // if (message != -1) {
  //   //   this.OTP = message.slice(0, 6);
  //   //   console.log(this.OTP);

  //   // }
  // }

  private generateLoginInteractTelemetry(interactType, interactSubtype, uid) {
    const valuesMap = new Map();
    valuesMap['UID'] = uid;
    this.telemetryGeneratorService.generateInteractTelemetry(
      interactType,
      interactSubtype,
      Environment.HOME,
      PageId.LOGIN,
      undefined,
      valuesMap
    );
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
                // console.log('read api res', res)
                await this.userHomeSvc.setUserProfile(res);
                if (_.get(res, 'result.response')) {
                  this.localStorageService
                    .getLocalStorage(`url_before_login`)
                    .then((navigateUrl) => {
                      if (navigateUrl) {
                        this.localStorageService.deleteOneStorage(
                          'url_before_login'
                        );
                        that.router.navigateByUrl(navigateUrl, {
                          state: { loggedIn: true },
                        });
                      } else {
                        that.router.navigateByUrl('page/home');
                      }
                    })
                    .catch((err) => {
                      that.router.navigateByUrl('page/home');
                    });
                }
              });
            resolve('');
          } else {
            reject('session is null');
          }
        });
    });
  }

  // private refreshProfileData() {
  //   const that = this;
  //   return new Promise<any>((resolve, reject) => {
  //     that.authService.getSession().toPromise()
  //       .then((session: any) => {
  //         if (session) {
  //           this.userHomeSvc.userReadCall(session.userToken).subscribe(async (res) => {
  //           await this.userHomeSvc.setUserProfile(res);
  //             if (_.get(res, 'result.response')) {
  //               this.localStorageService.getLocalStorage(`url_before_login`).then(
  //                 (navigateUrl) => {
  //                   console.log('ws-app-public-nav-bar url_before_login - ',navigateUrl)
  //                   that.router.navigateByUrl(navigateUrl);
  //                 },
  //                 (error) => {
  //                   this.router.navigateByUrl(RouterLinks.PRIVATE_HOME)
  //                 }
  //               )
  //             }
  //           });
  //         } else {
  //           reject('session is null');
  //         }
  //       });
  //   });
  // }

  fetchUserDetails(_data) {
    let param: any = {
      request: {
        filters: {},
      },
    };

    if (this.emailPattern.test(this.loginID)) {
      param.request.filters.email = this.loginID.toLowerCase();
    } else {
      param.request.filters.phone = this.loginID;
    }
    let header = {
      Authorization: 'bearer ' + appsConfig.API.secret_key,
      'x-authenticated-user-token': _data.token.access_token,
      'Content-Type': 'application/json',
    };
    this.loginService.searchUser(header, param).subscribe(
      (_res: any) => {
        if (
          _res &&
          _res.result &&
          _res.result.response &&
          _res.result.response.count == 1
        ) {
          let id = _res.result.response.content[0].userId || 0;
          if (id) {
            this.userID = id;
            this.login(_data);
          } else {
            this.commonUtilService.showToast(this.retryMsg);
            this.isAPIInProgress = false;
          }
        } else {
          this.isAPIInProgress = false;
          this.commonUtilService.showToast(this.retryMsg);
        }
      },
      (_err) => {
        this.commonUtilService.showToast(this.retryMsg);
        this.isAPIInProgress = false;
      }
    );
  }

  async detectFramework() {
    try {
      this.appFramework =
        await this.appFrameworkDetectorService.detectAppFramework();
      if (this.appFramework === 'Sphere') {
        this.appId = 'com.aastrika.sphere';
      } else if (this.appFramework === 'Ekshamata') {
        this.appId = 'org.aastrika.ekshamata';
        this.navigateToEkshmataHome = true;
      }
      this.appFramework =
        await this.appFrameworkDetectorService.detectAppFramework();
      const values = new Map();
      values['appName'] = this.appFramework.toUpperCase();
      this.telemetryGeneratorService.generateImpressionTelemetry(
        ImpressionType.SIGNIN_POPUP_LOADED,
        '',
        PageId.SIGNIN_POPUP,
        Environment.HOME
      );
    } catch (error) {
      console.log('error while getting packagename');
    }
  }

  forgotPassword() {
    // this.router.navigate(['/public/forgot-password']);
    this.router.navigateByUrl(RouterLinks.FORGOT_PASSWORD);
  }

  getHelp() {
    const confirmdialog = this.dialog.open(AlertModalComponent, {
      panelClass: 'auth-alert-modal',
      disableClose: false,
      data: {
        type: 'socialMedia',
      },
    });
  }
  onKeyUp(event: KeyboardEvent, nextInput: HTMLInputElement) {
    const target = event.target as HTMLInputElement;
    if (event.key === 'Backspace') {
      //
    } else if (target.value.length === 1 && nextInput) {
      nextInput.focus();
    }
  }

  generateInteractTelemetry(loginType: string) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      loginType === 'createAccount' ? InteractSubtype.CREATE_ACCOUNT_CLICKED : (
        loginType === 'otp' ? InteractSubtype.OTP_LOGIN_SELECTED : InteractSubtype.PASSWORD_LOGIN_SELECTED),
      Environment.HOME,
      PageId.LOGIN
    );
  }
}