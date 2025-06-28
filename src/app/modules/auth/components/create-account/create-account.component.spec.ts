import {ChangeDetectorRef} from "@angular/core";
import {
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { SignupService } from "../../services/signup/signup.service";
import { UserProfileService } from "../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service";
import { AppFrameworkDetectorService } from "../../../../../app/modules/core/services/app-framework-detector-service.service";
import { TranslateService } from "@ngx-translate/core";
import { AlertModalComponent } from "./../alert-modal/alert-modal.component";
import { CommonUtilService, Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from "../../../../../services";
import { CreateAccountComponent } from "./create-account.component";
import { of, throwError } from "rxjs";

describe("CreateAccountComponent", () => {
  let component: CreateAccountComponent;

  const formBuilder: Partial<UntypedFormBuilder> = {};
  const snackBar: Partial<MatSnackBar> = {};
  const signupService: Partial<SignupService> = {};
  const router: Partial<Router> = {};
  const dialog: Partial<MatDialog> = {};
  const userProfileSvc: Partial<UserProfileService> = {};
  const appFrameworkDetectorService: Partial<AppFrameworkDetectorService> = {};
  const translate: Partial<TranslateService> = {};
  const cdr: Partial<ChangeDetectorRef> = {};
  const commonUtilService: Partial<CommonUtilService> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {}

  beforeAll(() => {
    component = new CreateAccountComponent(
      formBuilder as UntypedFormBuilder,
      snackBar as MatSnackBar,
      signupService as SignupService,
      router as Router,
      dialog as MatDialog,
      userProfileSvc as UserProfileService,
      appFrameworkDetectorService as AppFrameworkDetectorService,
      translate as TranslateService,
      cdr as ChangeDetectorRef,
      commonUtilService as CommonUtilService,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a instance of component", () => {
    expect(component).toBeTruthy();
  });

  describe("initializeFormFields", () => {
    it("should initialize three form groups with correct controls and validators", () => {
      const mockFormBuilder = {
        group: jest.fn().mockReturnValue(
          new FormGroup({
            firstname: new UntypedFormControl("f-name"),
            lastname: new UntypedFormControl("l-name"),
            emailOrMobile: new UntypedFormControl("emailOrMobile"),
            password: new UntypedFormControl("Test@123"),
          })
        ),
      };
      component.spherFormBuilder = mockFormBuilder as any;
      component.initializeFormFields();
      expect(component.createAccountForm).toBeTruthy();
      expect(component.createAccountWithPasswordForm).toBeTruthy();
    });
  });

  it("should check validation of form", () => {
    component.createAccountForm = new FormGroup({
      emailOrMobile: new FormControl("", [Validators.required]),
    });
    component.createAccountForm.controls["emailOrMobile"].setErrors({
      invalid: true,
    });
    component.createAccountForm.controls["emailOrMobile"].markAsTouched();
    const spy = jest.spyOn(
      component.createAccountForm.controls["emailOrMobile"],
      "markAsTouched"
    );
    // Act
    component.validateEmailOrMobile();
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  it("should toggle showPassword from false to true when called", () => {
    // Arrange
    component.showPassword = false;
    // Act
    component.managePasswordView();
    // Assert
    expect(component.showPassword).toBe(true);
  });

  it("should manage password view", () => {
    component.showPasswordTwo = false;
    component.managePasswordViewTwo();
    expect(component.showPasswordTwo).toBe(true);
  });

  it("should return null for valid password with all criteria", () => {
    // Arrange
    const validator = component.passwordValidator();
    const control = { value: "Test123!@" };

    // Act
    const result = validator(control);

    // Assert
    expect(result).toBeNull();
  });

  it("should return invalidPassword for empty string", () => {
    // Arrange
    const validator = component.passwordValidator();
    const control = { value: "" };

    // Act
    const result = validator(control);

    // Assert
    expect(result).toEqual({ invalidPassword: true });
  });

  it("should invoke validatePassword", () => {
    // Arrange
    const password = "Test@123";
    cdr.detectChanges = jest.fn();
    // Act
    component.validatePassword(password);
    // Assert
    expect(cdr.detectChanges).toHaveBeenCalled();
  });

  describe("isValidState", () => {
    it("should return valid if password is valid", () => {
      // Arrange
      component.createAccountWithPasswordForm = new FormGroup({
        password: new FormControl("", [Validators.required]),
      });
      component.createAccountWithPasswordForm.controls["password"].setErrors({
        touched: true,
      });
      component.createAccountWithPasswordForm.controls["password"].setErrors({
        dirty: true,
      });
      component.createAccountWithPasswordForm.controls[
        "password"
      ].markAsTouched();
      // Act
      const result = component.isValidState(true);
      // Assert
      expect(result).toBe("valid");
    });

    it("should return invalid if password is invalid", () => {
      // Arrange
      component.createAccountWithPasswordForm = new FormGroup({
        password: new FormControl("", [Validators.required]),
      });
      component.createAccountWithPasswordForm.controls["password"].setErrors({
        touched: false,
      });
      component.createAccountWithPasswordForm.controls["password"].setErrors({
        dirty: false,
      });
      component.createAccountWithPasswordForm.controls[
        "password"
      ].markAsTouched();
      // Act
      const result = component.isValidState(false);
      // Assert
      expect(result).toBe("invalid");
    });
  });

  describe("isValidState", () => {
    it("should invoke showParentForm", () => {
      // Arrange
      const event = "true";
      jest
        .spyOn(component, "initializeFormFields")
        .mockImplementation(() => {});
      // Act
      component.showParentForm(event);
      // Assert
      expect(component.accountPage).toBe(false);
    });
    it("should invoke showParentForm as false", () => {
      // Arrange
      const event = "false";
      // Act
      component.showParentForm(event);
      // Assert
      expect(component.accountPage).toBe(false);
    });
  });

  it("should show Create an Account", () => {
    //arrange
    const event = {};
    //act
    component.showCreateAccount(event);
    //assert
    expect(component.accountPage).toBe(true);
    expect(component.otpPage).toBe(false);
  });

  it("should show OTP", () => {
    //arrange
    const event = {};
    //act
    component.showOtpPage(event);
    //assert
    expect(component.otpPage).toBe(event);
  });

  describe("optionSelected", () => {
    it("should confirm event for select option as password", () => {
      const value = new Map();
      component.loginSelected = "password";
      translate.instant = jest.fn(() => "test message");
      dialog.open = jest.fn(() => {
        return {
          afterClosed: () => {
            return of({ event: "CONFIRMED" });
          },
        };
      }) as any;
      component.createAccountForm = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        emailOrMobile: new UntypedFormControl("emailOrMobile"),
        password: new UntypedFormControl("Test@123"),
      });
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      // Act
      component.optionSelected();
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(dialog.open).toHaveBeenCalledWith(AlertModalComponent, {
        panelClass: "auth-alert-modal",
        disableClose: true,
        data: {
          type: "confirName",
          first: "John",
          last: "Doe",
          msg: "test message",
        },
      });
      expect(component.accountPage).toBe(false);
      expect(component.confirmPassword).toBe(true);
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
        InteractType.TOUCH,
        InteractSubtype.SUBMIT_CLICKED,
        Environment.CREATE_ACCOUNT,
        PageId.CREATE_ACCOUNT,
        undefined,
        value
      )
    });

    it("should confirm event for select option as otp", () => {
      component.loginSelected = "otp";
      translate.instant = jest.fn(() => "test message");
      dialog.open = jest.fn(() => {
        return {
          afterClosed: () => {
            return of({ event: "CONFIRMED" });
          },
        };
      }) as any;
      component.createAccountForm = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        emailOrMobile: new UntypedFormControl("emailOrMobile"),
        password: new UntypedFormControl("Test@123"),
      });
      // Act
      component.optionSelected();
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(dialog.open).toHaveBeenCalledWith(AlertModalComponent, {
        panelClass: "auth-alert-modal",
        disableClose: true,
        data: {
          type: "confirName",
          first: "John",
          last: "Doe",
          msg: "test message",
        },
      });
      expect(component.accountPage).toBe(false);
      expect(component.confirmPassword).toBe(false);
    });

    it("should be edit event", () => {
      component.loginSelected = "otp";
      translate.instant = jest.fn(() => "test message");
      dialog.open = jest.fn(() => {
        return {
          afterClosed: () => {
            return of({ event: "EDIT" });
          },
        };
      }) as any;
      component.createAccountForm = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        emailOrMobile: new UntypedFormControl("emailOrMobile"),
        password: new UntypedFormControl("Test@123"),
      });
      // Act
      component.optionSelected();
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(dialog.open).toHaveBeenCalledWith(AlertModalComponent, {
        panelClass: "auth-alert-modal",
        disableClose: true,
        data: {
          type: "confirName",
          first: "John",
          last: "Doe",
          msg: "test message",
        },
      });
      expect(component.accountPage).toBe(false);
      expect(component.confirmPassword).toBe(false);
    });
  });

  describe("toggle1", () => {
    it("should hide password", () => {
      // Arrange
      component.hide1 = false;
      // Act
      component.toggle1();
      // Assert
      expect(component.iconChange1).toBe("visibility_off");
    });

    it("should visible password", () => {
      // Arrange
      component.hide1 = true;
      // Act
      component.toggle1();
      // Assert
      expect(component.iconChange1).toBe("visibility");
    });
  });

  describe("toggle2", () => {
    it("should hide password", () => {
      // Arrange
      component.hide2 = false;
      // Act
      component.toggle2();
      // Assert
      expect(component.iconChange2).toBe("visibility_off");
    });

    it("should visible password", () => {
      // Arrange
      component.hide2 = true;
      // Act
      component.toggle2();
      // Assert
      expect(component.iconChange2).toBe("visibility");
    });
  });

  describe("onSubmit", () => {
    it("should verify phone for create account", () => {
      // Arrange
      component.createAccountForm = new FormGroup({
        emailOrMobile: new UntypedFormControl("9907878787"),
      });
      const form = new FormGroup({
        password: new UntypedFormControl("Test@123"),
      });
      const createAccount = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        email: new UntypedFormControl("Test@gmail.com"),
        emailOrMobile: new UntypedFormControl("9907878787"),
      });
      component.preferedLanguage = { id: "en", lang: "English" };
      signupService.autoSignup = jest.fn(() =>
        of({
          status: 200,
        })
      );
      translate.instant = jest.fn(() => "user created successfully");
      // Act
      component.onSubmit(form, createAccount);
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(signupService.autoSignup).toHaveBeenCalled();
      expect(component.showAllFields).toBe(true);
      expect(component.accountPage).toBe(false);
      expect(component.otpPage).toBeTruthy();
    });

    it("should verify email for create account", () => {
      // Arrange
      component.createAccountForm = new FormGroup({
        emailOrMobile: new UntypedFormControl("Test@gmail.com"),
      });
      const form = new FormGroup({
        password: new UntypedFormControl("Test@123"),
      });
      const createAccount = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        email: new UntypedFormControl("Test@gmail.com"),
        emailOrMobile: new UntypedFormControl("Test@gmail.com"),
      });
      component.preferedLanguage = { id: "en", lang: "English" };
      signupService.autoSignup = jest.fn(() =>
        of({
          status: 200,
        })
      );
      translate.instant = jest.fn(() => "user created successfully");
      jest.spyOn(Storage.prototype, "setItem");
      Storage.prototype.setItem = jest.fn();
      userProfileSvc.updateProfileDetails = jest.fn(() => of({ uid: "123" }));
      snackBar.open = jest.fn(() => {}) as any;
      userProfileSvc.updateProfileData = jest.fn(() =>
        of({ uid: "123" })
      ) as any;
      // Act
      component.onSubmit(form, createAccount);
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(signupService.autoSignup).toHaveBeenCalled();
      expect(component.showAllFields).toBe(false);
      expect(userProfileSvc.updateProfileDetails).toHaveBeenCalled();
      expect(userProfileSvc.updateProfileData).toHaveBeenCalled;
      expect(snackBar.open).toHaveBeenCalled();
    });

    it("should verify email for create account if status is not 200", () => {
      // Arrange
      component.createAccountForm = new FormGroup({
        emailOrMobile: new UntypedFormControl("Test@gmail.com"),
      });
      const form = new FormGroup({
        password: new UntypedFormControl("Test@123"),
      });
      const createAccount = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        email: new UntypedFormControl("Test@gmail.com"),
        emailOrMobile: new UntypedFormControl("Test@gmail.com"),
      });
      component.preferedLanguage = { id: "en", lang: "English" };
      signupService.autoSignup = jest.fn(() =>
        of({
          status: 401,
        })
      );
      translate.instant = jest.fn(() => "user created successfully");
      jest.spyOn(Storage.prototype, "setItem");
      Storage.prototype.setItem = jest.fn();
      userProfileSvc.updateProfileDetails = jest.fn(() => of({ uid: "123" }));
      snackBar.open = jest.fn(() => {}) as any;
      userProfileSvc.updateProfileData = jest.fn(() =>
        of({ uid: "123" })
      ) as any;
      dialog.open = jest.fn(() => {
        return {
          afterClosed: () => {
            return of({ event: "LOGIN" });
          },
        };
      }) as any;
      router.navigateByUrl = jest.fn();
      // Act
      component.onSubmit(form, createAccount);
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(signupService.autoSignup).toHaveBeenCalled();
      expect(component.showAllFields).toBe(false);
      expect(component.accountPage).toBe(true);
      expect(component.otpPage).toBe(false);
      expect(router.navigateByUrl).toHaveBeenCalled();
      expect(userProfileSvc.updateProfileData).toHaveBeenCalled;
    });

    it("should verify email for create account if status is TRYAGAIN", () => {
      // Arrange
      component.createAccountForm = new FormGroup({
        emailOrMobile: new UntypedFormControl("Test@gmail.com"),
      });
      const form = new FormGroup({
        password: new UntypedFormControl("Test@123"),
      });
      const createAccount = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        email: new UntypedFormControl("Test@gmail.com"),
        emailOrMobile: new UntypedFormControl("Test@gmail.com"),
      });
      component.preferedLanguage = { id: "en", lang: "English" };
      signupService.autoSignup = jest.fn(() =>
        of({
          status: 401,
        })
      );
      translate.instant = jest.fn(() => "user created successfully");
      jest.spyOn(Storage.prototype, "setItem");
      Storage.prototype.setItem = jest.fn();
      userProfileSvc.updateProfileDetails = jest.fn(() => of({ uid: "123" }));
      snackBar.open = jest.fn(() => {}) as any;
      userProfileSvc.updateProfileData = jest.fn(() =>
        of({ uid: "123" })
      ) as any;
      dialog.open = jest.fn(() => {
        return {
          afterClosed: () => {
            return of({ event: "TRYAGAIN" });
          },
        };
      }) as any;
      // Act
      component.onSubmit(form, createAccount);
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(signupService.autoSignup).toHaveBeenCalled();
      expect(component.showAllFields).toBe(false);
      expect(component.accountPage).toBe(true);
      expect(component.otpPage).toBe(false);
      expect(userProfileSvc.updateProfileData).toHaveBeenCalled;
    });

    it("should verify email and user is already exists", () => {
      // Arrange
      component.createAccountForm = new FormGroup({
        emailOrMobile: new UntypedFormControl("Test@gmail.com"),
      });
      const form = new FormGroup({
        password: new UntypedFormControl("Test@123"),
      });
      const createAccount = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        email: new UntypedFormControl("Test@gmail.com"),
        emailOrMobile: new UntypedFormControl("Test@gmail.com"),
      });
      component.preferedLanguage = { id: "en", lang: "English" };
      signupService.autoSignup = jest.fn(() =>
        throwError({
          error: {
            msg: "User already exists",
          },
        })
      );
      translate.instant = jest.fn(() => "user created successfully");
      jest.spyOn(Storage.prototype, "setItem");
      Storage.prototype.setItem = jest.fn();
      snackBar.open = jest.fn(() => {}) as any;
      dialog.open = jest.fn(() => {
        return {
          afterClosed: () => {
            return of({ event: "TRYAGAIN" });
          },
        };
      }) as any;
      router.navigateByUrl = jest.fn();
      // Act
      component.onSubmit(form, createAccount);
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(signupService.autoSignup).toHaveBeenCalled();
      expect(component.showAllFields).toBe(false);
      expect(component.accountPage).toBe(true);
      expect(component.otpPage).toBe(false);
    });

    it("should create account if email is not valid", () => {
      // Arrange
      component.createAccountForm = new FormGroup({
        emailOrMobile: new UntypedFormControl(""),
      });
      const form = new FormGroup({
        password: new UntypedFormControl("Test@123"),
      });
      const createAccount = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        email: new UntypedFormControl(""),
        emailOrMobile: new UntypedFormControl(""),
      });
      component.preferedLanguage = { id: "en", lang: "English" };
      signupService.autoSignup = jest.fn(() =>
        of({
          status: 200,
        })
      );
      translate.instant = jest.fn(() => "user created successfully");
      jest.spyOn(Storage.prototype, "setItem");
      Storage.prototype.setItem = jest.fn();
      userProfileSvc.updateProfileDetails = jest.fn(() => of({ uid: "123" }));
      snackBar.open = jest.fn(() => {}) as any;
      userProfileSvc.updateProfileData = jest.fn(() =>
        of({ uid: "123" })
      ) as any;
      // Act
      component.onSubmit(form, createAccount);
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(signupService.autoSignup).toHaveBeenCalled();
      expect(component.showAllFields).toBe(false);
      expect(userProfileSvc.updateProfileDetails).toHaveBeenCalled();
      expect(userProfileSvc.updateProfileData).toHaveBeenCalled;
      expect(snackBar.open).toHaveBeenCalled();
    });

    it("should verify email for create account if email is not valid and status is not 200", () => {
      // Arrange
      component.createAccountForm = new FormGroup({
        emailOrMobile: new UntypedFormControl(""),
      });
      const form = new FormGroup({
        password: new UntypedFormControl("Test@123"),
      });
      const createAccount = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        email: new UntypedFormControl(""),
        emailOrMobile: new UntypedFormControl(""),
      });
      component.preferedLanguage = { id: "en", lang: "English" };
      signupService.autoSignup = jest.fn(() =>
        of({
          status: 401,
        })
      );
      translate.instant = jest.fn(() => "user created successfully");
      snackBar.open = jest.fn(() => {}) as any;
      // Act
      component.onSubmit(form, createAccount);
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(signupService.autoSignup).toHaveBeenCalled();
      expect(component.showAllFields).toBe(false);
      expect(component.accountPage).toBe(true);
      expect(component.otpPage).toBe(false);
      expect(snackBar.open).toHaveBeenCalled();
    });

    it("should throw error and user is already exists", () => {
      // Arrange
      component.createAccountForm = new FormGroup({
        emailOrMobile: new UntypedFormControl(""),
      });
      const form = new FormGroup({
        password: new UntypedFormControl("Test@123"),
      });
      const createAccount = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        email: new UntypedFormControl(""),
        emailOrMobile: new UntypedFormControl(""),
      });
      component.preferedLanguage = { id: "en", lang: "English" };
      signupService.autoSignup = jest.fn(() =>
        throwError({
          error: {
            msg: "User already exists",
          },
        })
      );
      translate.instant = jest.fn(() => "user created successfully");
      jest.spyOn(Storage.prototype, "setItem");
      Storage.prototype.setItem = jest.fn();
      snackBar.open = jest.fn(() => {}) as any;
      dialog.open = jest.fn(() => {
        return {
          afterClosed: () => {
            return of({ event: "TRYAGAIN" });
          },
        };
      }) as any;
      router.navigateByUrl = jest.fn();
      // Act
      component.onSubmit(form, createAccount);
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(signupService.autoSignup).toHaveBeenCalled();
      expect(component.showAllFields).toBe(false);
      expect(component.accountPage).toBe(true);
      expect(component.otpPage).toBe(false);
    });

    it("should throw error and user is not exists", () => {
      // Arrange
      component.createAccountForm = new FormGroup({
        emailOrMobile: new UntypedFormControl(""),
      });
      const form = new FormGroup({
        password: new UntypedFormControl("Test@123"),
      });
      const createAccount = new FormGroup({
        firstname: new UntypedFormControl("John"),
        lastname: new UntypedFormControl("Doe"),
        email: new UntypedFormControl(""),
        emailOrMobile: new UntypedFormControl(""),
      });
      component.preferedLanguage = { id: "en", lang: "English" };
      signupService.autoSignup = jest.fn(() =>
        throwError({
          error: {
            msg: "User does not exists",
          },
        })
      );
      translate.instant = jest.fn(() => "user created successfully");
      jest.spyOn(Storage.prototype, "setItem");
      Storage.prototype.setItem = jest.fn();
      snackBar.open = jest.fn(() => {}) as any;
      dialog.open = jest.fn(() => {
        return {
          afterClosed: () => {
            return of({ event: "TRYAGAIN" });
          },
        };
      }) as any;
      router.navigateByUrl = jest.fn();
      // Act
      component.onSubmit(form, createAccount);
      // Assert
      expect(translate.instant).toHaveBeenCalled();
      expect(signupService.autoSignup).toHaveBeenCalled();
      expect(component.showAllFields).toBe(false);
      expect(component.accountPage).toBe(true);
      expect(component.otpPage).toBe(false);
      expect(component.uploadSaveData).toBeFalsy();
    });
  });

  it('should trigger a signup service event', () => {
    // Arrange
    signupService.plumb5SendEvent = jest.fn(() => of({}));
    const p1 = 'test'
    const p2 = '123';
    // Act
    component.eventTrigger(p1, p2);
    // Assert
    expect(signupService.plumb5SendEvent).toHaveBeenCalled();
  })

  it('should navigate to home page', () => {
    // Arrange
    router.navigate = jest.fn(() => Promise.resolve(true));
    window.location = {
      reload: jest.fn()
    } as any;
    // Act
    component.gotoHome();
    // Assert
    expect(router.navigate).toHaveBeenCalled();
  })

  describe('getDefaultLanguage', () => {
    it('should select hindi for ekshamata', async() => {
      // Arrange
      appFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('Ekshamata'));
      // Act
      await component.getDefaultLanguage();
      // Assert
      expect(component.defaultLanguage).toBe('hi');
    });

    it('should select hindi for ekshamata', async() => {
      // Arrange
      appFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('other'));
      // Act
      await component.getDefaultLanguage();
      // Assert
      expect(component.defaultLanguage).toBe('en');
    });
  });

  describe('selectLanguage', () => {
    it('should be preferedLanguage for english', () => {
      // Arrange  
      const event = 'en';
      commonUtilService.updateAppLanguage = jest.fn();
      // Act
      component.selectLanguage(event);
      // Assert
      expect(component.preferedLanguage).toEqual({ id: 'en', lang: 'English' });
      expect(commonUtilService.updateAppLanguage).toHaveBeenCalled();
    });

    it('should be preferedLanguage for kn', () => {
      // Arrange  
      const event = 'kn';
      commonUtilService.updateAppLanguage = jest.fn();
      // Act
      component.selectLanguage(event);
      // Assert
      expect(component.preferedLanguage).toEqual({ id: 'kn', lang: 'ಕನ್ನಡ' });
      expect(commonUtilService.updateAppLanguage).toHaveBeenCalled();
    });

    it('should be preferedLanguage for default', () => {
      // Arrange  
      const event = 'hi';
      commonUtilService.updateAppLanguage = jest.fn();
      // Act
      component.selectLanguage(event);
      // Assert
      expect(component.preferedLanguage).toEqual({ id: 'hi', lang: 'हिंदी' });
      expect(commonUtilService.updateAppLanguage).toHaveBeenCalled();
    });
  });

  it('should show language selection', () => {
    // Arrange
    component.createAccountForm = {
      reset: jest.fn()
    } as any;
    // Act
    component.showLanguageSelection('');
    // Assert
    expect(component.languagePage).toBeTruthy();
    expect(component.accountPage).toBeFalsy();
    expect(component.otpPage).toBeFalsy();
    expect(component.createAccountForm.reset).toHaveBeenCalled();
  });

  it('should open a popup for getting help', () => {
    // Arrange
    translate.instant = jest.fn(() => 'SUPPORT_MSG');
    dialog.open = jest.fn(() => {
      return {
        afterClosed: () => {
          return of({ event: "TRYAGAIN" });
        },
      };
    }) as any;
    mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
    // Act
    component.getHelp();
    // Assert
    expect(dialog.open).toHaveBeenCalled();
    expect(translate.instant).toHaveBeenCalled();
    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toBeCalledWith(
      InteractType.TOUCH,
      InteractSubtype.HELP_CLICKED,
      Environment.CREATE_ACCOUNT,
      PageId.CREATE_ACCOUNT,
    )
  });

  it('should be hide hideFcWidget', () => {
    // Arrange
    window['fcWidget'] = {
      hide: jest.fn()
    } as any;
    // Act
    component.hideFcWidget();
    // Assert
    expect(window['fcWidget'].hide).toHaveBeenCalled();
  });

  it('should invoke ngOnInit', () => {
    // Arrange
    jest.spyOn(component, 'getDefaultLanguage').mockImplementation(() => {
      return Promise.resolve();
    });
    jest.spyOn(component, 'initializeFormFields').mockImplementation();
    jest.spyOn(component, 'hideFcWidget').mockImplementation();
    // Act
    component.ngOnInit();
    // Assert
    expect(component.getDefaultLanguage).toHaveBeenCalled();
    expect(component.initializeFormFields).toHaveBeenCalled();
    expect(component.hideFcWidget).toHaveBeenCalled();
  });
});
