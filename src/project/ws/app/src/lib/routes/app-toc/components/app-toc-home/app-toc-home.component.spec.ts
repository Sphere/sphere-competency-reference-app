import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  WidgetContentService,
  WidgetUserService,
} from "../../../../../../../../../library/ws-widget/collection/src/public-api";
import {
  LoggerService,
  ConfigurationsService,
} from "../../../../../../../../../library/ws-widget/utils/src/public-api";
import { AppTocService } from "../../services/app-toc.service";
import { AppTocHomeComponent } from "./app-toc-home.component";
import { AccessControlService } from "../../../../../../../../ws/author/src/public-api";
import { BehaviorSubject, of, ReplaySubject, throwError } from "rxjs";
import { NsAppToc } from "../../models/app-toc.model";
import { error } from "console";

jest.mock("ngx-extended-pdf-viewer", () => ({
  NgxExtendedPdfViewerComponent: () => "MockPdfViewerComponent",
}));

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  NgModule: () => (target) => target,
}));

describe("AppTocHomeComponent", () => {
  let appTocHomeComponent: AppTocHomeComponent;

  const mockcontentService: Partial<WidgetContentService> = {};
  const mockroute: Partial<ActivatedRoute> = {
    queryParamMap: of({
      params: {
        isAsha: "true",
        courseid: "do_123",
        batchId: "123",
        levelId: "1",
      } as any,
    }) as any,
    snapshot: {
      data: {
        pageData: {
          data: {
            analytics: {
              enabled: true,
            },
          },
        },
      },
    } as any,
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
  };
  const mockrouter: Partial<Router> = {};
  const mockuserSvc: Partial<WidgetUserService> = {};
  const mocktocSvc: Partial<AppTocService> = {};
  const mockloggerSvc: Partial<LoggerService> = {};
  const mockconfigSvc: Partial<ConfigurationsService> = {
    userProfile: {
      profile: {
        firstName: "test",
        lastName: "test",
      },
      userId: "uid-1",
    } as any,
    nodebbUserProfile: {
      username: "test",
      email: "test@test.com",
    },
  };
  const mockdomSanitizer: Partial<DomSanitizer> = {};
  const mockauthAccessControlSvc: Partial<AccessControlService> = {};

  beforeAll(() => {
    appTocHomeComponent = new AppTocHomeComponent(
      mockroute as ActivatedRoute,
      mockrouter as Router,
      mockcontentService as WidgetContentService,
      mockuserSvc as WidgetUserService,
      mocktocSvc as AppTocService,
      mockloggerSvc as LoggerService,
      mockconfigSvc as ConfigurationsService,
      mockdomSanitizer as DomSanitizer,
      mockauthAccessControlSvc as AccessControlService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create an instance of AppTocHomeComponent", () => {
    expect(appTocHomeComponent).toBeTruthy();
  });

  it("should return enableAnalytics as false if restrictedFeatures is not set", () => {
    (appTocHomeComponent as any).configSvc.restrictedFeatures = undefined;
    expect(appTocHomeComponent.enableAnalytics).toBe(false);
  });

  it("should return enableAnalytics as true if restrictedFeatures does not have tocAnalytics", () => {
    (appTocHomeComponent as any).configSvc.restrictedFeatures = new Set([
      "somethingElse",
    ]);
    expect(appTocHomeComponent.enableAnalytics).toBe(true);
  });

  it("should return enableAnalytics as false if restrictedFeatures has tocAnalytics", () => {
    (appTocHomeComponent as any).configSvc.restrictedFeatures = new Set([
      "tocAnalytics",
    ]);
    expect(appTocHomeComponent.enableAnalytics).toBe(false);
  });

  it("should set sticky to true or false based on scroll position", () => {
    appTocHomeComponent.elementPosition = 200;
    Object.defineProperty(window, "pageYOffset", {
      value: 150,
      writable: true,
    });
    appTocHomeComponent.handleScroll();
    expect(appTocHomeComponent.sticky).toBe(true);
    Object.defineProperty(window, "pageYOffset", { value: 50, writable: true });
    appTocHomeComponent.handleScroll();
    expect(appTocHomeComponent.sticky).toBe(false);
  });

  it("should return true for valid JSON string in checkJson", () => {
    expect(appTocHomeComponent.checkJson('{"a":1}')).toBe(true);
  });

  it("should return false for invalid JSON string in checkJson", () => {
    expect(appTocHomeComponent.checkJson("{a:1}")).toBe(false);
  });

  describe("toggleComponent", () => {
    it("should navigate to overview page", () => {
      // arrange
      const cname = "overview";
      mocktocSvc._showComponent = new BehaviorSubject<any>(null);
      // act
      appTocHomeComponent.toggleComponent(cname);
      // assert
      expect(appTocHomeComponent.routelinK).toBe(cname);
    });

    it("should navigate to contents page", () => {
      // arrange
      const cname = "contents";
      mocktocSvc._showComponent = new BehaviorSubject<any>(null);
      // act
      appTocHomeComponent.toggleComponent(cname);
      // assert
      expect(appTocHomeComponent.routelinK).toBe(cname);
    });

    it("should navigate to license page", () => {
      // arrange
      const cname = "license";
      // act
      appTocHomeComponent.toggleComponent(cname);
      // assert
      expect(appTocHomeComponent.routelinK).toBe(cname);
    });
  });

  describe("checkRoute", () => {
    it("should set currentFragment", () => {
      // arrange
      mockroute.fragment = of("license");
      jest.spyOn(appTocHomeComponent, "toggleComponent").mockReturnValue();
      // act
      appTocHomeComponent.checkRoute();
      // assert
      expect(appTocHomeComponent.currentFragment).toBe("overview");
    });

    it("should set for overview", () => {
      // arrange
      Object.defineProperty(mockrouter, "url", {
        get: () => "/app-toc/overview",
        configurable: true,
      });
      jest.spyOn(appTocHomeComponent, "toggleComponent").mockReturnValue();
      // act
      appTocHomeComponent.checkRoute();
      // assert
      expect(appTocHomeComponent.currentFragment).toBe("overview");
    });

    it("should set for contents", () => {
      // arrange
      Object.defineProperty(mockrouter, "url", {
        get: () => "/app-toc/contents",
        configurable: true,
      });
      jest.spyOn(appTocHomeComponent, "toggleComponent").mockReturnValue();
      // act
      appTocHomeComponent.checkRoute();
      // assert
      expect(appTocHomeComponent.currentFragment).toBe("overview");
    });
  });

  describe("ngOnInit", () => {
    it("should set tocConfig for textbook", () => {
      //arrange
      jest.spyOn(appTocHomeComponent, "checkRoute").mockReturnValue();
      mockroute.data = of({
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
            subtitleOnBanners: true,
            showDescription: "true",
          },
        },
        content: {
          data: {
            creatorDetails: JSON.stringify({
              firstName: "test",
              lastName: "test",
            }),
            reviewer: JSON.stringify({
              firstName: "test",
              lastName: "test",
            }),
          },
        },
      }) as any;
      (mockroute.fragment = of("overview")),
        (mocktocSvc.initData = jest.fn(() => ({
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
        })) as any);
      mocktocSvc.batchReplaySubject = new ReplaySubject(1);
      mocktocSvc.batchReplaySubject.next({ data: "data" });
      mockcontentService.fetchContentHistoryV2 = jest.fn(() =>
        of({
          result: {
            contentList: [
              {
                identifier: "do_123",
                name: "test",
                appIcon: "assets/app-icon.png",
                description: "test",
                pkgVersion: "1.0",
                status: "Live",
                size: "12MB",
                owner: "owner",
                completionPercentage: 50,
              },
            ],
          },
        })
      ) as any;
      mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
      //act
      appTocHomeComponent.ngOnInit();
      //assert
      expect(appTocHomeComponent.banners).toBeTruthy();
      expect(appTocHomeComponent.tocConfig).toBeTruthy();
      expect(appTocHomeComponent.currentFragment).toBe("overview");
      expect(mocktocSvc.initData).toHaveBeenCalled();
    });

    it("should set tocConfig for course", () => {
      //arrange
      jest.spyOn(appTocHomeComponent, "checkRoute").mockReturnValue();
      mockroute.data = of({
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
            subtitleOnBanners: true,
            showDescription: "true",
          },
        },
        content: {
          data: undefined,
        },
      }) as any;
      (mockroute.fragment = of("overview")),
        (mocktocSvc.initData = jest.fn(() => ({
          content: {
            identifier: "do_123",
            name: "test",
            primaryCategory: "Course",
            completionPercentage: 80,
            children: [
              {
                identifier: "do_234",
                mimeType: "application/vnd.ekstep.content-collection",
                name: "test",
              },
            ],
          },
          errorCode: NsAppToc.EWsTocErrorCode.INVALID_DATA,
        })) as any);
      mockrouter.navigate = jest.fn(() => Promise.resolve(true));
      jest
        .spyOn(window.localStorage.__proto__, "getItem")
        .mockReturnValue("/app/toc");
      mocktocSvc.batchReplaySubject = new ReplaySubject(1);
      mocktocSvc.batchReplaySubject.next({ data: "data" });
      mockcontentService.fetchCourseBatches = jest.fn(() =>
        of({
          content: [
            {
              batchId: "batchId",
              createdBy: "test-creator",
              endDate: "2025-10-10",
              enrollmentType: "open",
              identifier: "do_123",
              name: "test-course",
              startDate: "2020-10-10",
              status: "live",
            },
          ],
          count: 1,
          enrolled: true,
        })
      ) as any;
      mockcontentService.fetchContentHistoryV2 = jest.fn(() =>
        of({
          result: {
            contentList: [
              {
                identifier: "do_123",
                name: "test",
                appIcon: "assets/app-icon.png",
                description: "test",
                pkgVersion: "1.0",
                status: "Live",
                size: "12MB",
                owner: "owner",
                completionPercentage: 50,
              },
            ],
          },
        })
      ) as any;
      mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
      mockuserSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseName: "test",
            identifier: "do_123",
            courseId: "do_123",
            batchId: "do_123",
            batchName: "test",
            primaryCategory: "Course",
            contentId: "do_123",
            content: {
              identifier: "do_123",
              name: "test",
              primaryCategory: "Course",
              children: [
                {
                  identifier: "do_234",
                  mimeType: "application/vnd.ekstep.content-collection",
                  name: "test",
                },
              ],
            },
          },
        ])
      ) as any;
      //act
      appTocHomeComponent.ngOnInit();
      //assert
      expect(appTocHomeComponent.banners).toBeTruthy();
      expect(appTocHomeComponent.tocConfig).toBeTruthy();
      expect(appTocHomeComponent.currentFragment).toBe("overview");
      expect(mocktocSvc.initData).toHaveBeenCalled();
    });

    it("should set tocConfig for course and local storage is undefined", () => {
      //arrange
      jest.spyOn(appTocHomeComponent, "checkRoute").mockReturnValue();
      mockroute.data = of({
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
            subtitleOnBanners: true,
            showDescription: "true",
          },
        },
        content: {
          data: undefined,
        },
      }) as any;
      (mockroute.fragment = of("overview")),
        (mocktocSvc.initData = jest.fn(() => ({
          content: {
            identifier: "do_123",
            name: "test",
            primaryCategory: "Course",
            completionPercentage: 80,
            children: [
              {
                identifier: "do_234",
                mimeType: "application/vnd.ekstep.content-collection",
                name: "test",
              },
            ],
          },
          errorCode: NsAppToc.EWsTocErrorCode.NO_DATA,
        })) as any);
      mockrouter.navigate = jest.fn(() => Promise.resolve(true));
      jest
        .spyOn(window.localStorage.__proto__, "getItem")
        .mockReturnValue(undefined);
      mocktocSvc.batchReplaySubject = new ReplaySubject(1);
      mocktocSvc.batchReplaySubject.next({ data: "data" });
      mockcontentService.fetchCourseBatches = jest.fn(() =>
        throwError({
          error: {
            params: {
              errorCode: NsAppToc.EWsTocErrorCode.NO_DATA,
            },
          },
        })
      );
      mockcontentService.fetchContentHistoryV2 = jest.fn(() =>
        of({
          result: {
            contentList: [
              {
                identifier: "do_123",
                name: "test",
                appIcon: "assets/app-icon.png",
                description: "test",
                pkgVersion: "1.0",
                status: "Live",
                size: "12MB",
                owner: "owner",
                completionPercentage: 50,
              },
            ],
          },
        })
      ) as any;
      mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
      mockuserSvc.fetchUserBatchList = jest.fn(() =>
        of([
          {
            courseName: "test",
            identifier: "do_123",
            courseId: "do_123",
            batchId: "do_123",
            batchName: "test",
            primaryCategory: "Course",
            contentId: "do_123",
            content: {
              identifier: "do_123",
              name: "test",
              primaryCategory: "Course",
              children: [
                {
                  identifier: "do_234",
                  mimeType: "application/vnd.ekstep.content-collection",
                  name: "test",
                },
              ],
            },
            batch: {
              batchId: "do_123",
              batchName: "test",
            },
          },
        ])
      ) as any;
      //act
      appTocHomeComponent.ngOnInit();
      //assert
      expect(appTocHomeComponent.banners).toBeTruthy();
      expect(appTocHomeComponent.tocConfig).toBeTruthy();
      expect(appTocHomeComponent.currentFragment).toBe("overview");
      expect(mocktocSvc.initData).toHaveBeenCalled();
    });

    it("should set tocConfig for course and default value", () => {
      //arrange
      jest.spyOn(appTocHomeComponent, "checkRoute").mockReturnValue();
      mockroute.data = of({
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
            subtitleOnBanners: true,
            showDescription: "true",
          },
        },
        content: {
          data: undefined,
        },
      }) as any;
      (mockroute.fragment = of("overview")),
        (mocktocSvc.initData = jest.fn(() => ({
          content: {
            identifier: "do_123",
            name: "test",
            primaryCategory: "Course",
            completionPercentage: 80,
            children: [
              {
                identifier: "do_234",
                mimeType: "application/vnd.ekstep.content-collection",
                name: "test",
              },
            ],
          },
          errorCode: undefined,
        })) as any);
      mockrouter.navigate = jest.fn(() => Promise.resolve(true));
      jest
        .spyOn(window.localStorage.__proto__, "getItem")
        .mockReturnValue(undefined);
      mocktocSvc.batchReplaySubject = new ReplaySubject(1);
      mocktocSvc.batchReplaySubject.next({ data: "data" });
      mockcontentService.fetchContentHistoryV2 = jest.fn(() =>
        throwError({
          error: {
            params: {
              errorCode: NsAppToc.EWsTocErrorCode.NO_DATA,
            },
          },
        })
      ) as any;
      mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
      mockuserSvc.fetchUserBatchList = jest.fn(() =>
        throwError({
          error: {
            params: {
              errorCode: NsAppToc.EWsTocErrorCode.NO_DATA,
            },
          },
        })
      );
      //act
      appTocHomeComponent.ngOnInit();
      //assert
      expect(appTocHomeComponent.banners).toBeTruthy();
      expect(appTocHomeComponent.tocConfig).toBeTruthy();
      expect(appTocHomeComponent.currentFragment).toBe("overview");
      expect(mocktocSvc.initData).toHaveBeenCalled();
    });
  });

  it("should be redirectTo", () => {
    // arrange
    appTocHomeComponent.routelinK = "discuss";
    appTocHomeComponent.loadDiscussionWidget = true;
    mocktocSvc._showComponent = new BehaviorSubject<any>(null);
    // act
    appTocHomeComponent.redirectTo();
    // assert
    expect(appTocHomeComponent.routelinK).toBe("discuss");
    expect(appTocHomeComponent.loadDiscussionWidget).toBe(true);
  });

  it("should unsubscribe routeSubscription on ngOnDestroy", () => {
    const unsubscribeMock = jest.fn();
    appTocHomeComponent.routeSubscription = {
      unsubscribe: unsubscribeMock,
    } as any;
    appTocHomeComponent.ngOnDestroy();
    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
