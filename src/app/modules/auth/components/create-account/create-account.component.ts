import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SignupService } from '../../services/signup/signup.service';
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { mustMatch } from '../../routes/password-validator';
import _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { AlertModalComponent} from './../alert-modal/alert-modal.component'
import { CommonUtilService, Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../../services';
import { RouterLinks } from '../../../../../app/app.constant'

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
})
export class CreateAccountComponent implements OnInit {
 
  uploadSaveData = false
  languageIcon = '../../../fusion-assets/images/lang-icon.png'
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  @ViewChild('firstnameInput') firstnameInput!: ElementRef;
  @ViewChild('emailInput') emailInput!: ElementRef;
  emailOrMobile: any
  userDetails: any
  phone = false
  email: any
  showAllFields = true
  isMobile = false
  isOtpValid = false
  emailPhoneType: any
  otpPage = false
  accountPage = false
  languageDialog = true
  spherFormBuilder: UntypedFormBuilder
  createAccountForm: UntypedFormGroup
  createAccountWithPasswordForm: UntypedFormGroup
  otpCodeForm: UntypedFormGroup
  hide1 = true
  hide2 = true
  iconChange1 = 'visibility_off'
  iconChange2 = 'visibility_off'
  passwordRequirements = {
    minLength: false,
    uppercase: false,
    number: false,
    specialChar: false
  };
  langDialog: any
  preferedLanguage: any
  showbackButton= false
  trigerrNavigation= false
  showLogOutIcon= false
  languagePage = true
  appFramework: string;
  defaultLanguage: string;
  confirmPassword: boolean = false
  loginSelected: any = 'otp'
  showPassword: boolean = false;
  passwordValidations = {
    isValidLength: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
  };
  showPasswordTwo: boolean = false;
 
  constructor(
    formBuilder: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private signupService: SignupService,
    private router: Router,
    public dialog: MatDialog,
    private userProfileSvc: UserProfileService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService 
  ) {
    this.spherFormBuilder = formBuilder
    localStorage.removeItem(`userUUID`)
    
  }


