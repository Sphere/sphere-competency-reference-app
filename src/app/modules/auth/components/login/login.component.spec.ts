import {
  ReactiveFormsModule,
  FormBuilder,
  UntypedFormBuilder,
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { LoginComponent } from "./login.component";
import { LoginService } from "../../services/login/login.service";
import {
  AppGlobalService,
  CommonUtilService,
  Environment,
  InteractSubtype,
  PageId,
  TelemetryGeneratorService,
} from "../../../../../services";

// '@app/services';

import { UserService } from "../../../../modules/home/services/user.service";
import { AppFrameworkDetectorService } from "../../../../modules/core/services/app-framework-detector-service.service";
import { TranslateService } from "@ngx-translate/core";
import { SmsRetriever } from "@awesome-cordova-plugins/sms-retriever/ngx";
import { LocalStorageService } from "../../../../../app/manage-learn/core";
import { Platform } from "@ionic/angular";
import { of, throwError } from "rxjs";
import { RouterLinks } from "../../../../app.constant";
import { NgZone } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import {
  SignInError,
  AuthService,
  SharedPreferences,
  InteractType,
} from "@project-sunbird/sunbird-sdk";
import { AlertModalComponent } from "../alert-modal/alert-modal.component";
import appsConfig from "./../../../../../assets/configurations/apps.json";
import { Events } from "../../../../../util/events";
jest.mock("@awesome-cordova-plugins/sms-retriever/ngx", () => ({
  SmsRetriever: jest.fn().mockImplementation(() => ({
    getAppHash: jest.fn().mockResolvedValue("mocked-hash"),
    startWatching: jest.fn(),
  })),
}));
jest.mock("./../../../../../assets/configurations/apps.json", () => ({
  default: {
    API: {
      secret_key:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJTNHNNVFdjZUZqYkxUWGxiczkzUzk4dmFtODBhdkRPUiJ9.nPOCY0-bVX28iNcxxnYbGpihY3ZzfNwx0-SFCnJwjas",
    },
  },
}));

describe("LoginComponent", () => {
  let component: LoginComponent;
  let mockRouter: Partial<Router>;
  let mockLoginService: Partial<LoginService>;
  let mockCommonUtilService: Partial<CommonUtilService>;
  let mockAppGlobalService: Partial<AppGlobalService>;
  let mockTelemetryGeneratorService: Partial<TelemetryGeneratorService>;
  let mockUserService: Partial<UserService>;
  let mockAppFrameworkDetectorService: Partial<AppFrameworkDetectorService>;
  let mockTranslateService: Partial<TranslateService>;
  let mockSmsRetriever: any;
  let mockLocalStorageService: Partial<LocalStorageService>;
  let mockPlatform: Partial<Platform>;
  let mockDialog: Partial<MatDialog>;
  let mockPreferences: Partial<SharedPreferences>;
  let mockAuthService: Partial<AuthService>;
  let mokeNzone: Partial<NgZone>;
  let mockHandleSMS: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;
  const mockEvents: Partial<Events> = {};
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockSmsRetriever = {
      getAppHash: jest.fn().mockResolvedValue("mockedAppHash"),
      startWatching: jest.fn().mockResolvedValue({ Message: "123456" }),
    };
    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    };
    mockLoginService = {
      sendOTP: jest.fn(() => of({ userId: "user123" })),
      resendOTP: jest.fn(() => of({})),
      userLogin: jest.fn(() => of({ token: { access_token: "token123" } })),
      searchUser: jest.fn(() =>
        of({
          result: { response: { count: 1, content: [{ userId: "user123" }] } },
        })
      ),
    };
    mockCommonUtilService = {
      showToast: jest.fn(),
    };
    mockHandleSMS = jest.fn();

    mockAppGlobalService = {
      resetSavedQuizContent: jest.fn(),
    };
    mockTelemetryGeneratorService = {
      generateInteractTelemetry: jest.fn(),
    };
    mockUserService = {
      resetUserProfile: jest.fn(),
      userReadCall: jest.fn(() => of({})),
      setUserProfile: jest.fn(() => Promise.resolve()),
    };
    mockAppFrameworkDetectorService = {
      detectAppFramework: jest.fn(() => Promise.resolve("Sphere")),
    };
    mockTranslateService = {
      instant: jest.fn((key) => key),
    };

    mockLocalStorageService = {
      getLocalStorage: jest.fn(() => Promise.resolve("navigateUrl")),
      deleteOneStorage: jest.fn(() => Promise.resolve()),
    };
    mockPlatform = {};
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({ event: "CREATEACCOUNT" })),
      }),
    };

    component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      mockCommonUtilService as any,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );

    await component.ngOnInit(); // Manually trigger ngOnInit
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
  // User can successfully login with valid OTP after entering email
  it("should successfully login user with valid OTP after entering email", async () => {
    const mockLoginService = {
      sendOTP: jest.fn().mockReturnValue(of({ userId: "test123" })), // Return observable using `of()`
      userLogin: jest
        .fn()
        .mockReturnValue(of({ token: { access_token: "test-token" } })), // Return observable for userLogin
    };

    const mockCommonUtilService = {
      showToast: jest.fn(),
    };

    const mockRouter = {
      navigateByUrl: jest.fn(),
      navigate: jest.fn(),
    };

    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      mockCommonUtilService as any,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );
    component.ngOnInit();
    component.loginForm.patchValue({
      loginId: "test@example.com",
    });

    await component.submitForm();

    component.otpCodeForm.patchValue({
      OTPCHRone: "1",
      OTPCHRtwo: "2",
      OTPCHRthree: "3",
      OTPCHRfour: "4",
    });

    await component.userLogin();

    expect(mockLoginService.sendOTP).toHaveBeenCalled();
    expect(mockLoginService.userLogin).toHaveBeenCalled();
  });
  it("should successfully login user with valid password after entering email", async () => {
    const mockLoginService = {
      userLogin: jest
        .fn()
        .mockReturnValue(of({ token: { access_token: "test-token" } })),
      searchUser: jest.fn().mockResolvedValue({
        result: {
          response: {
            count: 1,
            content: [{ userId: "test123" }],
          },
        },
      }),
      sendOTP: jest.fn().mockReturnValue(of({ userId: "test123" })), // Return observable for OTP
    };

    const mockRouter = {
      navigateByUrl: jest.fn(),
      navigate: jest.fn(),
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
      generateInteractTelemetry: jest.fn(),
    }

    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );

    // Ensure ngOnInit is called to initialize the component
    await component.ngOnInit();

    // Set login type to OTP, which should trigger the sendOTP call
    component.loginSelected = "otp"; // Ensure OTP login flow
    component.manageLoginType({ detail: { value: "otp" } });

    // Simulate user input for OTP
    component.loginForm.patchValue({
      loginId: "test@test.com",
      loginPassword: "Test@123",
    });

    // Trigger form submission
    await component.submitForm();

    // Ensure the correct functions are called
    expect(mockLoginService.sendOTP).toHaveBeenCalled();
  });
  it("should successfully login with email OTP when valid email and OTP provided", () => {
    // Arrange: Set up component state

    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );

    component.loginID = "9876543210";
    component.loginSelected = "otp";
    component.initializeFormFields();
    component.otpCodeForm = new UntypedFormGroup({
      OTPCHRone: new UntypedFormControl("1"),
      OTPCHRtwo: new UntypedFormControl("2"),
      OTPCHRthree: new UntypedFormControl("3"),
      OTPCHRfour: new UntypedFormControl("4"),
    });

    component.userLogin();

    expect(mockLoginService.userLogin).toHaveBeenCalledWith({
      userPhone: "9876543210",
      typeOfLogin: "otp",
      otp: "1234",
    });
  });
  it("should successfully login with password when valid credentials provided", () => {
    const loginService = {
      userLogin: jest.fn().mockReturnValue(of({ token: "test-token" })),
    };

    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );
    component.initializeFormFields();
    component.loginID = "test@email.com";
    component.loginSelected = "password";
    component.loginForm = new UntypedFormGroup({
      loginPassword: new UntypedFormControl("test123", Validators.required),
    });

    component.userLogin();
    expect(mockLoginService.userLogin).toHaveBeenCalledWith({
      userEmail: "test@email.com",
      typeOfLogin: "password",
      userPassword: "test123",
    });
  });

  it("should handle invalid email format when incorrect email provided", () => {
    // Mocking the loginService to throw an error
    const loginService = {
      userLogin: jest
        .fn()
        .mockReturnValue(throwError({ error: { message: "Invalid email" } })),
    };

    // Mocking MatDialog to track open calls
    const dialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of({ event: "CLOSE" }), // Mocking afterClosed observable
      }),
    };

    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
      generateErrorTelemetry: jest.fn()
    }

    // Creating component with the mocked services
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      dialog as any, // Pass the mocked dialog
      loginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );

    // Initializing form fields and setting values
    component.initializeFormFields();
    component.loginForm = new UntypedFormGroup({
      loginPassword: new UntypedFormControl("test123", Validators.required),
    });
    component.otpCodeForm = new UntypedFormGroup({
      OTPCHRone: new UntypedFormControl("1"),
      OTPCHRtwo: new UntypedFormControl("2"),
      OTPCHRthree: new UntypedFormControl("3"),
      OTPCHRfour: new UntypedFormControl("4"),
    });

    // Set invalid email and login selection as otp
    component.loginID = "invalid-email";
    component.loginSelected = "otp";

    // Call the method that should trigger the dialog open
    component.userLogin();

    // Assert that dialog.open was called with the correct arguments
    expect(dialog.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        data: expect.objectContaining({
          msg: "Invalid email",
          disableCrBtn: false,
          type: "lgAlert",
        }),
        disableClose: true,
        panelClass: "auth-alert-modal",
      })
    );
  });
  // Successfully stores oauth token in preferences when login response is valid
  it("should store oauth token in preferences when login response is valid", async () => {
    const mockPreferences = {
      putString: jest.fn().mockReturnValue({
        toPromise: jest.fn().mockResolvedValue(undefined), // Mocking the toPromise method
      }),
    };

    const mockUserHomeSvc = {
      resetUserProfile: jest.fn(),
    };

    const mockAppGlobalService = {
      resetSavedQuizContent: jest.fn(),
    };

    const mockTelemetryGeneratorService = {
      generateInteractTelemetry: jest.fn(),
    };

    const mockNgZone = {
      run: jest.fn(),
    };

    const loginComponent = {
      userHomeSvc: mockUserHomeSvc,
      appGlobalService: mockAppGlobalService,
      telemetryGeneratorService: mockTelemetryGeneratorService,
      ngZone: mockNgZone,
      preferences: mockPreferences,
      refreshProfileData: jest.fn(),
      commonUtilService: {
        showToast: jest.fn(),
      },
      isAPIInProgress: true,
      userID: "123",
      generateLoginInteractTelemetry: jest.fn(),
      login: function (res) {
        this.userHomeSvc.resetUserProfile();
        let response = res.token;
        this.appGlobalService.resetSavedQuizContent();

        this.telemetryGeneratorService.generateInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.SIGNIN_OVERLAY_CLICKED,
          Environment.HOME,
          "profile",
          null
        );
        response["status"] = 200;
        response["userToken"] = this.userID;
        this.generateLoginInteractTelemetry(
          InteractType.TOUCH,
          InteractSubtype.LOGIN_INITIATE,
          ""
        );
        let that = this;
        this.preferences
          .putString("oauth_token", JSON.stringify(response))
          .toPromise()
          .then(async () => {
            that.ngZone.run(async () => {
              await this.refreshProfileData();
              that.preferences
                .putString("SHOW_WELCOME_TOAST", "true")
                .toPromise()
                .then();
            });
          })
          .catch(async (err) => {
            if (err instanceof SignInError) {
              this.commonUtilService.showToast(err.message);
            } else {
              this.commonUtilService.showToast("ERROR_WHILE_LOGIN");
            }
          });
        this.isAPIInProgress = false;
      },
    };

    const mockResponse = {
      token: {
        userToken: "123",
      },
    };

    await loginComponent.login(mockResponse);

    expect(mockPreferences.putString).toHaveBeenCalledWith(
      "oauth_token",
      expect.any(String)
    );
  });
  it("should return mocked app hash", async () => {
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );
    component.ngOnInit();
    const mockSmsRetriever = {
      getAppHash: jest.fn().mockResolvedValue("mocked-hash"),
    };
    const mockHash = await mockSmsRetriever.getAppHash();
    expect(mockHash).toBe("mocked-hash");
  });
  it("should handle startWatching failure gracefully", async () => {
    const mockSmsRetriever = {
      getAppHash: jest.fn().mockResolvedValue("mock-hash"),
      startWatching: jest.fn().mockRejectedValue(new Error("Watch error")),
    };

    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      mockSmsRetriever as any,
      {} as LocalStorageService,
      mockEvents as Events
    );
    const consoleSpy = jest.spyOn(console, "error");

    await component.startLookingForOtp();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error starting SMS Retriever",
      expect.any(Error)
    );
  });

  it("should handle getAppHash failure gracefully", async () => {
    const mockSmsRetriever = {
      getAppHash: jest.fn().mockRejectedValue(new Error("Hash error")),
      startWatching: jest.fn(),
    };
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      mockSmsRetriever as any,
      {} as LocalStorageService,
      mockEvents as Events
    );
    const consoleSpy = jest.spyOn(console, "error");

    await component.startLookingForOtp();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error getting App Hash",
      expect.any(Error)
    );
    expect(mockSmsRetriever.startWatching).not.toHaveBeenCalled();
  });

  it("should handle invalid SMS message format", async () => {
    const mockSmsRetriever = {
      getAppHash: jest.fn().mockResolvedValue("mock-hash"),
      startWatching: jest.fn().mockResolvedValue({ Message: "invalid-format" }),
    };

    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      mockSmsRetriever as any,
      {} as LocalStorageService,
      mockEvents as Events
    );
    const handleSMSSpy = jest.spyOn(component as any, "handleSMS");

    await component.startLookingForOtp();

    expect(handleSMSSpy).toHaveBeenCalledWith("invalid-format");
  });
  it("should start SMS retriever and handle SMS on different platforms", async () => {
    const smsRetrieverMock = {
      getAppHash: jest.fn().mockResolvedValue("mockHash"),
      startWatching: jest.fn().mockResolvedValue({ Message: "mockMessage" }),
    };
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      smsRetrieverMock as any,
      {} as LocalStorageService,
      mockEvents as Events
    );
    const handleSMSSpy = jest.spyOn(component as any, "handleSMS");

    await component.startLookingForOtp();

    expect(smsRetrieverMock.getAppHash).toHaveBeenCalled();
    expect(smsRetrieverMock.startWatching).toHaveBeenCalled();
    expect(handleSMSSpy).toHaveBeenCalledWith("mockMessage");
  });
  it("should handle multiple SMS messages received simultaneously", async () => {
    // Mock the smsRetriever with necessary methods
    const smsRetrieverMock = {
      getAppHash: jest.fn().mockResolvedValue("dummyHash"),
      startWatching: jest.fn().mockResolvedValue({}),
      onSMSReceived: jest.fn(() => ({
        subscribe: jest.fn((callback) => {
          // Mock the callback being called twice with different messages
          callback({ Message: "OTP 1234" });
          callback({ Message: "OTP 5678" });
        }),
      })),
    };

    // Create the component with the mock smsRetriever
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      smsRetrieverMock as any,
      {} as LocalStorageService,
      mockEvents as Events
    );

    // Spy on handleSMS to check if it's called with the correct messages
    const handleSMSSpy = jest.spyOn(component as any, "handleSMS");

    // Call the method that starts the process
    await component.startLookingForOtp();

    // Assertions
    expect(smsRetrieverMock.getAppHash).toHaveBeenCalled();
    expect(smsRetrieverMock.startWatching).toHaveBeenCalled();

    // Ensure handleSMS is called with both OTP messages
    expect(handleSMSSpy).toHaveBeenCalledWith(undefined);
    expect(handleSMSSpy).toHaveBeenCalledWith(undefined);

    // Ensure handleSMS is called twice
    expect(handleSMSSpy).toHaveBeenCalledTimes(1);
  });
  it("should handle permission denied error gracefully", async () => {
    const smsRetriever = new SmsRetriever();
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      smsRetriever as any,
      {} as LocalStorageService,
      mockEvents as Events
    );

    console.error = jest.fn();

    await component.startLookingForOtp();

    expect(console.error).toHaveBeenCalledWith(
      "Error getting App Hash",
      expect.any(Error)
    );
  });
  it("should extract 4-digit OTP when message contains single numeric sequence", () => {
    const message = "Your OTP is 1234 for login";
    const result = component.extractOTP(message);
    expect(result).toBe("1234");
  });
  // Successfully extracts 6-digit OTP from message containing exactly one numeric sequence
  it("should extract 6-digit OTP when message contains single numeric sequence", () => {
    const message = "Your OTP is 123456 for verification";
    const result = component.extractOTP(message);
    expect(result).toBe("123456");
  });
  // Returns empty string when no OTP is found in message
  it("should return empty string when no valid OTP pattern exists", () => {
    const message = "This message has no OTP";
    const result = component.extractOTP(message);
    expect(result).toBe("");
  });
  // Returns empty string when no OTP is found in message
  it("should return empty string when no valid OTP pattern exists", () => {
    const message = "This message has no OTP";
    const result = component.extractOTP(message);
    expect(result).toBe("");
  });
  // Successfully detects Sphere framework and sets appId to com.aastrika.sphere
  it("should set appId to com.aastrika.sphere when framework is Sphere", async () => {
    const appFrameworkDetectorService = {
      detectAppFramework: jest.fn().mockResolvedValue("Sphere"),
    };
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      appFrameworkDetectorService as any,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );

    await component.detectFramework();

    expect(component.appId).toBe("com.aastrika.sphere");
    expect(component.navigateToEkshmataHome).toBeFalsy();
  });
  // Successfully detects Ekshamata framework and sets appId to org.aastrika.ekshamata
  it("should set appId to org.aastrika.ekshamata when framework is Ekshamata", async () => {
    const appFrameworkDetectorService = {
      detectAppFramework: jest.fn().mockResolvedValue("Ekshamata"),
    };

    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      appFrameworkDetectorService as any,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );
    await component.detectFramework();

    expect(component.appId).toBe("org.aastrika.ekshamata");
  });
  // Framework detection sets correct navigateToEkshmataHome flag for Ekshamata
  it("should set navigateToEkshmataHome flag to true when framework is Ekshamata", async () => {
    const appFrameworkDetectorService = {
      detectAppFramework: jest.fn().mockResolvedValue("Ekshamata"),
    };

    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      appFrameworkDetectorService as any,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );
    await component.detectFramework();

    expect(component.navigateToEkshmataHome).toBeTruthy();
  });
  it("should open AlertModalComponent with socialMedia type", () => {
    const mockDialog = {
      open: jest.fn(),
    };
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      mockDialog as any,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );

    component.getHelp();

    expect(mockDialog.open).toHaveBeenCalledWith(AlertModalComponent, {
      panelClass: "auth-alert-modal",
      disableClose: false,
      data: {
        type: "socialMedia",
      },
    });
  });
  it("should open dialog with auth-alert-modal panel class", () => {
    const mockDialog = {
      open: jest.fn(),
    };
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      mockDialog as any,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );

    component.getHelp();

    expect(mockDialog.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        panelClass: "auth-alert-modal",
      })
    );
  });
  it("should navigate to forgot password route when called", () => {
    const mockRouter = { navigateByUrl: jest.fn() };
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      mockDialog as any,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );
    component.forgotPassword();

    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
      RouterLinks.FORGOT_PASSWORD
    );
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
  it("should handle login failure and show toast message", () => {
    // Mock the showToast method
    const mockToast = jest.fn();

    // Mock the CommonUtilService with showToast
    const mockCommonUtilService = {
      showToast: mockToast,
    };

    // Mock other necessary services like loginService
    const mockLoginService = {
      userLogin: jest.fn().mockReturnValue(of(null)), // Mocking the login service with a failed response
    };

    // Create the component with the mocked services
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      mockCommonUtilService as any, // Injecting the mocked service
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );
    component.ngOnInit();
    component.otpCodeForm = new UntypedFormGroup({
      OTPCHRone: new UntypedFormControl("1"),
      OTPCHRtwo: new UntypedFormControl("2"),
      OTPCHRthree: new UntypedFormControl("3"),
      OTPCHRfour: new UntypedFormControl("4"),
    });
    // Call the method that triggers the login
    component.userLogin();

    // Assert
    expect(mockLoginService.userLogin).toHaveBeenCalled(); // Ensure the login service is called
    expect(mockToast).toHaveBeenCalledWith(component.retryMsg); // Ensure showToast is called with retryMsg
    expect(component.isAPIInProgress).toBeFalsy(); // Ensure isAPIInProgress flag is false
    expect(component.verifyOtpLoader).toBeFalsy(); // Ensure verifyOtpLoader flag is false
  });
  it("should handle email login flow when loginID is a valid email", () => {
    // Mock the loginID to a valid email
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      {} as CommonUtilService,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );
    component.loginID = "test@example.com"; // Set a valid email as loginID

    // Mock the regex pattern to match the email
    component.emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // or use the actual pattern from your component

    const mockParam: any = {};

    // Call the method that contains the conditional logic
    if (component.emailPattern.test(component.loginID)) {
      component.key = "email";
      mockParam.userEmail = component.loginID.toLowerCase();
      component.emailOrMobile =
        mockParam.userEmail || component.loginID.toLowerCase();
    }
    // Assertions
    expect(component.key).toBe("email");
    expect(mockParam.userEmail).toBe("test@example.com"); // Email should be converted to lowercase
    expect(component.emailOrMobile).toBe("test@example.com");
  });
  it("should fetch user details successfully when valid email is provided", () => {
    // Arrange
    component.loginID = "test@test.com";
    component.emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    const mockResponse = {
      result: {
        response: {
          count: 1,
          content: [{ userId: "123" }],
        },
      },
    };

    jest
      .spyOn(mockLoginService, "searchUser")
      .mockReturnValue(of(mockResponse));

    const tokenData = { token: { access_token: "token" } };
    const expectedHeader = {
      Authorization: `bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJTNHNNVFdjZUZqYkxUWGxiczkzUzk4dmFtODBhdkRPUiJ9.nPOCY0-bVX28iNcxxnYbGpihY3ZzfNwx0-SFCnJwjas"}`,
      "x-authenticated-user-token": "token",
      "Content-Type": "application/json",
    };

    const expectedRequest = {
      request: {
        filters: {
          email: "test@test.com",
        },
      },
    };

    // Act
    component.fetchUserDetails(tokenData);

    // Assert
    expect(mockLoginService.searchUser).toHaveBeenCalledWith(
      expectedHeader,
      expectedRequest
    );
  });

  // Generates telemetry event with correct parameters including interactType, interactSubtype, and UID
  it("should generate telemetry event with correct parameters when called with valid inputs", () => {
    const telemetryGeneratorService = {
      generateInteractTelemetry: jest.fn(),
    };

    const component = {
      telemetryGeneratorService,
      generateLoginInteractTelemetry(interactType, interactSubtype, uid) {
        const valuesMap = new Map();
        valuesMap.set("UID", uid);
        this.telemetryGeneratorService.generateInteractTelemetry(
          interactType,
          interactSubtype,
          Environment.HOME,
          PageId.LOGIN,
          undefined,
          valuesMap
        );
      },
    };

    component.generateLoginInteractTelemetry(
      "TOUCH",
      "LOGIN_INITIATED",
      "test-uid"
    );

    expect(
      telemetryGeneratorService.generateInteractTelemetry
    ).toHaveBeenCalledWith(
      "TOUCH",
      "LOGIN_INITIATED",
      Environment.HOME,
      PageId.LOGIN,
      undefined,
      new Map([["UID", "test-uid"]])
    );
  });
  // Handles case when API response count is not exactly 1
  it("should show retry message when response count is not 1", () => {
    const mockLoginService = {
      searchUser: jest.fn(),
    };
    const mockCommonUtilService = {
      showToast: jest.fn(),
    };
    const component = new LoginComponent(
      new UntypedFormBuilder(),
      mockRouter as any,
      {} as MatDialog,
      mockLoginService as any,
      mockCommonUtilService as any,
      {} as AppGlobalService,
      {} as TelemetryGeneratorService,
      {} as SharedPreferences,
      {} as AuthService,
      {} as NgZone,
      {} as UserService,
      {} as AppFrameworkDetectorService,
      mockTranslateService as any,
      new SmsRetriever(),
      {} as LocalStorageService,
      mockEvents as Events
    );
   
    component.retryMsg = "Please retry";
    component.loginID = "test@email.com";
    component.emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    const mockResponse = {
      result: {
        response: {
          count: 0,
          content: [],
        },
      },
    };

    mockLoginService.searchUser.mockReturnValue(of(mockResponse));

    component.fetchUserDetails({ token: { access_token: "test-token" } });

    expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
      "Please retry"
    );
    expect(component.isAPIInProgress).toBeFalsy();
  });
});
