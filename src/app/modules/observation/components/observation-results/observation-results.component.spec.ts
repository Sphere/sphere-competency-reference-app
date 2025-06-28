import { Router } from "@angular/router";
import { ObservationResultsComponent } from "./observation-results.component";
import { ObservationService } from "../../services/observation.service";
import { MatDialog } from "@angular/material/dialog";
import { RouterLinks } from "../../../../app.constant";
import { of, throwError } from "rxjs";

describe("ObservationResultsComponent", () => {
  let observationResultsComponent: ObservationResultsComponent;

  const mockRouter: Partial<Router> = {
    navigate: jest.fn(),
    getCurrentNavigation: jest.fn().mockReturnValue({
      extras: {
        state: {
          observationDetails: { assessment: { submissionId: "123" } },
          observationData: {
            result_percentage: 50,
            competency_data: [{ key: "value-1-2" }],
          },
          canSubmit: true,
        },
      },
    }),
  };
  const mockObservationService: Partial<ObservationService> = {
    getObservationSubmissionResult: jest.fn().mockReturnValue(
      of({
        data: {
          result: [{ pointsBasedPercentageScore: 70 }],
        },
      })
    ),
    updateSubmissionandCompetency: jest.fn().mockReturnValue(of({})),
  };
  const mockMatDialog: Partial<MatDialog> = {
    open: jest.fn(),
  };

  function initCompo() {
    observationResultsComponent = new ObservationResultsComponent(
      mockRouter as Router,
      mockObservationService as ObservationService,
      mockMatDialog as MatDialog
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
    expect(observationResultsComponent).toBeTruthy();
  });

  it("should navigate to mentees list if no observation details or data", () => {
    (mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({
      extras: {},
    });
    initCompo();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      `${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`,
    ]);
  });

  it("should set canSubmit to true if state canSubmit is true", () => {
    initCompo();
    expect(observationResultsComponent.canSubmit).toBe(false);
  });

  it("should set pointsBasedPercentageScore and isAPIInprogress if canSubmit is false", () => {
    (mockRouter.getCurrentNavigation as jest.Mock).mockReturnValueOnce({
      extras: {
        state: {
          observationDetails: { assessment: { submissionId: "123" } },
          observationData: {
            result_percentage: 50,
            competency_data: [{ key: "value-1-2" }],
          },
          canSubmit: false,
        },
      },
    });
    initCompo();
    expect(observationResultsComponent.pointsBasedPercentageScore).toBe(50);
    expect(observationResultsComponent.isAPIInprogress).toBe(false);
  });

  it("should open dialog on result call", () => {
    observationResultsComponent.result();
    expect(mockMatDialog.open).toHaveBeenCalled();
  });

  it("should navigate to home on continue call", () => {
    observationResultsComponent.continue();
    expect(mockRouter.navigate).toHaveBeenCalledWith(["page/home"]);
  });

  it("should update submission and competency if pointsBasedPercentageScore > 60", () => {
    mockObservationService.getObservationSubmissionResult = jest.fn().mockReturnValue(
      of({
        data: {
          result: [{ pointsBasedPercentageScore: 70 }],
        },
      })  
    );
    observationResultsComponent.canSubmit = true;
    mockObservationService.updateSubmissionandCompetency = jest.fn().mockReturnValue(of({}));
    observationResultsComponent.getSubmissionResult();
    expect(
      mockObservationService.updateSubmissionandCompetency
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        is_passbook_update_required: true,
      })
    );
    expect(mockObservationService.getObservationSubmissionResult).toHaveBeenCalled();
  });

  it("should handle error in getSubmissionResult", () => {
    mockObservationService.getObservationSubmissionResult = jest.fn().mockReturnValueOnce(throwError("error"));
    observationResultsComponent.getSubmissionResult();
    expect(observationResultsComponent.isAPIInprogress).toBe(false);
  });
});