  ngOnInit() {
    this.initializeFormFields()
    this.getDefaultLanguage();
    // this.signupService.updateLanguage$.pipe().subscribe(value => {
    //   this.languagePage = value
    //   if(!this.languagePage){
    //     this.accountPage = true
    //   }
    // })
    this.hideFcWidget()
  }
  initializeFormFields() {
    this.createAccountForm = this.spherFormBuilder.group({
      firstname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      lastname: new UntypedFormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z '.-]*$/)]),
      // tslint:disable-next-line:max-line-length
      emailOrMobile: new UntypedFormControl('', [Validators.required, Validators.pattern(/^(([- ]*)[6-9][0-9]{9}([- ]*)|^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9 ]([- ]*))?)*$)$/)]),
    })
    
    this.createAccountWithPasswordForm = this.spherFormBuilder.group({
      password: new UntypedFormControl('', [Validators.required, this.passwordValidator()
      // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\ *])(?=.{8,})/g)
    ]),
      confirmPassword: new UntypedFormControl('', [Validators.required]),
    }, { validator: mustMatch('password', 'confirmPassword') }
    )
    this.otpCodeForm = this.spherFormBuilder.group({
      otpCode: new UntypedFormControl('', [Validators.required]),
    })

    this.createAccountWithPasswordForm.get('password').valueChanges.subscribe((value) => {
      this.validatePassword(value);
    });

  }

  validateEmailOrMobile() {
    if (this.createAccountForm.controls['emailOrMobile'].invalid && this.createAccountForm.controls['emailOrMobile'].touched) {
      this.createAccountForm.controls['emailOrMobile'].markAsTouched();
    }
  }

  managePasswordView(){
    this.showPassword = !this.showPassword;
  }

  managePasswordViewTwo(){
    this.showPasswordTwo = !this.showPasswordTwo;
  }
  
  passwordValidator() {
    return (control: { value: string; }) => {
      const value = control.value;
      const hasNumber = /[0-9]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isValidLength = value.length >= 8;
      const valid = hasNumber && hasUpper && hasLower && hasSpecial && isValidLength;
      if (!valid) {
        return { invalidPassword: true };
      }
      return null;
    };
  }
  // get passwordValidations() {
  //   const password = this.createAccountWithPasswordForm.get('password')?.value || '';
  //   return {
  //     hasNumber: /\d/.test(password),
  //     hasUpper: /[A-Z]/.test(password),
  //     hasLower: /[a-z]/.test(password),
  //     hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  //     isValidLength: password.length >= 8
  //   };
  // }

  validatePassword(value: string) {
    this.passwordValidations.isValidLength = value.length >= 8;
    this.passwordValidations.hasUpper = /[A-Z]/.test(value);
    this.passwordValidations.hasNumber = /\d/.test(value);
    this.passwordValidations.hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    this.cdr.detectChanges();
  }

  isValidState(requirement: boolean): string {
    if (this.createAccountWithPasswordForm.controls['password'].touched || this.createAccountWithPasswordForm.controls['password'].dirty ) {
      return requirement ? 'valid' : 'invalid';
    } else {
      return '';
    }
  }

  
  showParentForm(event: any) {
    if (event === 'true') {
      this.initializeFormFields()
    }
  }

  showCreateAccount(event: any){
    this.otpPage = false
    this.accountPage = true
  }

  showOtpPage(event){
    this.otpPage = event;
  }

  generatesubmitTelemetry() {
    const value = new Map();
    value['option'] = this.loginSelected;
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.SUBMIT_CLICKED,
      Environment.CREATE_ACCOUNT,
      PageId.CREATE_ACCOUNT,
      undefined,
      value
    );
  }

  optionSelected() {
    let selectedOption = this.loginSelected
    let msg = this.translate.instant('WILL_BE_DISPLAYED_ON_CERTIFICATE');
    this.generatesubmitTelemetry();
    const confirmdialog = this.dialog.open(AlertModalComponent, {
      panelClass: 'auth-alert-modal',
      disableClose: true,
      data: {
        type: 'confirName',
        first: this.createAccountForm.value.firstname,
        last:this.createAccountForm.value.lastname,
        msg:msg ,
      },
    })
    confirmdialog.afterClosed().subscribe((res: any) => {
      if(res.event == 'CONFIRMED'){
        if (selectedOption && selectedOption === "password") {
          this.accountPage = false
          this.confirmPassword = true
        } else {
          this.accountPage = false
          this.confirmPassword = false
          this.onSubmit(this.createAccountWithPasswordForm, this.createAccountForm)
        }
      }else if(res.event == 'EDIT'){
        this.firstnameFocus();
      }
    })
  }

  firstnameFocus(){
    this.firstnameInput.nativeElement.focus();
  }

  emailFocus(){
    this.emailInput.nativeElement.focus();
  }
  
  toggle1() {
    this.hide1 = !this.hide1
    if (this.hide1) {
      this.iconChange1 = 'visibility_off'
    } else {
      this.iconChange1 = 'visibility'
    }
  }
  toggle2() {
    this.hide2 = !this.hide2
    if (this.hide2) {
      this.iconChange2 = 'visibility_off'
    } else {
      this.iconChange2 = 'visibility'
    }
  }
  onSubmit(form: any, createAccount: any) {
    let userLoginId = this.createAccountForm.controls.emailOrMobile.value;
    let OTPMsg = this.translate.instant('OTP_SENT_ON')+ ' ';
    let emailText = this.translate.instant('EMAIL')+ ' ';
    let phoneText = this.translate.instant('PHONE')+ ' ';
    // let msg = this.translate.instant('OTP_SENT_TO')

    sessionStorage.setItem('login-btn', 'clicked')
    let phone = this.createAccountForm.controls.emailOrMobile.value
    phone = phone.replace(/[^0-9+#]/g, '')
    if (phone.length >= 10) {
      this.isMobile = true
      this.emailPhoneType = 'phone'
      this.email = false;
      OTPMsg = OTPMsg + phoneText + userLoginId;
    } else {
      this.email = /^[a-zA-Z0-9 .!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9- ]+)*$/.test(
        this.createAccountForm.controls.emailOrMobile.value
      )
      this.emailPhoneType = 'email';
      OTPMsg = OTPMsg + emailText + userLoginId;
    }
    this.uploadSaveData = true
    let reqObj

    if (this.email) {
      let language = {
        preferences: {
          language: this.preferedLanguage.id ?  this.preferedLanguage.id : this.defaultLanguage
        }
      }
      reqObj = {
        firstName: createAccount.value.firstname.trim(),
        lastName: createAccount.value.lastname.trim(),
        email: createAccount.value.emailOrMobile.trim(),
        password: form.value.password.trim(),
      }
      this.signupService.autoSignup(reqObj).subscribe(async res => {
        if (res.status === 200) {
          let msg = this.translate.instant('USER_SUCCESSFULLY_CREATED');
          this.openSnackbar(msg);
          this.showAllFields = false
          this.uploadSaveData = false
          this.accountPage = false
          this.otpPage = true
          this.confirmPassword = false
          this.showbackButton = true
          localStorage.setItem(`userUUID`, res.userId)
          const reqUpdate = {
            request: {
              userId: res.userId,
              profileLocation: `${this.appFramework}/create-account`,
              profileDetails: language,
              tcStatus: 'false'
            },
          }
          this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
          async (res: any) => {
              if (res) {
                this.openSnackbar(OTPMsg)
                await this.userProfileSvc.updateProfileData(res)
              }
            })
        } else {
          this.accountPage = true;
          this.otpPage = false
          this.confirmPassword = false
          let msg = this.translate.instant('USER_ALREADY_EXIST');
          const userAlert = this.dialog.open(AlertModalComponent, {
            panelClass: 'auth-alert-modal',
            disableClose: true,
            data: {
              type: 'caAlert',
              msg: msg
            },
          })

          userAlert.afterClosed().subscribe((res: any) => {
            if(res.event == 'LOGIN'){
              this.router.navigateByUrl(RouterLinks.APP_LOGIN);
            }else if(res.event == 'TRYAGAIN'){
              this.emailFocus()
            }
          })
          // this.openSnackbar(msg);
        }
      },
        err => {
          if(err){
            this.accountPage = true;
            this.otpPage = false
            this.confirmPassword = false
            this.uploadSaveData = false;
            if(err.error.msg == 'User already exists'){
              // this.openSnackbar(this.translate.instant('USER_ALREADY_EXIST'));
              const userAlert = this.dialog.open(AlertModalComponent, {
                panelClass: 'auth-alert-modal',
                disableClose: true,
                data: {
                  type: 'caAlert',
                  msg: this.translate.instant('USER_ALREADY_EXIST')
                },
              })

              userAlert.afterClosed().subscribe((res: any) => {
                if(res.event == 'LOGIN'){
                  this.router.navigateByUrl(RouterLinks.APP_LOGIN);
                }else if(res.event == 'TRYAGAIN'){
                  this.emailFocus()
                }
              })

            }else{
              this.openSnackbar(err.error.msg)
            }
          }
         
        }
      )
    } else {
      let language = {
        preferences: {
          language: this.preferedLanguage.id ?  this.preferedLanguage.id : this.defaultLanguage
        }
      }
      const requestBody = {
        firstName: createAccount.value.firstname.trim(),
        lastName: createAccount.value.lastname.trim(),
        phone: createAccount.value.emailOrMobile.trim(),
        password: form.value.password.trim(),
      }

      this.signupService.autoSignup(requestBody).subscribe((res: any) => {
        if (res.status === 200) {
          let msg = this.translate.instant('USER_SUCCESSFULLY_CREATED');
          this.openSnackbar(msg);
          this.showAllFields = false
          this.uploadSaveData = false
          this.otpPage = true
          this.showbackButton = true
          this.confirmPassword = false
          this.accountPage = false
          localStorage.setItem(`userUUID`, res.userUUId)
          const reqUpdate = {
            request: {
              userId: res.userId,
              profileDetails: language,
              tcStatus: 'false'
            },
          }
          this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
          async (res: any) => {
              if (res) {
                this.openSnackbar(OTPMsg)
                await this.userProfileSvc.updateProfileData(res)
              }
            })
        } else  {
          this.accountPage = true;
          this.otpPage = false
          this.confirmPassword = false
          let msg = this.translate.instant('USER_ALREADY_EXIST');
          this.openSnackbar(msg);
        }
      },
        err => {
          this.accountPage = true;
          this.otpPage = false
          this.confirmPassword = false;
          if(err.error.msg == 'User already exists'){
            this.openSnackbar(this.translate.instant('USER_ALREADY_EXIST'));
          }else{
            this.openSnackbar(err.error.msg)
          }
          this.uploadSaveData = false
        }
      )
    }
  }
  eventTrigger(p1: string, p2: string) {
    const obj = {
      EventDetails: {
        EventName: p1,
        Name: p2,
      },
    }
   
    // const userdata = Object.assign(MainVisitorDetails, obj)
    const userdata = Object.assign(obj)
    this.signupService.plumb5SendEvent(userdata).subscribe((res: any) => {
      // @ts-ignore: Unreachable code error
      // tslint:disable-next-line
      // console.log(res)
    })
  }

  gotoHome() {
    this.router.navigate(['/page/home'])
      .then(() => {
        window.location.reload()
      })
  }
  private openSnackbar(primaryMsg: string, duration: number = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
  

  selectLanguage(event: any) {
    this.languagePage = false
    this.accountPage = true
      if(event == 'en'){
        this.preferedLanguage = { id: 'en', lang: 'English' }
      }
      else if(event == 'kn'){
        this.preferedLanguage = { id: 'kn', lang: 'ಕನ್ನಡ' }
      }
      else{
        this.preferedLanguage = { id: 'hi', lang: 'हिंदी' }
      }
      // this.translate.setDefaultLang(event);
      this.commonUtilService.updateAppLanguage(event);
  }

  async getDefaultLanguage(){
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (this.appFramework === 'Ekshamata') {
        this.defaultLanguage = 'hi'
      } else {
        this.defaultLanguage = 'en'
      }
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }

  showLanguageSelection(event) {
    this.languagePage = true
    this.accountPage = false
    this.otpPage = false
    this.createAccountForm.reset()
  }

  getHelp(){
    let msg = this.translate.instant('SUPPORT_MSG');
    const confirmdialog = this.dialog.open(AlertModalComponent, {
      panelClass: 'auth-alert-modal',     
      disableClose: true,
      data: {
        msg: msg ,
        type: 'socialMedia',
      },
    });
    this.generateInteractEvent();
   
  }

  hideFcWidget() {
    const fcWidget = window.fcWidget;
    if (fcWidget) {
      fcWidget.hide();
    }
  }

  generateInteractEvent() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.HELP_CLICKED,
      Environment.CREATE_ACCOUNT,
      PageId.CREATE_ACCOUNT,
    );
  }
}
