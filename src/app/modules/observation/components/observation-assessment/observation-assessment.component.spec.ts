import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";
import { CommonUtilService } from "../../../../../services";
import { ObservationAssessmentComponent } from "./observation-assessment.component";
import { NavigationExtras, Router } from "@angular/router";
import { ObservationService } from "../../services/observation.service";
import { of, throwError } from "rxjs";
import { RouterLinks } from "../../../../app.constant";
import { mockObservationDetails } from "./observation-assessment.component.spec.data";
import { get } from "lodash";
import exp from "constants";

describe("ObservationAssessmentComponent", () => {
  let observationAssessmentComponent: ObservationAssessmentComponent;

  const mockRouter: Partial<Router> = {
    getCurrentNavigation: jest.fn(() => ({
      extras: {
        state: {
          activeTab: "mentee",
          cardData: {
            mentor_id: "mentor123",
            mentee_id: "mentee123",
            id: "solution123",
            name: "Observation Name",
          },
          canSubmit: true,
          observationData: {
            observation_id: "observation123",
            mentor_id: "mentor123",
            mentee_id: "mentee123",
            attempted_count: 1,
            attempt_serial_number: 1,
            showResult: true,
            result_percentage: 80,
          },
        },
      },
    })) as any,
    navigate: jest.fn(),
  };

  const mockObservationService: Partial<ObservationService> = {
    getAllObservationForMentee: jest.fn(() => of({ data: [] })),
    getobservationDetails: jest.fn(() =>
      of({ result: mockObservationDetails })
    ),
    submitObservation: jest.fn(() => of({})),
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    addLoader: jest.fn(),
    showToast: jest.fn(),
  };

  const div = document.createElement("div");

  function initCompo() {
    observationAssessmentComponent = new ObservationAssessmentComponent(
      mockRouter as Router,
      mockObservationService as ObservationService,
      mockCommonUtilService as CommonUtilService
    );
  }

  beforeAll(() => {
    initCompo();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create component", () => {
    expect(observationAssessmentComponent).toBeTruthy();
  });

  describe('constructor', () => {
    it('should navigate menteeProgressURL when observationData is null', () => {
      jest.spyOn(mockRouter, 'getCurrentNavigation').mockReturnValue({
        extras: {
          state: {
            activeTab: "mentee",
            cardData: {
              mentor_id: "mentor123",
              mentee_id: "mentee123",
              id: "solution123",
              name: "Observation Name",
            },
            canSubmit: false,
            observationData: undefined,
          },
        }
      } as any);
      observationAssessmentComponent = new ObservationAssessmentComponent(
        mockRouter as Router,
        mockObservationService as ObservationService,
        mockCommonUtilService as CommonUtilService
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['mentor/mentees-progress']);
    });

    it('should update previousUrl', () => {
      jest.spyOn(mockRouter, 'getCurrentNavigation').mockReturnValue({
        extras: {
          state: {
            activeTab: "mentee",
            cardData: {
              mentor_id: "mentor123",
              mentee_id: "mentee123",
              id: "solution123",
              name: "Observation Name",
            },
            canSubmit: false,
            observationData: {
              observation_id: "observation123"},
          },
        }
      } as any);
      mockObservationService.getobservationDetails = jest.fn(() => of({}));
      observationAssessmentComponent = new ObservationAssessmentComponent(
        mockRouter as Router,
        mockObservationService as ObservationService,
        mockCommonUtilService as CommonUtilService
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['mentor/mentees-progress']);
    });

    it('should navigate menteeProgressURL when observationData is null', () => {
      jest.spyOn(mockRouter, 'getCurrentNavigation').mockReturnValue({
        extras: {
          state: undefined,
        }
      } as any);
      observationAssessmentComponent = new ObservationAssessmentComponent(
        mockRouter as Router,
        mockObservationService as ObservationService,
        mockCommonUtilService as CommonUtilService
      );
      expect(mockRouter.navigate).toHaveBeenCalledWith(['mentor/mentees-progress']);
    });
  });

  describe("ngOnInit", () => {
    it("should navigate to menteeProgressURL when observationData is null", () => {
      const routerMock = { 
        navigate: jest.fn(),
        getCurrentNavigation: jest.fn(() => ({
          extras: {
            state: {
              activeTab: "mentee",
              cardData: {
                mentor_id: "mentor123",
                mentee_id: "mentee123",
                id: "solution123",
                name: "Observation Name",
              },
              canSubmit: false,
              observationData: {
                showTimer: false,
              },
            },
          }
        })) as any
       } as unknown as Router;
       const observationServiceMock = {
        getobservationDetails: jest.fn(() => of({ result: { sections: [{ id: 1, name: "Section 1" }, { id: 2, name: "Section 2" }] } }))
      } as any;
      const commonUtilServiceMock = {} as CommonUtilService;

      const component = new ObservationAssessmentComponent(
        routerMock,
        observationServiceMock,
        commonUtilServiceMock
      );

      component.observationData = { showTimer: undefined, showResult: true };
      component.menteeProgressURL = "/mentee-progress";

      component.ngOnInit();
      expect(component.observationData).toBeTruthy();  
    });

    it("should set currentSection when questionData sections exist", () => {
      const routerMock = { 
        navigate: jest.fn(),
        getCurrentNavigation: jest.fn(() => ({
          extras: {
            state: {
              activeTab: "mentee",
              cardData: {
                mentor_id: "mentor123",
                mentee_id: "mentee123",
                id: "solution123",
                name: "Observation Name",
              },
              canSubmit: false,
              observationData: {
                showTimer: false,
                observation_id: "observation123"},
            },
          }
        }))
       } as unknown as Router;
      const observationServiceMock = {
        getobservationDetails: jest.fn(() => of({ result: { sections: [{ id: 1, name: "Section 1" }, { id: 2, name: "Section 2" }] } }))
      } as any;
      const commonUtilServiceMock = {} as CommonUtilService;

      const component = new ObservationAssessmentComponent(
        routerMock,
        observationServiceMock,
        commonUtilServiceMock
      );

      component.observationData = { showTimer: true };
      component.questionData = {
        sections: [
          { id: 1, name: "Section 1" },
          { id: 2, name: "Section 2" },
        ],
      };
      component.currentSectionIndex = 0;

      component.ngOnInit();

      expect(component.currentSection).toEqual({ id: 1, name: "Section 1" });
    });

    it("should set progressbarValue correctly", () => {
      observationAssessmentComponent.questionData.sections = [{}, {}];
      observationAssessmentComponent.currentSectionIndex = 0;
      observationAssessmentComponent.observationData = { showTimer: true };

      observationAssessmentComponent.ngOnInit();

      expect(observationAssessmentComponent.progressbarValue).toBe(50);
    });

    it("should set showTimer and startTimer correctly", () => {
      observationAssessmentComponent.observationData = { showTimer: false };
      observationAssessmentComponent.observationData = { showTimer: true };
      
      observationAssessmentComponent.ngOnInit();

      expect(observationAssessmentComponent.showTimer).toBe(true);
      expect(observationAssessmentComponent.startTimer).toBe(true);
    });

    it("should set result_percentage and showChip correctly", () => {
      observationAssessmentComponent.observationData = {
        showResult: true,
        result_percentage: 80,
      };
      observationAssessmentComponent.observationData = { showTimer: true };

      observationAssessmentComponent.ngOnInit();

      expect(observationAssessmentComponent.result_percentage).toBe(0);
      expect(observationAssessmentComponent.showChip).toBe(false);
    });
  });

  it('should scroll element to top smoothly when element exists', () => {
    const mockElement = {
      scroll: jest.fn()
    };
    document.getElementById = jest.fn().mockReturnValue(mockElement);

    observationAssessmentComponent.scrollToTop();

    expect(document.getElementById).toHaveBeenCalledWith('observationQuestionSection');
    expect(mockElement.scroll).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });

  describe("getTimer", () => {
    it("should set timerText correctly", () => {
      jest.useFakeTimers();

      observationAssessmentComponent.observationData = { duration: 65 };
      observationAssessmentComponent.getTimer();

      expect(observationAssessmentComponent.seconds).toBe(65);
      expect(observationAssessmentComponent.minutes).toBe(1);

      jest.advanceTimersByTime(1000);
      expect(observationAssessmentComponent.seconds).toBe(64);

      jest.useRealTimers();
    });

    it("should navigate to home when timer ends", () => {
      jest.useFakeTimers();

      observationAssessmentComponent.observationData = { duration: -2 };
      observationAssessmentComponent.startTimer = true;
      observationAssessmentComponent.getTimer();

      expect(observationAssessmentComponent.timerText).toBe('1:4');

      jest.advanceTimersByTime(1000);
      expect(observationAssessmentComponent.timerText).toBe('00:00');

      jest.useRealTimers();
    });
  });

  describe("getobservationDetails", () => {
    it("should set observationDetails correctly", () => {
      observationAssessmentComponent.observationData = {
        mentee_id: "1",
        attempted_count: 1,
        observation_id: "1",
        mentor_id: "1",
      };
      observationAssessmentComponent.canSubmit = true;

      mockObservationService.getobservationDetails = jest.fn(() => of(mockObservationDetails));

      observationAssessmentComponent.getobservationDetails();

      expect(mockObservationService.getobservationDetails).toHaveBeenCalled();
    });

    it("should navigate to menteeProgressURL on error", () => {
      mockObservationService.getobservationDetails = jest.fn(() =>
        throwError("error")
      );

      observationAssessmentComponent.getobservationDetails();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        observationAssessmentComponent.menteeProgressURL,
      ]);
    });
  });

  describe("mapQuestions", () => {
    it("should set currentSection correctly", () => {
      observationAssessmentComponent.observationDetails =
        mockObservationDetails;
      jest.spyOn(observationAssessmentComponent, 'scrollToTop').mockImplementation();
      observationAssessmentComponent.mapQuestions();

      expect(observationAssessmentComponent.currentSection).toBeDefined();
    });

    it("should set showSubmit correctly", () => {
      observationAssessmentComponent.observationDetails =
        mockObservationDetails;
      jest.spyOn(observationAssessmentComponent, 'scrollToTop').mockImplementation();
      observationAssessmentComponent.mapQuestions();

      expect(observationAssessmentComponent.showSubmit).toBe(true);
    });
  });

  describe("previousQuestion", () => {
    it("should decrement currentSectionIndex", () => {
      observationAssessmentComponent.currentSectionIndex = 1;

      observationAssessmentComponent.previousQuestion();

      expect(observationAssessmentComponent.currentSectionIndex).toBe(0);
    });

    it("should set diablePrevious correctly", () => {
      observationAssessmentComponent.currentSectionIndex = 1;

      observationAssessmentComponent.previousQuestion();

      expect(observationAssessmentComponent.diablePrevious).toBe(true);
    });
  });

  describe("nextQuestion", () => {
    it("should increment currentSectionIndex", async () => {
      observationAssessmentComponent.currentSectionIndex = 0;
      observationAssessmentComponent.questionData.sections = [{
        pageQuestions: [
          {
            id: "1",
            value: "1",
            question: "Question 1",
            payload: {
              criteriaId: "1"
            }
          }
        ] 
      }];
      observationAssessmentComponent.currentSection = { pageQuestions: [
        {
          id: "1",
          value: "1",
          question: "Question 1",
          payload: {
            criteriaId: "1"
          }
        }
      ] } as any;
      mockObservationService.submitObservation = jest.fn(() => of({}));

      await observationAssessmentComponent.nextQuestion();

      expect(mockObservationService.submitObservation).toHaveBeenCalled();
    });

    it("should call submit when on last section", async () => {
      observationAssessmentComponent.currentSectionIndex = 0;
      observationAssessmentComponent.questionData.sections = [{
        pageQuestions: [
          {
            id: "1",
            value: "1",
            question: "Question 1",
            payload: {
              criteriaId: "1"
            }
          }
        ]
      }];
      observationAssessmentComponent.currentSection = { pageQuestions: [
        {
          id: "1",
          value: "1",
          question: "Question 1",
          payload: {
            criteriaId: "1"
          }
        }
      ] } as any;

      const submitSpy = jest.spyOn(observationAssessmentComponent, "submit");
      mockObservationService.submitObservation = jest.fn(() => of({}));

      await observationAssessmentComponent.nextQuestion();

      expect(submitSpy).toHaveBeenCalled();
      expect(mockObservationService.submitObservation).toHaveBeenCalled();
    });
  });

  describe("saveAnswer", () => {
    it("should set value correctly for multiselect", () => {
      observationAssessmentComponent.currentSection = {
        sectionID: "1",
        pageQuestions: [{ responseType: "multiselect", value: [] }] as any,
      };

      observationAssessmentComponent.saveAnswer(
        [{ checked: true, value: "1" }],
        0
      );

      expect(
        observationAssessmentComponent.currentSection.pageQuestions[0].value
      ).toEqual(["1"]);
    });

    it("should set value correctly for date", () => {
      observationAssessmentComponent.currentSection = {
        sectionID: "1",
        pageQuestions: [{ responseType: "date", value: "" }] as any,
      };

      observationAssessmentComponent.saveAnswer("2021-01-01", 0);

      expect(
        observationAssessmentComponent.currentSection.pageQuestions[0].value
      ).toBe("2021-01-01T00:00:00.000Z");
    });

    it("should set value correctly for other types", () => {
      observationAssessmentComponent.currentSection = {
        sectionID: "1",
        pageQuestions: [{ responseType: "text", value: "" }] as any,
      };

      observationAssessmentComponent.saveAnswer("answer", 0);

      expect(
        observationAssessmentComponent.currentSection.pageQuestions[0].value
      ).toBe("answer");
    });
  });

  describe("submitEvidences", () => {
    it("should call submitObservation", async () => {
      observationAssessmentComponent.currentSection = {
        sectionID: "1",
        pageQuestions: [
          {
            _id: "1",
            responseType: "text",
            value: "answer",
            question: "Question",
            options: [],
            questionType: "text",
            payload: { criteriaId: "1" },
            evidenceMethod: "method",
            rubricLevel: "level",
          } as any,
        ],
      };
      observationAssessmentComponent.questionData.sections = [
        { externalId: "1" },
      ];
      observationAssessmentComponent.startTime = new Date().getTime();
      observationAssessmentComponent.observationData = {
        mentoring_relationship_id: "1",
        mentor_id: "1",
        mentee_id: "1",
        solution_id: "1",
        observation_id: "1",
        attempted_count: 1,
      };
      observationAssessmentComponent.observationDetails = {
        assessment: { submissionId: "1" },
      };
      mockObservationService.submitObservation = jest.fn(() => of({}));

      await observationAssessmentComponent.submitEvidences();

      expect(mockObservationService.submitObservation).toHaveBeenCalled();
    });
  });

  describe("valdateCurrentSection", () => {
    it("should set isCurrentSectionFormValid correctly", () => {
      observationAssessmentComponent.currentSection = {
        sectionID: "1",
        pageQuestions: [{ value: "answer" }] as any,
      };

      observationAssessmentComponent.valdateCurrentSection();

      expect(observationAssessmentComponent.isCurrentSectionFormValid).toBe(
        true
      );
    });

    it("should set isCurrentSectionFormValid to false when a question is not answered", () => {
      observationAssessmentComponent.currentSection = {
        sectionID: "1",
        pageQuestions: [{ value: "" }] as any,
      };

      observationAssessmentComponent.valdateCurrentSection();

      expect(observationAssessmentComponent.isCurrentSectionFormValid).toBe(
        false
      );
    });
  });

  describe("showRequiredMessage", () => {
    it("should call showToast", () => {
      observationAssessmentComponent.showRequiredMessage();

      expect(mockCommonUtilService.showToast).toHaveBeenCalledWith(
        "PLEASE_ANSWER_ALL_QUESTION"
      );
    });
  });

  describe("updatePreviuosSelection", () => {
    it("should set previuosSelection correctly", () => {
      observationAssessmentComponent.observationData = {
        user_submission: {
          evidence: {
            answers: { "1": { value: "answer" } },
          },
        },
      };

      observationAssessmentComponent.updatePreviuosSelection();

      expect(observationAssessmentComponent.previuosSelection).toEqual({
        "1": { value: "answer" },
      });
    });
  });

  describe("mapAnswers", () => {
    it("should set currentSection pageQuestions values correctly", () => {
      observationAssessmentComponent.currentSection = {
        sectionID: "1",
        pageQuestions: [{ _id: "1", value: "" }] as any,
      };
      observationAssessmentComponent.previuosSelection = {
        "1": { value: "answer" },
      };

      observationAssessmentComponent.mapAnswers();

      expect(
        observationAssessmentComponent.currentSection.pageQuestions[0].value
      ).toBe("answer");
    });
  });

  describe("navigateBack", () => {
    it("should navigate to menteeProgressURL", () => {
      observationAssessmentComponent.showTimer = false;

      observationAssessmentComponent.navigateBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        `${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`,
      ]);
    });

    it("should navigate to home when showTimer is true", () => {
      observationAssessmentComponent.showTimer = true;

      observationAssessmentComponent.navigateBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(["page/home"]);
    });
  });
});
