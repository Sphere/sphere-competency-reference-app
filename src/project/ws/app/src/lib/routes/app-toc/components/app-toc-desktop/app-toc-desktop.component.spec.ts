import { NgModule } from "@angular/core";

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
})
export class MockMdePopoverModule {}

jest.mock("@material-extended/mde", () => ({
  MdePopoverModule: MockMdePopoverModule,
}));

import {
  ContentService,
  CourseService,
  DownloadService,
  ErrorType,
  EventsBusService,
  InteractType,
  StorageService,
} from "@project-sunbird/sunbird-sdk";
import { AppTocDesktopComponent } from "./app-toc-desktop.component";
import { NgZone } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer } from "@angular/platform-browser";
import { Router, ActivatedRoute } from "@angular/router";
import { AndroidPermissions } from "@awesome-cordova-plugins/android-permissions/ngx";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "../../../../../../../../../app/manage-learn/core";
import { AppFrameworkDetectorService } from "../../../../../../../../../app/modules/core/services/app-framework-detector-service.service";
import { ContentCorodovaService } from "../../../../../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service";
import { WidgetContentService } from "../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.service";
import { ConfigurationsService } from "../../../../../../../../../library/ws-widget/utils/src/public-api";
import {
  TelemetryGeneratorService,
  CommonUtilService,
  Environment,
  InteractSubtype,
  PageId,
} from "../../../../../../../../../services";
import { MobileAppsService } from "../../../../../../../../../services/mobile-apps.service";
import { Events } from "../../../../../../../../../util/events";
import { QuizService } from "../../../../../../../viewer/src/lib/plugins/quiz/quiz.service";
import { ViewerUtilService } from "../../../../../../../viewer/src/lib/viewer-util.service";
import { AppTocService } from "../../services/app-toc.service";
import { InAppBrowser } from "@awesome-cordova-plugins/in-app-browser/ngx";
import { Device } from "@awesome-cordova-plugins/device/ngx";
import { UtilityService } from "../../../../../../../../../library/ws-widget/utils/src/lib/services/utility.service";
import { BehaviorSubject, of, Subject, throwError } from "rxjs";
import { NsContent } from "../../../../../../../../../library/ws-widget/collection/src/public-api";
import { CourseDownloadCompletionModalComponent } from "../course-download-completion-modal/course-download-completion-modal.component";
import { UserWhatsappModalComponent } from "../user-whatsapp-modal/user-whatsapp-modal.component";
import exp from "constants";
import { Network } from "@capacitor/network";
import { UntypedFormControl } from "@angular/forms";
import { AppTocDialogIntroVideoComponent } from "../app-toc-dialog-intro-video/app-toc-dialog-intro-video.component";

jest.mock("ngx-extended-pdf-viewer", () => ({
  NgxExtendedPdfViewerComponent: () => "MockPdfViewerComponent",
}));
jest.mock("@ngx-translate/core");
jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  NgModule: () => (target) => target,
}));

