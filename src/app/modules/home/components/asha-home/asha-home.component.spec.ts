import { AshaHomeComponent } from "./asha-home.component";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ContentCorodovaService } from "../../../../../library/ws-widget/collection/src/public-api";
import { of } from "rxjs";

jest.mock("ngx-extended-pdf-viewer", () => ({
  NgxExtendedPdfViewerComponent: () => "MockPdfViewerComponent",
}));

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  NgModule: () => (target) => target,
}));

describe("AshaHomeComponent", () => {
  let component: AshaHomeComponent;
  const mockRouter: Partial<Router> = {};
  const mockCordovasvc: Partial<ContentCorodovaService> = {};
  const mockTranslate: Partial<TranslateService> = {};

  beforeAll(() => {
    component = new AshaHomeComponent(
      mockRouter as Router,
      mockCordovasvc as ContentCorodovaService,
      mockTranslate as TranslateService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a instance of AshaHomeComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should invoked ngOnInit", () => {
    // Arrange
    component.expand = true;
    // Act
    component.ngOnInit();
    // Assert
    expect(component.isExpanded).toBeTruthy();
  });

  it("should expand toggled", () => {
    // Arrange
    component.expand = false;
    // Act
    component.toggleExpand();
    // Assert
    expect(component.isExpanded).toBeFalsy();
  });

  describe("getCourseId", () => {
    it("should return course id", () => {
      // Arrange
      const competencyId = "1";
      const levelId = "1";
      const ashaData = {
        levels: [
          {
            competencyId: "1",
            level: "1",
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
        lang: "hi",
      };
      // Act
      const result = component.getCourseId(competencyId, levelId, ashaData);
      // Assert
      expect(result).toEqual("sample_do_id");
    });
  });

  describe("startSelfAssesmentold", () => {
    it("should start self assesment old and navigate to course page for content type is course", () => {
      // Arrange
      const data = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const event = new Event("click");
      mockCordovasvc.setAshaCardData = jest.fn();
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockCordovasvc.getAshaCompetencyCorses = jest.fn(() =>
        of({
          result: {
            content: [
              {
                contentId: "sample_do_id",
                name: "sample-content-name",
                identifier: "sample-content-identifier",
                batches: [
                  {
                    batchId: "sample_batch_id",
                  },
                ],
              },
            ],
          },
        })
      );
      mockCordovasvc.setAshaData = jest.fn();
      // Act
      component.startSelfAssesmentold(data, event);
      // Assert
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(component.btnName).toEqual("Continue");
      expect(component.isExpanded).toBeFalsy();
      expect(mockCordovasvc.setAshaData).toHaveBeenCalled();
      expect(mockCordovasvc.getAshaCompetencyCorses).toHaveBeenCalled();
      expect(mockCordovasvc.setAshaCardData).toHaveBeenCalled();
    });

    it("should start self assesment old and navigate to course page for content type is self assessment", () => {
      // Arrange
      const data = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const event = new Event("click");
      mockCordovasvc.setAshaCardData = jest.fn();
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockCordovasvc.getAshaCompetencyCorses = jest.fn(() =>
        of({
          result: {
            content: [
              {
                contentId: "sample_do_id",
                name: "sample-content-name",
                identifier: "sample-content-identifier",
                batches: [
                  {
                    batchId: "sample_batch_id",
                  },
                ],
              },
            ],
          },
        })
      );
      jest
        .spyOn(component, "getCourseId")
        .mockImplementation(() => "sample_do_id");
      // Act
      component.startSelfAssesmentold(data, event);
      // Assert
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(component.btnName).toEqual("Continue");
      expect(component.isExpanded).toBeFalsy();
      expect(mockCordovasvc.setAshaCardData).toHaveBeenCalled();
    });

    it("should navigate self asssessment old if progress is undefined", () => {
      // Arrange
      const data = {
        progress: undefined,
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const event = new Event("click");
      mockCordovasvc.setAshaCardData = jest.fn();
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // Act
      component.startSelfAssesmentold(data, event);
      // Assert
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(component.btnName).toEqual("Continue");
      expect(component.isExpanded).toBeFalsy();
    });
  });

  describe("startSelfAssesment", () => {
    it("should start self assesment and navigate to course page for content type is course", () => {
      // Arrange
      const data = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const event = new Event("click");
      mockCordovasvc.setAshaCardData = jest.fn();
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockCordovasvc.getAshaCompetencyCorses = jest.fn(() =>
        of({
          result: {
            content: [
              {
                contentId: "sample_do_id",
                name: "sample-content-name",
                identifier: "sample-content-identifier",
                batches: [
                  {
                    batchId: "sample_batch_id",
                  },
                ],
              },
            ],
          },
        })
      );
      mockCordovasvc.setAshaData = jest.fn();
      // Act
      component.startSelfAssesment(data, event);
      // Assert
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(component.btnName).toEqual("Continue");
      expect(component.isExpanded).toBeFalsy();
      expect(mockCordovasvc.setAshaData).toHaveBeenCalled();
      expect(mockCordovasvc.getAshaCompetencyCorses).toHaveBeenCalled();
      expect(mockCordovasvc.setAshaCardData).toHaveBeenCalled();
    });

    it("should start self assesment and navigate to course page for content type is self assessment", () => {
      // Arrange
      const data = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const event = new Event("click");
      mockCordovasvc.setAshaCardData = jest.fn();
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockCordovasvc.getAshaCompetencyCorses = jest.fn(() =>
        of({
          result: {
            content: [
              {
                contentId: "sample_do_id",
                name: "sample-content-name",
                identifier: "sample-content-identifier",
                batches: [
                  {
                    batchId: "sample_batch_id",
                  },
                ],
              },
            ],
          },
        })
      );
      jest
        .spyOn(component, "getCourseId")
        .mockImplementation(() => "sample_do_id");
      // Act
      component.startSelfAssesment(data, event);
      // Assert
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(component.btnName).toEqual("Continue");
      expect(component.isExpanded).toBeFalsy();
      expect(mockCordovasvc.setAshaCardData).toHaveBeenCalled();
    });

    it("should navigate self asssessment if progress is undefined", () => {
      // Arrange
      const data = {
        progress: undefined,
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const event = new Event("click");
      mockCordovasvc.setAshaCardData = jest.fn();
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // Act
      component.startSelfAssesment(data, event);
      // Assert
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(component.btnName).toEqual("Continue");
      expect(component.isExpanded).toBeFalsy();
    });
  });

  describe("getLevelNote", () => {
    it("should return LEVEL_NOTE if progress is undefined", () => {
      component.ashaData = {
        progress: undefined,
      };
      mockTranslate.instant = jest.fn(() => "level note");
      //Act
      component.getLevelNote();
      //Assert
      expect(mockTranslate.instant).toHaveBeenCalledWith("LEVEL_NOTE");
    });

    it("should return LEVEL_NOTE if progress is undefined", () => {
      component.ashaData = {
        progress: "progress",
      };
      mockTranslate.instant = jest.fn(() => "level note");
      //Act
      component.getLevelNote();
      //Assert
      expect(mockTranslate.instant).toHaveBeenCalledWith("LEVEL_NOTE");
    });

    it("should display clear all messgae for pass all the test", () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      mockTranslate.instant = jest.fn(() => "level note");
      //Act
      component.getLevelNote();
      //Assert
      expect(mockTranslate.instant).toHaveBeenCalledWith(
        "YOU_CLEAR_ALL_LEVELS"
      );
    });

    it("should display pass message level for course", () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      mockTranslate.instant = jest.fn(() => "level note");
      //Act
      component.getLevelNote();
      //Assert
      expect(mockTranslate.instant).toHaveBeenCalledWith(
        "COMPLETE_LEVEL_COURSE", {"nextLevel": 5}
      );
    });

    it("should display pass message for assessment", () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      mockTranslate.instant = jest.fn(() => "level note");
      //Act
      component.getLevelNote();
      //Assert
      expect(mockTranslate.instant).toHaveBeenCalledWith(
        "COMPLETE_LEVEL_ASSESSMENT", {"nextLevel": 5}
      );
    });

    it("should display not clear for course", () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Fail",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      mockTranslate.instant = jest.fn(() => "level note");
      //Act
      component.getLevelNote();
      //Assert
      expect(mockTranslate.instant).toHaveBeenCalledWith(
        "NOTE_CLEAR_COURSE", {"nextLevel": 5}
      );
    });

    it("should display not clear for self assessment", () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Fail",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      mockTranslate.instant = jest.fn(() => "level note");
      //Act
      component.getLevelNote();
      //Assert
      expect(mockTranslate.instant).toHaveBeenCalledWith(
        "NOTE_CLEAR_ASSESSMENT", {"nextLevel": 5}
      );
    });

    it("should display not clear for self assessment", () => {
      component.ashaData = {
        progress: [
          {
            levelId: 10,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 20,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 30,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 40,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 50,
            completionpercentage: 0,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      mockTranslate.instant = jest.fn(() => "level note");
      //Act
      component.getLevelNote();
      //Assert
      expect(mockTranslate.instant).toHaveBeenCalledWith(
        'CLEAR_LEVEL_COURSE', {"nextLevel": 1}
      );
    });
  });

  it('should return last passed value', () => {
    // Arrange
    component.ashaData = {
      progress: [
        {
          levelId: 1,
          completionpercentage: 100,
          contentType: "course",
          passFailStatus: "Pass",
        },
        {
          levelId: 2,
          completionpercentage: 100,
          contentType: "course",
          passFailStatus: "Pass",
        },
        {
          levelId: 3,
          completionpercentage: 100,
          contentType: "course",
          passFailStatus: "Pass",
        },
        {
          levelId: 4,
          completionpercentage: 100,
          contentType: "selfAssessment",
          passFailStatus: "Pass",
        }
      ],
      lang: "hi",
      competencyID: 1,
      levels: [
        {
          competencyId: "1",
          level: 1,
          course: [
            {
              id: "sample_do_id",
              lang: "hi",
            },
          ],
        },
      ],
    };
    //Act
    const result = component.getLastPassedLevel();
    //Assert
    expect(result).toBe(4)
  });

  describe('getLevelStyle', () => {
    it('should return level style as gray for empty progress', () => {
      //Arrange
      component.ashaData = {
        progress: [],
      };
      const levelId = 1;
      //Act
      const defaultColor = component.getLevelStyle(levelId);
      //Assert
      expect(defaultColor).toBe('lightgray');
    });

    it('should return green for pass level', () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const levelId = 1;
      //Act
      const defaultColor = component.getLevelStyle(levelId);
      //Assert
      expect(defaultColor).toBe('green')
    });

    it('should return yellow for fail level', () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Fail",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const levelId = 1;
      //Act
      const defaultColor = component.getLevelStyle(levelId);
      //Assert
      expect(defaultColor).toBe('yellow')
    });

    it('should return lightgray for not started', () => {
      component.ashaData = {
        progress: [
          {
            levelId: 3,
            completionpercentage: '',
            contentType: "course",
            passFailStatus: "N/A",
          }
        ]
      };
      const levelId = 5;
      //Act
      const defaultColor = component.getLevelStyle(levelId);
      //Assert
      expect(defaultColor).toBe('lightgray')
    });
  });

  describe('getLevelStyleold', () => {
    it('should return level old style as gray for empty progress', () => {
      //Arrange
      component.ashaData = {
        progress: [],
      };
      const levelId = 1;
      //Act
      const defaultColor = component.getLevelStyleold(levelId);
      //Assert
      expect(defaultColor).toBe('lightgray');
    });

    it('should return green for pass level old style', () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const levelId = 1;
      //Act
      const defaultColor = component.getLevelStyleold(levelId);
      //Assert
      expect(defaultColor).toBe('green')
    });

    it('should return yellow for fail level old style', () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Fail",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const levelId = 1;
      //Act
      const defaultColor = component.getLevelStyleold(levelId);
      //Assert
      expect(defaultColor).toBe('yellow')
    });

    it('should return yellow for fail level old style', () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Fail",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      jest.spyOn(component, 'getLastPassedLevel').mockImplementation(() => {
        return 1;
      })
      const levelId = 2;
      //Act
      const defaultColor = component.getLevelStyleold(levelId);
      //Assert
      expect(defaultColor).toBe('yellow')
    });

    it('should return lightgray for not started old style', () => {
      component.ashaData = {
        progress: [
          {
            levelId: 3,
            completionpercentage: '',
            contentType: "course",
            passFailStatus: "N/A",
          }
        ]
      };
      const levelId = 5;
      //Act
      const defaultColor = component.getLevelStyleold(levelId);
      //Assert
      expect(defaultColor).toBe('lightgray')
    });
  });

  describe('getCompletionPercentage', () => {
    it('should return compilation percentage', () => {
      //Arrange
      component.ashaData = {
        progress: [],
      };
      //Act
      const result = component.getCompletionPercentage();
      //Assert
      expect(component.showBtn).toBeTruthy();
      expect(result).toBe(0)
    });

    it('should be return result 100', () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },{
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      //ACT
      const result = component.getCompletionPercentage();
      //Assert
      expect(component.showBtn).toBeFalsy();
      expect(result).toBe(100);
    });
  });

  describe('getNavigationData', () => {
    it('should not navigate if ashaData level is undefined', () => {
      //Arrange
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: undefined,
      };
      const res = {};
      const levelId = 1;
      //Act
      const result = component.getNavigationData(res, levelId);
      //Assert
      expect(result).toBeNull();
    });

    it('should return true if levels are valid', () => {
      component.ashaData = {
        progress: [
          {
            levelId: 1,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },{
            levelId: 2,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 3,
            completionpercentage: 100,
            contentType: "course",
            passFailStatus: "Pass",
          },
          {
            levelId: 4,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          },
          {
            levelId: 5,
            completionpercentage: 100,
            contentType: "selfAssessment",
            passFailStatus: "Pass",
          }
        ],
        lang: "hi",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const res = [{
        lang: "hi",
        identifier: 'sample_do_id'
      }];
      const levelId = 1;
      //Act
      const result = component.getNavigationData(res, levelId);
      //Assert
      expect(result).toBeTruthy();
    });

    it('should return true if levels are valid and language is not matched', () => {
      component.ashaData = {
        lang: "en",
        competencyID: 1,
        levels: [
          {
            competencyId: "1",
            level: 1,
            course: [
              {
                id: "sample_do_id",
                lang: "hi",
              },
            ],
          },
        ],
      };
      const res = [{
        lang: "hi",
        identifier: 'sample_do_id'
      }];
      const levelId = 1;
      //Act
      const result = component.getNavigationData(res, levelId);
      //Assert
      expect(result).toBeTruthy();
    });
  })
});
