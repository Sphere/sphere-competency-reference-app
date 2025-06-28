import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileProfileNavComponent } from './mobile-profile-nav.component'
import { Location } from '@angular/common'
import { of } from 'rxjs'
import { CommonUtilService, TelemetryGeneratorService } from '../../../../../services'
import { LocalStorageService } from '../../../../../app/manage-learn/core'
// import { LogoutComponent } from '../../../../../components/logout/logout.component'
import { RouterLinks } from '../../../../../app/app.constant'



  describe('MobileProfileNavComponent', () => {
    let component: MobileProfileNavComponent
    let fixture: ComponentFixture<MobileProfileNavComponent>
    let commonUtilService: CommonUtilService
    let localStorageService: LocalStorageService
    let location: Location;
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    beforeEach(() => {
      commonUtilService = { updateAppLanguage: jest.fn(), setShowNavBar: jest.fn(), addLoader: jest.fn(), getPreviesUrl: 'previous-url', blockAddUrl: false } as any
      localStorageService = { getLocalStorage: jest.fn().mockResolvedValue({ profileDetails: { preferences: { language: 'en' } } }) } as any
      location = { back: jest.fn() } as any
      const routerMock = { 
        navigateByUrl: jest.fn() 
      };
      component = new MobileProfileNavComponent(
        { open: jest.fn() } as any, // dialog
        location,
        routerMock as any, // router
        { queryParams: of({ redirect: 'test-url' }) } as any, // route
        commonUtilService,
        { back: jest.fn() } as any, // navCtrl
        mockTelemetryGeneratorService as TelemetryGeneratorService,
        localStorageService
      )
    })

    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize with redirectUrl', async() => {
      await component.ngOnInit();
      expect(component.redirectUrl).toBe('test-url')
    })

    it('should call logout and open dialog', () => {
      const dialog = { open: jest.fn() } as any
      component.dialog = dialog
      component.logout();
      (component as any).dialog = dialog
    })

   

    it('should navigate to previous page on backScreen', async () => {
      component.navigateToPreviesPage = true
      const spy = jest.spyOn(component, 'navigateBackToPreviesPage')
      commonUtilService.getPageLoadTime = jest.fn(() => 1000);
      mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn()
      await component.backScreen()
      expect(spy).toHaveBeenCalled()
    })

    it('should navigate to profile dashboard on backScreen', async () => {
      component.trigerrNavigation = true
      const router = { navigateByUrl: jest.fn() } as any
      component.router = router
      await component.backScreen()
      expect(router.navigateByUrl).toHaveBeenCalledWith(RouterLinks.PROFILE_DASHBOARD)
    })

    it('should navigate to personal detail list on backScreen', async () => {
      component.navigateToProfile = true
      const router = { navigate: jest.fn() } as any
      component.router = router
      await component.backScreen()
      expect(router.navigate).toHaveBeenCalledWith(['app/personal-detail-list'])
    })

    it('should navigate to education list on backScreen', async () => {
      component.navigateToEducation = true
      const router = { navigate: jest.fn() } as any
      component.router = router
      await component.backScreen()
      expect(router.navigate).toHaveBeenCalledWith(['app/education-list'])
    })

    it('should navigate to organization list on backScreen', async () => {
      component.navigateToWorkInfo = true
      const router = { navigate: jest.fn() } as any
      component.router = router
      await component.backScreen()
      expect(router.navigate).toHaveBeenCalledWith(['app/organization-list'])
    })

    it('should navigate to redirectUrl on backScreen', async () => {
      component.redirectUrl = 'test-url'
      const router = { navigate: jest.fn() } as any
      component.router = router
      await component.backScreen()
      expect(router.navigate).toHaveBeenCalledWith(['test-url'])
    })

    it('should navigate to Ekshmata home on backScreen', async () => {
      component.navigateToEkshmataHome = true
      const router = { navigate: jest.fn() } as any
      component.router = router
      await component.backScreen()
      expect(router.navigate).toHaveBeenCalledWith(['public/home'])
      expect(commonUtilService.setShowNavBar).toHaveBeenCalledWith(false)
    })

    it('should navigate to Sphere home on backScreen', async () => {
      component.navigateToSphereHome = true
      const router = { navigate: jest.fn() } as any
      component.router = router
      await component.backScreen()
      expect(router.navigate).toHaveBeenCalledWith(['public/home'])
    })

    it('should navigate to home on backScreen', async () => {
      // Set up the component state
      component.navigateTohome = true;
    
      // Mock the router with both navigate and navigateByUrl
      const router = {
        navigate: jest.fn(),
        navigateByUrl: jest.fn(),
      } as any;
    
      // Assign the mock router to the component
      component.router = router;
    
      // Mock localStorage
      localStorage.setItem('orgValue', 'nhsrc');
    
      // Call the method being tested
      await component.backScreen();
    
      // Assert that navigateByUrl was called with the correct argument
      expect(router.navigateByUrl).toHaveBeenCalledWith('/organisations/home');
    });
    

    it('should navigate to default home on backScreen', async () => {
      component.navigateTohome = true
      const router = { navigate: jest.fn() } as any
      component.router = router
      localStorage.removeItem('orgValue')
      await component.backScreen()
      expect(router.navigate).toHaveBeenCalledWith(['/page/home'])
    })

    it('should call location back on backScreen', async () => {
      await component.backScreen()
      expect(location.back).toHaveBeenCalled()
    })

    it('should navigate to home on navigateBackToPreviesPage', async () => {
      // Mock getPreviesUrl as a getter
      Object.defineProperty(commonUtilService, 'getPreviesUrl', {
        get: jest.fn(() => 'page/home'),
      });
      commonUtilService.getPageLoadTime = jest.fn(() => 1000);
      mockTelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
      // Mock router
      const router = { navigateByUrl: jest.fn() } as any;
      component.router = router; // Ensure the mocked router is set on the component
    
      // Call the method
      await component.navigateBackToPreviesPage();
    
      // Assert the navigation
      expect(router.navigateByUrl).toHaveBeenCalledWith('page/home');
      expect(commonUtilService.getPageLoadTime).toHaveBeenCalled();
      expect(mockTelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalled();
    });
    

    it('should unsubscribe OnDestroy on ngOnDestroy', () => {
      component.OnDestroy = { unsubscribe: jest.fn() } as any
      const spy = jest.spyOn(component.OnDestroy, 'unsubscribe')
      component.ngOnDestroy()
      expect(spy).toHaveBeenCalled()
    })
  })


