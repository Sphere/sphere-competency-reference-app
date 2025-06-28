import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { CommonUtilService, TelemetryGeneratorService } from '../../../services';
import { Events } from '../../../util/events';
import { LocalStorageService } from '../../manage-learn/core';
import { AppFrameworkDetectorService } from '../../modules/core/services/app-framework-detector-service.service';
import { UserService } from '../../modules/home/services/user.service';
import { AppNavBarComponent } from './app-nav-bar.component';
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { ValueService } from '../../../library/ws-widget/utils/src/lib/services/value.service';
import { CustomTourService } from '../../../library/ws-widget/collection/src/lib/_common/tour-guide/tour-guide.service';
import { of, Subject } from 'rxjs';
import { RouterLinks } from '../../app.constant';

jest.mock("ngx-extended-pdf-viewer", () => ({
  NgxExtendedPdfViewerComponent: () => "MockPdfViewerComponent",
}));

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  NgModule: () => (target) => target,
}));

describe('AppNavBarComponent', () => {
  let component: AppNavBarComponent;

  const mockDomSanitizer: Partial<DomSanitizer> = {};
  const mockConfigSvc: Partial<ConfigurationsService> = {
    restrictedFeatures: new Set<string>(['red', 'green', 'helpNavBarMenu']),
    primaryNavBarConfig: {
      smallScreen: {
        left: [
          { config: { actionBtnId: 'feature_home', show: false } },
          { config: { actionBtnId: 'feature_courses', show: true } }
        ]
      } as any
    } as any
  };
  const mockTourService: Partial<CustomTourService> = {};
  const mockRouter: Partial<Router> = {
    events: of(new NavigationStart(1, '/app/setup/test'), 
     new NavigationEnd(1, '/app/setup/test', '/app/setup/test')),
    url: 'http://localhost:4000/mentor'
    };
  const mockValueSvc: Partial<ValueService> = {
    isXSmall$: of(true)
  };
  const mockDialog: Partial<MatDialog> = {};
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockAppFrameworkDetectorService: Partial<AppFrameworkDetectorService> = {};
  const mockUserSvc: Partial<UserService> = {};
  const mockLocalStorage: Partial<LocalStorageService> = {
    getLocalStorage: jest.fn(() => Promise.resolve({}))
  };
  const mockEvents: Partial<Events> = {
    subscribe: jest.fn((_, cb) => cb(of({})))
  };

  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn()
  };

  beforeAll(() => {
    component = new AppNavBarComponent(
      mockDomSanitizer as DomSanitizer,
      mockConfigSvc as ConfigurationsService,
      mockTourService as CustomTourService,
      mockRouter as Router,
      mockValueSvc as ValueService,
      mockDialog as MatDialog,
      mockCommonUtilService as CommonUtilService,
      mockAppFrameworkDetectorService as AppFrameworkDetectorService,
      mockUserSvc as UserService,
      mockLocalStorage as LocalStorageService,
      mockEvents as Events,
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
    it('should detect framework for ekshamata and set input', async () => {
      // arrange
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('Ekshamata'));
      //act
      await component.detectFramework();
      //assert
      expect(component.appFramework).toBe('Ekshamata');
      expect(component.hideCreateButton).toBeFalsy();
      expect(component.showSphereFoundation).toBeTruthy();
    });

    it('should detect framework for sphere and set input', async () => {
      // arrange
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('sphere'));
      //act
      await component.detectFramework();
      //assert
      expect(component.appFramework).toBe('sphere');
      expect(component.hideCreateButton).toBeTruthy();
      expect(component.showSphereFoundation).toBeFalsy();
    });
  });

  it('should get orgname', async () => {
    // arrange
    mockConfigSvc.userProfile = {
      rootOrgId: 'sample-root-OrgId',
    } as any;
    mockUserSvc.getOrgData = jest.fn(() => Promise.resolve(({ orgNames: [{ channelId: 'sample-root-OrgId' }] }))) as any;
    //act
    await component.getOrgName();
    //assert
    expect(mockUserSvc.getOrgData).toHaveBeenCalled();
    expect(component.orgName).toStrictEqual({"channelId": "sample-root-OrgId"});
  });

  describe('manageProfileBTNAction', () => {
    it('should be manageProfileBTNAction for offline', () => {
      // Arrange
      Object.defineProperty(window.navigator, "onLine", { value: false, configurable: true });
      // Act
      const result = component.manageProfileBTNAction();
      // Assert
      expect(result).toBeUndefined();
    });

    it('should be manageProfileBTNAction for online', () => {
      // Arrange
      Object.defineProperty(window.navigator, "onLine", { value: true, configurable: true });
      mockRouter.navigateByUrl = jest.fn(() => Promise.resolve(true));
      component.activeRoute = '/profile-dashboard/';
      Object.defineProperty(mockCommonUtilService, 'getPreviesUrl', {
        get: jest.fn().mockReturnValue(RouterLinks.COMPETENCY_DASHBOARD),
      });
      // Act
      component.manageProfileBTNAction();
      // Assert
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(RouterLinks.COMPETENCY_DASHBOARD);
    });

    it('should be manageProfileBTNAction for online with other url', () => {
      // Arrange
      Object.defineProperty(window.navigator, "onLine", { value: true, configurable: true });
      component.activeRoute = '/profile-dashboard/';
      Object.defineProperty(mockCommonUtilService, 'getPreviesUrl', {
        get: jest.fn().mockReturnValue('other'),
      });
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // Act
      component.manageProfileBTNAction();
      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([`${RouterLinks.PRIVATE_HOME}`]);
    });

    it('should be manageProfileBTNAction for online dashboard', () => {
      // Arrange
      Object.defineProperty(window.navigator, "onLine", { value: true, configurable: true });
      component.activeRoute = '/other/';
      Object.defineProperty(mockCommonUtilService, 'getPreviesUrl', {
        get: jest.fn().mockReturnValue('other'),
      });
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // Act
      component.manageProfileBTNAction();
      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith([`${RouterLinks.PROFILE_DASHBOARD}`]);
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit and local value is nhsrc', () => {
      // Arrange
      jest.spyOn(component, 'detectFramework').mockImplementation(() => Promise.resolve());
      jest.spyOn(component, 'getOrgName').mockImplementation(() => Promise.resolve());
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('nhsrc');
      mockLocalStorage.getLocalStorage = jest.fn(() => Promise.resolve('Asha'));
      mockConfigSvc.tourGuideNotifier = of({id: 'sample-id'}) as any;
      mockConfigSvc.instanceConfig = {
        logos: {
          app: 'sample-app-logo',
          appBottomNav: 'sample-app-bottom-nav-logo'
        }
      } as any;
      mockConfigSvc.appsConfig = {
        features: {
          feature1: 'feature1'
        }
      } as any;
      mockConfigSvc.primaryNavBar = {
        smallScreen: {
          left: [
            { config: { actionBtnId: 'feature_home', show: false } },
            { config: { actionBtnId: 'feature_courses', show: true } }
          ]
        }   
      } as any;
      mockDomSanitizer.bypassSecurityTrustResourceUrl = jest.fn();
      // Act
      component.ngOnInit();
      // Assert
      expect(component.hideCreateButton).toBeFalsy();
      expect(mockLocalStorage.getLocalStorage).toHaveBeenCalled();
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled(); 
      expect(component.primaryNavbarBackground).toBeTruthy()
    });

    it('should call ngOnInit and local value is other', () => {
      // Arrange
      jest.spyOn(component, 'detectFramework').mockImplementation(() => Promise.resolve());
      jest.spyOn(component, 'getOrgName').mockImplementation(() => Promise.resolve());
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('other');
      mockLocalStorage.getLocalStorage = jest.fn(() => Promise.resolve('Asha'));
      mockConfigSvc.tourGuideNotifier = of({id: 'sample-id'}) as any;
      mockConfigSvc.instanceConfig = {
        logos: {
          app: 'sample-app-logo',
          appBottomNav: 'sample-app-bottom-nav-logo'
        },
        showNavBarInSetup: true
      } as any;
      mockConfigSvc.appsConfig = {
        features: {
          feature1: 'feature1'
        }
      } as any;
      mockConfigSvc.primaryNavBar = {
        smallScreen: {
          left: [
            { config: { actionBtnId: 'feature_home', show: false } },
            { config: { actionBtnId: 'feature_courses', show: true } }
          ]
        }   
      } as any;
      mockDomSanitizer.bypassSecurityTrustResourceUrl = jest.fn();
      // Act
      component.ngOnInit();
      // Assert
      expect(component.hideCreateButton).toBeFalsy();
      expect(mockLocalStorage.getLocalStorage).toHaveBeenCalled();
      expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled(); 
      expect(component.primaryNavbarBackground).toBeTruthy()
    });
  });

  it('should create an account', () => {
    // Arrange
    jest.spyOn(Storage.prototype, 'removeItem').mockReturnValue();
    mockCommonUtilService.addLoader = jest.fn(() => Promise.resolve())
    mockRouter.navigateByUrl = jest.fn(() => Promise.resolve(true))
    // Act
    component.createAcct();
    // Assert
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/create-account');
    expect(mockCommonUtilService.addLoader).toHaveBeenCalled();
  });

  describe('goHomePage', () => {
    beforeEach(() => {
      const mockRouter: Partial<Router> = {
        events: of(new NavigationStart(1, '/app/setup/test'), 
         new NavigationEnd(1, '/app/setup/test', '/app/setup/test')),
        url: '/app/new-tnc'
      };
      component = new AppNavBarComponent(
        mockDomSanitizer as DomSanitizer,
        mockConfigSvc as ConfigurationsService,
        mockTourService as CustomTourService,
        mockRouter as Router,
        mockValueSvc as ValueService,
        mockDialog as MatDialog,
        mockCommonUtilService as CommonUtilService,
        mockAppFrameworkDetectorService as AppFrameworkDetectorService,
        mockUserSvc as UserService,
        mockLocalStorage as LocalStorageService,
        mockEvents as Events,
        mockTelemetryGeneratorService as TelemetryGeneratorService
      )
    });
    it('should go to tnc page', () => {
      // Arrange
      // Act
      const result = component.goHomePage();
      // Assert
      expect(result).toBeUndefined();
    });

    it('should navigate to home page', () => {
      // Arrange
      const mockRouter: Partial<Router> = {
        events: of(new NavigationStart(1, '/app/setup/test'), 
         new NavigationEnd(1, '/app/setup/test', '/app/setup/test')),
        url: '/app/home'
      };
      component = new AppNavBarComponent(
        mockDomSanitizer as DomSanitizer,
        mockConfigSvc as ConfigurationsService,
        mockTourService as CustomTourService,
        mockRouter as Router,
        mockValueSvc as ValueService,
        mockDialog as MatDialog,
        mockCommonUtilService as CommonUtilService,
        mockAppFrameworkDetectorService as AppFrameworkDetectorService,
        mockUserSvc as UserService,
        mockLocalStorage as LocalStorageService,
        mockEvents as Events,
        mockTelemetryGeneratorService as TelemetryGeneratorService
      );
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      // Act
      const result = component.goHomePage();
      // Assert
      expect(result).toBeUndefined();
      expect(mockRouter.navigate).toHaveBeenCalledWith(["page/home"]);
    });

    it('should not navigate to home page for offline', () => {
      //Arrange
      const mockRouter: Partial<Router> = {
        events: of(new NavigationStart(1, '/app/setup/test'), 
         new NavigationEnd(1, '/app/setup/test', '/app/setup/test')),
        url: '/mentor/'
      };
      component = new AppNavBarComponent(
        mockDomSanitizer as DomSanitizer,
        mockConfigSvc as ConfigurationsService,
        mockTourService as CustomTourService,
        mockRouter as Router,
        mockValueSvc as ValueService,
        mockDialog as MatDialog,
        mockCommonUtilService as CommonUtilService,
        mockAppFrameworkDetectorService as AppFrameworkDetectorService,
        mockUserSvc as UserService,
        mockLocalStorage as LocalStorageService,
        mockEvents as Events,
        mockTelemetryGeneratorService as TelemetryGeneratorService
      );
      Object.defineProperty(window.navigator, "onLine", { value: false, configurable: true });
      //Act
      const result = component.goHomePage();
      //Assert
      expect(result).toBeUndefined();
    })
  });

  describe('ngOnChanges', () => {
    it('should call ngOnChanges', () => {
      // Arrange
      component.basicBtnAppsConfig = {
        widgetType: 'actionButton',
        widgetSubType: 'actionButtonApps',
        widgetData: { allListingUrl: '/app/features' }
      };
      component.mode = 'bottom';
  
      const changes = {
        mode: {
          currentValue: 'bottom',
          previousValue: 'top',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      // Act
      component.ngOnChanges(changes);
      // Assert
      expect(component.btnAppsConfig.widgetData.showTitle).toBe(true);
    });

    it('should call ngOnChanges for else part', () => {
      // Arrange
      component.basicBtnAppsConfig = {
        widgetType: 'actionButton',
        widgetSubType: 'actionButtonApps',
        widgetData: { allListingUrl: '/app/features' }
      };
      component.mode = 'top';
  
      const changes = {
        mode: {
          currentValue: 'bottom',
          previousValue: 'top',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      // Act
      component.ngOnChanges(changes);
      // Assert
      expect(component.btnAppsConfig).toBeTruthy();
    });
  });

  describe('getActiveRole', () => {
    it('should get active role', () => {
      // Arrange
      mockLocalStorage.getLocalStorage = jest.fn(() => Promise.resolve('user'));
      // Act
      component.getActiveRole();
      // Assert
      expect(mockLocalStorage.getLocalStorage).toHaveBeenCalledWith('userActiveRole');
    });

    it('should get default role', () => {
      // Arrange
      mockLocalStorage.getLocalStorage = jest.fn(() => Promise.resolve(undefined));
      // Act
      component.getActiveRole();
      // Assert
      expect(mockLocalStorage.getLocalStorage).toHaveBeenCalled();
    });

    it('should get default role as learner for error', () => {
      // Arrange
      mockLocalStorage.getLocalStorage = jest.fn(() => Promise.reject({error: 'error'}));
      // Act
      component.getActiveRole();
      // Assert
      expect(mockLocalStorage.getLocalStorage).toHaveBeenCalled();
    });
  });

  describe('updatePrimaryNavBarConfig', () => {
    beforeEach(() => {
      const mockRouter: Partial<Router> = {
        events: of(new NavigationStart(1, '/app/setup/test'), 
         new NavigationEnd(1, '/app/setup/test', '/app/setup/test')),
        url: '/mentor'
      };
      component = new AppNavBarComponent(
        mockDomSanitizer as DomSanitizer,
        mockConfigSvc as ConfigurationsService,
        mockTourService as CustomTourService,
        mockRouter as Router,
        mockValueSvc as ValueService,
        mockDialog as MatDialog,
        mockCommonUtilService as CommonUtilService,
        mockAppFrameworkDetectorService as AppFrameworkDetectorService,
        mockUserSvc as UserService,
        mockLocalStorage as LocalStorageService,
        mockEvents as Events,
        mockTelemetryGeneratorService as TelemetryGeneratorService
      )
    });
    it('should be updatePrimaryNavBarConfig for mentor', () => {
      //Arrange
      mockConfigSvc.primaryNavBarConfig = {
          smallScreen: {
            left: [
              { config: { actionBtnId: 'feature_home', show: false } },
              { config: { actionBtnId: 'feature_courses', show: true } }
            ]
          }
        } as any;
      mockLocalStorage.getLocalStorage = jest.fn(() => Promise.resolve(undefined));
      component.getActiveRole = jest.fn().mockResolvedValue('user');

      //Act
      component.updatePrimaryNavBarConfig();
      //Assert  
      expect(mockConfigSvc.primaryNavBarConfig).toEqual({
        smallScreen: {
          left: [
            { config: { actionBtnId: 'feature_home', show: false } },
            { config: { actionBtnId: 'feature_courses', show: true } }
          ]
        }
      });
    });
  });

  it('should start tour', () => {
    // Arrange
    mockTourService.startTour = jest.fn(() => true) as any;
    mockTourService.isTourComplete = of(true) as any;
    mockTourService.startPopupTour = jest.fn()
    mockConfigSvc.completedTour = true;
    const subject = new Subject<any>();
    mockConfigSvc.prefChangeNotifier = subject as any;
    jest.useFakeTimers();
    mockTourService.cancelPopupTour = jest.fn();
    // Act
    component.startTour();
    jest.advanceTimersByTime(3000);
    // Assert
    expect(mockTourService.startTour).toHaveBeenCalled();
    expect(mockTourService.startPopupTour).toHaveBeenCalled();
    expect(mockTourService.cancelPopupTour).toHaveBeenCalled();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('should be cancel the tour', () => {
    // Arrange
    component.popupTour = true;
    mockTourService.cancelPopupTour = jest.fn();
    // Act
    component.cancelTour();
    // Assert
    expect(mockTourService.cancelPopupTour).toHaveBeenCalled();
    expect(component.isTourGuideClosed).toBeFalsy();
  });
});
