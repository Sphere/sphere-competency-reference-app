import { NgModule } from '@angular/core';

@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class MockMdePopoverModule {}

jest.mock('@material-extended/mde', () => ({
  MdePopoverModule: MockMdePopoverModule
}));

import { ForYouComponent } from './for-you.component';
import { MyCourseService } from '../../services/my-course.service';
import { WidgetUserService } from '../../../../../library/ws-widget/collection/src/public-api';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api';
import { Platform } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { TelemetryGeneratorService } from '../../../../../services';

jest.mock("ngx-extended-pdf-viewer", () => ({
  NgxExtendedPdfViewerComponent: () => "MockPdfViewerComponent",
}));

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  NgModule: () => (target) => target,
}));

jest.mock('../../../core/services/cordova-http.service', () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    }
  };
});

describe('ForYouComponent', () => {
  let component: ForYouComponent;
  let myCourseServiceMock: Partial<MyCourseService> = {};
  let widgetUserServiceMock: Partial<WidgetUserService> = {};
  let configServiceMock: Partial<ConfigurationsService> = {};
  let platformMock: Partial<Platform> = {};
  let mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

  beforeAll(() => {
    component = new ForYouComponent(
      myCourseServiceMock as MyCourseService,
      widgetUserServiceMock as WidgetUserService,
      configServiceMock as ConfigurationsService,
      platformMock as Platform,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );  
  });
  beforeEach(() => {
   jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBeTruthy();
    expect(component.forYouCourse).toBeUndefined();
    expect(component.currentParams).toBeUndefined();
    expect(component.offset).toBeUndefined();
    expect(component.limit).toBeUndefined();
    expect(component.requiredSourceName).toEqual([]);
    expect(component.departmentDefaultLang).toBe('en');
    expect(component.currentOrgId).toBeUndefined();
    expect(component.isTablet).toBeFalsy();
  });

  it('should get home content and set requiredSourceName and departmentDefaultLang', async () => {
    const mockSphereHomeContent = {
      departments: [
        {
          channelId: 'org123',
          sourceName: ['Source1'],
          defaultLanguage: 'fr'
        }
      ]
    };
    configServiceMock.userProfile = { rootOrgId: 'org123' } as any;
    localStorage.setItem('sphereHomeContent', JSON.stringify(mockSphereHomeContent));
    await component.getHomeContent();
    expect(component.requiredSourceName).toBeTruthy();
    expect(component.departmentDefaultLang).toBe('fr');
  });

  it('should get home content and set requiredSourceName and en if orgId is not matched', async () => {
    const mockSphereHomeContent = {
      departments: [
        {
          channelId: 'org1234',
          sourceName: ['Source1'],
          defaultLanguage: 'fr'
        }
      ]
    };
    configServiceMock.userProfile = { rootOrgId: 'org123' } as any;
    localStorage.setItem('sphereHomeContent', JSON.stringify(mockSphereHomeContent));
    await component.getHomeContent();
    expect(component.requiredSourceName).toBeTruthy();
    expect(component.departmentDefaultLang).toBe('en');
  });

  it('should load initial courses and set forYouCourse', () => {
    const mockCourses = [{ id: 1, name: 'Course 1' }];
    myCourseServiceMock.getRecomendedCourseData = jest.fn(() => of(mockCourses));
    myCourseServiceMock.getForYouParams = jest.fn(() => of({ offset: 0, limit: 10, appId: 'app1', designation: 'designation1' })) as any;
    component.loadInitialCourses();
    expect(component.isLoading).toBeFalsy();
    expect(myCourseServiceMock.getRecomendedCourseData).toHaveBeenCalled();
    expect(myCourseServiceMock.getForYouParams).toHaveBeenCalled();
  });

  it('should call getHomeContent and loadInitialCourses on ngOnInit', async () => {
    jest.spyOn(component, 'getHomeContent').mockImplementation();
    jest.spyOn(component, 'loadInitialCourses').mockImplementation();
    platformMock.is = jest.fn(() => true);

    await component.ngOnInit();
    expect(component.getHomeContent).toHaveBeenCalled();
    expect(component.loadInitialCourses).toHaveBeenCalled();
    expect(component.isTablet).toBeTruthy();
  });

  it('should set isTablet based on platform', async () => {
    platformMock.is = jest.fn(() => true);
    await component.ngOnInit();
    expect(component.isTablet).toBeTruthy();
  });

  it('should load more courses and update forYouCourse', () => {
    const mockNewCourses = [{ course_id: 2, course_name: 'Course 2', competency: false }];
    widgetUserServiceMock.fetchCourseRemommendationv = jest.fn(() => of(mockNewCourses as any));
    component.forYouCourse = [{ course_id: 1, course_name: 'Course 1', competency: false }];
    component.currentParams = { offset: 0, limit: 10, appId: 'app1', designation: 'designation1' };
    component.offset = 0;
    component.limit = 10;

    const eventMock = {
      target: {
        complete: jest.fn(),
        disabled: false
      }
    };
    myCourseServiceMock.updateForYouCount = jest.fn();

    component.loadMoreCourses(eventMock);
    expect(component.forYouCourse.length).toBe(2);
    expect(eventMock.target.complete).toHaveBeenCalled();
  });

  it('should load more courses and update empty Course', () => {
    const mockNewCourses = [];
    widgetUserServiceMock.fetchCourseRemommendationv = jest.fn(() => of(mockNewCourses as any));
    component.forYouCourse = [{ course_id: 1, course_name: 'Course 1', competency: false }];
    component.currentParams = { offset: 0, limit: 10, appId: 'app1', designation: 'designation1' };
    component.offset = 0;
    component.limit = 10;

    const eventMock = {
      target: {
        complete: jest.fn(),
        disabled: false
      }
    };
    myCourseServiceMock.updateForYouCount = jest.fn();

    component.loadMoreCourses(eventMock);
    expect(component.forYouCourse.length).toBe(1);
    expect(eventMock.target.complete).toHaveBeenCalled();
  });

  it('should handle for error part', () => {
    const mockNewCourses = [];
    widgetUserServiceMock.fetchCourseRemommendationv = jest.fn(() => throwError({ error: 'error' })) as any;
    component.forYouCourse = [{ course_id: 1, course_name: 'Course 1', competency: false }];
    component.currentParams = { offset: 0, limit: 10, appId: 'app1', designation: 'designation1' };
    component.offset = 0;
    component.limit = 10;

    const eventMock = {
      target: {
        complete: jest.fn(),
        disabled: false
      }
    };
    component.loadMoreCourses(eventMock);
    expect(component.forYouCourse.length).toBe(1);
    expect(widgetUserServiceMock.fetchCourseRemommendationv).toHaveBeenCalled();
  });

  it('should handle error when loading more courses', () => {
    widgetUserServiceMock.fetchCourseRemommendationv = jest.fn(() => of({ error: 'error' })) as any;
    const eventMock = {
      target: {
        complete: jest.fn(),
        disabled: false
      }
    };
    component.loadMoreCourses(eventMock);
    expect(eventMock.target.complete).toHaveBeenCalled();
  });

  it('should call loadMoreCourses on doInfinite', () => {
    const infiniteScrollMock = {
      target: {
        complete: jest.fn()
      }
    };
    jest.spyOn(component, 'loadMoreCourses').mockImplementation();
    jest.useFakeTimers();
    component.doInfinite(infiniteScrollMock);
    jest.advanceTimersByTime(500);
    expect(component.loadMoreCourses).toHaveBeenCalled();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('should scroll', () => {
    const event = { detail: { scrollTop: 100 } };
    component.onScroll(event);
  });
});