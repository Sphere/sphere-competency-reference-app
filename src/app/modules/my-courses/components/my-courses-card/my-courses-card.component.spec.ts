import { Router } from "@angular/router";
import { UserService } from "../../../../../app/modules/home/services/user.service";
import { ConfigurationsService } from "../../../../../library/ws-widget/utils/src/public-api";
import { CommonUtilService } from "../../../../../services/common-util.service";
import { MyCoursesCardComponent } from "./my-courses-card.component";

describe("MyCoursesCardComponent", () => {
  let component: MyCoursesCardComponent;

  const router: Partial<Router> = {};
  const configSvc: Partial<ConfigurationsService> = {};
  const userHomeSvc: Partial<UserService> = {};
  const commonUtilService: Partial<CommonUtilService> = {};

  beforeAll(() => {
    component = new MyCoursesCardComponent(
      router as Router,
      configSvc as ConfigurationsService,
      userHomeSvc as UserService,
      commonUtilService as CommonUtilService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a instance of component", () => {
    expect(component).toBeTruthy();
  });

  it("should navigate to TOC page if user has DOB", async () => {
    const contentIdentifier = "testContentId";
    userHomeSvc.userRead = jest.fn().mockResolvedValue({});
    router.navigate = jest.fn(() => Promise.resolve(true));
    commonUtilService.addLoader = jest.fn(() => Promise.resolve());
    commonUtilService.removeLoader = jest.fn(() => Promise.resolve());
    configSvc.unMappedUser = {
      profileDetails: {
        profileReq: {
          personalDetails: {
            dob: "1990-01-01",
          },
        },
      },
    };
    //act
    await component.navigateToToc(contentIdentifier);
    //assert
    expect(commonUtilService.addLoader).toHaveBeenCalled();
    expect(commonUtilService.removeLoader).toHaveBeenCalled();
    expect(commonUtilService.addLoader).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenCalledWith(
      [`/app/toc/${contentIdentifier}/overview`],
      { replaceUrl: true }
    );
    expect(userHomeSvc.userRead).toHaveBeenCalled();
  });

  it("should not navigate to TOC page if user does not have DOB", async () => {
    const contentIdentifier = "testContentId";
    userHomeSvc.userRead = jest.fn().mockResolvedValue({});
    router.navigate = jest.fn(() => Promise.resolve(true));
    commonUtilService.addLoader = jest.fn(() => Promise.resolve());
    commonUtilService.removeLoader = jest.fn(() => Promise.resolve());
    configSvc.unMappedUser = {
      profileDetails: {
        profileReq: {
          personalDetails: {
            dob: undefined,
          },
        },
      },
    };
    //act
    await component.navigateToToc(contentIdentifier);
    //assert
    expect(commonUtilService.addLoader).toHaveBeenCalled();
    expect(commonUtilService.removeLoader).toHaveBeenCalled();
    expect(commonUtilService.addLoader).toHaveBeenCalledTimes(2);
    expect(router.navigate).toHaveBeenCalledWith([`/app/about-you`], {
      queryParams: {
        redirect: "/app/toc/testContentId/overview",
      },
    });
    expect(userHomeSvc.userRead).toHaveBeenCalled();
  });

  it("should invoke ngOnInit", () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
});
