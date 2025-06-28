import { HttpClient } from "@angular/common/http";
import { SignupService } from "./signup.service";
import { ConfigurationsService } from "@ws-widget/utils/src/public-api";
import { UtilityService } from "../../../core/services/utility-service";
import { AuthService } from "sunbird-sdk";
import { of, throwError } from "rxjs";

describe("SignupService", () => {
  let component: SignupService;

  const http: Partial<HttpClient> = {};
  const configSvc: Partial<ConfigurationsService> = {};
  const utilityService: Partial<UtilityService> = {
    getBuildConfigValue: jest.fn(() => Promise.resolve("org.sphere.app")),
  };
  const authService: Partial<AuthService> = {};

  beforeAll(() => {
    component = new SignupService(
      http as HttpClient,
      configSvc as ConfigurationsService,
      utilityService as UtilityService,
      authService as AuthService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a instance of component", () => {
    expect(component).toBeTruthy();
  });

  it("should sign up", () => {
    // Arrange
    const mockData = { email: "test@test.com", password: "test123" };
    const mockResponse = { success: true };
    jest.spyOn(component, "post").mockImplementation(() => of(mockResponse));
    // Act
    const result = component.signup(mockData);
    // Assert
    expect(component.post).toHaveBeenCalledWith({
      url: "apis/public/v8/emailMobile/signup",
      data: mockData,
    });
    result.subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it("should be auto sign up", () => {
    // arrange
    const data = {
      firstName: "test",
      lastName: "test",
      email: "test",
      password: "test",
      role: "test",
    };
    jest.spyOn(component, "post").mockImplementation(() => of({}));
    // act
    component.autoSignup(data);
    // assert
    expect(component.autoSignup).toBeTruthy();
  });

  it("should be register with mobile", () => {
    // arrange
    const data = {
      mobile: "999999999",
    };
    const mockResponse = { success: true };
    jest.spyOn(component, "post").mockImplementation(() => of(mockResponse));
    // act
    const result = component.registerWithMobile(data);
    // assert
    expect(component.post).toHaveBeenCalledWith({
      url: "apis/public/v8/emailMobile/registerUserWithMobile",
      data: data,
    });
    result.subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it("should be verifu user mobile", () => {
    // arrange
    const data = {
      mobile: "98908998",
    };
    const mockResponse = { success: true };
    jest.spyOn(component, "post").mockImplementation(() => of(mockResponse));
    // act
    const result = component.verifyUserMobile(data);
    // assert
    expect(component.post).toHaveBeenCalledWith({
      url: "apis/public/v8/forgot-password/verifyOtp",
      data: data,
    });
    result.subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it("should be generated OTP", () => {
    // arrange
    const data = {
      OTP: "1234",
    };
    const mockResponse = { success: true };
    jest.spyOn(component, "post").mockImplementation(() => of(mockResponse));
    // act
    const result = component.generateOtp(data);
    // assert
    expect(component.post).toHaveBeenCalledWith({
      url: "apis/public/v8/emailMobile/generateOtp",
      data: data,
    });
    result.subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it("should be verify OTP", () => {
    // arrange
    const data = {
      OTP: "1234",
    };
    const mockResponse = { success: true };
    jest.spyOn(component, "post").mockImplementation(() => of(mockResponse));
    // act
    const result = component.validateOtp(data);
    // assert
    expect(component.post).toHaveBeenCalledWith({
      url: "apis/public/v8/emailMobile/validateOtp",
      data: data,
    });
    result.subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it("should be auto validate OTP", () => {
    // arrange
    const data = {
      OTP: "1234",
    };
    const mockResponse = { success: true };
    jest.spyOn(component, "post").mockImplementation(() => of(mockResponse));
    // act
    const result = component.autoValidateOtp(data);
    // assert
    expect(component.post).toHaveBeenCalledWith({
      url: "apis/public/v8/appSignUpWithAutoLogin/validateOtpWithLogin",
      data: data,
    });
    result.subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it("should invoked forgot password", () => {
    // arrange
    const data = {
      password: "1234",
    };
    http.post = jest.fn(() => of({ password: "1234" })) as any;
    // act
    component.forgotPassword(data);
    // assert
    expect(http.post).toHaveBeenCalled();
  });

  it("should invoked plumb5SendEvent", () => {
    // arrange
    const data = {
      password: "1234",
    };
    http.post = jest.fn(() => of({ password: "1234" })) as any;
    // act
    const result = component.plumb5SendEvent(data);
    // assert
    expect(http.post).toHaveBeenCalled();
    result.subscribe((response) => {
      expect(response).toEqual({ password: "1234" });
    });
  });

  it("should be set Password With Otp", () => {
    // arrange
    const data = {
      password: "1234",
    };
    http.post = jest.fn(() => of({ password: "1234" })) as any;
    // act
    component.setPasswordWithOtp(data);
    // assert
    expect(http.post).toHaveBeenCalled();
  });

  describe("fetchStartUpDetails", () => {
    it("should fetch start up details", async() => {
      // arrange
      configSvc.instanceConfig = {Iconfig: {}} as any;
      http.get = jest.fn(() => of({
        result: {
            response: {
                roles: ['PUBLIC', 'PUBLIC_asha'],
                firstName: 'sample_fname',
                lastName: 'sample_lname',
                userId: 'sample-uid',
                rootOrgId: 'sample-rootOrgId',
                channel: 'sample-channel',
                userName: 'sample-username',
                thumbnail: 'sample-thumbnail',
                profiledetails: {
                    personalDetails: {
                        countryCode: 'test',
                        officialEmail: 'test'
                    },
                    profileDetails: {
                        officialEmail: 'test'
                    }
                }
            }
        }
      })) as any;
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('sample-telemetrySessionId');
      jest.spyOn(window.localStorage.__proto__, 'removeItem').mockImplementation();
      // act
      await component.fetchStartUpDetails();
      // assert
      expect(configSvc.instanceConfig).toBeTruthy();
      expect(http.get).toHaveBeenCalled();
      expect(window.localStorage.removeItem).toHaveBeenCalled();
      expect(window.localStorage.getItem).toHaveBeenCalled();
    });

    it("should not fetch start up details for error part", async() => {
        // arrange
        configSvc.instanceConfig = {Iconfig: {}} as any;
        http.get = jest.fn(() => throwError({
          error: {
            message: 'sample_error'
          }
        })) as any;
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('sample-telemetrySessionId');
        jest.spyOn(window.localStorage.__proto__, 'removeItem').mockImplementation();
        // act
        await component.fetchStartUpDetails();
        // assert
        expect(http.get).toHaveBeenCalled();
      });
  });

  describe('keyClockLogin', () => {
    it('should invoke keyClockLogin', () => {
      // arrange
      jest.spyOn(window.sessionStorage.__proto__, 'setItem').mockImplementation();
      // act
      component.keyClockLogin();
      // assert
      expect(window.sessionStorage.setItem).toHaveBeenCalled();
    });
  });
});
