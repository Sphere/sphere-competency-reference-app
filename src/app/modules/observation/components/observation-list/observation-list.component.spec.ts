import { ObservationListComponent } from "./observation-list.component";
import { Router } from "@angular/router";
import { ObservationService } from "../../services/observation.service";
import { ConfigurationsService } from "../../../../../library/ws-widget/utils/src/lib/services/configurations.service";
import { CommonUtilService } from "../../../../../services";
import { of, throwError } from "rxjs";

describe("ObservationListComponent", () => {
  let component: ObservationListComponent;

  const mockRouter: Partial<Router> = {
    navigate: jest.fn(),
  };
  const mockObservationService: Partial<ObservationService> = {
    getMentorsObservation: jest.fn(),
    getMentorObservationCount: jest.fn(),
  };
  const mockConfigurationsService: Partial<ConfigurationsService> = {
    userProfile: { userId: "1234" },
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    translateMessage: jest.fn().mockReturnValue("No result found"),
  };

  const constructComponent = () => {
    component = new ObservationListComponent(
      mockObservationService as ObservationService,
      mockConfigurationsService as ConfigurationsService,
      mockCommonUtilService as CommonUtilService
    );
  };

  beforeAll(() => {
    constructComponent();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with default values", () => {
    mockObservationService.getMentorObservationCount = jest.fn(() => of({data: {}}));
    mockObservationService.getMentorsObservation = jest.fn(() => of({data: [
      { mentee_name: "John Doe", mentee_designation: "Developer" }
    ]}));
    component.ngOnInit();
    expect(component.selectedTab).toBe("pending");
    expect(component.activeIndex).toBe(1);
    expect(component.isApiInProgress).toBe(false);
    expect(component.observationList).toEqual([
      {  "designation": "Developer",
        "mentee_designation": "Developer",
       "mentee_name": "John Doe",
        "name": "John Doe"}
    ]);
    expect(mockObservationService.getMentorObservationCount).toHaveBeenCalled();
    expect(mockObservationService.getMentorsObservation).toHaveBeenCalled();
  });

  it("should call getObservationCount and getMentorsObservation on init", () => {
    mockObservationService.getMentorObservationCount = jest.fn(() => throwError({error: {}}));
    mockObservationService.getMentorsObservation = jest.fn(() => of({data: [
      { mentee_name: "John Doe", mentee_designation: "Developer" }
    ]}));
    const getObservationCountSpy = jest.spyOn(component, "getObservationCount");
    const getMentorsObservationSpy = jest.spyOn(
      component,
      "getMentorsObservation"
    );
    component.ngOnInit();
    expect(getObservationCountSpy).toHaveBeenCalled();
    expect(getMentorsObservationSpy).toHaveBeenCalled();
    expect(mockObservationService.getMentorObservationCount).toHaveBeenCalled();
    expect(mockObservationService.getMentorsObservation).toHaveBeenCalled();
  });

  it("should fetch mentor observation count", () => {
    const mockResponse = {
      data: {
        pending: 5,
        inProgress: 3,
        completed: 2,
      },
    };
    mockObservationService.getMentorObservationCount = jest
      .fn()
      .mockReturnValue(of(mockResponse));
    component.getObservationCount();
    expect(component.isApiInProgress).toBe(false);
  });

  it("should fetch mentors observation list", () => {
    const mockResponse = {
      data: [{ mentee_name: "John Doe", mentee_designation: "Developer" }],
    };
    mockObservationService.getMentorsObservation = jest
      .fn()
      .mockReturnValue(of(mockResponse));
    component.getMentorsObservation();
    expect(component.isApiInProgress).toBe(false);
    expect(component.observationList).toEqual([
      {
        mentee_name: "John Doe",
        mentee_designation: "Developer",
        name: "John Doe",
        designation: "Developer",
      },
    ]);
  });

  describe('tabClick', () => {
    it("should handle tab click and fetch observations accordingly", () => {
      const getMentorsObservationSpy = jest.spyOn(
        component,
        "getMentorsObservation"
      );
      component.tabClick({ index: 2 });
      expect(component.activeIndex).toBe(2);
      expect(component.selectedTab).toBe("completed");
      expect(component.displayConfig.activeTab).toBe("completed");
      expect(getMentorsObservationSpy).toHaveBeenCalled();
    });

    it("should handle tab click and fetch observations accordingly for index 0", () => {
      const getMentorsObservationSpy = jest.spyOn(
        component,
        "getMentorsObservation"
      );
      component.tabClick({ index: 0 });
      expect(component.activeIndex).toBe(0);
      expect(component.selectedTab).toBe("inProgress");
      expect(component.displayConfig.activeTab).toBe("inProgress");
      expect(getMentorsObservationSpy).toHaveBeenCalled();
    });

    it("should handle tab click and fetch observations accordingly for index 1", () => {
      const getMentorsObservationSpy = jest.spyOn(
        component,
        "getMentorsObservation"
      );
      component.tabClick({ index: 1 });
      expect(component.activeIndex).toBe(1);
      expect(component.selectedTab).toBe("pending");
      expect(component.displayConfig.activeTab).toBe("pending");
      expect(getMentorsObservationSpy).toHaveBeenCalled();
    });

    it("should handle tab click and fetch observations accordingly for default", () => {
      const getMentorsObservationSpy = jest.spyOn(
        component,
        "getMentorsObservation"
      );
      component.tabClick({ index: '' });
      expect(component.activeIndex).toBe(0);
      expect(component.selectedTab).toBe("inProgress");
      expect(component.displayConfig.activeTab).toBe("inProgress");
      expect(getMentorsObservationSpy).toHaveBeenCalled();
    });
  });
});
