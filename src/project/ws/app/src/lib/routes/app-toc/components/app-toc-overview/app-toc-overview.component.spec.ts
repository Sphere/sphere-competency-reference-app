import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfigurationsService } from "../../../../../../../../../library/ws-widget/utils/src/public-api";
import { AccessControlService } from "../../../../../../../author/src/public-api";
import { TrainingApiService } from "../../../infy/routes/training/apis/training-api.service";
import { TrainingService } from "../../../infy/routes/training/services/training.service";
import { AppTocService } from "../../services/app-toc.service";
import { AppTocOverviewComponent } from "./app-toc-overview.component";
import { of, Subject, throwError } from "rxjs";
import { NsAppToc } from "../../models/app-toc.model";

jest.mock("ngx-extended-pdf-viewer", () => ({
  NgxExtendedPdfViewerComponent: () => "MockPdfViewerComponent",
}));

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  NgModule: () => (target) => target,
}));

describe("AppTocOverviewComponent", () => {
  let appTocOverviewComponent: AppTocOverviewComponent;
  const mockroute: Partial<ActivatedRoute> = {
    parent: {
      data: of({
        pageData: {
          data: {
            analytics: {
              enabled: true,
            },
            banners: {
              analytics: "analytics",
              overview: "overview",
              contents: "contents",
              name: "name",
            },
          },
        },
      }),
    },
  } as any;
  const mocktocSharedSvc: Partial<AppTocService> = {};
  const mockconfigSvc: Partial<ConfigurationsService> = {
    restrictedFeatures: new Set(["askAuthor", "trainingLHub"]),
  };
  const mocktrainingApi: Partial<TrainingApiService> = {};
  const mocktrainingSvc: Partial<TrainingService> = {};
  const mockdomSanitizer: Partial<DomSanitizer> = {};
  const mockauthAccessControlSvc: Partial<AccessControlService> = {};
  const mockrouter: Partial<Router> = {};

  beforeAll(() => {
    appTocOverviewComponent = new AppTocOverviewComponent(
      mockroute as ActivatedRoute,
      mocktocSharedSvc as AppTocService,
      mockconfigSvc as ConfigurationsService,
      mocktrainingApi as TrainingApiService,
      mocktrainingSvc as TrainingService,
      mockdomSanitizer as DomSanitizer,
      mockauthAccessControlSvc as AccessControlService,
      mockrouter as Router
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should be create a instance of AppTocOverviewComponent", () => {
    expect(appTocOverviewComponent).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should be called for intialized component", async() => {
      //arrange
      appTocOverviewComponent.forPreview = false;
      appTocOverviewComponent.trainingLHubEnabled = true;
      mocktocSharedSvc.initData = jest.fn(() => ({
        content: {
          identifier: "do_123",
          name: "test",
          primaryCategory: "Digital Textbook",
          completionPercentage: 80,
          children: [
            {
              identifier: "do_234",
              mimeType: "application/vnd.ekstep.content-collection",
              name: "test",
            },
          ],
        },
        errorCode: NsAppToc.EWsTocErrorCode.API_FAILURE,
      })) as any;
      mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
      mocktocSharedSvc.getTocStructure = jest.fn(() => ({
        assessment: 2,
        course: 1,
        handsOn: 1,
        interactiveVideo: 2,
        learningModule: 2,
      })) as any;
      mocktrainingSvc.isValidTrainingContent = jest.fn(() => true);
      mocktocSharedSvc.fetchContentParent = jest.fn(() => of({
        collections: [
            {
              identifier: "do_123",
              name: "test",
              primaryCategory: "Digital Textbook",
              completionPercentage: 80,
              contentType: "Collection",
              children: [
                {
                  identifier: "do_234",
                  mimeType: "application/vnd.ekstep.content-collection",
                  name: "test",
                },
              ],
            },
        ]
      }));
      mocktrainingApi.getTrainingCount = jest.fn(() => of(2));
      //act
      await appTocOverviewComponent.ngOnInit();
      //assert
      expect(mocktocSharedSvc.initData).toHaveBeenCalled();
      expect(mocktocSharedSvc.getTocStructure).toHaveBeenCalled();
      expect(mocktrainingSvc.isValidTrainingContent).toHaveBeenCalled();
      expect(appTocOverviewComponent.tocStructure).toEqual({
        assessment: 2,
        course: 1,
        handsOn: 1,
        interactiveVideo: 2,
        learningModule: 2,
      });
      expect(mocktocSharedSvc.fetchContentParent).toHaveBeenCalled();
      expect(mocktrainingApi.getTrainingCount).toHaveBeenCalled();
    });

    it("should be handle error part", async() => {
      //arrange
      appTocOverviewComponent.forPreview = false;
      appTocOverviewComponent.trainingLHubEnabled = true;
      mocktocSharedSvc.initData = jest.fn(() => ({
        content: {
          identifier: "do_123",
          name: "test",
          primaryCategory: "Digital Textbook",
          completionPercentage: 80,
          children: [
            {
              identifier: "do_234",
              mimeType: "application/vnd.ekstep.content-collection",
              name: "test",
            },
          ],
        },
        errorCode: NsAppToc.EWsTocErrorCode.API_FAILURE,
      })) as any;
      mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
      mocktocSharedSvc.getTocStructure = jest.fn(() => ({
        assessment: 2,
        course: 1,
        handsOn: 1,
        interactiveVideo: 2,
        learningModule: 2,
      })) as any;
      mocktrainingSvc.isValidTrainingContent = jest.fn(() => true);
      mocktocSharedSvc.fetchContentParent = jest.fn(() => throwError({
        error: {
          params: {
            errorCode: NsAppToc.EWsTocErrorCode.API_FAILURE,
          },
        },
      }));
      mocktrainingApi.getTrainingCount = jest.fn(() => of(2));
      //act
      await appTocOverviewComponent.ngOnInit();
      //assert
      expect(mocktocSharedSvc.initData).toHaveBeenCalled();
      expect(mocktocSharedSvc.getTocStructure).toHaveBeenCalled();
      expect(mocktrainingSvc.isValidTrainingContent).toHaveBeenCalled();
      expect(appTocOverviewComponent.tocStructure).toEqual({
        assessment: 2,
        course: 1,
        handsOn: 1,
        interactiveVideo: 2,
        learningModule: 2,
      });
      expect(mocktocSharedSvc.fetchContentParent).toHaveBeenCalled();
      expect(mocktrainingApi.getTrainingCount).toHaveBeenCalled();
    });
  });

  it('should be return subtitle on banner', () => {
    mocktocSharedSvc.subtitleOnBanners = true;
    expect(appTocOverviewComponent.showSubtitleOnBanner).toBe(true);
  });

  it('should be return description on banner', () => {
    mocktocSharedSvc.showDescription = true;
    expect(appTocOverviewComponent.showDescription).toBe(true);
  })

  it('should be return description on banner for content body', () => {
    mocktocSharedSvc.showDescription = true;
    appTocOverviewComponent.content = {
        body: {
            name: 'test'
        }
    } as any;
    expect(appTocOverviewComponent.showDescription).toBe(true);
  })

  it('should clear the component from DOM', () => {
    appTocOverviewComponent.routeSubscription = new Subject() as any;
    appTocOverviewComponent.ngOnDestroy()
  })

  it('should navigate to profile page', () => {
    mockrouter.navigate = jest.fn(() => Promise.resolve(true));
    appTocOverviewComponent.goToProfile('user123');
    expect(mockrouter.navigate).toHaveBeenCalledWith(['/app/person-profile'], { queryParams: { userId: 'user123' } });
  })
});
