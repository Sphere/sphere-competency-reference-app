import { HttpClient } from "@angular/common/http";
import { ObservationService } from "./observation.service";
import { HTTP } from "@awesome-cordova-plugins/http/ngx";
import { ModalController } from "@ionic/angular";
import {
  AuthService,
  DeviceInfo,
  SharedPreferences,
} from "@project-sunbird/sunbird-sdk";
import { ConfigurationsService } from "../../../../library/ws-widget/utils/src/public-api";
import { UtilityService } from "../../../../services/utility-service";
import { ToastService, ApiUtilsService } from "../../../manage-learn/core";
import { AppFrameworkDetectorService } from "../../core/services/app-framework-detector-service.service";

jest.mock("../../core/services/cordova-http.service", () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    },
  };
});

describe("ObservationService", () => {
  let observationService: ObservationService;
  const mockhttp: Partial<HttpClient> = {};
  const mocktoast: Partial<ToastService> = {};
  const mockmodalController: Partial<ModalController> = {};
  const mockauthService: Partial<AuthService> = {};
  const mockdeviceInfo: Partial<DeviceInfo> = {};
  const mockpreferences: Partial<SharedPreferences> = {};
  const mockionicHttp: Partial<HTTP> = {};
  const mockutilityService: Partial<UtilityService> = {
    getBuildConfigValue: jest.fn(() =>
      Promise.resolve("https://sphere.aastrika.org")
    ),
  };
  const mockconfigSvc: Partial<ConfigurationsService> = {};
  const mockutils: Partial<ApiUtilsService> = {};
  const mockframeWorkDetector: Partial<AppFrameworkDetectorService> = {};

  beforeAll(() => {
    observationService = new ObservationService(
      mockhttp as HttpClient,
      mocktoast as ToastService,
      mockmodalController as ModalController,
      mockauthService as AuthService,
      mockdeviceInfo as DeviceInfo,
      mockpreferences as SharedPreferences,
      mockionicHttp as HTTP,
      mockutilityService as UtilityService,
      mockconfigSvc as ConfigurationsService,
      mockutils as ApiUtilsService,
      mockframeWorkDetector as AppFrameworkDetectorService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should be created", () => {
    expect(observationService).toBeTruthy();
  });

  it("should call getAllMenteeForMentor with correct params", () => {
    const mentorId = "mentor123";
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/mentor/getAllMenteeForMentor",
      payload: { mentorId },
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getAllMenteeForMentor(mentorId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getAllObservationForMentee with correct params", () => {
    const menteeId = "mentee123";
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/mentor/getObservationForMentee",
      payload: { menteeId },
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getAllObservationForMentee(menteeId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call sendOtp with correct params", () => {
    const menteeId = "mentee456";
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/otp/sendOtp",
      payload: { menteeId },
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.sendOtp(menteeId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call resendOtp with correct params", () => {
    const menteeId = "mentee789";
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/otp/retry",
      payload: { menteeId },
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.resendOtp(menteeId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call observationOtpVerification with correct params", () => {
    const param = { menteeId: "mentee1", otp: "123456" };
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/observation/observationOtpVerification",
      payload: param,
    };
    const postSpy = jest.spyOn(observationService, "post");
    observationService.observationOtpVerification(param);
    expect(postSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getobservationDetails with correct params", () => {
    const urlParam = { id: "obs1" };
    const param = { some: "data" };
    const expectedUrl =
      "/apis/public/v8/mobileApp/kong/observationmw/v1/observation/getobservationDetails?id=obs1";
    const expectedRequest = {
      url: expectedUrl,
      payload: param,
    };
    const postSpy = jest.spyOn(observationService, "post");
    observationService.getobservationDetails(urlParam, param);
    expect(postSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should convert object to url params", () => {
    const obj = { a: 1, b: "test" };
    expect(observationService.objectToUrlParams(obj)).toBe("a=1&b=test");
  });

  it("should call addEntityToObservation with correct params", () => {
    const param = { entityId: "e1", type: "school" };
    const expectedUrl =
      "/apis/public/v8/mobileApp/kong/observationmw/v1/observation/addEntityToObservation?entityId=e1&type=school";
    const expectedRequest = {
      url: expectedUrl,
      payload: param,
    };
    const postSpy = jest.spyOn(observationService, "post");
    observationService.addEntityToObservation(param);
    expect(postSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call submitObservation with correct params", () => {
    const param = { obs: "data" };
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/observation/submitObservation",
      payload: param,
    };
    const postSpy = jest.spyOn(observationService, "post");
    observationService.submitObservation(param);
    expect(postSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getObservationSubmissionResult with correct params", () => {
    const param = { submissionId: "sub1" };
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/observation/getObservationSubmissionResult",
      payload: param,
    };
    const postSpy = jest.spyOn(observationService, "post");
    observationService.getObservationSubmissionResult(param);
    expect(postSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call updateSubmissionandCompetency with correct params", () => {
    const param = { submissionId: "sub2" };
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/observation/updateSubmissionandCompetency",
      payload: param,
    };
    const postSpy = jest.spyOn(observationService, "post");
    observationService.updateSubmissionandCompetency(param);
    expect(postSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getMentorsObservation with correct params", () => {
    const param = { mentorId: "mentor2" };
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/mentor/getMentorMenteeDetailsFiltered",
      payload: param,
    };
    const postSpy = jest.spyOn(observationService, "post");
    observationService.getMentorsObservation(param);
    expect(postSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getMentorObservationCount with correct params", () => {
    const param = { mentorId: "mentor3" };
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/mentor/mentorObservationFilteredCount",
      payload: param,
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getMentorObservationCount(param);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getMenteeAttemps with correct params", () => {
    const param = { menteeId: "mentee3" };
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/observation/menteeConsolidatedObservationAttempts",
      payload: param,
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getMenteeAttemps(param);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getObservationListMentor with correct mentorId", () => {
    const mentorId = "mentor4";
    const expectedRequest = {
      url: `/apis/public/v8/mobileApp/kong/observationmw/v1/observation/getMentorAssignedSolutionsList?mentorId=${mentorId}`,
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getObservationListMentor(mentorId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call secheduleObservation with correct params", () => {
    const params = { schedule: "data" };
    const expectedRequest = {
      url: "/apis/public/v8/mobileApp/kong/observationmw/v1/scheduler/v1/observation/schedule",
      payload: params,
    };
    const postSpy = jest.spyOn(observationService, "post");
    observationService.secheduleObservation(params);
    expect(postSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getAllSechedules with correct mentorId", () => {
    const mentorId = "mentor5";
    const expectedRequest = {
      url: `/apis/public/v8/mobileApp/kong/observationmw/v1/scheduler/v1/getScheduledObservationList?mentorId=${mentorId}`,
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getAllSechedules(mentorId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getAllMenteSechedules with correct mentorId", () => {
    const mentorId = "mentor6";
    const expectedRequest = {
      url: `/apis/public/v8/mobileApp/kong/observationmw/v1/scheduler/v1/getScheduledObservationList?menteeId=${mentorId}`,
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getAllMenteSechedules(mentorId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getAllCompletedSechedules with correct menteeId", () => {
    const menteeId = "mentee4";
    const expectedRequest = {
      url: `/apis/public/v8/mobileApp/kong/observationmw/v1/observation/menteeConsolidatedObservationAttemptsV2?menteeId=${menteeId}&groupBy=solution_id`,
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getAllCompletedSechedules(menteeId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getAttempsOfMentee with correct params", () => {
    const mentorId = "mentor7";
    const menteeId = "mentee5";
    const expectedRequest = {
      url: `/apis/public/v8/mobileApp/kong/observationmw/v1/observation/menteeConsolidatedObservationAttemptsV2?mentorId=${mentorId}&menteeId=${menteeId}&groupBy=solution_id`,
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getAttempsOfMentee(mentorId, menteeId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });

  it("should call getAttempsOfObservations with correct params", () => {
    const mentorId = "mentor8";
    const solutionId = "solution1";
    const expectedRequest = {
      url: `/apis/public/v8/mobileApp/kong/observationmw/v1/observation/menteeConsolidatedObservationAttemptsV2?mentorId=${mentorId}&solutionId=${solutionId}&groupBy=mentee_id`,
    };
    const getSpy = jest.spyOn(observationService, "get");
    observationService.getAttempsOfObservations(mentorId, solutionId);
    expect(getSpy).toHaveBeenCalledWith(expectedRequest);
  });
});
