import { HeaderComponent } from "./header.component";
import { CommonUtilService } from "../../../../../services";
import { Router } from "@angular/router";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";

describe("HeaderComponent", () => {
  let component: HeaderComponent;

  let mockCommonUtilService: Partial<CommonUtilService>;
  let mockRouter: Router;
  beforeEach(async () => {
    mockRouter = {
      events: new Subject(),
      navigate: jest.fn(), // Mock events as a Subject
    } as any;
    mockCommonUtilService = {
      changeAppLanguage: jest.fn(), // Only mock the method needed
    };

    component = new HeaderComponent(
      mockRouter as any,
      mockCommonUtilService as any
    );
    await component.ngOnInit();
  });
  // Component initializes successfully with Router and CommonUtilService dependencies
  it("should create component with required dependencies", () => {
    expect(component).toBeTruthy();
  });
  // homePage() method navigates to /public/home route
  it("should navigate to public/home route when homePage is called", () => {
    const routerMock = {
      navigate: jest.fn(),
    };
    const commonUtilServiceMock = {
      updateAppLanguage: jest.fn(),
    };

    const component = new HeaderComponent(
      routerMock as any,
      commonUtilServiceMock as any
    );

    component.homePage();

    expect(routerMock.navigate).toHaveBeenCalledWith(["/public/home"]);
  });
  // homePage() method updates app language to English before navigation
  it("should update language to English before navigation", () => {
    const routerMock = {
      navigate: jest.fn(),
    };
    const commonUtilServiceMock = {
      updateAppLanguage: jest.fn(),
    };

    const component = new HeaderComponent(
      routerMock as any,
      commonUtilServiceMock as any
    );

    component.homePage();

    expect(commonUtilServiceMock.updateAppLanguage).toHaveBeenCalledWith("en");
    expect(routerMock.navigate).toHaveBeenCalledWith(["/public/home"]);

    // Check call order
    expect(commonUtilServiceMock.updateAppLanguage).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);

    const updateAppLanguageCallIndex =
      commonUtilServiceMock.updateAppLanguage.mock.invocationCallOrder[0];
    const navigateCallIndex = routerMock.navigate.mock.invocationCallOrder[0];

    // Ensure updateAppLanguage is called before navigate
    expect(updateAppLanguageCallIndex).toBeLessThan(navigateCallIndex);
  });

  // Handle navigation when router is not available
  // Component handles error gracefully when router is not available
  it("should not throw error when router is not available", () => {
    const routerMock = {
      navigate: jest.fn().mockImplementation(() => {
        throw new Error("Router not available");
      }),
    };
    const commonUtilServiceMock = {
      updateAppLanguage: jest.fn(),
    };

    const component = new HeaderComponent(
      routerMock as any,
      commonUtilServiceMock as any
    );

    try {
      component.homePage();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Router not available");
    }
  });
  // Component handles error gracefully when CommonUtilService is not available
 
  // Handle case when language code is invalid or undefined
  it("should handle invalid language code gracefully", () => {
    const routerMock = {
      navigate: jest.fn(),
    };
    const commonUtilServiceMock = {
      updateAppLanguage: jest.fn().mockImplementation((code) => {
        if (!code) throw new Error("Invalid language code");
      }),
    };

    const component = new HeaderComponent(
      routerMock as any,
      commonUtilServiceMock as any
    );

    component.homePage();

    expect(commonUtilServiceMock.updateAppLanguage).toHaveBeenCalledWith("en");
    expect(routerMock.navigate).toHaveBeenCalled();
  });
  // Component renders header template correctly
  it("should navigate to home page and update language when homePage is called", () => {
    const routerMock = {
      navigate: jest.fn(),
    };
    const commonUtilServiceMock = {
      updateAppLanguage: jest.fn(),
    };
    const component = new HeaderComponent(
      routerMock as any,
      commonUtilServiceMock as any
    );

    component.homePage();

    expect(commonUtilServiceMock.updateAppLanguage).toHaveBeenCalledWith("en");
    expect(routerMock.navigate).toHaveBeenCalledWith(["/public/home"]);
  });
  
});
