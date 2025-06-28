import {
  FormBuilder,
  UntypedFormControl,
  FormControl,
  FormGroup,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { SignupService } from "../../services/signup/signup.service";
import { InAppBrowser } from "@awesome-cordova-plugins/in-app-browser/ngx";
import { TranslateService } from "@ngx-translate/core";
import { Events } from "../../../../../util/events";
import { ForgotPasswordComponent } from "./forgot-password.component";
import { AppFrameworkDetectorService } from "../../../../../app/modules/core/services/app-framework-detector-service.service";
import { of, throwError } from "rxjs";
import { value } from "lodash-es";
import { TelemetryGeneratorService } from "../../../../../services";

describe("ForgotPasswordComponent", () => {
  let component: ForgotPasswordComponent;

  const router: Partial<Router> = {};
  const signupService: Partial<SignupService> = {};
  const fb: Partial<FormBuilder> = {
    group: jest.fn().mockReturnValue({
      password: new FormControl("Test@123"),
      confirmPassword: new FormControl("Test@123"),
    }),
  };
  const snackBar: Partial<MatSnackBar> = {};
  const dialog: Partial<MatDialog> = {};
  const inAppBrowser: Partial<InAppBrowser> = {};
  const translate: Partial<TranslateService> = {};
  const events: Partial<Events> = {};
  const appFrameworkDetectorService: Partial<AppFrameworkDetectorService> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

  beforeAll(() => {
    component = new ForgotPasswordComponent(
      router as Router,
      signupService as SignupService,
      fb as FormBuilder,
      snackBar as MatSnackBar,
      dialog as MatDialog,
      inAppBrowser as InAppBrowser,
      translate as TranslateService,
      events as Events,
      appFrameworkDetectorService as AppFrameworkDetectorService,
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

  describe("detectFramework", () => {
    it("should set emitNavigateBack true and navigateToEkshmataHome false when framework is Sphere", async () => {
      // Arrange
      appFrameworkDetectorService.detectAppFramework = jest.fn(() =>
        Promise.resolve("Sphere")
      );
      // Act
      await component.detectFramework();
      // Assert
      expect(appFrameworkDetectorService.detectAppFramework).toHaveBeenCalled();
      expect(component.emitNavigateBack).toBe(true);
      expect(component.navigateToEkshmataHome).toBe(false);
    });

    it("should set navigateToEkshmataHome true and emitNavigateBack false when framework is Ekshamata", async () => {
      // Arrange
      appFrameworkDetectorService.detectAppFramework = jest.fn(() =>
        Promise.resolve("Ekshamata")
      );
      // Act
      await component.detectFramework();
      // Assert
      expect(appFrameworkDetectorService.detectAppFramework).toHaveBeenCalled();
      expect(component.navigateToEkshmataHome).toBe(true);
      expect(component.emitNavigateBack).toBe(false);
    });

    it("should handle error part", async () => {
      // Arrange
      appFrameworkDetectorService.detectAppFramework = jest.fn(() =>
        Promise.reject({ erro: "error" })
      );
      // Act
      await component.detectFramework();
      // Assert
      expect(appFrameworkDetectorService.detectAppFramework).toHaveBeenCalled();
    });
  });

  it("should invoke ngOnInit", () => {
    // Arrange
    jest.spyOn(component, "detectFramework").mockImplementation(() => {
      return Promise.resolve();
    });
    // Act
    component.ngOnInit();
    // Assert
    expect(component.detectFramework).toHaveBeenCalled();
  });

  describe("passwordMatchValidator", () => {
    it("should return an error when passwords do not match", () => {
      // Arrange
      const formGroup = new FormGroup({
        password: new FormControl("Test@123"),
        confirmPassword: new FormControl(""),
      });
      // Act
      const result = component.passwordMatchValidator(formGroup);
      // Assert
      expect(result).toEqual({ required: true });
    });

    it("should return null when passwords match", () => {
      // Arrange
      const formGroup = new FormGroup({
        password: new FormControl("Test@123"),
        confirmPassword: new FormControl("Test@123"),
      });
      // Act
      const result = component.passwordMatchValidator(formGroup);
      // Assert
      expect(result).toBeNull();
    });

    it("should return an error when passwords do not match", () => {
      // Arrange
      const formGroup = new FormGroup({
        password: new FormControl("Test@123"),
        confirmPassword: new FormControl("DifferentPassword"),
      });
      // Act
      const result = component.passwordMatchValidator(formGroup);
      // Assert
      expect(result).toEqual({ passwordMismatch: true });
    });
  });

  describe("initOptForm", () => {
    beforeEach(() => {
      component.key = "phone";
      const form = (fb.group = jest.fn().mockReturnValue(
        new FormGroup({
          OTPCHRone: new UntypedFormControl("1234"),
          OTPCHRtwo: new UntypedFormControl("1234"),
          OTPCHRthree: new UntypedFormControl("1234"),
          OTPCHRfour: new UntypedFormControl("1234"),
        })
      ));
      component.otpForm = form as any;
      component.otpForm = {
        reset: jest.fn(),
      } as any;
    });
    it("should set otpForm", () => {
      // Arrange
      // Act
      component.initOptForm();
      // Assert
      expect(component.otpForm).toBeTruthy();
    });

    it("should set otpForm", () => {
      // Arrange
      component.key = "";
      component.otpForm = {
        reset: jest.fn(),
      } as any;
      // Act
      component.initOptForm();
      // Assert
      expect(component.otpForm).toBeTruthy();
    });
  });

  it("should send otp screen of invoked gotoToSendOTPScreen", () => {
    // Arrange
    component.emailForm = {
      reset: jest.fn(),
    } as any;
    const mockFormBuilder = {
      group: jest.fn().mockReturnValue(
        new FormGroup({
          OTPCHRone: new UntypedFormControl("1234"),
          OTPCHRtwo: new UntypedFormControl("1234"),
          OTPCHRthree: new UntypedFormControl("1234"),
          OTPCHRfour: new UntypedFormControl("1234"),
        })
      ),
    };
    component.otpForm = mockFormBuilder as any;
    component.otpForm = {
      reset: jest.fn(),
    } as any;
    component.passwordForm = {
      reset: jest.fn(),
    } as any;
    // Act
    component.gotoToSendOTPScreen();
    // Assert
    expect(component.emailForm.reset).toHaveBeenCalled();
    expect(component.otpForm.reset).toHaveBeenCalled();
    expect(component.passwordForm.reset).toHaveBeenCalled();
    expect(component.showEmailsection).toBe(true);
    expect(component.showOtpPwd).toBe(false);
    expect(component.showSetPassword).toBe(false);
  });

  it("should invoked ngAfterViewChecked", () => {
    // Arrange
    jest.useFakeTimers();
    // Act
    component.ngAfterViewChecked();
    jest.advanceTimersByTime(1000);
    // Assert
    expect(component.showResend).toBe(true);
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  describe("resendOtpEnablePostTimer", () => {
    it("should invoke resendOtpEnablePostTimer", () => {
      // Arrange
      jest.useFakeTimers();
      // Act
      component.resendOtpEnablePostTimer();
      jest.advanceTimersByTime(1000);
      // Assert
      expect(component.disableResendButton).toBeFalsy();
      jest.useRealTimers();
      jest.clearAllTimers();
    });

    it("should invoke resendOtpEnablePostTimer", () => {
      // Arrange
      jest.useFakeTimers();
      component.resendOtpEnablePostTimer();
      component.counter = -1;
      jest.advanceTimersByTime(1000);

      expect(component.disableResendButton).toBeFalsy();
      expect(component.resendOTPbtn).toBe("");
      jest.useRealTimers();
      jest.clearAllTimers();
    });
  });

  describe("forgotPassword", () => {
    it("should disable resend button for Maximum retry limit exceeded please try again", () => {
      // Arrange
      const resendOTP = "1234";
      component.resendOtpCounter = 1;
      component.maxResendTry = 1;
      snackBar.open = jest.fn(() => {}) as any;
      // Act
      component.forgotPassword(resendOTP);
      // Assert
      expect(component.disableResendButton).toBeFalsy();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it("should send otp", () => {
      // Arrange
      const form = new FormGroup({
        userInput: new UntypedFormControl("1234"),
      });
      component.emailForm = form as any;
      snackBar.open = jest.fn(() => {}) as any;
      signupService.forgotPassword = jest.fn(() =>
        of({
          message: "success",
        })
      ) as any;
      jest.spyOn(component, "initOptForm").mockImplementation();
      jest
        .spyOn(component, "resendOtpEnablePostTimer")
        .mockImplementation(() => {
          return;
        });
      // Act
      component.forgotPassword();
      // Assert
      expect(snackBar.open).toHaveBeenCalled();
      expect(signupService.forgotPassword).toHaveBeenCalled();
      expect(component.showEmailsection).toBe(false);
      expect(component.showOtpPwd).toBe(true);
      expect(component.showSetPassword).toBe(false);
      expect(component.resendOtpLoader).toBeFalsy();
      expect(component.sendOtpLoader).toBeFalsy();
    });

    it("should not send otp for error response", () => {
      // Arrange
      const form = new FormGroup({
        userInput: new UntypedFormControl("1234"),
      });
      component.emailForm = form as any;
      snackBar.open = jest.fn(() => {}) as any;
      signupService.forgotPassword = jest.fn(() =>
        throwError({
          error: "error",
        })
      ) as any;
      mockTelemetryGeneratorService.generateErrorTelemetry = jest.fn();
      // Act
      component.forgotPassword();
      // Assert
      expect(snackBar.open).toHaveBeenCalled();
      expect(signupService.forgotPassword).toHaveBeenCalled();
      expect(component.showEmailsection).toBe(false);
      expect(component.showOtpPwd).toBe(true);
      expect(component.showSetPassword).toBe(false);
      expect(component.resendOtpLoader).toBeFalsy();
      expect(component.sendOtpLoader).toBeFalsy();
      expect(mockTelemetryGeneratorService.generateErrorTelemetry).toHaveBeenCalled();
    });
  });

  it("should reset form", () => {
    // Arrange
    router.navigate = jest.fn(() => Promise.resolve(true));
    // Act
    component.resetForm();
    // Assert
    expect(router.navigate).toHaveBeenCalled();
  });

  describe("handleEnterKey", () => {
    it("should call onSubmitOtp for set password if match the success url", () => {
      // Arrange
      component.otpForm = {
        valid: true,
      } as any;
      component.verifyOtpLoader = false;
      component.key = "email";
      const mockFormBuilder = new FormGroup({
        OTPCHRone: new UntypedFormControl("1234"),
        OTPCHRtwo: new UntypedFormControl("1234"),
        OTPCHRthree: new UntypedFormControl("1234"),
        OTPCHRfour: new UntypedFormControl("1234"),
      });
      component.otpForm = mockFormBuilder as any;
      signupService.setPasswordWithOtp = jest.fn(() =>
        of({
          response: "SUCCESS",
          link: "https://sample.org/",
        })
      );
      inAppBrowser.create = jest.fn(() => ({
        on: jest.fn(() =>
          of({
            url: "https://sphere.aastrika.org/",
          })
        ),
        close: jest.fn(),
      })) as any;
      dialog.open = jest.fn(() => ({
        afterClosed: jest.fn(() =>
          of({
            event: "CONFIRMED",
          })
        ),
      })) as any;
      jest.useFakeTimers();
      events.publish = jest.fn();
      router.navigate = jest.fn(() => Promise.resolve(true));
      // Act
      component.handleEnterKey();
      jest.advanceTimersByTime(1000);
      // Assert
      expect(signupService.setPasswordWithOtp).toHaveBeenCalled();
      expect(component.showEmailsection).toBe(false);
      expect(component.verifyOtpLoader).toBe(false);
      expect(inAppBrowser.create).toHaveBeenCalled();
      expect(dialog.open).toHaveBeenCalled();
      expect(events.publish).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalled();
      jest.useRealTimers();
      jest.clearAllTimers();
    });

    it("should call onSubmitOtp for set password if not match the success url", () => {
      // Arrange
      component.otpForm = {
        valid: true,
      } as any;
      component.verifyOtpLoader = false;
      component.key = "email";
      const mockFormBuilder = new FormGroup({
        OTPCHRone: new UntypedFormControl("1234"),
        OTPCHRtwo: new UntypedFormControl("1234"),
        OTPCHRthree: new UntypedFormControl("1234"),
        OTPCHRfour: new UntypedFormControl("1234"),
      });
      component.otpForm = mockFormBuilder as any;
      signupService.setPasswordWithOtp = jest.fn(() =>
        of({
          response: "SUCCESS",
          link: "https://sample.org/",
        })
      );
      inAppBrowser.create = jest.fn(() => ({
        on: jest.fn(() =>
          of({
            url: "https://sample.org/",
          })
        ),
        close: jest.fn(),
      })) as any;
      dialog.open = jest.fn(() => ({
        afterClosed: jest.fn(() =>
          of({
            event: "CONFIRMED",
          })
        ),
      })) as any;
      // Act
      component.handleEnterKey();
      // Assert
      expect(signupService.setPasswordWithOtp).toHaveBeenCalled();
      expect(component.showEmailsection).toBe(true);
      expect(component.showOtpPwd).toBe(false);
      expect(inAppBrowser.create).toHaveBeenCalled();
      expect(component.showSetPassword).toBeFalsy();
    });

    it("should display message for try again", () => {
      // Arrange
      component.otpForm = {
        valid: true,
      } as any;
      component.verifyOtpLoader = false;
      component.key = "email";
      const mockFormBuilder = new FormGroup({
        OTPCHRone: new UntypedFormControl("1234"),
        OTPCHRtwo: new UntypedFormControl("1234"),
        OTPCHRthree: new UntypedFormControl("1234"),
        OTPCHRfour: new UntypedFormControl("1234"),
      });
      component.otpForm = mockFormBuilder as any;
      signupService.setPasswordWithOtp = jest.fn(() =>
        of({
          response: "FAIL",
          link: "https://sample.org/",
        })
      );
      translate.instant = jest.fn(() => "Something went wrong") as any;
      snackBar.open = jest.fn(() => {}) as any;
      // Act
      component.handleEnterKey();
      // Assert
      expect(signupService.setPasswordWithOtp).toHaveBeenCalled();
      expect(translate.instant).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it("should display error message for catch error", () => {
      // Arrange
      component.otpForm = {
        valid: true,
      } as any;
      component.verifyOtpLoader = false;
      component.key = "phone";
      const mockFormBuilder = new FormGroup({
        OTPCHRone: new UntypedFormControl("1234"),
        OTPCHRtwo: new UntypedFormControl("1234"),
        OTPCHRthree: new UntypedFormControl("1234"),
        OTPCHRfour: new UntypedFormControl("1234"),
      });
      component.otpForm = mockFormBuilder as any;
      signupService.setPasswordWithOtp = jest.fn(() =>
        throwError({
          error: {
            message: {
              message: "error",
            },
          },
        })
      );
      snackBar.open = jest.fn(() => {}) as any;
      // Act
      component.handleEnterKey();
      // Assert
      expect(signupService.setPasswordWithOtp).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalled();
      expect(component.verifyOtpLoader).toBeFalsy();
    });
  });

  it("should navigate to home page", () => {
    // Arrange
    router.navigate = jest.fn(() => Promise.resolve(true));
    // Act
    component.gotoHome();
    // Assert
    expect(router.navigate).toHaveBeenCalledWith(["/public/home"]);
  });

  it("should update password", () => {
    // Arrange
    jest.useFakeTimers();
    jest.spyOn(component, "showSuccessAlert").mockImplementation();
    // Act
    component.updatePassword();
    jest.advanceTimersByTime(3000);
    // Assert
    expect(component.setPasswordLoader).toBe(false);
  });

  describe("onKeyUp", () => {
    it("should call onKeyUp for Backspace", () => {
      // Arrange
      const event = {
        target: {
          value: "1234",
        },
        key: "Backspace",
      } as any;
      const nextInput = {
        nativeElement: {
          focus: jest.fn(),
        },
      } as any;
      // Act
      component.onKeyUp(event, nextInput);
      // Assert
    });

    it("should call onKeyUp", () => {
      // Arrange
      const event = {
        target: {
          value: ["1234"],
        },
      } as any;
      const nextInput = {
        focus: jest.fn(),
      } as any;
      // Act
      component.onKeyUp(event, nextInput);
      // Assert
      expect(nextInput.focus).toHaveBeenCalled();
    });
  });
});
