import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api';
import { CommonUtilService, TelemetryGeneratorService } from '../../../../../services';
import { LocalStorageService } from '../../../../manage-learn/core';
import { UserService } from '../../services/user.service';
import {MobileCourseViewComponent} from './mobile-course-view.component';

jest.mock('../../../../../app/modules/core/services/cordova-http.service', () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    }
  };
});

describe('MobileCourseViewComponent', () => {
    let mobileCourseViewComponent: MobileCourseViewComponent;
    const mockrouter: Partial<Router> = {};
    const mockconfigSvc: Partial<ConfigurationsService> = {};
    const mockuserHomeSvc: Partial<UserService> = {};
    const mockcommonUtilService: Partial<CommonUtilService> = {};    
    const mocktitleService: Partial<Title> = {};
    const mocklocalStorageService: Partial<LocalStorageService> = {};
    const mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    beforeAll(() => {
        mobileCourseViewComponent = new MobileCourseViewComponent(
           mockrouter as Router,
            mockconfigSvc as ConfigurationsService,
            mockuserHomeSvc as UserService,
            mockcommonUtilService as CommonUtilService,
            mocktitleService as Title,
            mocklocalStorageService as LocalStorageService,
            mocktelemetryGeneratorService as TelemetryGeneratorService,
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of component', () => {
        expect(mobileCourseViewComponent).toBeTruthy();
    });

    it('should set isTablet and populate cometencyData in ngOnInit when competencies_v1 exists', async () => {
      const mockIsTablet = jest.fn().mockResolvedValue(true);
      const competencies = [
        { competencyName: 'Test Competency', level: 2 },
        { competencyName: 'No Level Competency' }
      ];
      mockcommonUtilService.isTablet = mockIsTablet;
      mobileCourseViewComponent.courseData = {
        competencies_v1: JSON.stringify(competencies)
      };

      await mobileCourseViewComponent.ngOnInit();
      expect(mockcommonUtilService.isTablet).toHaveBeenCalled();
      expect(mobileCourseViewComponent.isTablet).toBe(true);
      expect(mobileCourseViewComponent.cometencyData).toEqual([
        { name: 'Test Competency', levels: ' Level 2' }
      ]);
    });

    it('should not populate cometencyData if competencies_v1 is missing', async () => {
      const mockIsTablet = jest.fn().mockResolvedValue(false);
      mockcommonUtilService.isTablet = mockIsTablet;
      mobileCourseViewComponent.courseData = {};

      await mobileCourseViewComponent.ngOnInit();
      expect(mockcommonUtilService.isTablet).toHaveBeenCalled();
      expect(mobileCourseViewComponent.cometencyData).toStrictEqual([
        { name: 'Test Competency', levels: ' Level 2' }
      ]);
    });

    it('should call correct methods and navigate for mapped user in navigateToToc', async () => {
      mockcommonUtilService.removeLoader = jest.fn(() => Promise.resolve());
      mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockconfigSvc.unMappedUser = undefined;
      mobileCourseViewComponent.courseData = { name: 'CourseName', identifier: 'id1' };
      mocktitleService.setTitle = jest.fn();
      mockrouter.navigate = jest.fn();
      mocklocalStorageService.setLocalStorage = jest.fn();

      await mobileCourseViewComponent.navigateToToc('id1');

      expect(mockcommonUtilService.removeLoader).toHaveBeenCalled();
      expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(mocktitleService.setTitle).toHaveBeenCalledWith('CourseName - Aastrika');
      expect(mockrouter.navigate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        state: { tocData: { name: 'CourseName', identifier: 'id1' } },
        queryParams: { courseId: 'id1' }
      }));
      expect(mocklocalStorageService.setLocalStorage).toHaveBeenCalledWith('tocData', JSON.stringify(mobileCourseViewComponent.courseData));
      expect(mocklocalStorageService.setLocalStorage).toHaveBeenCalledWith('url_before_login', 'app/toc/id1/overview');
    });

    it('should call correct methods and navigate for unmapped user with dob', async () => {
      mockcommonUtilService.removeLoader = jest.fn(() => Promise.resolve());
      mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockcommonUtilService.addLoader = jest.fn();
      mockuserHomeSvc.userRead = jest.fn().mockResolvedValue({});
      mockrouter.navigate = jest.fn();
      mobileCourseViewComponent.ashaData = { foo: 'bar' };
      mockconfigSvc.unMappedUser = {
        id: 'user1',
        profileDetails: {
          profileReq: {
            personalDetails: {
              dob: '2000-01-01'
            }
          }
        }
      };
      mobileCourseViewComponent.courseData = { name: 'CourseName', identifier: 'id1' };

      await mobileCourseViewComponent.navigateToToc('id1');

      expect(mockcommonUtilService.removeLoader).toHaveBeenCalled();
      expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
      expect(mockcommonUtilService.addLoader).toHaveBeenCalled();
      expect(mockuserHomeSvc.userRead).toHaveBeenCalledWith('user1');
      expect(mockrouter.navigate).toHaveBeenCalledWith(
        ['/app/toc/id1/overview'],
        { replaceUrl: true, queryParams: { data: JSON.stringify({ foo: 'bar' }) } }
      );
    });

    it('should call correct methods and navigate for unmapped user without dob', async () => {
      mockcommonUtilService.removeLoader = jest.fn(() => Promise.resolve());
      mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      mockcommonUtilService.addLoader = jest.fn();
      mockuserHomeSvc.userRead = jest.fn().mockResolvedValue({});
      mockrouter.navigate = jest.fn();
      mobileCourseViewComponent.ashaData = {};
      mockconfigSvc.unMappedUser = {
        id: 'user2',
        profileDetails: {
          profileReq: {
            personalDetails: {
              // dob is missing
            }
          }
        }
      };
      mobileCourseViewComponent.courseData = { name: 'CourseName', identifier: 'id2' };

      await mobileCourseViewComponent.navigateToToc('id2');

      expect(mockrouter.navigate).toHaveBeenCalledWith(
        ['/app/about-you'],
        { queryParams: { redirect: '/app/toc/id2/overview' } }
      );
    });

    it('should generate interact event', () => {
      const mockTelemetryService = {
        generateInteractTelemetry: jest.fn()
      };
      // @ts-ignore
      mobileCourseViewComponent.telemetryGeneratorService = mockTelemetryService;
      const contentIdentifier = 'cid123';
      mobileCourseViewComponent.generateInteractEvent(contentIdentifier);

      expect(mockTelemetryService.generateInteractTelemetry).toHaveBeenCalled();
    });

    it('should complete unsubscribe in ngOnDestroy', () => {
      const nextSpy = jest.spyOn(mobileCourseViewComponent.unsubscribe, 'next');
      const completeSpy = jest.spyOn(mobileCourseViewComponent.unsubscribe, 'complete');
      mobileCourseViewComponent.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
});