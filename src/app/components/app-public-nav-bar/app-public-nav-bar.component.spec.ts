import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonUtilService, TelemetryGeneratorService } from '../../../services';
import { Events } from '../../../util/events';
import { AppPublicNavBarComponent } from './app-public-nav-bar.component'
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { ValueService } from '../../../library/ws-widget/utils/src/lib/services/value.service';
import { AppFrameworkDetectorService } from '../../modules/core/services/app-framework-detector-service.service';
import { of } from 'rxjs';


describe('AppPublicNavBarComponent', () => {
  let component: AppPublicNavBarComponent;
  const mockActivateRoute: Partial<ActivatedRoute> = {}
  const mockRouter: Partial<Router> = {
    navigateByUrl: jest.fn(() => Promise.resolve(true))
  }
  const mockConfigSvc: Partial<ConfigurationsService> = {}
  const mockDomSanitizer: Partial<DomSanitizer> = {}
  const mockValueSvc: Partial<ValueService> = {
    isXSmall$: of(true)
  }
  const mockAppFrameworkDetectorService: Partial<AppFrameworkDetectorService> = {}
  const mockEvents: Partial<Events> = {
    subscribe: jest.fn((_, cb) => cb())
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    isTablet: jest.fn(() => true)
  }
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn(),
  };

  beforeAll(() => {
    component = new AppPublicNavBarComponent(
        mockDomSanitizer as DomSanitizer,
          mockConfigSvc as ConfigurationsService,
          mockRouter as Router,
          mockActivateRoute as ActivatedRoute,
          mockValueSvc as ValueService,
          mockAppFrameworkDetectorService as AppFrameworkDetectorService,
          mockEvents as Events,
          mockCommonUtilService as CommonUtilService,
          mockTelemetryGeneratorService as TelemetryGeneratorService
    )
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  it('should create a instance of AppPublicNavBarComponent', () => {
    component.appFramework = 'sphere';
    expect(component).toBeTruthy();
  });

  describe('detectFramework', () => {
    it('should get detectFramework for sphere', async() => {
      // arrange
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('sphere'));
      // act
      await component.detectFramework();
      // assert
      expect(component.showSphereFoundation).toBeFalsy();
    });

    it('should get detectFramework for ekshamata', async() => {
      // arrange
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('Ekshamata'));
      // act
      await component.detectFramework();
      // assert
      expect(component.showSphereFoundation).toBeTruthy();
    });

    it('should handle error in detectFramework', async() => {
      // arrange
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.reject('error'));
      // act
      await component.detectFramework();
      // assert
      expect(component.showSphereFoundation).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {  
    it('should generate  IMPRESSION telemetry on ngOnInit', async() => {
      // arrange
      jest.spyOn(component, 'detectFramework').mockImplementation(() => Promise.resolve());
      localStorage.setItem('orgValue', 'nhsrc');
      mockConfigSvc.instanceConfig = {
        logos: {
          app: 'appLogo'
        } as any,
        details: {
          appName: 'appName'
        }
      } as any;
      mockActivateRoute.snapshot = {
        queryParamMap: {
          has: jest.fn(() => true),
          get: jest.fn(() => 'ref')
        }
      } as any;
      mockDomSanitizer.bypassSecurityTrustResourceUrl = jest.fn(() => 'appLogo');
      // act
      await component.ngOnInit();
      // assert
      expect(component.hideCreateButton).toBeFalsy();
      expect(component.appIcon).toBe('appLogo');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('appLogo');
      expect(component.appName).toBe('appName');
      expect(component.showCreateBtn).toBeTruthy();
    });

    it('should navigate to org-details', async() => {
      // arrange
      jest.spyOn(component, 'detectFramework').mockImplementation(() => Promise.resolve());
      localStorage.setItem('orgValue', 'nhsrc');
      mockConfigSvc.instanceConfig = {
        logos: {
          app: 'appLogo',
          appBottomNav: 'appBottomNav'
        } as any,
        details: {
          appName: 'appName'
        }
      } as any;
      mockActivateRoute.snapshot = {
        queryParamMap: {
          has: jest.fn(() => false),
        }
      } as any;
      mockDomSanitizer.bypassSecurityTrustResourceUrl = jest.fn(() => 'appLogo');
      mockConfigSvc.appsConfig = {
        appBottomNav: 'appBottomNav',
        features: {
          feature1: 'feature1'
        }
      } as any;
      // act
      await component.ngOnInit();
      // assert
      expect(component.hideCreateButton).toBeFalsy();
      expect(component.appIcon).toBe('appLogo');
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('appLogo');
      expect(component.appName).toBe('appName');
      expect(component.showCreateBtn).toBeTruthy();
    })
  });

  it('should not return user profile', () => {
    // Arrange
    // Assert
    expect(component.isUserProfileNull).toBeFalsy();
  })

  it('should invoked ngOnChanges for bottom', () => {  
    // Arrange
      const changes = {
        mode: {
          currentValue: 'bottom',
          previousValue: 'top',
          firstChange: false,
          isFirstChange: () => false,
        }
      };
    component.mode = 'bottom'
    // Act
    component.ngOnChanges(changes);
    // Assert
    expect(component.showCreateBtn).toBeTruthy();
  });

  it('should invoked ngOnChanges for else part', () => {  
    // Arrange
      const changes = {
        mode: {
          currentValue: 'bottom',
          previousValue: 'top',
          firstChange: false,
          isFirstChange: () => false,
        }
      };
    component.mode = 'top';
    // Act
    component.ngOnChanges(changes);
    // Assert
    expect(component.showCreateBtn).toBeTruthy();
  });

  it('should call onResize', () => {
    // Arrange
    // Act
    component.onResize();
    // Assert
    expect(component.showCreateBtn).toBeTruthy();
  });

  it('should navigate to create account page', () => {
    // Arrange
    // Act
    component.createAcct();
    // Assert
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/create-account');
  });

  it('should call ngOnDestroy', () => {
    // Arrange
    // Act
    component.ngOnDestroy();
    // Assert
  });

  it('should navigate to home page', () => {  
    // Arrange
    // Act
    component.goHomePage();
    // Assert
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/public/home');
  });

})
