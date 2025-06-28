import { NavigationExtras, Router } from "@angular/router";
import { OtpVerifyMenteeComponent } from "./otp-verify-mentee.component";
import { of, throwError } from "rxjs";
import { ObservationService } from "../../services/observation.service";
import { RouterLinks } from "../../../../app.constant";
import { FormBuilder, FormGroup, UntypedFormBuilder, Validators } from "@angular/forms";
import { fakeAsync, tick } from "@angular/core/testing";
import { TelemetryGeneratorService } from "../../../../../services";

jest.mock('../../../core/services/cordova-http.service', () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    }
  };
});

describe("OtpVerifyMenteeComponent", () => {
  let otpVerifyMenteeComponent: OtpVerifyMenteeComponent;

  const mockRouter: Partial<Router> = {
    getCurrentNavigation: jest.fn(),
    navigate: jest.fn(),
  };
  const mockObservationService: Partial<ObservationService> = {
    sendOtp: jest.fn(() => of({ data: [] })),
    resendOtp: jest.fn(() => of({ data: [] })),
    observationOtpVerification: jest.fn(() => of({ observation_id: "12345" })),
    addEntityToObservation: jest.fn(() => of({})),
  };
  let mockFormBuilder: Partial<FormBuilder> = {
    group: jest.fn(),
    control: jest.fn(),
    array: jest.fn(),
  } as any;
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateImpressionTelemetry: jest.fn(),
    generateInteractTelemetry: jest.fn(),
  };

  function initCompo() {
    otpVerifyMenteeComponent = new OtpVerifyMenteeComponent(
      (mockFormBuilder = {
        group: jest.fn(() => ({
          controls: {
            otp: {
              value: "",
              setValidators: jest.fn(),
            },
          },
        })) as any,
      } as FormBuilder),
      mockRouter as Router,
      mockObservationService as ObservationService,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );
  }

  beforeAll(() => {
    initCompo();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create the component", () => {
    expect(otpVerifyMenteeComponent).toBeTruthy();
  });

  it("should initialize the form", () => {
    expect(otpVerifyMenteeComponent.verifyOtpForm).toBeDefined();
    expect(otpVerifyMenteeComponent.verifyOtpForm.controls.otp).toBeDefined();
  });

  it("should navigate to mentees list if observationData is not present", () => {
    (mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce(null);
    initCompo();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      `${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`,
    ]);
  });

  it("should call sendOtp if observationData is present", () => {
    (mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({
      extras: {
        state: {
          observationData: { mentee_id: "123" },
        },
      },
    });
    mockObservationService.sendOtp = jest.fn(() => of({ data: [] }));
    initCompo();
    expect(mockObservationService.sendOtp).toHaveBeenCalledWith("123");
  });

  it("should start timer on sendOtp", (() => {
    otpVerifyMenteeComponent.observationData = { mentee_id: "123" };
    mockObservationService.sendOtp = jest.fn(() => of({ data: [] }));
    otpVerifyMenteeComponent.resendTimer = 1;
    jest.useFakeTimers();
    otpVerifyMenteeComponent.sendOtp();
    jest.advanceTimersByTime(1000);
    expect(otpVerifyMenteeComponent.resendTimer).toBeFalsy();
    expect(otpVerifyMenteeComponent.sendOtpInProgress).toBe(false);
    expect(mockObservationService.sendOtp).toHaveBeenCalled();
    jest.useRealTimers();
  }));

  it("should start timer on resendOtp", (() => {
    otpVerifyMenteeComponent.observationData = { mentee_id: "123" };
    mockObservationService.resendOtp = jest.fn(() => of({ data: [] }));
    jest.useFakeTimers();
    otpVerifyMenteeComponent.resendOtp();
    jest.advanceTimersByTime(1000);
    expect(otpVerifyMenteeComponent.resendTimer).toBeTruthy();
    expect(mockObservationService.resendOtp).toHaveBeenCalled();
    jest.useRealTimers();
  }));

  it("should verify OTP and add entity to observation", () => {
    otpVerifyMenteeComponent.observationData = {
      mentor_id: "mentor123",
      mentee_id: "mentee123",
      solution_id: "solution123",
    };
    mockObservationService.observationOtpVerification = jest.fn(() => of({observation_id: "12345"}));
    otpVerifyMenteeComponent.verifyOtp("123456");
    expect(
      mockObservationService.observationOtpVerification
    ).toHaveBeenCalledWith({
      mentor_id: "mentor123",
      mentee_id: "mentee123",
      otp: "123456",
      solution_id: "solution123",
    });
    expect(mockObservationService.addEntityToObservation).toHaveBeenCalledWith({
      observation_id: "12345",
      mentee_id: "mentee123",
    });
  });

  it("should handle OTP verification error", () => {
    (
      mockObservationService.observationOtpVerification as jest.Mock
    ).mockReturnValueOnce(throwError("error"));
    otpVerifyMenteeComponent.observationData = {
      mentor_id: "mentor123",
      mentee_id: "mentee123",
      solution_id: "solution123",
    };
    otpVerifyMenteeComponent.verifyOtp("123456");
    expect(otpVerifyMenteeComponent.sendOtpInProgress).toBe(false);
  });

  it("should navigate to observation assessment on startObservation", () => {
    otpVerifyMenteeComponent.observationData = { observation_id: "12345" };
    otpVerifyMenteeComponent.startObservation();
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [`${RouterLinks.MENTOR}/${RouterLinks.OBSERVATION_ASSESSMENT}`],
      {
        state: {
          observationData: { observation_id: "12345" },
          canSubmit: true,
        },
      }
    );
  });

  it('should invoked ngOnInit', () => {
    otpVerifyMenteeComponent.observationData = undefined;
    otpVerifyMenteeComponent.ngOnInit();
    expect(otpVerifyMenteeComponent.verifyOtpForm).toBeDefined();
  });

  it('should call submitOtp', () => {
    // Arrange
    const formBuilder = new UntypedFormBuilder();
    otpVerifyMenteeComponent.verifyOtpForm = formBuilder.group({
      otp: ['123456', Validators.required],
    });  
    otpVerifyMenteeComponent.observationData = {
      mentor_id: "mentor123",
      mentee_id: "mentee123",
      solution_id: "solution123",
    };
    mockObservationService.observationOtpVerification = jest.fn(() => of({observation_id: "12345"}));
    mockObservationService.addEntityToObservation = jest.fn(() => of({}));
    // Act
    otpVerifyMenteeComponent.submitOtp();
    // Assert
    expect(otpVerifyMenteeComponent.sendOtpInProgress).toBe(false);
    expect(otpVerifyMenteeComponent.isOtpCodeVerifed).toBe(true);
    expect(otpVerifyMenteeComponent.verifyOtpForm.valid).toBe(true);  
    expect(otpVerifyMenteeComponent.verifyOtpForm.get('otp')?.valid).toBe(true);
    expect(mockObservationService.observationOtpVerification).toHaveBeenCalled();
    expect(mockObservationService.addEntityToObservation).toHaveBeenCalled();
  })
});
