import { ConfigurationsService } from "../../../../../library/ws-widget/utils/src/public-api";
import { ObservationService } from "../../../observation/services/observation.service";
import { LearnerObservationCompletedComponent } from "./learner-observation-completed.component";

jest.mock("../../../core/services/cordova-http.service", () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
      setHeaders = jest.fn();
    },
  };
});

describe("LearnerObservationCompletedComponent", () => {
  let component: LearnerObservationCompletedComponent;
  const mockuserObserSvc: Partial<ObservationService> = {};
  const mockconfigSvc: Partial<ConfigurationsService> = {};

  beforeAll(() => {
    component = new LearnerObservationCompletedComponent(
      mockuserObserSvc as ObservationService,
      mockconfigSvc as ConfigurationsService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call getCompletedSechdules on ngOnInit", () => {
    const spy = jest
      .spyOn(component, "getCompletedSechdules")
      .mockImplementation();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  describe("getCompletedSechdules", () => {
    it("should fetch completed schedules and update completedScheduleList", async () => {
      const mockUserId = "user123";
      const mockResponse = {
        result: {
          sol1: {
            solution_name: "Solution 1",
            attempts: [
              {
                mentoring_relationship_id: "rel1",
                mentor_id: "mentor1",
                mentee_id: "mentee1",
                createdAt: "2024-06-01T10:00:00Z",
                attempt_serial_number: 1,
                result_percentage: 80,
                user_submission: {},
                acquired_score: 8,
                observationAttemptsMetaData: { solution_name: "Solution 1" },
                solution_id: "sol1",
                submission_id: "sub1",
                total_score: 10,
                observation_id: "obs1",
              },
            ],
            mentorMenteeInfo: { mentor_name: "Mentor Name" },
          },
        },
      };

      // Mock configSvc.userProfile.userId
      (component as any).configSvc.userProfile = { userId: mockUserId };

      // Mock userObserSvc.getAllCompletedSechedules
      (component as any).userObserSvc.getAllCompletedSechedules = jest
        .fn()
        .mockReturnValue({
          subscribe: (cb: any) => cb(mockResponse),
        });

      await component.getCompletedSechdules();

      expect(component.completedScheduleList.length).toBe(1);
      expect(component.completedScheduleList[0].solutionId).toBe("sol1");
      expect(component.isAPIInprogress).toBe(false);
    });

    it("should handle empty result", async () => {
      const mockUserId = "user123";
      const mockResponse = { result: {} };
      (component as any).configSvc.userProfile = { userId: mockUserId };
      (component as any).userObserSvc.getAllCompletedSechedules = jest
        .fn()
        .mockReturnValue({
          subscribe: (cb: any) => cb(mockResponse),
        });

      await component.getCompletedSechdules();

      expect(component.completedScheduleList).toEqual([]);
      expect(component.isAPIInprogress).toBe(false);
    });
  });

  describe("mapToCompletedScheduleList", () => {
    it("should return empty array if data.result is empty", () => {
      const result = (component as any).mapToCompletedScheduleList({
        result: {},
      });
      expect(result).toEqual([]);
    });

    it("should map data.result to completed schedule list", () => {
      const data = {
        result: {
          sol2: {
            solution_name: "Solution 2",
            attempts: [
              {
                mentoring_relationship_id: "rel2",
                mentor_id: "mentor2",
                mentee_id: "mentee2",
                createdAt: "2024-06-02T10:00:00Z",
                attempt_serial_number: 2,
                result_percentage: 90,
                user_submission: {},
                acquired_score: 9,
                observationAttemptsMetaData: { solution_name: "Solution 2" },
                solution_id: "sol2",
                submission_id: "sub2",
                total_score: 10,
                observation_id: "obs2",
              },
            ],
            mentorMenteeInfo: { mentor_name: "Mentor2" },
          },
        },
      };
      const result = (component as any).mapToCompletedScheduleList(data);
      expect(result.length).toBe(1);
      expect(result[0].solutionId).toBe("sol2");
      expect(result[0].name).toBe("Solution 2");
      expect(result[0].designation).toBe("Mentor2");
      expect(result[0].attempt_serial_number).toBe(1);
      expect(result[0].result_percentage).toBe(90);
      expect(Array.isArray(result[0].attemptList)).toBe(true);
    });
  });

  describe("mapToAttemptList", () => {
    it("should map attempts to attempt list", () => {
      const attempts = [
        {
          mentoring_relationship_id: "rel3",
          mentor_id: "mentor3",
          mentee_id: "mentee3",
          createdAt: "2024-06-03T10:00:00Z",
          attempt_serial_number: 3,
          result_percentage: 70,
          user_submission: {},
          acquired_score: 7,
          observationAttemptsMetaData: { solution_name: "Solution 3" },
          solution_id: "sol3",
          submission_id: "sub3",
          total_score: 10,
          observation_id: "obs3",
        },
      ];
      const solutionData = { solution_name: "Solution 3" };
      const result = (component as any).mapToAttemptList(
        attempts,
        solutionData
      );
      expect(result.length).toBe(1);
      expect(result[0].mentoring_relationship_id).toBe("rel3");
      expect(result[0].mentor_id).toBe("mentor3");
      expect(result[0].mentee_id).toBe("mentee3");
      expect(result[0].createdAt).toMatch(/06-03-2024/);
      expect(result[0].attempt_serial_number).toBe(3);
      expect(result[0].result_percentage).toBe(70);
      expect(result[0].solution_name).toBe("Solution 3");
      expect(result[0].attemptName).toBe("Attempt 1");
      expect(result[0].observation_id).toBe("obs3");
      expect(result[0].attempted_count).toBe(1);
    });
  });

  describe("getFormattedDate", () => {
    it("should format date as MM-DD-YYYY", () => {
      const dateStr = "2024-06-04T12:00:00Z";
      const formatted = (component as any).getFormattedDate(dateStr);
      expect(formatted).toMatch(/^06-04-2024/);
    });
  });
});
