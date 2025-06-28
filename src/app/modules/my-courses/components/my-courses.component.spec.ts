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

import { NavigationEnd, Router } from '@angular/router'; 
import { ContentCorodovaService, WidgetUserService } from '../../../../library/ws-widget/collection/src/public-api';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api';
import { MyCourseService } from '../services/my-course.service';
import { AppFrameworkDetectorService } from '../../core/services/app-framework-detector-service.service';
import { MyCoursesComponent } from './my-courses.component';
import { of, Subject } from 'rxjs';
import { TelemetryGeneratorService } from '../../../../services';

jest.mock("ngx-extended-pdf-viewer", () => ({
  NgxExtendedPdfViewerComponent: () => "MockPdfViewerComponent",
}));

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  NgModule: () => (target) => target,
}));

describe('MyCoursesComponent', () => {
  let component: MyCoursesComponent;
  let routerEventsSubject: Subject<any>;
  let router: Partial<Router>;
  const userSvc: Partial<WidgetUserService> = {};
  const configSvc: Partial<ConfigurationsService> = {};
  const myCourseService: Partial<MyCourseService> = {};
  const appFrameworkDetectorService: Partial<AppFrameworkDetectorService> = {};
  const mockContentCorodovaService: Partial<ContentCorodovaService> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  beforeAll(() => {
    component = new MyCoursesComponent(
      router as Router,
      userSvc as WidgetUserService,
      configSvc as ConfigurationsService,
      myCourseService as MyCourseService,
      appFrameworkDetectorService as AppFrameworkDetectorService,
      mockContentCorodovaService as ContentCorodovaService,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('detectFramework', () => {
    it('should detect framework and set appId', async () => {
      // arrange
      appFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('Ekshamata'));
      //act
      await component.detectFramework();
      //assert
      expect(component.appId).toBe('app.aastrika.ekhamata');
    });
  
    it('should handle error in detectFramework', async () => {
      // arrange
      appFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('Sphere'));
      //act
      await component.detectFramework();
      //assert
      expect(component.appId).toBe('app.aastrika.sphere');
    });
  
    it('should handle error in detectFramework and set appId to empty string', async () => {
      jest.spyOn(appFrameworkDetectorService, 'detectAppFramework').mockRejectedValue(new Error('error'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await component.detectFramework();
      expect(component.appId).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('error while getting packagename');
    });
  });

  describe('getHomeContent', () => {
    it('should fetch home content', async () => {
      // arrange
      configSvc.userProfile = {
        rootOrgId: 'rootOrgId',
      } as any;
      const localStorageItem = {
        departments: [
          {
            channelId: 'channelId',
            sourceName: 'sourceName',
            defaultLanguage: 'defaultLanguage',
          },
        ],  
      };
      localStorage.setItem('sphereHomeContent', JSON.stringify(localStorageItem));
      // act
      await component.getHomeContent();
      // assert
      expect(component.requiredSourceName).toEqual(['IHAT', 'Others']);
      expect(component.departmentDefaultLang).toEqual('en');
      expect(component.currentOrgId).toEqual('rootOrgId');
    });

    it('should fetch home content for same rootOrgId and channelId', async () => {
      // arrange
      configSvc.userProfile = {
        rootOrgId: 'rootOrgId',
      } as any;
      const localStorageItem = {
        departments: [
          {
            channelId: 'rootOrgId',
            sourceName: 'sourceName',
            defaultLanguage: 'defaultLanguage',
          },
        ],  
      };
      localStorage.setItem('sphereHomeContent', JSON.stringify(localStorageItem));
      // act
      await component.getHomeContent();
      // assert
      expect(component.requiredSourceName).toEqual('sourceName');
      expect(component.departmentDefaultLang).toEqual('defaultLanguage');
      expect(component.currentOrgId).toEqual('rootOrgId');
    });
  });

  describe('fetchUserEnrolledCourse', () => {
    beforeEach(() => {
      routerEventsSubject = new Subject();
      router = {
        url: '/my-courses/started',
        events: routerEventsSubject.asObservable(),
        navigate: jest.fn(),
      } as unknown as Router;

      component = new MyCoursesComponent(
        router as Router,
        userSvc as WidgetUserService,
        configSvc as ConfigurationsService,
        myCourseService as MyCourseService,
        appFrameworkDetectorService as AppFrameworkDetectorService,
        mockContentCorodovaService as ContentCorodovaService,
        mockTelemetryGeneratorService as TelemetryGeneratorService
      );
    });
    it('should fetch user enrolled courses and set started course data', () => {
      //arrange
      configSvc.userProfile = {
        userId: 'user123',
      } as any;
      const courses = [
        { course_id: '1', course_appIcon: 'icon1', course_thumbnail: 'thumb1', course_name: 'Course 1', course_sourceName: 'Source 1', course_issueCertification: true, course_rating: 4.5, competencies_v1: [] },
        { course_id: '2', course_appIcon: 'icon2', course_thumbnail: 'thumb2', course_name: 'Course 2', course_sourceName: 'Source 2', course_issueCertification: false, course_rating: 3.5, competencies_v1: [] }
      ];
      userSvc.fetchUserBatchList = jest.fn(() => of({ result: { courses } })) as any;
      myCourseService.setStartedCourseData = jest.fn();
      myCourseService.setCompletedCourseData = jest.fn();
      const formatmyCourseResponseSpy = jest.spyOn(component, 'formatmyCourseResponse').mockReturnValue({ startedCourse: [], completedCourse: [], startCount: 0, completedCount: 0 });
      //act
      component.fetchUserEnrolledCourse();
      //assert
      expect(userSvc.fetchUserBatchList).toHaveBeenCalledWith('user123');
      expect(formatmyCourseResponseSpy).toHaveBeenCalled();
      expect(myCourseService.setStartedCourseData).toHaveBeenCalled();
    });
  });    
  
  describe('fetchUserEnrolledCourse', () => {
    beforeEach(() => {
      routerEventsSubject = new Subject();
      router = {
        url: '/my-courses/completed',
        events: routerEventsSubject.asObservable(),
        navigate: jest.fn(),
      } as unknown as Router;

      component = new MyCoursesComponent(
        router as Router,
        userSvc as WidgetUserService,
        configSvc as ConfigurationsService,
        myCourseService as MyCourseService,
        appFrameworkDetectorService as AppFrameworkDetectorService,
        mockContentCorodovaService as ContentCorodovaService,
        mockTelemetryGeneratorService as TelemetryGeneratorService
      );
    });
    it('should fetch user enrolled courses and completed course data', () => {
      //arrange
      configSvc.userProfile = {
        userId: 'user123',
      } as any;
      const courses = [
        { course_id: '1', course_appIcon: 'icon1', course_thumbnail: 'thumb1', course_name: 'Course 1', course_sourceName: 'Source 1', course_issueCertification: true, course_rating: 4.5, competencies_v1: [] },
        { course_id: '2', course_appIcon: 'icon2', course_thumbnail: 'thumb2', course_name: 'Course 2', course_sourceName: 'Source 2', course_issueCertification: false, course_rating: 3.5, competencies_v1: [] }
      ];
      userSvc.fetchUserBatchList = jest.fn(() => of({ result: { courses } })) as any;
      myCourseService.setStartedCourseData = jest.fn();
      myCourseService.setCompletedCourseData = jest.fn();
      const formatmyCourseResponseSpy = jest.spyOn(component, 'formatmyCourseResponse').mockReturnValue({ startedCourse: [], completedCourse: [], startCount: 0, completedCount: 0 });
      //act
      component.fetchUserEnrolledCourse();
      //assert
      expect(userSvc.fetchUserBatchList).toHaveBeenCalledWith('user123');
      expect(formatmyCourseResponseSpy).toHaveBeenCalled();
      expect(myCourseService.setCompletedCourseData).toHaveBeenCalled();
    });
  });  

  describe('fetchForYouCourse', () => {
    it('should fetch for you courses', async () => {
      // arrange
      configSvc.userProfile = {
        profileData: {
          rootOrgId: 'rootOrgId',
          professionalDetails: [{ designation: 'designation' }],
        }
      } as any;
      const courses = [
        { course_id: '1', course_appIcon: 'icon1', course_thumbnail: 'thumb1', course_name: 'Course 1', course_sourceName: 'Source 1', course_issueCertification: true, course_rating: 4.5, competencies_v1: [] },
        { course_id: '2', course_appIcon: 'icon2', course_thumbnail: 'thumb2', course_name: 'Course 2', course_sourceName: 'Source 2', course_issueCertification: false, course_rating: 3.5, competencies_v1: [] }
      ];
      userSvc.fetchCourseRemommendationv = jest.fn(() => of(courses)) as any;
      myCourseService.setRecomendedCourseData = jest.fn();
      myCourseService.setForYouParams = jest.fn();
      //act
      await component.fetchForYouCourse();
      //assert
      expect(userSvc.fetchCourseRemommendationv).toHaveBeenCalled();
      expect(myCourseService.setRecomendedCourseData).toHaveBeenCalled();
      expect(myCourseService.setForYouParams).toHaveBeenCalledWith(component.forYouRequestData);
    });

  it('should fetch for you courses and set recommended course data', async () => {
    const detectFrameworkSpy = jest.spyOn(component, 'detectFramework').mockResolvedValue();
    const fetchCourseRemommendationvSpy = jest.spyOn(userSvc, 'fetchCourseRemommendationv').mockReturnValue(of([]));
    const formatmyRecomenderCourseSpy = jest.spyOn(component, 'formatmyRecomenderCourse').mockReturnValue({ recomenderCourse: [], forYouCount: 0 });

    await component.fetchForYouCourse();

    expect(detectFrameworkSpy).toHaveBeenCalled();
    expect(fetchCourseRemommendationvSpy).toHaveBeenCalled();
    expect(formatmyRecomenderCourseSpy).toHaveBeenCalled();
    expect(myCourseService.setRecomendedCourseData).toHaveBeenCalledWith([]);
    expect(myCourseService.setForYouParams).toHaveBeenCalledWith(component.forYouRequestData);
  });
});

  describe('ngOnInit', () => {    
    beforeEach(() => {
      routerEventsSubject = new Subject();
      router = {
        url: '/my-courses/for-you',
        events: routerEventsSubject.asObservable(),
        navigate: jest.fn(),
      } as unknown as Router;

      component = new MyCoursesComponent(
        router as Router,
        userSvc as WidgetUserService,
        configSvc as ConfigurationsService,
        myCourseService as MyCourseService,
        appFrameworkDetectorService as AppFrameworkDetectorService,
        mockContentCorodovaService as ContentCorodovaService,
        mockTelemetryGeneratorService as TelemetryGeneratorService
      );
    });
    it('should initialize and subscribe to forYouCount changes', async () => {
      myCourseService.currentForYouCount = of(5) as any;
      mockContentCorodovaService.setAshaData = jest.fn();
      const getHomeContentSpy = jest.spyOn(component, 'getHomeContent').mockImplementation(() => Promise.resolve());
      const fetchUserEnrolledCourseSpy = jest.spyOn(component, 'fetchUserEnrolledCourse').mockImplementation();
      const fetchForYouCourseSpy = jest.spyOn(component, 'fetchForYouCourse').mockImplementation(() => Promise.resolve());
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      //act
      await component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/my-courses/for-you', '/my-courses/for-you'));
      //assert
      expect(component.forYouCount).toBe(5);  
      expect(getHomeContentSpy).toHaveBeenCalled();
      expect(fetchUserEnrolledCourseSpy).toHaveBeenCalled();
      expect(mockContentCorodovaService.setAshaData).toHaveBeenCalled();
      expect(fetchForYouCourseSpy).toHaveBeenCalled();
      expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      routerEventsSubject = new Subject();
      router = {
        url: '/my-courses/enrolled',
        events: routerEventsSubject.asObservable(),
        navigate: jest.fn(),
      } as unknown as Router;

      component = new MyCoursesComponent(
        router as Router,
        userSvc as WidgetUserService,
        configSvc as ConfigurationsService,
        myCourseService as MyCourseService,
        appFrameworkDetectorService as AppFrameworkDetectorService,
        mockContentCorodovaService as ContentCorodovaService,
        mockTelemetryGeneratorService as TelemetryGeneratorService
      );
    });

    it('should call fetchUserEnrolledCourse when the URL is /my-courses/enrolled', async () => {
      myCourseService.currentForYouCount = of(5) as any;
      const getHomeContentSpy = jest.spyOn(component, 'getHomeContent').mockImplementation(() => Promise.resolve());
      const fetchUserEnrolledCourseSpy = jest.spyOn(component, 'fetchUserEnrolledCourse').mockImplementation();
      const fetchForYouCourseSpy = jest.spyOn(component, 'fetchForYouCourse').mockImplementation(() => Promise.resolve());
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      //act
      await component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/my-courses/enrolled', '/my-courses/enrolled'));
      //assert
      expect(component.forYouCount).toBe(5);  
      expect(getHomeContentSpy).toHaveBeenCalled();
      expect(fetchUserEnrolledCourseSpy).toHaveBeenCalled();
      expect(fetchForYouCourseSpy).toHaveBeenCalled();
      expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
    });
  });


  it('should format recommended courses', () => {
    const courses = [
      { course_id: '1', course_appIcon: 'icon1', course_thumbnail: 'thumb1', course_name: 'Course 1', course_sourceName: 'Source 1', course_issueCertification: true, course_rating: 4.5, competencies_v1: [] },
      { course_id: '2', course_appIcon: 'icon2', course_thumbnail: 'thumb2', course_name: 'Course 2', course_sourceName: 'Source 2', course_issueCertification: false, course_rating: 3.5, competencies_v1: [] }
    ];

    const result = component.formatmyRecomenderCourse(courses);

    expect(result.recomenderCourse.length).toBe(2);
    expect(result.forYouCount).toBe(2);
  });

  it('should format user enrolled courses', () => {
    const courses = [
      { content: { identifier: '1', appIcon: 'icon1', thumbnail: 'thumb1', name: 'Course 1', sourceName: 'Source 1', averageRating: 4.5, issueCertification: true, cneName: 'CNE 1' }, completionPercentage: 50, dateTime: 1234567890 },
      { content: { identifier: '2', appIcon: 'icon2', thumbnail: 'thumb2', name: 'Course 2', sourceName: 'Source 2', averageRating: 3.5, issueCertification: false, cneName: 'CNE 2' }, completionPercentage: 100, dateTime: 1234567891 }
    ];

    const result = component.formatmyCourseResponse(courses);

    expect(result.startedCourse.length).toBe(1);
    expect(result.completedCourse.length).toBe(1);
    expect(result.startCount).toBe(1);
    expect(result.completedCount).toBe(1);
  });
});