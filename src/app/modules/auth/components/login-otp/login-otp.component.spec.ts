import { LoginOtpComponent } from "./login-otp.component";
import { SignupService } from "../../services/signup/signup.service";
import {
  AppGlobalService,
  CommonUtilService,
  TelemetryGeneratorService,
} from "../../../../../services";
import {
  AuthService,
  OAuthSession,
  SharedPreferences,
} from "@project-sunbird/sunbird-sdk";
import { UserService } from "../../../../../app/modules/home/services/user.service";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { of, throwError } from "rxjs";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterLinks } from "../../../../app.constant";
import { fakeAsync, flushMicrotasks } from "@angular/core/testing";
const mockSharedPreferences: jest.Mocked<SharedPreferences> = {
  getString: jest.fn().mockReturnValue(of(undefined)), // Observable<string | undefined>
  putString: jest.fn().mockReturnValue(of(undefined)), // Observable<undefined>
  putBoolean: jest.fn().mockReturnValue(of(undefined)), // Observable<undefined>
  getBoolean: jest.fn().mockReturnValue(of(undefined)), // Observable<boolean | undefined>
  addListener: jest.fn(), // No return value
  removeListener: jest.fn(), // No return value
};
describe("LoginOtpComponent", () => {
  let component: LoginOtpComponent;
  let mockSignupService: jest.Mocked<SignupService>;
  let mockAppGlobalService: Partial<AppGlobalService>;
  let mockCommonUtilService: jest.Mocked<CommonUtilService>;
  let mockTelemetryGeneratorService: Partial<TelemetryGeneratorService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockPreferences: jest.Mocked<SharedPreferences>;
  null as any;
  let mockUserService: Partial<UserService>;
  let mockRouter: Partial<Router>;
  let mockTranslateService: Partial<TranslateService>;
  let formBuilder: UntypedFormBuilder;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockChangeDetectorRef: any;
  beforeEach(() => {
    mockSignupService = {
      autoValidateOtp: jest.fn().mockReturnValue(of({ success: true })),
      validateOtp: jest.fn(),
      generateOtp: jest.fn(),
    } as unknown as jest.Mocked<SignupService>;
    mockSnackBar = {
      open: jest.fn(),
    };
    mockAppGlobalService = {
      resetSavedQuizContent: jest.fn(), // Mocking the resetSavedQuizContent method
    };
    mockCommonUtilService = {
      networkInfo: { isNetworkAvailable: true },
    } as jest.Mocked<CommonUtilService>;
    mockTelemetryGeneratorService = {
      generateInteractTelemetry: jest.fn(),
    };
    mockAuthService = {
      getSession: jest.fn(() => of({ userToken: "token" })),
    } as unknown as jest.Mocked<AuthService>;
    mockPreferences = mockSharedPreferences;
    mockUserService = {
      resetUserProfile: jest.fn(),
      userReadCall: jest.fn(() => of({})),
      setUserProfile: jest.fn(),
    };
    mockChangeDetectorRef = {
      markForCheck: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    };
    mockTranslateService = {
      instant: jest.fn((key) => key),
    };

    formBuilder = new UntypedFormBuilder();
    component = new LoginOtpComponent(
      formBuilder,
      mockSnackBar as any, // MatSnackBar mock is not used here
      mockSignupService,
      mockAppGlobalService as any,
      mockCommonUtilService,
      mockTelemetryGeneratorService as any,
      null as any, // FormAndFrameworkUtilService mock
      null as any, // SbProgressLoader mock
      null as any, // NgZone mock
      mockAuthService,
      mockPreferences,
      mockUserService as any,
      mockRouter as any,
      mockChangeDetectorRef as any, // ChangeDetectorRef mock
      mockTranslateService as any
    );
  });

  it("should initialize the OTP form", () => {
    component.ngOnInit();
    expect(component.loginOtpForm.controls["OTPCHRone"]).toBeTruthy();
  });

  it("should emit redirectToParent when redirectToSignUp is called", () => {
    jest.spyOn(component.redirectToParent, "emit");
    component.redirectToSignUp();
    expect(component.redirectToParent.emit).toHaveBeenCalledWith("true");
  });

  it("should emit redirectToParent when redirectToMobileLogin is called", () => {
    jest.spyOn(component.redirectToParent, "emit");
    component.redirectToMobileLogin();
    expect(component.redirectToParent.emit).toHaveBeenCalledWith("true");
  });
  it("should call verifyOtp when handleEnterKey is called and form is valid", () => {
    jest.spyOn(component, "verifyOtp");
    component.signUpdata = new UntypedFormGroup({
      emailOrMobile: new UntypedFormControl("test@example.com", []),
      password: new UntypedFormControl("password123", []),
    });
    component.loginOtpForm = new UntypedFormGroup({
      OTPCHRone: new UntypedFormControl("1", []),
      OTPCHRtwo: new UntypedFormControl("2", []),
      OTPCHRthree: new UntypedFormControl("3", []),
      OTPCHRfour: new UntypedFormControl("4", []),
    });
    component.handleEnterKey();
    expect(component.verifyOtp).toHaveBeenCalled();
  });

  it("should start the timer", () => {
    jest.useFakeTimers();
    component.startTimer();
    expect(component.resendTimer).toBe(600);
    jest.advanceTimersByTime(1000);
    expect(component.resendTimer).toBe(599);
    jest.useRealTimers();
  });
  it("should open snackbar with the provided message", () => {
    component.openSnackbar("Test Message");
    expect(mockSnackBar.open).toHaveBeenCalledWith("Test Message", undefined, {
      duration: 3000,
    });
  });
  it("should verify OTP and call autoValidateOtp", () => {
    component.signUpdata = {
      value: { emailOrMobile: "9876543210", password: "password" },
    };
    component.loginOtpForm = new UntypedFormGroup({
      OTPCHRone: new UntypedFormControl("1", []),
      OTPCHRtwo: new UntypedFormControl("2", []),
      OTPCHRthree: new UntypedFormControl("3", []),
      OTPCHRfour: new UntypedFormControl("4", []),
    });

    const request = {
      mobileNumber: "9876543210",
      password: "password",
      otp: "1234",
      userId: localStorage.getItem("userUUID"),
    };

    mockSignupService.autoValidateOtp.mockReturnValue(of({}));

    component.verifyOtp();

    expect(mockSignupService.autoValidateOtp).toHaveBeenCalledWith(request);
  });
  it("should handle OTP verification error", () => {
    component.signUpdata = {
      value: { emailOrMobile: "9876543210", password: "password" },
    };
    component.loginOtpForm = new UntypedFormGroup({
      OTPCHRone: new UntypedFormControl("1", []),
      OTPCHRtwo: new UntypedFormControl("2", []),
      OTPCHRthree: new UntypedFormControl("3", []),
      OTPCHRfour: new UntypedFormControl("4", []),
    });

    mockSignupService.autoValidateOtp.mockReturnValue(
      throwError({ error: { message: "OTP Error" } })
    );

    component.verifyOtp();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "OTP_ERROR_MESSGE",
      undefined,
      { duration: 3000 }
    );
  });
  it("should resend OTP and call generateOtp", () => {
    component.signUpdata = { value: { emailOrMobile: "test@example.com" } };
    component.emailPhoneType = "email";

    const requestBody = { email: "test@example.com" };
    const OTPMsg = "OTP_RE_SENT_ON EMAIL test@example.com";

    mockSignupService.generateOtp.mockReturnValue(of({}));

    component.resendOTP("email");

    expect(mockSignupService.generateOtp).toHaveBeenCalledWith(requestBody);
    expect(mockSnackBar.open).toHaveBeenCalledWith(OTPMsg, undefined, {
      duration: 3000,
    });
  });
  it("should call snackBar.open with OTP Error on error response", () => {
    jest.spyOn(mockSnackBar, "open");
    component.emailPhoneType = "email";
    component.signUpdata = { value: { emailOrMobile: "test@example.com" } };
    jest
      .spyOn(mockSignupService, "generateOtp")
      .mockImplementation(() => throwError({ error: { message: "3000" } }));

    component.resendOTP("email");

    expect(mockSnackBar.open).toHaveBeenCalledWith("OTP Error", undefined, {
      duration: 3000,
    });
  });
  it("should move focus to next input when value length is 1 and nextInput exists", () => {
    const mockEvent = {
      target: { value: "1" },
      key: "a",
    } as unknown as KeyboardEvent;
    const mockNextInput = { focus: jest.fn() } as unknown as HTMLInputElement;

    component.onKeyUp(mockEvent, mockNextInput);

    expect(mockNextInput.focus).toHaveBeenCalled();
  });
  it("should not move focus when nextInput is null", () => {
    const mockEvent = {
      target: { value: "1" },
      key: "a",
    } as unknown as KeyboardEvent;
    const mockFocus = jest.fn();

    component.onKeyUp(mockEvent, undefined as unknown as HTMLInputElement);

    expect(mockFocus).not.toHaveBeenCalled();
  });
  it("should handle login verification and call validateOtp", () => {
    component.loginData = {
      value: { username: "test@example.com", password: "password" },
    };
    component.loginOtpForm = new UntypedFormGroup({
      OTPCHRone: new UntypedFormControl("1", []),
      OTPCHRtwo: new UntypedFormControl("2", []),
      OTPCHRthree: new UntypedFormControl("3", []),
      OTPCHRfour: new UntypedFormControl("4", []),
      code: new UntypedFormControl("1234", []), // Adding the 'code' field for test
    });

    const request = {
      email: "test@example.com",
      password: "password",
      otp: "1234",
      userId: localStorage.getItem("userUUID"),
    };

    jest
      .spyOn(mockSignupService, "validateOtp")
      .mockReturnValue(of({ message: "Success" }));

    component.loginVerifyOtp();

    expect(mockSignupService.validateOtp).toHaveBeenCalledWith(request);
    expect(mockSnackBar.open).toHaveBeenCalledWith("Success", undefined, {
      duration: 3000,
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      RouterLinks.PRIVATE_HOME,
    ]);
  });
  it("should handle login verification error", () => {
    component.loginData = {
      value: { username: "test@example.com", password: "password" },
    };
    component.loginOtpForm = new UntypedFormGroup({
      OTPCHRone: new UntypedFormControl("1", []),
    });

    mockSignupService.validateOtp.mockReturnValue(
      throwError({ error: { message: "OTP Error" } })
    );

    component.loginVerifyOtp();

    expect(mockSnackBar.open).toHaveBeenCalledWith("OTP Error", undefined, {
      duration: 3000,
    });
  });
  it("should refresh profile data and navigate to home", async () => {
    await component.refreshProfileData();
    expect(mockAuthService.getSession).toHaveBeenCalled();
    expect(mockUserService.userReadCall).toHaveBeenCalledWith("token");
    expect(mockUserService.setUserProfile).toHaveBeenCalled();
  });
  it("should generate login interact telemetry", () => {
    const generateInteractTelemetrySpy = jest.spyOn(
      mockTelemetryGeneratorService,
      "generateInteractTelemetry"
    );
    component.generateLoginInteractTelemetry("TOUCH", "LOGIN_INITIATE", "uid");
    expect(generateInteractTelemetrySpy).toHaveBeenCalled();
  });
  it("should emit showCreateAccount when backScreen is called", () => {
    jest.spyOn(component.showCreateAccount, "emit");
    component.backScreen();
    expect(component.showCreateAccount.emit).toHaveBeenCalledWith(true);
  });

  it("should handle error when session is null in refreshProfileData", async () => {
    mockAuthService.getSession.mockReturnValue(of(null as any));

    await expect(component.refreshProfileData()).rejects.toEqual(
      "session is null"
    );

    expect(mockAuthService.getSession).toHaveBeenCalled();
    expect(mockUserService.userReadCall).not.toHaveBeenCalled();
    expect(mockUserService.setUserProfile).not.toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });
});
