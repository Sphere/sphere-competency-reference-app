import { YourBackgroundComponent } from "./your-background.component";
import { ChangeDetectorRef } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ConfigurationsService } from "../../../../library/ws-widget/utils/src/public-api";
import { UserProfileService } from "../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service";
import { of } from "rxjs";
import { TelemetryGeneratorService } from "../../../../services";
import { AppFrameworkDetectorService } from "../../core/services/app-framework-detector-service.service";

jest.mock('../../core/services/cordova-http.service', () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    }
  };
});

describe("YourBackgroundComponent", () => {
  let component: YourBackgroundComponent;


  const mockActivateRoute: Partial<ActivatedRoute> = {};
  const mockConfigSvc: Partial<ConfigurationsService> = {};
  const mockUserProfileSvc: Partial<UserProfileService> = {};
  const mockRouter: Partial<Router> = {};
  const mockSnackBar: Partial<MatSnackBar> = {};
  const mockTranslate: Partial<TranslateService> = {};
  const mockCdr: Partial<ChangeDetectorRef> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockAppFrameworkDetectorService: Partial<AppFrameworkDetectorService> = {};

  beforeAll(() => {
    component = new YourBackgroundComponent(
      mockActivateRoute as ActivatedRoute,
      mockRouter as Router,
      mockSnackBar as MatSnackBar,
      mockConfigSvc as ConfigurationsService,
      mockUserProfileSvc as UserProfileService,
      mockTranslate as TranslateService,
      mockCdr as ChangeDetectorRef,
      mockAppFrameworkDetectorService as AppFrameworkDetectorService,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe('onsubmit', () => {
    it('should set yourBackground and navigate to login page for family member', async() => {
      // arrange
      component.bgImgSelect = 'Mother/Family Member';
      mockConfigSvc.userProfile = {
        firstName: 'f-name',
        lastName: 'l-name',
        middleName: 'm-name',
        email: 'emailOrMobile',
        language: 'en',
      } as any;
      component.aboutYou = {
        value: {
          state: 'Bihar',
          distict: 'dis-1',
          city: 'city-1', 
        }
      } as any;
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('sphere'));
      mockUserProfileSvc.updateProfileDetails = jest.fn(() => of({}));
      mockTranslate.instant = jest.fn(() => 'update successfully');
      mockSnackBar.open = jest.fn();
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockActivateRoute.queryParams = of({
        redirect: '/app/home'
      });
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      //act
      await component.onsubmit();
      //assert
      expect(mockUserProfileSvc.updateProfileDetails).toHaveBeenCalled();
      expect(mockTranslate.instant).toHaveBeenCalledWith('USER_PROFILE_DETAILS_UPDATED_SUCCESSFULLY');
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should set yourBackground and navigate to home page for family member', async() => {
      // arrange
      component.bgImgSelect = 'Mother/Family Member';
      mockConfigSvc.userProfile = {
        firstName: 'f-name',
        lastName: 'l-name',
        middleName: 'm-name',
        email: 'emailOrMobile',
        language: 'en',
      } as any;
      component.aboutYou = {
        value: {
          state: 'Bihar',
          distict: 'dis-1',
          city: 'city-1', 
          dob: ''
        }
      } as any;
      mockUserProfileSvc.updateProfileDetails = jest.fn(() => of({}));
      mockTranslate.instant = jest.fn(() => 'update successfully');
      mockSnackBar.open = jest.fn();
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockActivateRoute.queryParams = of({
        redirect: undefined
      });
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('sphere'));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
      //act
      await component.onsubmit();
      //assert
      expect(mockUserProfileSvc.updateProfileDetails).toHaveBeenCalled();
      expect(mockTranslate.instant).toHaveBeenCalledWith('USER_PROFILE_DETAILS_UPDATED_SUCCESSFULLY');
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should submit almost done for others', () => {
      component.bgImgSelect = 'Other Member';
       //act
       component.onsubmit();
       //assert
       expect(component.almostDone).toBeTruthy();
    })
  });

  it('should select a role', () => {
    const role = 'asha';
    const professions = {
      name: 'asha',
    }
    jest.spyOn(component, 'onsubmit').mockImplementation();
    // act
    component.selectRole(role, professions);
    // assert
    expect(component.selectedProfession).toBe(role);
    expect(component.selectedBackground).toBe(professions);
  });

  it('should navigate to asha', () => {
    const professions = {
      name: 'asha',
    }
    jest.spyOn(component, 'onsubmit').mockImplementation();
    // act
    component.navigateAsha(professions);
    // assert
    expect(component.selectedBackground).toBe(professions);
  });

  it('should be toggle a Section', () => {
    const index = 0;
    // act
    component.toggleSection(index);
    // assert
    expect(component.isOpen[index]).toBe(true);
  });

  it('should redirectToYourBackground', () => {
    // act
    component.redirectToYourBackground();
    // assert
    expect(component.redirectToParent).toBeTruthy();
  });

  it('should change the Backgroung', () => {
    // act
    component.changeBackgroung();
    // assert
    expect(component.almostDone).toBe(false);
    expect(component.selectedProfession).toBe('');
  });

  it('should Select a image', () => {
    const img = {
      name: 'health'
    };
    jest.spyOn(component, 'onsubmit').mockImplementation();
    // act
    component.imgSelect(img);
    // assert
    expect(component.nextBtnDisable).toBeFalsy();
    expect(component.bgImgSelect).toBe('health');
  });
});
