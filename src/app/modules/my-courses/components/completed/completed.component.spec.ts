import { CompletedComponent } from "./completed.component";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { MyCourseService } from "../../services/my-course.service";
import { AppFrameworkDetectorService } from "../../../core/services/app-framework-detector-service.service";
import { Platform } from "@ionic/angular";

describe("CompletedComponent", () => {
  let component: CompletedComponent;
  let myCourseServiceMock: Partial<MyCourseService>  = {};
  let appFrameworkDetectorServiceMock: Partial<AppFrameworkDetectorService> = {
    detectAppFramework: jest.fn()
  };
  let platformMock: Partial<Platform> = {};
  const mockRouter: Partial<Router> = {};


  beforeAll(() => {
    component = new CompletedComponent(
      mockRouter as Router,
      myCourseServiceMock as MyCourseService,
      appFrameworkDetectorServiceMock as AppFrameworkDetectorService,
      platformMock as Platform
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize isTablet based on platform", () => {
    expect(component.isTablet).toBe(false);
  });

  describe('detectFramework', () => {
    it('should detect framework and set appId', async () => {
      // arrange
      appFrameworkDetectorServiceMock.detectAppFramework = jest.fn(() => Promise.resolve('Ekshamata'));
      //act
      await component.detectFramework();
      //assert
      expect(component.displayConfig.showCompetency).toBeFalsy();
      expect(component.displayConfig.showSourceName).toBeTruthy();
    });
  
    it('should handle error in detectFramework', async () => {
      // arrange
      appFrameworkDetectorServiceMock.detectAppFramework = jest.fn(() => Promise.resolve('Sphere'));
      //act
      await component.detectFramework();
      //assert
      expect(component.displayConfig.showCompetency).toBeFalsy();
      expect(component.displayConfig.showSourceName).toBeTruthy();
    });
  
    it('should handle error in detectFramework and set appId to empty string', async () => {
      jest.spyOn(appFrameworkDetectorServiceMock, 'detectAppFramework').mockRejectedValue(new Error('error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await component.detectFramework();
      expect(consoleSpy).toHaveBeenCalledWith('error while getting packagename');
    });
  });

  describe("ngOnInit", () => {
    it('should call detectFramework on init', async () => {
      const detectFrameworkSpy = jest.spyOn(component, 'detectFramework');
      platformMock.is = jest.fn(() => true);
      myCourseServiceMock.getCompletedCourseData = jest.fn(() => of([{ dateTime: 1 }, { dateTime: 2 }]));
      component.ngOnInit();
      expect(detectFrameworkSpy).toHaveBeenCalled();
      expect(platformMock.is).toHaveBeenCalled();
      expect(myCourseServiceMock.getCompletedCourseData).toHaveBeenCalled();
    });
  });
});
