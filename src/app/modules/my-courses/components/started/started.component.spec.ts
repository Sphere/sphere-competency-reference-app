import { StartedComponent } from './started.component';
import { IonicModule, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { MyCourseService } from '../../services/my-course.service';
import { AppFrameworkDetectorService } from '../../../core/services/app-framework-detector-service.service';


  describe('StartedComponent', () => {
    let component: StartedComponent;
    let myCourseServiceMock: Partial<MyCourseService> = {};
    let appFrameworkDetectorServiceMock: Partial<AppFrameworkDetectorService> = {};
    let platformMock: Partial<Platform> = {};
    const mockRouter: Partial<Router> = {};

    beforeAll(() => {
      component = new StartedComponent(
        mockRouter as Router,
        myCourseServiceMock as MyCourseService,
        appFrameworkDetectorServiceMock as AppFrameworkDetectorService,
        platformMock as Platform
      );
    });

    beforeEach(() => {
     jest.clearAllMocks();
     jest.restoreAllMocks();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize isTablet to true', () => {
      expect(component.isTablet).toBe(false);
    });

    describe('detectFramework', () => {
      it('should set displayConfig based on appFramework for Ekshamata', async () => {
        appFrameworkDetectorServiceMock.detectAppFramework = jest.fn(() => Promise.resolve('Ekshamata'));
        await component.detectFramework();
        expect(appFrameworkDetectorServiceMock.detectAppFramework).toHaveBeenCalled();
        expect(component.displayConfig.showCompetency).toBe(false);
        expect(component.displayConfig.showSourceName).toBe(true);
      });

      it('should set displayConfig based on appFramework for Sphere', async () => {
        appFrameworkDetectorServiceMock.detectAppFramework = jest.fn(() => Promise.resolve('Sphere'));
        await component.detectFramework();
        expect(appFrameworkDetectorServiceMock.detectAppFramework).toHaveBeenCalled();
        expect(component.displayConfig.showCompetency).toBe(false);
        expect(component.displayConfig.showSourceName).toBe(true);
      });

      it('should set displayConfig based on appFramework for cath part', async () => {
        appFrameworkDetectorServiceMock.detectAppFramework = jest.fn(() => Promise.reject({error: 'error'}));
        await component.detectFramework();
        expect(appFrameworkDetectorServiceMock.detectAppFramework).toHaveBeenCalled();
      });
    })

    it('should call detectFramework on init', async () => {
      const detectFrameworkSpy = jest.spyOn(component, 'detectFramework');
      platformMock.is = jest.fn(() => true);
      myCourseServiceMock.getStartedCourseData = jest.fn(() => of([{ dateTime: 1 }, { dateTime: 2 }]));
      component.ngOnInit();
      expect(detectFrameworkSpy).toHaveBeenCalled();
      expect(platformMock.is).toHaveBeenCalled();
      expect(myCourseServiceMock.getStartedCourseData).toHaveBeenCalled();
    });

    it('should complete unsubscribe on destroy', () => {
      const unsubscribeSpy = jest.spyOn(component.unsubscribe, 'complete');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