describe("AppTocDesktopComponent", () => {
  let component: AppTocDesktopComponent;
  const mockStorageService: Partial<StorageService> = {};
  const mockContentService: Partial<ContentService> = {} as any;
  const mockCourseService: Partial<CourseService> = {};
  const mockDownloadService: Partial<DownloadService> = {};
  const mockEventBusService: Partial<EventsBusService> = {};
  const mockSanitizer: Partial<DomSanitizer> = {};
  const routerEventsSubject = new Subject<any>();
  const mockRouter: Partial<Router> = {
    events: routerEventsSubject.asObservable(),
    url: '/app/course',
  };
  const mockTranslate: Partial<TranslateService> = {
    instant: jest.fn((key) => key),
    get: jest.fn(() => of("mock translation")),
  };
  const mockRoute: Partial<ActivatedRoute> = {
    get queryParamMap() {
      return of({
        get: jest.fn((key) => {
          const params: Record<string, string> = {
            contextId: "do_123",
            courseId: "do_123",
          };
          return params[key];
        }),
      }) as any;
    },
  };
  const mockDialog: Partial<MatDialog> = {};
  const mockTocSvc: Partial<AppTocService> = {};
  const mockConfigSvc: Partial<ConfigurationsService> = {};
  const mockContentSvc: Partial<WidgetContentService> = {};
  const mockUtilitySvc: Partial<UtilityService> = {};
  const mockMobileAppsSvc: Partial<MobileAppsService> = {};
  const mockSnackBar: Partial<MatSnackBar> = {};
  const mockCreateBatchDialog: Partial<MatDialog> = {};
  const mockIab: Partial<InAppBrowser> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {
    isTablet: jest.fn(() => false),
  };
  const mockLocalStorageService: Partial<LocalStorageService> = {};
  const mockViewSvc: Partial<ViewerUtilService> = {};
  const mockQuizService: Partial<QuizService> = {};
  const mockContentRatingSvc: Partial<ContentCorodovaService> = {};
  const mockDocument: Partial<Document> = {};
  const mockZone: Partial<NgZone> = {};
  const mockAndroidPermissions: Partial<AndroidPermissions> = {};
  const mockDevice: Partial<Device> = {};
  const mockAppFrameworkDetectorService: Partial<AppFrameworkDetectorService> =
    {};
  const mockEvent: Partial<Events> = {};

  beforeAll(() => {
    component = new AppTocDesktopComponent(
      mockStorageService as StorageService,
      mockContentService as ContentService,
      mockCourseService as CourseService,
      mockDownloadService as DownloadService,
      mockEventBusService as EventsBusService,
      mockSanitizer as DomSanitizer,
      mockRouter as Router,
      mockRoute as ActivatedRoute,
      mockDialog as MatDialog,
      mockTocSvc as AppTocService,
      mockConfigSvc as ConfigurationsService,
      mockContentSvc as WidgetContentService,
      mockUtilitySvc as UtilityService,
      mockMobileAppsSvc as MobileAppsService,
      mockSnackBar as MatSnackBar,
      mockCreateBatchDialog as MatDialog,
      mockIab as InAppBrowser,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockCommonUtilService as CommonUtilService,
      mockLocalStorageService as LocalStorageService,
      mockViewSvc as ViewerUtilService,
      mockQuizService as QuizService,
      mockContentRatingSvc as ContentCorodovaService,
      mockDocument as Document,
      mockZone as NgZone,
      mockTranslate as TranslateService,
      mockAndroidPermissions as AndroidPermissions,
      mockDevice as Device,
      mockAppFrameworkDetectorService as AppFrameworkDetectorService,
      mockEvent as Events
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a instance of AppTocDesktopComponent", () => {
    expect(component).toBeTruthy();
  });

  describe('isResource', () => {
    it('should return true if content is a resource', () => {
      // arrange
      component.content = {
        contentType: NsContent.EContentTypes.RESOURCE,
        children: [],
      } as any;
      mockMobileAppsSvc.sendViewerData = jest.fn();
      // act
      const result = component.isResource;
      // assert
      expect(result).toBe(true);
    });

    it('should return false if content is a resource', () => {
      // arrange
      component.content = null;
      // act
      const result = component.isResource;
      // assert
      expect(result).toBe(false);
    });
  })

  describe("ngOnInit", () => {
    beforeEach(() => {
      component.tocConfig = {
        showPostAssessmentStatus: true,
        showPostAssessment: true,
        showPostAssessmentButton: true,
        showCertificate: true,
        showCertificateButton: true,
        showDownload: true,
      };
    });
    it("should call ngOnInit", async () => {
      // arrange
      component.isTablet = true;
      mockContentSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseId: "do_123",
            identifier: "do_123",
            batchId: "do_123",
            batchName: "Batch 1",
            batchStatus: "active",
            batchCode: "batch_123",
            batchType: "open",
            batchStartDate: "2023-01-01",
            batchEndDate: "2023-12-31",
            batchEnrollmentEndDate: "2023-12-31",
            batchEnrollmentStartDate: "2023-01-01",
          },
        ])
      ) as any;
      mockRoute.data = of({
        appFramework: "sphere",
      }) as any;
      mockConfigSvc.userProfile = {
        phone: "1234567890",
        userId: "user_123",
        firstName: "John",
        lastName: "Doe",
      } as any;
      mockTocSvc.fetchPostAssessmentStatus = jest.fn(() =>
        of({
          postAssessmentStatus: "completed",
          result: [],
        })
      ) as any;
      (mockDownloadService.trackDownloads = jest.fn(() =>
        of({
          completed: [
            {
              identifier: "do_123",
              downloadUrl: "https://example.com/download",
              mimeType: "application/pdf",
              destinationFolder: "downloads",
              filename: "file.pdf",
            },
          ],
          queued: [
            {
              identifier: "do_456",
              downloadUrl: "https://example.com/download",
              mimeType: "application/pdf",
              destinationFolder: "downloads",
              filename: "file.pdf",
            },
          ],
        })
      ) as any),
        (mockEventBusService.events = jest.fn(() =>
          of({
            event: {
              name: "downloadStatus",
              data: {
                identifier: "do_123",
                downloadUrl: "https://example.com/download",
                mimeType: "application/pdf",
                destinationFolder: "downloads",
                filename: "file.pdf",
              },
            },
          })
        ) as any);
      component.content = {
        identifier: "do_123",
        downloadUrl: "https://example.com/download",
        destinationFolder: "downloads",
        filename: "file.pdf",
      } as any;
      mockEventBusService.events = jest.fn(() =>
        of({
          event: {
            name: "downloadStatus",
            data: {
              identifier: "do_123",
              downloadUrl: "https://example.com/download",
            },
          },
        })
      ) as any;
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() =>
        Promise.resolve("sphere")
      );
      mockContentRatingSvc.getSearchResultsByIds = jest.fn(() =>
        of([
          {
            identifier: "do_123",
            rating: 4,
            ratingCount: 10,
            averageRating: 4.5,
            contentType: "Course",
            contentName: "Course 1",
            contentId: "do_123",
            contentRating: 4.5,
            contentRatingCount: 10,
          },
        ])
      ) as any;
      mockViewSvc.readCourseRatingSummary = jest.fn(() =>
        of({
          rating: 4,
          ratingCount: 10,
          averageRating: 4.5,
        })
      ) as any;
      mockEvent.subscribe = jest.fn();
      // act
      await component.ngOnInit();
      // assert
      expect(component).toBeTruthy();
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalled();
      expect(mockDownloadService.trackDownloads).toHaveBeenCalled();
      expect(mockEventBusService.events).toHaveBeenCalled();
      expect(mockContentRatingSvc.getSearchResultsByIds).toHaveBeenCalled();
      expect(mockViewSvc.readCourseRatingSummary).toHaveBeenCalled();
      expect(mockEvent.subscribe).toHaveBeenCalled();
      expect(mockEventBusService.events).toHaveBeenCalled();
    });

    it("should call ngOnInit to fetch PostAssessmentStatus", async () => {
      // arrange
      component.isTablet = true;
      mockContentSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseId: "do_123",
            identifier: "do_123",
            batchId: "do_123",
            batchName: "Batch 1",
            batchStatus: "active",
            batchCode: "batch_123",
            batchType: "open",
            batchStartDate: "2023-01-01",
            batchEndDate: "2023-12-31",
            batchEnrollmentEndDate: "2023-12-31",
            batchEnrollmentStartDate: "2023-01-01",
          },
        ])
      ) as any;
      mockRoute.data = of({
        appFramework: "sphere",
      }) as any;
      mockTocSvc.fetchPostAssessmentStatus = jest.fn(() =>
        of({
          postAssessmentStatus: "completed",
          result: [],
        })
      ) as any;
      (mockDownloadService.trackDownloads = jest.fn(() =>
        of({
          completed: [
            {
              identifier: "do_123",
              downloadUrl: "https://example.com/download",
              mimeType: "application/pdf",
              destinationFolder: "downloads",
              filename: "file.pdf",
            },
          ],
          queued: [
            {
              identifier: "do_456",
              downloadUrl: "https://example.com/download",
              mimeType: "application/pdf",
              destinationFolder: "downloads",
              filename: "file.pdf",
            },
          ],
        })
      ) as any),
        (mockEventBusService.events = jest.fn(() =>
          of({
            event: {
              name: "downloadStatus",
              data: {
                identifier: "do_123",
                downloadUrl: "https://example.com/download",
                mimeType: "application/pdf",
                destinationFolder: "downloads",
                filename: "file.pdf",
              },
            },
          })
        ) as any);
      component.content = {
        identifier: "do_123",
        downloadUrl: "https://example.com/download",
        destinationFolder: "downloads",
        filename: "file.pdf",
        contentType: NsContent.EContentTypes.COURSE,
        learningMode: "Instructor-Led",
      } as any;
      component.tocConfig = {
        showPostAssessmentStatus: true,
        showPostAssessment: true,
        showPostAssessmentButton: true,
      };
      mockEventBusService.events = jest.fn(() =>
        of({
          event: {
            name: "downloadStatus",
            data: {
              identifier: "do_123",
              downloadUrl: "https://example.com/download",
            },
          },
        })
      ) as any;
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() =>
        Promise.resolve("sphere")
      );
      mockContentRatingSvc.getSearchResultsByIds = jest.fn(() =>
        of([
          {
            identifier: "do_123",
            rating: 4,
            ratingCount: 10,
            averageRating: 4.5,
            contentType: "Course",
            contentName: "Course 1",
            contentId: "do_123",
            contentRating: 4.5,
            contentRatingCount: 10,
          },
        ])
      ) as any;
      mockViewSvc.readCourseRatingSummary = jest.fn(() =>
        of({
          rating: 4,
          ratingCount: 10,
          averageRating: 4.5,
        })
      ) as any;
      mockEvent.subscribe = jest.fn();
      // act
      await component.ngOnInit();
      // assert
      expect(component).toBeTruthy();
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalled();
      expect(mockDownloadService.trackDownloads).toHaveBeenCalled();
      expect(mockEventBusService.events).toHaveBeenCalled();
      expect(mockContentRatingSvc.getSearchResultsByIds).toHaveBeenCalled();
      expect(mockViewSvc.readCourseRatingSummary).toHaveBeenCalled();
      expect(mockEvent.subscribe).toHaveBeenCalled();
      expect(mockEventBusService.events).toHaveBeenCalled();
    });
  });

  describe("isMobile", () => {
    beforeEach(() => {
      Object.defineProperty(mockUtilitySvc, "isMobile", {
        get: () => false,
        configurable: true,
      });
    });

    it("should return false when utilitySvc.isMobile is false", () => {
      jest.spyOn(mockUtilitySvc, "isMobile", "get").mockImplementation(() => {
        return false;
      });
      expect(component.isMobile).toBe(false);
    });
  });

  describe("showSubtitleOnBanner", () => {
    beforeEach(() => {
      Object.defineProperty(mockTocSvc, "subtitleOnBanners", {
        get: () => false,
        configurable: true,
      });
    });
    it("should return true if content has subtitle", () => {
      // arrange
      jest
        .spyOn(mockTocSvc, "subtitleOnBanners", "get")
        .mockImplementation(() => {
          return false;
        });
      expect(component.showSubtitleOnBanner).toBe(false);
    });
  });

  describe("onPopState", () => {
    it("should navigate to /page/home when onPopState is called", () => {
      // arrange
      // act
      component.onPopState();
    });
  });

  describe("showIntranetMsg", () => {
    it("should return true if isMobile is true", () => {
      // arrange
      jest.spyOn(component, "isMobile", "get").mockReturnValue(true);

      // act
      const result = component.showIntranetMsg;

      // assert
      expect(result).toBe(true);
    });

    it("should return the value of showIntranetMessage if isMobile is false", () => {
      // arrange
      jest.spyOn(component, "isMobile", "get").mockReturnValue(false);
      component.showIntranetMessage = false;

      // act
      const result = component.showIntranetMsg;

      // assert
      expect(result).toBe(false);

      // arrange
      component.showIntranetMessage = true;

      // act
      const result2 = component.showIntranetMsg;

      // assert
      expect(result2).toBe(true);
    });

    describe("AppTocDesktopComponent Additional Tests", () => {
      describe("showStart", () => {
        it("should return true if showStartButton returns true", () => {
          // arrange
          const mockContent = { identifier: "do_123" } as any;
          component.content = mockContent;
          mockTocSvc.showStartButton = jest.fn(() => {}) as any;

          // act
          const result = component.showStart;

          // assert
          expect(result).toBeUndefined();
          expect(mockTocSvc.showStartButton).toHaveBeenCalledWith(mockContent);
        });

        it("should return false if showStartButton returns false", () => {
          // arrange
          const mockContent = { identifier: "do_123" } as any;
          component.content = mockContent;
          mockTocSvc.showStartButton = jest.fn(() => {}) as any;
          // act
          const result = component.showStart;
          // assert
          expect(result).toBeUndefined();
          expect(mockTocSvc.showStartButton).toHaveBeenCalledWith(mockContent);
        });
      });

      describe("isPostAssessment", () => {
        it("should return true if content is a course and learning mode is Instructor-Led", () => {
          // arrange
          component.tocConfig = {};
          component.content = {
            contentType: NsContent.EContentTypes.COURSE,
            learningMode: "Instructor-Led",
          } as any;

          // act
          const result = component.isPostAssessment;

          // assert
          expect(result).toBe(true);
        });

        it("should return false if tocConfig is not defined", () => {
          // arrange
          component.tocConfig = null;

          // act
          const result = component.isPostAssessment;

          // assert
          expect(result).toBe(false);
        });

        it("should return false if content is not a course", () => {
          // arrange
          component.tocConfig = {};
          component.content = {
            contentType: "Resource",
            learningMode: "Instructor-Led",
          } as any;

          // act
          const result = component.isPostAssessment;

          // assert
          expect(result).toBe(false);
        });
      });

      describe("isHeaderHidden", () => {
        it("should return true if content is a resource and artifactUrl is empty", () => {
          // arrange
          component.content = {
            artifactUrl: "",
          } as any;
          jest.spyOn(component, "isResource", "get").mockReturnValue(true);

          // act
          const result = component.isHeaderHidden;

          // assert
          expect(result).toBe(true);
        });

        it("should return false if content is not a resource", () => {
          // arrange
          component.content = {
            artifactUrl: "",
          } as any;
          jest.spyOn(component, "isResource", "get").mockReturnValue(false);

          // act
          const result = component.isHeaderHidden;

          // assert
          expect(result).toBe(false);
        });
      });

      describe("showActionButtons", () => {
        it("should return true if actionBtnStatus is not wait and content is not deleted or expired", () => {
          // arrange
          component.actionBtnStatus = "grant";
          component.content = {
            status: "Live",
          } as any;

          // act
          const result = component.showActionButtons;

          // assert
          expect(result).toBe(true);
        });

        it("should return false if actionBtnStatus is wait", () => {
          // arrange
          component.actionBtnStatus = "wait";
          component.content = {
            status: "Live",
          } as any;

          // act
          const result = component.showActionButtons;

          // assert
          expect(result).toBe(false);
        });

        it("should return false if content status is Deleted", () => {
          // arrange
          component.actionBtnStatus = "grant";
          component.content = {
            status: "Deleted",
          } as any;

          // act
          const result = component.showActionButtons;

          // assert
          expect(result).toBe(false);
        });

        it("should return false if content status is Expired", () => {
          // arrange
          component.actionBtnStatus = "grant";
          component.content = {
            status: "Expired",
          } as any;

          // act
          const result = component.showActionButtons;

          // assert
          expect(result).toBe(false);
        });
      });

      describe("showButtonContainer", () => {
        it("should return true if all conditions are met", () => {
          // arrange
          component.actionBtnStatus = "grant";
          jest.spyOn(component, "isMobile", "get").mockReturnValue(false);
          component.content = {
            contentType: "Course",
            children: [{}, {}],
            artifactUrl: "some-url",
          } as any;

          // act
          const result = component.showButtonContainer;

          // assert
          expect(result).toBe(true);
        });

        it("should return false if actionBtnStatus is not grant", () => {
          // arrange
          component.actionBtnStatus = "wait";

          // act
          const result = component.showButtonContainer;

          // assert
          expect(result).toBe(false);
        });

        it("should return false if content is in intranet and isMobile is true", () => {
          // arrange
          component.actionBtnStatus = "grant";
          jest.spyOn(component, "isMobile", "get").mockReturnValue(true);
          component.content = {
            isInIntranet: true,
          } as any;

          // act
          const result = component.showButtonContainer;

          // assert
          expect(result).toBe(false);
        });

        it("should return false if content is a course with no children and no artifactUrl", () => {
          // arrange
          component.actionBtnStatus = "grant";
          component.content = {
            contentType: "Course",
            children: [],
            artifactUrl: "",
          } as any;

          // act
          const result = component.showButtonContainer;

          // assert
          expect(result).toBe(false);
        });

        it("should return false if content is a resource with no artifactUrl", () => {
          // arrange
          component.actionBtnStatus = "grant";
          component.content = {
            contentType: "Resource",
            artifactUrl: "",
          } as any;

          // act
          const result = component.showButtonContainer;

          // assert
          expect(result).toBe(false);
        });
      });

      describe("isResource", () => {
        it("should return true if content is a resource or has no children", () => {
          // arrange
          component.content = {
            contentType: NsContent.EContentTypes.RESOURCE,
            children: [],
          } as any;
          mockMobileAppsSvc.sendViewerData = jest.fn();

          // act
          const result = component.isResource;

          // assert
          expect(result).toBeUndefined();
        });

        it("should return false if content is not a resource and has children", () => {
          // arrange
          component.content = {
            contentType: "Course",
            children: [{}, {}],
          } as any;

          // act
          const result = component.isResource;

          // assert
          expect(result).toBeUndefined();
        });
      });

      describe("showOrgprofile", () => {
        it("should navigate to org-details with the given orgId", () => {
          // arrange
          const mockOrgId = "org_123";
          mockRouter.navigate = jest.fn();

          // act
          component.showOrgprofile(mockOrgId);

          // assert
          expect(mockRouter.navigate).toHaveBeenCalledWith(
            ["/app/org-details"],
            { queryParams: { orgId: mockOrgId } }
          );
        });
      });

      describe("isInIFrame", () => {
        it("should return true if window is in an iframe", () => {
          // arrange
          jest.spyOn(window, "self", "get").mockReturnValue({} as any);
          jest
            .spyOn(window, "top", "get")
            .mockReturnValue({ parent: {} } as any);

          // act
          const result = component.isInIFrame;

          // assert
          expect(result).toBe(true);
        });

        it("should return false if window is not in an iframe", () => {
          // arrange
          jest.spyOn(window, "self", "get").mockReturnValue(window);
          jest.spyOn(window, "top", "get").mockReturnValue(window);

          // act
          const result = component.isInIFrame;

          // assert
          expect(result).toBe(false);
        });
      });
    });
  });

  describe('openDownloadCompletionModal', () => {
        // Opens a CourseDownloadCompletionModal dialog with the provided identifier
    it('should open CourseDownloadCompletionModal with correct identifier', () => {
      // Arrange
      mockDialog.open = jest.fn(() => ({
        afterClosed: jest.fn(() => of({event: 'YES'})),
      })) as any;
      const identifier = 'course-123';
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // Act
      component.openDownloadCompletionModal(identifier);
  
      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(CourseDownloadCompletionModalComponent, {
        width: '542px',
        panelClass: 'course-download-completion-modal',
        disableClose: true,
        data: {
          message: 'Course download is complete!',
          identifier: 'course-123'
        }
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith([`app/download-course`]);
    });
  });

  describe('detectFramework', () => {
    it('should set appFramework to the detected framework', async () => {
      // Arrange
      const mockFramework = 'mockFramework';
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() =>
        Promise.resolve(mockFramework)
      );

      // Act
      await component.detectFramework();

      // Assert
      expect(component.appFramework).toBe(mockFramework);
    }
    );
    it('should handle error when detecting framework', async () => {
      // Arrange
      const mockError = new Error('Mock error');
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() =>
        Promise.reject(mockError)
      );

      // Act
      await component.detectFramework();

      // Assert
      expect(component.appFramework).toBeTruthy();
    }
    );
  });

  describe('openUserWhatsAppOptInModal', () => {
    it('should handle WhatsAppOptInModalComponent dialog', () => {
      // Arrange
      mockDialog.open = jest.fn(() => ({
        afterClosed: jest.fn(() => of({ event: 'YES', is_opted_in: true })),
      })) as any;
      mockTocSvc.getUserWhatsAppContent = jest.fn(() =>
        of({
          message: 'WhatsApp Opt-In Message',
          found: false
        })
      );
      mockConfigSvc.userProfile = {
        phone: '1234567890',
      } as any;
      mockTocSvc.updateUserWhatsAppOptInStatus = jest.fn(() => of({}));
      // Act
      component.openUserWhatsAppOptInModal();
      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(UserWhatsappModalComponent, {
        width: '542px',
        panelClass: 'user-whatsup-optin-modal',
        disableClose: true,
        data: {
          maskedPhoneNumber: '1234567890',
        },
      });
      expect(mockTocSvc.getUserWhatsAppContent).toHaveBeenCalled();
      expect(mockTocSvc.updateUserWhatsAppOptInStatus).toHaveBeenCalled();
    });

    it('should handle update whatsapp optin error', () => {
      // Arrange
      mockDialog.open = jest.fn(() => ({
        afterClosed: jest.fn(() => of({ event: 'YES', is_opted_in: true })),
      })) as any;
      mockTocSvc.getUserWhatsAppContent = jest.fn(() =>
        of({
          message: 'WhatsApp Opt-In Message',
          found: false
        })
      );
      mockConfigSvc.userProfile = {
        phone: '1234567890',
      } as any;
      mockTocSvc.updateUserWhatsAppOptInStatus = jest.fn(() => throwError({}));
      // Act
      component.openUserWhatsAppOptInModal();
      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(UserWhatsappModalComponent, {
        width: '542px',
        panelClass: 'user-whatsup-optin-modal',
        disableClose: true,
        data: {
          maskedPhoneNumber: '1234567890',
        },
      });
      expect(mockTocSvc.getUserWhatsAppContent).toHaveBeenCalled();
      expect(mockTocSvc.updateUserWhatsAppOptInStatus).toHaveBeenCalled();
    });

    it('should handle whatsapp content error', () => {
      // Arrange
      mockDialog.open = jest.fn(() => ({
        afterClosed: jest.fn(() => of({ event: 'YES'})),
      })) as any;
      mockTocSvc.getUserWhatsAppContent = jest.fn(() =>
        of({
          message: 'WhatsApp Opt-In Message',
          found: false
        })
      );
      mockConfigSvc.userProfile = {
        phone: '1234567890',
      } as any;
      // Act
      component.openUserWhatsAppOptInModal();
      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(UserWhatsappModalComponent, {
        width: '542px',
        panelClass: 'user-whatsup-optin-modal',
        disableClose: true,
        data: {
          maskedPhoneNumber: '1234567890',
        },
      });
      expect(mockTocSvc.getUserWhatsAppContent).toHaveBeenCalled();
    });

    it('should handle WhatsAppOptInModalComponent dialog for 404', () => {
      // Arrange
      mockTocSvc.getUserWhatsAppContent = jest.fn(() =>
        throwError({
          message: 'WhatsApp Opt-In Message error',
          status: 404
        })
      );
      // Act
      component.openUserWhatsAppOptInModal();
      // Assert
     expect(mockTocSvc.getUserWhatsAppContent).toHaveBeenCalled();
    });

     it('should handle WhatsAppOptInModalComponent dialog', () => {
      // Arrange
      mockTocSvc.getUserWhatsAppContent = jest.fn(() =>
        throwError({
          error: 'WhatsApp Opt-In Message error',
          status: 500
        })
      );
      // Act
      component.openUserWhatsAppOptInModal();
      // Assert
     expect(mockTocSvc.getUserWhatsAppContent).toHaveBeenCalled();
    });
  });

  describe('beforeDownloadEnrollUser', () => {
    it('should call enrollUser and navigate to course details', async () => {
      // Arrange
      component.batchData = {
        enrolled: false,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      }
      mockContentSvc.enrollUserToBatch = jest.fn(() => of({
        result: {
          response: 'SUCCESS',
        }
      }));
      // Act
      await component.beforeDownloadEnrollUser();
      // Assert
      expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalled();
    });
  })

  it('should be cancle download content', () => {
    //arrange
    const identifier = 'do_123', size = 1024;
    mockContentService.cancelImport = jest.fn(() => of({}));
    mockDownloadService.cancelAll = jest.fn(() => of());
    //act
    component.cancelDownloadContent(identifier, size);
    //assert
    expect(mockContentService.cancelImport).toHaveBeenCalled();
    expect(mockDownloadService.cancelAll).toHaveBeenCalled();
  });

  it('should invoked onCrossClicked', () => {
    // arrange
    const mockEvent = {
      cancel: true
    }
    mockDownloadService.cancelAll = jest.fn(() => of());
    //act
    component.onCrossClicked(mockEvent);
    //assert
    expect(mockEvent.cancel).toBe(true);
    expect(mockDownloadService.cancelAll).toHaveBeenCalled();
  })

  describe('enrollApi', () => {
    it('should call enrollUserToBatch with correct parameters', () => {
      // Arrange
      const mockBatchData = {
        batchId: 'batch_123',
        enrolled: false,
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      };
      component.content = mockBatchData.content[0] as any;
      mockConfigSvc.userProfile = {
        phone: '1234567890',
        userId: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
      } as any;
      mockContentSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseId: 'do_123',
            identifier: 'do_123',
            batchId: 'do_123',
            batchName: 'Batch 1',
            batchStatus: 'active',
            batchCode: 'batch_123',
            batchType: 'open',
            batchStartDate: '2023-01-01',
            lastReadContentId: 'do_123',
            batchEndDate: '2023-12-31', 
            issuedCertificates: [
              {
                identifier: 'do_123',
                downloadUrl: 'https://example.com/download',
                mimeType: 'application/pdf',
                destinationFolder: 'downloads',
                filename: 'file.pdf',
                completionPercentage: 100,
                courseId: 'do_123',
              }]
          }])
      ) as any;
      // Act
      component.enrollApi();
      // Assert
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalled();
    });
  })

  it('should be close Popup', () => {
    // arrange
    mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
    component.closePopup();
    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
  })

  describe('downloadCertificate', () => {
    it('should call downloadCertificate with correct parameters', () => {
      // Arrange
      const mockContent = {
        identifier: 'do_123',
        downloadUrl: 'https://example.com/download',
        mimeType: 'application/pdf',
        destinationFolder: 'downloads',
        filename: 'file.pdf',
        completionPercentage: 100
      } as any;
      component.content = mockContent;
      component.batchData = {
        enrolled: true,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      };
      mockConfigSvc.userProfile = {
        phone: '1234567890',
        userId: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'r8E0u@example.com',
      } as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      localStorage.setItem('certificate_downloaded_do_123', 'true');
      mockContentSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseId: 'do_123',
            identifier: 'do_123',
            batchId: 'do_123',
            batchName: 'Batch 1',
            batchStatus: 'active',
            batchCode: 'batch_123',
            batchType: 'open',
            batchStartDate: '2023-01-01',
            batchEndDate: '2023-12-31',
            batchEnrollmentEndDate: '2023-12-31',
            batchEnrollmentStartDate: '2023-01-01',
            issuedCertificates: [
              {
                identifier: 'do_123',
                downloadUrl: 'https://example.com/download',
                mimeType: 'application/pdf',
                destinationFolder: 'downloads',
                filename: 'file.pdf',
                completionPercentage: 100,
                courseId: 'do_123',
                batchId: 'batch_123',
                batchName: 'Batch 1',
                batchStatus: 'active',
                batchCode: 'batch_123',
                batchType: 'open',
                batchStartDate: '2023-01-01',
                batchEndDate: '2023-12-31',
              }]
          },
        ])
      ) as any;
      // Act
      component.downloadCertificate(mockContent);
      // Assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalled();
    });
    
    it('should handle else when downloading certificate', () => {
       // Arrange
      const mockContent = {
        identifier: 'do_123',
        downloadUrl: 'https://example.com/download',
        mimeType: 'application/pdf',
        destinationFolder: 'downloads',
        filename: 'file.pdf',
        completionPercentage: 100
      } as any;
      component.content = mockContent;
      component.batchData = {
        enrolled: true,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      };
      mockConfigSvc.userProfile = {
        phone: '1234567890',
        userId: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'r8E0u@example.com',
      } as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      localStorage.setItem('certificate_downloaded_do_123', new Date().toString());
      mockContentSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseId: 'do_123',
            identifier: 'do_1234',
            batchId: 'do_123',
            batchName: 'Batch 1',
            batchStatus: 'active',
            batchCode: 'batch_123',
            batchType: 'open',
            batchStartDate: '2023-01-01',
            batchEndDate: '2023-12-31',
            batchEnrollmentEndDate: '2023-12-31',
            batchEnrollmentStartDate: '2023-01-01',
            issuedCertificates: []
          },
        ])
      ) as any;
      // Act
      component.downloadCertificate(mockContent);
      // Assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalled();
    });
    
    it('should handle else part when process certificate is OK', () => {
      const mockContent = {
        identifier: 'do_123',
        downloadUrl: 'https://example.com/download',
        mimeType: 'application/pdf',
        destinationFolder: 'downloads',
        filename: 'file.pdf',
        completionPercentage: 100
      } as any;
      component.content = mockContent;
      component.batchData = {
        enrolled: true,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      };
      mockConfigSvc.userProfile = {
        phone: '1234567890',
        userId: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'r8E0u@example.com',
      } as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      localStorage.setItem('certificate_downloaded_do_123', '2023-01-01');
      mockContentSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseId: 'do_123',
            identifier: 'do_1234',
            batchId: 'do_123',
            batchName: 'Batch 1',
            batchStatus: 'active',
            batchCode: 'batch_123',
            batchType: 'open',
            batchStartDate: '2023-01-01',
            batchEndDate: '2023-12-31',
            batchEnrollmentEndDate: '2023-12-31',
            batchEnrollmentStartDate: '2023-01-01',
            issuedCertificates: []
          },
        ])
      ) as any;
      mockContentSvc.processCertificate = jest.fn(() => of({
        responseCode: 'OK',
      }))
      // Act
      component.downloadCertificate(mockContent);
      // Assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalled();
    });

    it('should handle else part when process certificate is not OK', () => {
      const mockContent = {
        identifier: 'do_123',
        downloadUrl: 'https://example.com/download',
        mimeType: 'application/pdf',
        destinationFolder: 'downloads',
        filename: 'file.pdf',
        completionPercentage: 100
      } as any;
      component.content = mockContent;
      component.batchData = {
        enrolled: true,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      };
      mockConfigSvc.userProfile = {
        phone: '1234567890',
        userId: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'r8E0u@example.com',
      } as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      localStorage.setItem('certificate_downloaded_do_123', '2023-01-01');
      mockContentSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseId: 'do_123',
            identifier: 'do_1234',
            batchId: 'do_123',
            batchName: 'Batch 1',
            batchStatus: 'active',
            batchCode: 'batch_123',
            batchType: 'open',
            batchStartDate: '2023-01-01',
            batchEndDate: '2023-12-31',
            batchEnrollmentEndDate: '2023-12-31',
            batchEnrollmentStartDate: '2023-01-01',
            issuedCertificates: []
          },
        ])
      ) as any;
      mockContentSvc.processCertificate = jest.fn(() => of({
        responseCode: 'YES',
      }))
      // Act
      component.downloadCertificate(mockContent);
      // Assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalled();
    });

    it('should handle else part when process certificate is not OK', () => {
      const mockContent = {
        identifier: 'do_123',
        downloadUrl: 'https://example.com/download',
        mimeType: 'application/pdf',
        destinationFolder: 'downloads',
        filename: 'file.pdf',
        completionPercentage: 100
      } as any;
      component.content = mockContent;
      component.batchData = {
        enrolled: true,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      };
      mockConfigSvc.userProfile = {
        phone: '1234567890',
        userId: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'r8E0u@example.com',
      } as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      localStorage.setItem('certificate_downloaded_do_123', '2023-01-01');
      mockContentSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseId: 'do_123',
            identifier: 'do_1234',
            batchId: 'do_123',
            batchName: 'Batch 1',
            batchStatus: 'active',
            batchCode: 'batch_123',
            batchType: 'open',
            batchStartDate: '2023-01-01',
            batchEndDate: '2023-12-31',
            batchEnrollmentEndDate: '2023-12-31',
            batchEnrollmentStartDate: '2023-01-01',
            issuedCertificates: []
          },
        ])
      ) as any;
      mockContentSvc.processCertificate = jest.fn(() => throwError({
        message: 'Error',
        status: 500
      }))
      // Act
      component.downloadCertificate(mockContent);
      // Assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalled();
      expect(mockContentSvc.processCertificate).toHaveBeenCalled();
    });

    it('should call downloadCertificate but completionPercentage is not 100', () => {
      // Arrange
      const mockContent = {
        identifier: 'do_123',
        downloadUrl: 'https://example.com/download',
        mimeType: 'application/pdf',
        destinationFolder: 'downloads',
        filename: 'file.pdf',
        completionPercentage: 50
      } as any;
      component.content = mockContent;
      component.batchData = {
        enrolled: true,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      };
      mockConfigSvc.userProfile = {
        phone: '1234567890',
        userId: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'r8E0u@example.com',
      } as any;
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      localStorage.setItem('certificate_downloaded_do_123', 'true');
      mockContentSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseId: 'do_123',
            identifier: 'do_123',
            batchId: 'do_123',
            batchName: 'Batch 1',
            batchStatus: 'active',
            batchCode: 'batch_123',
            batchType: 'open',
            batchStartDate: '2023-01-01',
            batchEndDate: '2023-12-31',
            batchEnrollmentEndDate: '2023-12-31',
            batchEnrollmentStartDate: '2023-01-01',
            issuedCertificates: [
              {
                identifier: 'do_123',
                downloadUrl: 'https://example.com/download',
                mimeType: 'application/pdf',
                destinationFolder: 'downloads',
                filename: 'file.pdf',
                completionPercentage: 100,
                courseId: 'do_123',
                batchId: 'batch_123',
                batchName: 'Batch 1',
                batchStatus: 'active',
                batchCode: 'batch_123',
                batchType: 'open',
                batchStartDate: '2023-01-01',
                batchEndDate: '2023-12-31',
              }]
          },
        ])
      ) as any;
      // Act
      component.downloadCertificate(mockContent);
      // Assert
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
    });

    it('should handle else part if user is not enrolled', () => {
      // Arrange
      const mockContent = {
        identifier: 'do_123',
        downloadUrl: 'https://example.com/download',
        mimeType: 'application/pdf',
        destinationFolder: 'downloads',
        filename: 'file.pdf',
        completionPercentage: 100
      } as any;
      component.content = mockContent;
      component.batchData = {
        enrolled: false,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',   
            destinationFolder: 'downloads', 
            filename: 'file.pdf',
            courseId: 'do_123', 
            batchId: 'batch_123',
          },
        ]
      };
      // act
      component.downloadCertificate(mockContent);
      // assert
      expect(component.certificateMsg).toBeTruthy();
    });
  });

  describe("startDownload", () => {
    it("should call beforeDownloadEnrollUser", async () => {
      // arrange
      jest.spyOn(component, "beforeDownloadEnrollUser").mockResolvedValue();
      mockDialog.closeAll = jest.fn();
      component.content = {
        identifier: "do_123",
        downloadUrl: "https://example.com/download",
        children: [
          {
            identifier: "do_456",
            downloadUrl: "https://example.com/download",
            mimeType: "application/pdf",
            destinationFolder: "downloads",
            filename: "file.pdf",
          },{
            identifier: "do_789",
            downloadUrl: "https://example.com/download",
            mimeType: "application/pdf",
            destinationFolder: "downloads",
            filename: "file.pdf",
          }
        ]
      } as any;
      mockAndroidPermissions.checkPermission = jest.fn(() =>
        Promise.resolve({
          hasPermission: true,
        })
      ) as any;
      mockStorageService.getStorageDestinationDirectoryPath = jest.fn(() =>
        Promise.resolve("local/path")
      ) as any;
      mockContentService.importContent = jest.fn(() =>
        of([{
          status: -1,
          identifier: "do_123",
          downloadUrl: "https://example.com/download",
          mimeType: "application/pdf",
          destinationFolder: "downloads",
          filename: "file.pdf",
        }])
      ) as any;
       mockContentService.getContentDetails = jest.fn(() => of({
        identifier: "do_123",
        sizeOnDevice: 0,
        isAvailableLocally: false,
        downloadUrl: "https://example.com/download",
        mimeType: "application/pdf",
        destinationFolder: "downloads",
        filename: "file.pdf",
      })) as any;
      // act
      await component.startDownload(1024);
      // assert
      expect(component.beforeDownloadEnrollUser).toHaveBeenCalled();
      expect(mockDialog.closeAll).toHaveBeenCalled();
      expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
      expect(mockContentService.importContent).toHaveBeenCalled();
    });

    it("should call beforeDownloadEnrollUser for download", async () => {
      // arrange
      jest.spyOn(component, "beforeDownloadEnrollUser").mockResolvedValue();
      mockDialog.closeAll = jest.fn();
      component.content = {
        identifier: "do_123",
        downloadUrl: "https://example.com/download",
        children: [
          {
            identifier: "do_456",
            downloadUrl: "https://example.com/download",
            mimeType: "application/pdf",
            destinationFolder: "downloads",
            filename: "file.pdf",
          },{
            identifier: "do_789",
            downloadUrl: "https://example.com/download",
            mimeType: "application/pdf",
            destinationFolder: "downloads",
            filename: "file.pdf",
          }
        ]
      } as any;
      mockAndroidPermissions.checkPermission = jest.fn(() =>
        Promise.resolve({
          hasPermission: true,
        })
      ) as any;
      mockStorageService.getStorageDestinationDirectoryPath = jest.fn(() =>
        Promise.resolve("local/path")
      ) as any;
      mockContentService.importContent = jest.fn(() =>
        of([{
          status: -1,
          identifier: "do_123",
          downloadUrl: "https://example.com/download",
          mimeType: "application/pdf",
          destinationFolder: "downloads",
          filename: "file.pdf",
        }])
      ) as any;
      mockContentService.getContentDetails = jest.fn(() => of({
        identifier: "do_123",
        sizeOnDevice: 0,
        isAvailableLocally: false,
        downloadUrl: "https://example.com/download",
        mimeType: "application/pdf",
        destinationFolder: "downloads",
        filename: "file.pdf",
      })) as any;
      // act
      await component.startDownload(1024);
      // assert
      expect(component.beforeDownloadEnrollUser).toHaveBeenCalled();
      expect(mockDialog.closeAll).toHaveBeenCalled();
      expect(mockStorageService.getStorageDestinationDirectoryPath).toHaveBeenCalled();
      expect(mockContentService.importContent).toHaveBeenCalled();
    });

    it("should call beforeDownloadEnrollUser if user permission is not granted", async () => {
      // arrange
      jest.spyOn(component, "beforeDownloadEnrollUser").mockResolvedValue();
      mockDialog.closeAll = jest.fn();
      mockDevice.version = '13';
      component.content = {
        identifier: "do_123",
        downloadUrl: "https://example.com/download",
        children: [
          {
            identifier: "do_456",
            downloadUrl: "https://example.com/download",
            mimeType: "application/pdf",
            destinationFolder: "downloads",
            filename: "file.pdf",
          },{
            identifier: "do_789",
            downloadUrl: "https://example.com/download",
            mimeType: "application/pdf",
            destinationFolder: "downloads",
            filename: "file.pdf",
          }
        ]
      } as any;
      mockAndroidPermissions.checkPermission = jest.fn(() =>
        Promise.resolve({
          hasPermission: false,
        })
      ) as any;
      mockAndroidPermissions.PERMISSION = {
        READ_EXTERNAL_STORAGE: "READ_EXTERNAL_STORAGE",
      }
      mockAndroidPermissions.requestPermissions = jest.fn(() =>
        Promise.resolve({
          hasPermission: true,
        })
      ) as any;
      mockContentService.importContent = jest.fn(() => throwError({})) as any;
      mockContentService.getContentDetails = jest.fn(() => of({
        identifier: "do_123",
        sizeOnDevice: 0,
        isAvailableLocally: false,
        downloadUrl: "https://example.com/download",
        mimeType: "application/pdf",
        destinationFolder: "downloads",
        filename: "file.pdf",
      })) as any;
      // act
      await component.startDownload(1024);
      // assert
      expect(component.beforeDownloadEnrollUser).toHaveBeenCalled();
      expect(mockDialog.closeAll).toHaveBeenCalled();
      expect(mockAndroidPermissions.checkPermission).toHaveBeenCalled();
      expect(mockAndroidPermissions.requestPermissions).toHaveBeenCalled();
    });
  });

  describe("downloadContent", () => {
      it("should call startDownload if network type is wifi", async () => {
        // arrange
        const mockIdentifiers = ["do_123"];
        const mockSize = 1024;
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        const mockConnectionType = 'wifi';
        Network.getStatus = jest.fn(() => Promise.resolve({ connected: true, connectionType: mockConnectionType })) as any;
        jest.spyOn(component, "startDownload").mockResolvedValue();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        await component.downloadContent(mockIdentifiers, mockSize);
        // assert
        expect(mockCommonUtilService.networkInfo).toBeTruthy();
        expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      });

      it("should open OfflineConfirmModalComponent if network type is cellular", async () => {
        // arrange
        const mockIdentifiers = ["do_123"];
        const mockSize = 1024;
        mockCommonUtilService.networkInfo = { isNetworkAvailable: true };
        Network.getStatus = jest.fn(() => Promise.resolve({ connected: true, connectionType: "wifi" })) as any;
        mockDialog.open = jest.fn(() => ({
          afterClosed: jest.fn(() => of(true)),
        })) as any;
        jest.spyOn(component, "startDownload").mockResolvedValue();

        // act
        await component.downloadContent(mockIdentifiers, mockSize);

        // assert
      });

      it("should log network unavailable if network is not available", async () => {
        // arrange
        const mockIdentifiers = ["do_123"];
        const mockSize = 1024;
        mockCommonUtilService.networkInfo = { isNetworkAvailable: false };
        jest.spyOn(console, "log");

        // act
        await component.downloadContent(mockIdentifiers, mockSize);

        // assert
        expect(console.log).toHaveBeenCalledWith("Check your network");
      });
  });

  it('should be invoked handleEnrollmentEndDate', () => {
    // arrange
    const mockBatchData = {
      batchEndDate: '2023-12-31', batchEnrollmentEndDate: '2023-12-31'
    };    
    // act    
    const result = component.handleEnrollmentEndDate(mockBatchData);
    // assert
    expect(result).toEqual(true);
  });

  describe("AppTocDesktopComponent Methods", () => {
    describe("setConfirmDialogStatus", () => {
      it("should set contentSvc.showConformation and call detectFramework and openUserWhatsAppOptInModal if conditions are met", async () => {
        // arrange
        const mockPercentage = 100;
        component.content = {
          issueCertification: true,
          identifier: "do_123",
        } as any;
        component.appFramework = "Sphere";
        jest.spyOn(component, "detectFramework").mockResolvedValue();
        jest
          .spyOn(component, "openUserWhatsAppOptInModal")
          .mockImplementation();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

        // act
        await component.setConfirmDialogStatus(mockPercentage);

        // assert
        expect(component.detectFramework).toHaveBeenCalled();
        expect(
          mockTelemetryGeneratorService.generateInteractTelemetry
        ).toHaveBeenCalled();
      });

      it("should not call openUserWhatsAppOptInModal if issueCertification is false", async () => {
        // arrange
        const mockPercentage = 50;
        component.content = {
          issueCertification: false,
          identifier: "do_123",
        } as any;
        jest.spyOn(component, "detectFramework").mockResolvedValue();
        jest
          .spyOn(component, "openUserWhatsAppOptInModal")
          .mockImplementation();
        mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
        // act
        await component.setConfirmDialogStatus(mockPercentage);

        // assert
        expect(component.openUserWhatsAppOptInModal).not.toHaveBeenCalled();
        expect(
          mockTelemetryGeneratorService.generateInteractTelemetry
        ).toHaveBeenCalled();
      });
    });

    describe("getStarImage", () => {
      it("should return full star URL for full stars", () => {
        // arrange
        component.averageRating = 4.5;

        // act
        const result = component.getStarImage(3);

        // assert
        expect(result).toBe("/assets/icons/toc_star.png");
      });

      it("should return half star URL for half stars", () => {
        // arrange
        component.averageRating = 4.5;

        // act
        const result = component.getStarImage(4);

        // assert
        expect(result).toBe("/assets/icons/Half_star1.svg");
      });

      it("should return empty star URL for empty stars", () => {
        // arrange
        component.averageRating = 4.5;

        // act
        const result = component.getStarImage(5);

        // assert
        expect(result).toBe("/assets/icons/empty_star.png");
      });
    });

    describe("generateQuery", () => {
      it("should generate query params for START type", () => {
        // arrange
        component.firstResourceLink = {
          url: "/content",
          queryParams: { key: "value" },
        };
        component.contextId = "context_123";
        component.contextPath = "path_123";

        // act
        const result = component.generateQuery("START");

        // assert
        expect(result).toEqual({
          key: "value",
          viewMode: "START",
          batchId: "batch_123",
          collectionId: "context_123",
          collectionType: "path_123",
        });
      });

      it("should generate query params for RESUME type", () => {
        // arrange
        component.resumeDataLink = {
          url: "/resume",
          queryParams: { key: "value" },
        };
        component.contextId = "context_123";
        component.contextPath = "path_123";

        // act
        const result = component.generateQuery("RESUME");

        // assert
        expect(result).toEqual({
          key: "value",
          viewMode: "RESUME",
          batchId: "batch_123",
          collectionId: "context_123",
          collectionType: "path_123",
        });
      });
    });

    describe("enrollUser", () => {
      it("should enroll user and navigate to the first resource link", async () => {
        // arrange
        const mockBatchData = [
          { courseId: "course_123", batchId: "batch_123" },
        ];
        mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve("Sphere"));
        component.content = { issueCertification: true } as any;
        component.appFramework = "Sphere";
        mockConfigSvc.userProfile = {
          rootOrgId: "rootOrgId",
          userId: "userId",
          userName: "userName",
          phone: '976767898989',
          profileId: "profileId",
        } as any;
        jest.spyOn(component, "detectFramework").mockResolvedValue();
        jest
          .spyOn(component, "openUserWhatsAppOptInModal")
          .mockImplementation();
        mockContentSvc.enrollUserToBatch = jest.fn(() =>
          of({ result: { response: "SUCCESS" } })
        ) as any;
        component.firstResourceLink = { url: "/content", queryParams: {} };
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        mockSnackBar.open = jest.fn(() => ({
          onAction: jest.fn(() => Promise.resolve(true)),
        })) as any;
        const subject = new BehaviorSubject<any>(null)
        mockContentSvc._updateEnrollValue = subject;
        mockContentSvc.callNavigateBatchId = true;
        jest.useFakeTimers();
        // act
        await component.enrollUser(mockBatchData);
        jest.advanceTimersByTime(1000);
        // assert
        expect(component.detectFramework).toHaveBeenCalled();
        expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalled();
        jest.clearAllTimers();
      });

       it("should enroll user and navigate to the first resource link for else part", async () => {
        // arrange
        const mockBatchData = [
          { courseId: "course_123", batchId: "batch_123" },
        ];
        component.resumeDataLink = null;
        mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve("Sphere"));
        component.content = { issueCertification: true } as any;
        component.appFramework = "Sphere";
        mockConfigSvc.userProfile = {
          rootOrgId: "rootOrgId",
          userId: "userId",
          userName: "userName",
          phone: '976767898989',
          profileId: "profileId",
        } as any;
        jest.spyOn(component, "detectFramework").mockResolvedValue();
        jest
          .spyOn(component, "openUserWhatsAppOptInModal")
          .mockImplementation();
        mockContentSvc.enrollUserToBatch = jest.fn(() =>
          of({ result: { response: "SUCCESS" } })
        ) as any;
        component.firstResourceLink = { url: "/content", queryParams: {} };
        mockRouter.navigate = jest.fn(() => Promise.resolve(true));
        mockSnackBar.open = jest.fn(() => ({
          onAction: jest.fn(() => Promise.resolve(true)),
        })) as any;
        const subject = new BehaviorSubject<any>(null)
        mockContentSvc._updateEnrollValue = subject;
        mockContentSvc.callNavigateBatchId = true;
        jest.useFakeTimers();
        // act
        await component.enrollUser(mockBatchData);
        jest.advanceTimersByTime(1000);
        // assert
        expect(component.detectFramework).toHaveBeenCalled();
        expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalled();
        jest.clearAllTimers();
      });

      it("should handle enrollment failure", async () => {
        // arrange
        const mockBatchData = [
          { courseId: "course_123", batchId: "batch_123" },
        ];
        mockContentSvc.enrollUserToBatch = jest.fn(() =>
          of({ result: { response: "FAILURE" } })
        ) as any;

        // act
        await component.enrollUser(mockBatchData);

        // assert
      });
    });
  });

  it('should be open a dailog', () => {
    const content = {
      identifier: 'do_123',
      registrationUrl: 'https://example.com'
    }
    mockCreateBatchDialog.open = jest.fn();
    component.openDialog(content);
    expect(component.createBatchDialog).toBeTruthy();
  })

  it('should open a desktop dialog', () => {
    const content = {
      identifier: 'do_123',
      registrationUrl: 'https://example.com'
    }
    const tocConfig = {
      identifier: 'do_123',
      registrationUrl: 'https://example.com'
    }
    mockDialog.open = jest.fn();
    component.openDetails(content, tocConfig);
    expect(mockDialog.open).toBeTruthy();
  });

  it('should open a competency dialog', () => {
    const content = {
      identifier: 'do_123',
      registrationUrl: 'https://example.com'
    }
    mockDialog.open = jest.fn();
    component.openCompetency(content);
    expect(mockDialog.open).toBeTruthy();
  });

  describe('syncProgress', () => {
    it('should call syncProgress', async() => {
      // Arrange
      component.content = { identifier: 'do_123' } as any;
      mockConfigSvc.userProfile = {
        userId: '123'
      }
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
       component.batchData = {
        enrolled: false,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      };
      mockCourseService.syncCourseProgress = jest.fn(() => of({})) as any;
      mockTelemetryGeneratorService.generateLogEvent = jest.fn();
      mockCommonUtilService.showToast = jest.fn();
      // Act
      await component.syncProgress();
      // Assert
      expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
      expect(mockCourseService.syncCourseProgress).toHaveBeenCalled();
      expect(mockTelemetryGeneratorService.generateLogEvent).toHaveBeenCalled();
    });

    it('should call syncProgress and handle error part', async() => {
      // Arrange
      component.content = { identifier: 'do_123' } as any;
      mockConfigSvc.userProfile = {
        userId: '123'
      }
      const dismissFn = jest.fn(() => Promise.resolve());
      const presentFn = jest.fn(() => Promise.resolve());
      mockCommonUtilService.getLoader = jest.fn(() => ({
        present: presentFn,
        dismiss: dismissFn,
      }));
       component.batchData = {
        enrolled: false,
        batchId: 'batch_123',
        content: [
          {
            identifier: 'do_123',
            downloadUrl: 'https://example.com/download',
            mimeType: 'application/pdf',
            destinationFolder: 'downloads',
            filename: 'file.pdf',
            courseId: 'do_123',
            batchId: 'batch_123',
          },
        ]
      };
      mockCourseService.syncCourseProgress = jest.fn(() => throwError({})) as any;
      mockTelemetryGeneratorService.generateLogEvent = jest.fn();
      mockCommonUtilService.showToast = jest.fn();
      // Act
      await component.syncProgress();
      // Assert
      expect(mockCommonUtilService.getLoader).toHaveBeenCalled();
      expect(mockCourseService.syncCourseProgress).toHaveBeenCalled();
      expect(mockTelemetryGeneratorService.generateLogEvent).toHaveBeenCalled();
    });
  })

  describe('ngOnChanges', () => {
    it('should call detectFramework and set showIntranetMessage', () => {
      // Arrange
      component.content = { identifier: 'do_123', registrationUrl: 'https://example.com' } as any;
      component.showIntranetMessage = false;
      component.forPreview = false;
      component.resumeData = [{}] as any;
      jest.spyOn(component, 'detectFramework').mockResolvedValue();
      jest.spyOn(component, 'showIntranetMsg', 'get').mockReturnValue(true);
      mockSanitizer.bypassSecurityTrustStyle =  jest.fn();
      mockTocSvc.fetchExternalContentAccess = jest.fn(() => of({hasAccess: true})) as any;
      mockContentRatingSvc.getSearchResultsByIds = jest.fn(() => of({
        result: {
          content: [{ averageRating: 4.5, totalNumberOfRatings: 10 }]
        }
      })) as any;
      mockTocSvc.filterToc = jest.fn();
      mockContentSvc.getFirstChildInHierarchy = jest.fn(() => ({
        identifier: 'do_123',
        mimeType: 'application/pdf',
        contentType: NsContent.EContentTypes.COLLECTION,
        children: [
          {
            identifier: 'do_456',
            mimeType: 'application/pdf',
            contentType: NsContent.EContentTypes.COLLECTION,
          }
        ] 
      })) as any;
      component.batchControl = { valueChanges: of({ subscribe: jest.fn() }) } as any;
      mockContentSvc.enrollUserToBatch = jest.fn(() => of({ result: { response: 'SUCCESS' } })) as any;
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockTranslate.instant = jest.fn(() => 'translated string') as any;
      mockSnackBar.open = jest.fn(() => ({
        onAction: jest.fn(() => of({})),
      })) as any;
      // Act
      component.ngOnChanges();

      // Assert
      expect(component.showIntranetMsg).toBe(true);
      expect(component.externalContentFetchStatus).toBe('done');
      expect(component.registerForExternal).toBeTruthy();
      expect(mockContentRatingSvc.getSearchResultsByIds).toHaveBeenCalled();
      expect(mockTocSvc.fetchExternalContentAccess).toHaveBeenCalled();
      expect(mockTocSvc.filterToc).toHaveBeenCalled();
      expect(mockContentSvc.getFirstChildInHierarchy).toHaveBeenCalled();
      expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(mockTranslate.instant).toHaveBeenCalled();
    }
    );
    it('should not call detectFramework if content is not defined', () => {
      // Arrange
      component.content = { identifier: 'do_123', registrationUrl: 'https://example.com' } as any;
      component.showIntranetMessage = false;
      component.forPreview = false;
      component.resumeData = [{}] as any;
      jest.spyOn(component, 'detectFramework').mockResolvedValue();
      jest.spyOn(component, 'showIntranetMsg', 'get').mockReturnValue(true);
      mockSanitizer.bypassSecurityTrustStyle =  jest.fn();
      mockTocSvc.fetchExternalContentAccess = jest.fn(() => of({hasAccess: true})) as any;
      mockContentRatingSvc.getSearchResultsByIds = jest.fn(() => of({
        result: {
          content: [{ averageRating: 4.5, totalNumberOfRatings: 10 }]
        }
      })) as any;
      mockTocSvc.filterToc = jest.fn();
      mockContentSvc.getFirstChildInHierarchy = jest.fn(() => ({
        identifier: 'do_123',
        mimeType: 'application/pdf',
        contentType: NsContent.EContentTypes.COLLECTION,
        children: [
          {
            identifier: 'do_456',
            mimeType: 'application/pdf',
            contentType: NsContent.EContentTypes.COLLECTION,
          }
        ] 
      })) as any;
      component.batchControl = { valueChanges: of({ subscribe: jest.fn() }) } as any;
      mockContentSvc.enrollUserToBatch = jest.fn(() => of({ result: { response: 'failed' } })) as any;
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockTranslate.instant = jest.fn(() => 'translated string') as any;
      mockSnackBar.open = jest.fn(() => ({
        onAction: jest.fn(() => of({})),
      })) as any;
      // Act
      component.ngOnChanges();

      // Assert
      expect(component.showIntranetMsg).toBe(true);
      expect(component.externalContentFetchStatus).toBe('done');
      expect(component.registerForExternal).toBeTruthy();
      expect(mockContentRatingSvc.getSearchResultsByIds).toHaveBeenCalled();
      expect(mockTocSvc.fetchExternalContentAccess).toHaveBeenCalled();
      expect(mockTocSvc.filterToc).toHaveBeenCalled();
      expect(mockContentSvc.getFirstChildInHierarchy).toHaveBeenCalled();
      expect(mockContentSvc.enrollUserToBatch).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(mockTranslate.instant).toHaveBeenCalled();
    }
    );
    it('should not set showIntranetMessage if content is not defined', () => {
      // Arrange
      component.content = null;
      component.showIntranetMessage = false;

      // Act
      component.ngOnChanges();

      // Assert
      expect(component.showIntranetMessage).toBe(false);
    }
    );
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
    component.routerParamSubscription = { unsubscribe: jest.fn() } as any;
    component.routeSubscription = { unsubscribe: jest.fn() } as any;
  });
    it('should unsubscribe from batchControl valueChanges', async() => {
      // Arrange
      component.batchControl = { valueChanges: of({ subscribe: jest.fn() }) } as any;
      mockEvent.unsubscribe = jest.fn();
      const subject = new BehaviorSubject<any>(null)
      mockContentSvc._updateEnrollValue = subject;
      // Act
      await component.ngOnDestroy();
      // Assert
      expect(mockEvent.unsubscribe).toHaveBeenCalled();
    });
  }
  );

  it('should be invoked playIntroVideo', () => {
    // arrange
    component.content = {
      identifier: 'do_123',
      introVideoUrl: 'https://example.com/video.mp4',
      contentType: 'Course',
      mimeType: 'application/vnd.ekstep.content-collection',
      appIcon: 'https://example.com/icon.png',
      appName: 'Test App',
      appDescription: 'Test Description',
    } as any;
    mockDialog.open = jest.fn(() => {
      return {
        afterClosed: jest.fn(() => of(true)),
      } as any;
    });
    // act
    component.playIntroVideo();
    // assert
    expect(mockDialog.open).toHaveBeenCalledWith(AppTocDialogIntroVideoComponent, {
      data: undefined,
      height: '350px',
      width: '620px',
    });
  });

  describe('sanitizedIntroductoryVideoIcon', () => {
    it('should return sanitized URL', () => {
      // Arrange
      const url = 'https://example.com/icon.png';
      mockSanitizer.bypassSecurityTrustStyle = jest.fn(() => url);
      component.content = {
        appIcon: url,
        introductoryVideoIcon: url
      } as any;

      // Act
      const result = component.sanitizedIntroductoryVideoIcon;

      // Assert
      expect(result).toBe(url);
    });
    it('should return null if appIcon is not defined', () => {
      // Arrange
      component.content = {
        appIcon: null,
      } as any;

      // Act
      const result = component.sanitizedIntroductoryVideoIcon;

      // Assert
      expect(result).toBe(null);
    });
  });

  describe('getRatingIcon', () =>{
    it('should return rating icon', () => {
      // Arrange
      component.content = {
        averageRating: 4,
        totalRating: 10,
        identifier: 'do_123',
        contentType: 'Course',
        mimeType: 'application/vnd.ekstep.content-collection',
        appIcon: 'https://example.com/icon.png',
        appName: 'Test App',
        appDescription: 'Test Description',
      } as any;
      // Act
      const result = component.getRatingIcon(4.65);
      // Assert
      expect(result).toBe('star_border');
    });

    it('should return star rating icon', () => {
      // Arrange
      component.content = {
        averageRating: 4,
        totalRating: 10,
        identifier: 'do_123',
        contentType: 'Course',
        mimeType: 'application/vnd.ekstep.content-collection',
        appIcon: 'https://example.com/icon.png',
        appName: 'Test App',
        appDescription: 'Test Description',
      } as any;
      // Act
      const result = component.getRatingIcon(3);
      // Assert
      expect(result).toBe('star');
    });

    it('should return half star rating icon', () => {
      // Arrange
      component.content = {
        averageRating: 4.9,
        totalRating: 10,
        identifier: 'do_123',
        contentType: 'Course',
        mimeType: 'application/vnd.ekstep.content-collection',
        appIcon: 'https://example.com/icon.png',
        appName: 'Test App',
        appDescription: 'Test Description',
      } as any;
      // Act
      const result = component.getRatingIcon(5);
      // Assert
      expect(result).toBe('star_half');
    });
  })
});
