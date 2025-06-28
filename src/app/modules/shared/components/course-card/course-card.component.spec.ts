import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { CardComponent } from "./course-card.component";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { RouterTestingModule } from "@angular/router/testing";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { of, Subject } from "rxjs";
import { ConfigurationsService } from "../../../../../library/ws-widget/utils/src/public-api";
import { RouterLinks } from "../../../../../app/app.constant";
import { CommonUtilService } from "../../../../../services/common-util.service";
import { UserService } from "../../../../../app/modules/home/services/user.service";
import { LocalStorageService } from "../../../../../app/manage-learn/core";
import { EventEmitter } from "@angular/core";

describe("CourseCardComponent", () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let mockConfigSvc: Partial<ConfigurationsService>;
  let mockCommonUtilService: Partial<CommonUtilService>;
  let mockUserService: Partial<UserService>;
  let mockLocalStorageService: Partial<LocalStorageService>;

  beforeEach(() => {
    mockConfigSvc = {
      unMappedUser: {
        id: "123",
        profileDetails: {
          profileReq: { personalDetails: { dob: "1990-01-01" } },
        },
      },
    };
    mockCommonUtilService = {
      isTablet: jest.fn().mockResolvedValue(false),
      removeLoader: jest.fn(),
      addLoader: jest.fn(),
    };
    mockUserService = {
      userRead: jest.fn().mockResolvedValue({}),
    };
    mockLocalStorageService = {
      setLocalStorage: jest.fn(),
    };

    component = new CardComponent(
      mockConfigSvc as ConfigurationsService,
      {} as any, // Add the missing arguments here
      mockUserService as unknown as UserService,
      mockCommonUtilService as CommonUtilService,
      new Title({}),
      {} as any, // Add the missing arguments here
      {} as any // Add the missing arguments here
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize isTablet on ngOnInit", async () => {
    await component.ngOnInit();
    expect(component.isTablet).toBe(false);
  });

  // Component initializes with default properties and checks if device is tablet
  it("should initialize with default properties and check tablet device", async () => {
    const mockCommonUtilService: Partial<CommonUtilService> = {
      isTablet: jest.fn().mockResolvedValue(true),
      removeLoader: jest.fn(),
      addLoader: jest.fn(),
      // Add other required properties here
    };

    const component = new CardComponent(
      {} as ConfigurationsService,
      {} as Router,
      {} as UserService,
      mockCommonUtilService as any,
      {} as Title,
      {} as LocalStorageService,
      {} as MatDialog
    );

    await component.ngOnInit();

    expect(component.isTablet).toBe(true);
    expect(mockCommonUtilService.isTablet).toHaveBeenCalled();
  });
  // Navigation to TOC overview page with course data when user is mapped
  it("should navigate to TOC overview when user is mapped", async () => {
    const mockRouter = {
      navigate: jest.fn(),
    };
    const mockConfigSvc = {
      unMappedUser: null,
    };
    const mockLocalStorageService = {
      setLocalStorage: jest.fn(),
    };
    const mockTitleService = {
      setTitle: jest.fn(),
    };
    const mockCommonUtilService = {
      isTablet: jest.fn().mockResolvedValue(false),
      removeLoader: jest.fn(),
      addLoader: jest.fn(),
    };
    const component = new CardComponent(
      mockConfigSvc as ConfigurationsService,
      mockRouter as any,
      {} as UserService,
      mockCommonUtilService as any,
      mockTitleService as any,
      mockLocalStorageService as any,
      {} as MatDialog
    );

    component.courseData = {
      identifier: "123",
      name: "Test Course",
    };

    await component.navigateToToc("123");

    expect(mockTitleService.setTitle).toHaveBeenCalledWith(
      "Test Course - Aastrika"
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [RouterLinks.PUBLIC_TOC_OVERVIEW],
      {
        state: { tocData: component.courseData },
        queryParams: { courseId: "123" },
      }
    );
  });
  // Navigation to TOC overview page with course data when user is unmapped but has DOB
  it("should navigate to TOC overview when unmapped user has DOB", async () => {
    const mockRouter = {
      navigate: jest.fn(),
    };
    const mockConfigSvc = {
      unMappedUser: {
        id: "123",
        profileDetails: {
          profileReq: {
            personalDetails: {
              dob: "1990-01-01",
            },
          },
        },
      },
    };
    const mockCommonUtilService = {
      isTablet: jest.fn().mockResolvedValue(false),
      removeLoader: jest.fn(),
      addLoader: jest.fn(),
    };
    const mockUserService = {
      userRead: jest.fn().mockResolvedValue({}),
    };

    const component = new CardComponent(
      mockConfigSvc as ConfigurationsService,
      mockRouter as any,
      mockUserService as any,
      mockCommonUtilService as any,
      {} as Title,
      {} as LocalStorageService,
      {} as MatDialog
    );

    await component.navigateToToc("123");

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ["/app/toc/123/overview"],
      {
        state: component.courseData,
        replaceUrl: true,
      }
    );
  });
  // Dialog closes without emitting when not confirmed
  it("should close dialog without emitting when not confirmed", () => {
    const mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of({ event: "NO" }),
      }),
    };

    const component = new CardComponent(
      {} as ConfigurationsService,
      {} as Router,
      {} as UserService,
      {} as CommonUtilService,
      {} as Title,
      {} as LocalStorageService,
      mockDialog as any
    );

    const emitSpy = jest.spyOn(component.clickEvent, "emit");

    component.onAction({}, "test");

    expect(mockDialog.open).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });
  // Navigation redirects to about page when unmapped user has no DOB
  it("should redirect to about page when unmapped user has no DOB", async () => {
    const mockRouter = {
      navigate: jest.fn(),
    };
    const mockConfigSvc = {
      unMappedUser: {
        id: "123",
        profileDetails: {
          profileReq: {
            personalDetails: {},
          },
        },
      },
    };
    const mockCommonUtilService = {
      isTablet: jest.fn().mockResolvedValue(false),
      removeLoader: jest.fn(),
      addLoader: jest.fn(),
    };
    const mockUserService = {
      userRead: jest.fn().mockResolvedValue({}),
    };

    const component = new CardComponent(
      mockConfigSvc as ConfigurationsService,
      mockRouter as unknown as Router,
      mockUserService as unknown as UserService,
      mockCommonUtilService as any,
      {} as Title,
      {} as LocalStorageService,
      {} as MatDialog
    );

    await component.navigateToToc("123");

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [`/${RouterLinks.ABOUT_YOU}`],
      {
        queryParams: { redirect: "/app/toc/123/overview" },
      }
    );
  });
  // Dialog closes without emitting when not confirmed
  it("should close dialog without emitting when not confirmed", () => {
    const mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of({ event: "NO" }),
      }),
    };
    const mockCommonUtilService = {
      isTablet: jest.fn().mockResolvedValue(false),
      removeLoader: jest.fn(),
      addLoader: jest.fn(),
    };
    const component = new CardComponent(
      {} as ConfigurationsService,
      {} as Router,
      {} as UserService,
      mockCommonUtilService as any,
      {} as Title,
      {} as LocalStorageService,
      mockDialog as any
    );

    const emitSpy = jest.spyOn(component.clickEvent, "emit");

    component.onAction({}, "test");

    expect(mockDialog.open).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });
  // Successfully navigates to TOC page when user has DOB defined
  it("should navigate to TOC page when user has DOB defined", async () => {
    const mockRouter = { navigate: jest.fn() };
    const mockUserService = { userRead: jest.fn() };
    const mockConfigService = {
      unMappedUser: {
        id: "123",
        profileDetails: {
          profileReq: { personalDetails: { dob: "1990-01-01" } },
        },
      },
    };

    const mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of({ event: "NO" }),
      }),
    };
    const mockCommonUtilService = {
      isTablet: jest.fn().mockResolvedValue(false),
      removeLoader: jest.fn(),
      addLoader: jest.fn(),
    };
    const component = new CardComponent(
      mockConfigService as any,
      mockRouter as any,
      mockUserService as any,
      mockCommonUtilService as any,
      {} as Title,
      {} as LocalStorageService,
      mockDialog as any
    );

    mockUserService.userRead.mockResolvedValue({});

    await component.mycourseNavigateToToc("CONTENT_123");

    expect(mockCommonUtilService.addLoader).toHaveBeenCalled();
    expect(mockCommonUtilService.removeLoader).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ["/app/toc/CONTENT_123/overview"],
      { replaceUrl: true }
    );
  });
  it("should emit clickEvent when dialog returns YES", () => {
   
    const mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of({ event: "YES" }),
      }),
    };
    const mockRouter = { navigate: jest.fn() };
    const component = new CardComponent(
      mockConfigSvc as any,
      mockRouter as any,
      mockUserService as any,
      mockCommonUtilService as any,
      {} as Title,
      {} as LocalStorageService,
      mockDialog as any
    );
    component.clickEvent = new EventEmitter();
    const emitSpy = jest.spyOn(component.clickEvent, "emit");
    const testData = { id: 1 };
    const testAction = "delete";

    component.onAction(testData, testAction);

    expect(emitSpy).toHaveBeenCalledWith({
      action: testAction,
      data: testData,
    });
  });
});
