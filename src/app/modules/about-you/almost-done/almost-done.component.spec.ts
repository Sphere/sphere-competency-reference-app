import { AlmostDoneComponent } from './almost-done.component';
import { HttpClient } from '@angular/common/http';
import { FormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/public-api';
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import { LocalStorageService } from '../../../manage-learn/core';
import { UserService } from '../../home/services/user.service';
import { of } from 'rxjs';
import { Environment, InteractType, PageId, TelemetryGeneratorService } from '../../../../services';
import { AppFrameworkDetectorService } from '../../core/services/app-framework-detector-service.service';

jest.mock('../../core/services/cordova-http.service', () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    }
  };
});

describe('AlmostDoneComponent', () => {
  let component: AlmostDoneComponent;
  const mockActivateRoute: Partial<ActivatedRoute> = {};
  const mockConfigSvc: Partial<ConfigurationsService> = {};
  const mockUserProfileSvc: Partial<UserProfileService> = {};
  const mockRouter: Partial<Router> = {};
  const mockSnackBar: Partial<MatSnackBar> = {};
  const mockFb: Partial<UntypedFormBuilder> = {
    group: jest.fn(() => {
      new FormGroup({
        firstname: new UntypedFormControl("f-name"),
        lastname: new UntypedFormControl("l-name"),
        emailOrMobile: new UntypedFormControl("emailOrMobile"),
        password: new UntypedFormControl("Test@123")
      }) as any
    }) as any
  };
  const mockHttp: Partial<HttpClient> = {};
  const mockUserHomeSvc: Partial<UserService> = {};
  const mockLocalStorage: Partial<LocalStorageService> = {};
  const mockTranslate: Partial<TranslateService> = {};
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
  const mockAppFrameworkDetectorService: Partial<AppFrameworkDetectorService> = {};

  beforeAll(() => {
    component = new AlmostDoneComponent(
      mockConfigSvc as ConfigurationsService,
          mockUserProfileSvc as UserProfileService,
          mockRouter as Router,
          mockSnackBar as MatSnackBar,
          mockFb as UntypedFormBuilder,
          mockActivateRoute as ActivatedRoute,
          mockHttp as HttpClient,
          mockUserHomeSvc as UserService,
          mockLocalStorage as LocalStorageService,
          mockTranslate as TranslateService,
          mockAppFrameworkDetectorService as AppFrameworkDetectorService,
          mockTelemetryGeneratorService as TelemetryGeneratorService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call detectFramework on init for india Healthcare Worker', () => {
      component.yourBackground = {
        value: {
          country: 'India',
        }
      };
      component.backgroundSelect = 'ASHA';
      jest.spyOn(component, 'createUserFormFields').mockImplementation(() => {
        return new UntypedFormGroup({
          firstname: new UntypedFormControl("f-name"),
          lastname: new UntypedFormControl("l-name"),
          emailOrMobile: new UntypedFormControl("emailOrMobile"),
          password: new UntypedFormControl("Test@123"),
          designation: new UntypedFormControl('Midwife'),
          profession: new UntypedFormControl('Midwife'),
        })
      });
      component.selectedBackground = {
        name: 'Healthcare Worker'
      }
      component.selectedProfession ='Midwife';
      mockUserProfileSvc.getData = jest.fn(() => of({states: [{state: 'Bihar', districts: ['b1', 'b2']}]}));
      component.ngOnInit();
      expect(component.hideAsha).toBeFalsy();
    });
  });

  describe('updateProfile', () => {
    it('should call updateProfile', async() => {
      mockConfigSvc.userProfile = {
        firstName: 'f-name',
        lastName: 'l-name',
        middleName: 'm-name',
        email: 'emailOrMobile',
        language: 'en',
      } as any;
      mockConfigSvc.unMappedUser = {
        id: '123'
      } as any;
      mockUserHomeSvc.userRead = jest.fn(() => Promise.resolve());
      mockUserProfileSvc.updateProfileDetails = jest.fn(() => of({}))
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({
        id: 'user-id',
        name: 'user-name'
      })) as any;
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('sphere'));
      mockLocalStorage.setLocalStorage = jest.fn(() => Promise.resolve());
      mockTranslate.instant = jest.fn(() => 'update successfully');
      mockSnackBar.open = jest.fn();
      mockActivateRoute.queryParams = of({
        redirect: '/app/home'
      });
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
       // act
      await component.updateProfile();
      expect(component.defaultLang).toBe('en');
      expect(mockUserHomeSvc.userRead).toHaveBeenCalled();
      expect(mockUserProfileSvc.updateProfileDetails).toHaveBeenCalled();
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalled();
      expect(mockLocalStorage.setLocalStorage).toHaveBeenCalled();
      expect(mockTranslate.instant).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(mockAppFrameworkDetectorService.detectAppFramework).toHaveBeenCalled();
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
        InteractType.UPDATE_PROFILE,
        'success',
        Environment.HOME,
        PageId.PROFILE
      );
    });

    it('should call updateProfile and navigate to home page for other user', async() => {
      mockConfigSvc.userProfile = {
        firstName: 'f-name',
        lastName: 'l-name',
        middleName: 'm-name',
        email: 'emailOrMobile',
        language: 'en',
      } as any;
      mockConfigSvc.unMappedUser = {
        id: '123'
      } as any;
      component.backgroundSelect = 'Others';
      component.selectedBg = 'Asha Facilitator';
      mockUserHomeSvc.userRead = jest.fn(() => Promise.resolve());
      mockUserProfileSvc.updateProfileDetails = jest.fn(() => of({}))
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({
        id: 'user-id',
        name: 'user-name'
      })) as any;
      mockLocalStorage.setLocalStorage = jest.fn(() => Promise.resolve());
      mockTranslate.instant = jest.fn(() => 'update successfully');
      mockSnackBar.open = jest.fn();
      mockActivateRoute.queryParams = of({
        redirect: undefined
      });
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('sphere'));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
       // act
      await component.updateProfile();
      expect(component.defaultLang).toBe('en');
      expect(mockUserHomeSvc.userRead).toHaveBeenCalled();
      expect(mockUserProfileSvc.updateProfileDetails).toHaveBeenCalled();
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalled();
      expect(mockLocalStorage.setLocalStorage).toHaveBeenCalled();
      expect(mockTranslate.instant).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(mockAppFrameworkDetectorService.detectAppFramework).toHaveBeenCalled();
      expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
        InteractType.UPDATE_PROFILE,
        'success',
        Environment.HOME,
        PageId.PROFILE
      );
    });

    it('should call updateProfile and navigate to home page for studen', async() => {
      mockConfigSvc.userProfile = {
        firstName: 'f-name',
        lastName: 'l-name',
        middleName: 'm-name',
        email: 'emailOrMobile',
        language: 'en',
      } as any;
      mockConfigSvc.unMappedUser = {
        id: '123'
      } as any;
      component.backgroundSelect = 'Student';
      component.selectedBg = '';
      mockUserHomeSvc.userRead = jest.fn(() => Promise.resolve());
      mockUserProfileSvc.updateProfileDetails = jest.fn(() => of({}))
      mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({
        id: 'user-id',
        name: 'user-name'
      })) as any;
      mockLocalStorage.setLocalStorage = jest.fn(() => Promise.resolve());
      mockTranslate.instant = jest.fn(() => 'update successfully');
      mockSnackBar.open = jest.fn();
      mockActivateRoute.queryParams = of({
        redirect: undefined
      });
      mockRouter.navigate = jest.fn(() => Promise.resolve(true));
      mockAppFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('sphere'));
      mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();
       // act
      await component.updateProfile();
      expect(component.defaultLang).toBe('en');
      expect(mockUserHomeSvc.userRead).toHaveBeenCalled();
      expect(mockUserProfileSvc.updateProfileDetails).toHaveBeenCalled();
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalled();
      expect(mockLocalStorage.setLocalStorage).toHaveBeenCalled();
      expect(mockTranslate.instant).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(mockAppFrameworkDetectorService.detectAppFramework).toHaveBeenCalled();
    });
  })

  describe("assignFields", () => {
    it("should set form control values correctly when qid matches profession/designation/organization fields", () => {
      const formBuilderMock = new UntypedFormBuilder();
      component.createUserForm = formBuilderMock.group({
        designation: [""],
        orgType: [""],
        orgName: [""],
        orgOtherSpecify: [""]
      });

      component.profession = "faculty";
      component.backgroundSelect = "Healthcare Volunteer";

      component.assignFields("profession", "Doctor", {});
      expect(component.createUserForm.get("designation").value).toBe("Doctor");

      component.assignFields("organizationType", "Hospital", {});
      expect(component.createUserForm.get("orgType").value).toBe("Hospital");

      component.assignFields("organizationName", "City Hospital", {});
      expect(component.createUserForm.get("orgName").value).toBe(
        "City Hospital"
      );

      component.assignFields("institutionName", "City Hospital", {});
      expect(component.createUserForm.get("orgName").value).toBe(
        "City Hospital"
      );
      component.profession = "";

      component.assignFields("institutionName", "City Hospital", {});
      expect(component.createUserForm.get("orgName").value).toBe(
        "City Hospital"
      );

      component.assignFields("coursename", "IHAT", {});
      expect(component.studentCourse).toBe("IHAT");

      component.assignFields("locationselect", "Bihar", {});
      expect(component.almostDoneForm.get("locationselect").value).toBe(
        "Bihar"
      );

      //Block valid
      component.assignFields("block", "block-1", {});
      expect(component.blockEntered).toBeTruthy();
      // block empty
      component.assignFields("block", "", {});
      expect(component.blockEntered).toBeFalsy();
      // subcentre valid
      component.assignFields("subcentre", "RD-1", {});
      expect(component.subcentreEntered).toBeTruthy();
      // subcentre empty
      component.assignFields("subcentre", "", {});
      expect(component.subcentreEntered).toBeFalsy();
      // default
      component.assignFields("default", "", {});
      expect(component.enableSubmit).toBeTruthy();
    });

    it("should set form control values correctly for ASHA", () => {
      const formBuilderMock = new UntypedFormBuilder();
      component.createUserForm = formBuilderMock.group({
        designation: [""],
        orgType: [""],
        orgName: [""],
        orgOtherSpecify: [""],
      });

      component.profession = "faculty";
      component.backgroundSelect = "ASHA";

      component.assignFields("profession", "Doctor", {});
      expect(component.createUserForm.get("designation").value).toBe("Doctor");

      component.assignFields("organizationType", "Hospital", {});
      expect(component.createUserForm.get("orgType").value).toBe("Hospital");

      component.assignFields("organizationName", "City Hospital", {});
      expect(component.createUserForm.get("orgName").value).toBe(
        "City Hospital"
      );

      component.assignFields("institutionName", "City Hospital", {});
      expect(component.createUserForm.get("orgName").value).toBe(
        "City Hospital"
      );
      component.profession = "";

      component.assignFields("institutionName", "City Hospital", {});
      expect(component.createUserForm.get("orgName").value).toBe(
        "City Hospital"
      );

      component.assignFields("coursename", "IHAT", {});
      expect(component.studentCourse).toBe("IHAT");

      component.assignFields("locationselect", "Bihar", {});
      expect(component.almostDoneForm.get("locationselect").value).toBe(
        "Bihar"
      );

      //Block valid
      component.assignFields("block", "block-1", {});
      expect(component.blockEntered).toBeTruthy();
      // block empty
      component.assignFields("block", "", {});
      expect(component.blockEntered).toBeFalsy();
      // subcentre valid
      component.assignFields("subcentre", "RD-1", {});
      expect(component.subcentreEntered).toBeTruthy();
      // subcentre empty
      component.assignFields("subcentre", "", {});
      expect(component.subcentreEntered).toBeFalsy();
      // default
      component.assignFields("default", "", {});
      expect(component.enableSubmit).toBeTruthy();
    });
  });

  it('should redirect to background', () => {
    component.redirectToYourBackground();
    component.redirectToParent = {
      emit: jest.fn()
    } as any;
    expect(component.redirectToParent).toBeTruthy();
  })

  describe('chooseBackground', () => {
    it('should choose background for mother and family members', () => {
      // arrange
      const data = 'Mother/Family Members';
      // act
      component.chooseBackground(data);
      // assert
      expect(component.enableSubmit).toBe(false);
    });

    it('should choose background for ASHA', () => {
      // arrange
      const data = 'Asha Facilitator';
      mockHttp.get = jest.fn(() => of({
          states: [
            {
              state: 'Bihar',
              districts: ['dis-1', 'dis-2'],
              name: 'Bihar'
            }
          ]
      })) as any;
      component.yourBackground = {
        value: {state: 'Bihar'}
      };
      // act
      component.chooseBackground(data);
      // assert
      expect(component.enableSubmit).toBe(true);
      expect(component.disticts).toEqual(['dis-1', 'dis-2']);
      expect(mockHttp.get).toHaveBeenCalled();
    });
  });

  describe('setFormFields', () => {
    it('should set form fields for Healthcare Worker and Others', () => {
      component.selectedBackground = {
        name: 'Healthcare Worker'
      }
      component.selectedProfession = 'Others'
      // act
      component.setFormFields();
      // assert
      expect(component.almostDoneForm.get('locationselect')).toBeTruthy();
      expect(component.almostDoneForm.get('block')).toBeTruthy();
      expect(component.almostDoneForm.get('subcentre')).toBeTruthy();
      expect(component.isRnNumber).toBeFalsy();
    });

    it('should set form fields for Others', () => {
      component.selectedBackground = {
        name: 'Others'
      }
      component.selectedProfession = 'Others'
      // act
      component.setFormFields();
      // assert
      expect(component.almostDoneForm.get('locationselect')).toBeTruthy();
      expect(component.almostDoneForm.get('block')).toBeTruthy();
      expect(component.almostDoneForm.get('subcentre')).toBeTruthy();
      expect(component.isOthers).toBeTruthy();
    });

    it('should set form fields for Others but not others profession', () => {
      component.selectedBackground = {
        name: 'Others'
      }
      component.selectedProfession = 'student'
      // act
      component.setFormFields();
      // assert
      expect(component.almostDoneForm.get('locationselect')).toBeTruthy();
      expect(component.almostDoneForm.get('block')).toBeTruthy();
      expect(component.almostDoneForm.get('subcentre')).toBeTruthy();
      expect(component.isOthers).toBeFalsy();
    });
  });

  describe('professionSelect', () => {
    it('should set selectedProfession', () => {
      // arrange
      const data = 'student';
      // act
      component.professionSelect(data);
      // assert
      expect(component.createUserForm.controls.designation.value).toBe('student');
      expect(component.almostDoneForm.controls.profession.value).toBe(data);
    });

    it('should set as null for selectedProfession', () => {
      // arrange
      const data = 'null';
      // act
      component.professionSelect(data);
      // assert
      expect(component.almostDoneForm.controls.profession.value).toBe(null);
    });

    it('should set selectedProfession as others', () => {
      // arrange
      const data = 'Others';
      // act
      component.professionSelect(data);
      // assert
      expect(component.almostDoneForm.controls.profession.value).toBe('Others');
      expect(component.professionOthersField).toBeTruthy()
    });

    it('should set selectedProfession as Midwives', () => {
      // arrange
      const data = 'Midwives';
      // act
      component.professionSelect(data);
      // assert
      expect(component.rnFieldDisabled).toBeFalsy()
    });
  });

  describe('setProfession', () => {
    it('should set selectedProfession', () => {
      // arrange
      component.selectedProfession = undefined
      // act
      component.setProfession();
      // assert
      expect(component.almostDoneForm.controls.profession.value).toBe(null);
    });
  });

  describe('orgTypeSelect', () => {
    it('should set orgType for selectedOrgType', () => {
      // arrange
      const data = 'student';
      // act
      component.orgTypeSelect(data);
      // assert
      expect(component.almostDoneForm.controls.orgType.value).toBe(data);
    });

    it('should set orgType as null for undefined users', () => {
      // arrange
      const data = 'null';
      // act
      component.orgTypeSelect(data);
      // assert
      expect(component.almostDoneForm.controls.orgType.value).toBe(null);
    });

    it('should set orgType for others', () => {
      // arrange
      const data = 'Others';
      // act
      component.orgTypeSelect(data);
      // assert
      expect(component.orgOthersField).toBeTruthy();
      expect(component.createUserForm.controls.orgOtherSpecify.value).toBeNull();
      expect(component.almostDoneForm.controls.orgOtherSpecify.value).toBe(null);
    });
  });

  describe('onsubmit', () => {
    beforeEach(() => {
      const formBuilderMock = new UntypedFormBuilder();
      component.almostDoneForm = formBuilderMock.group({
        designation: ["ASHA"],
        orgType: [""],
        orgName: [""],
        orgOtherSpecify: [""],
        profession: ["ASHA"],
        selectBackground: ["ASHA"],
      });
    })
    it('should set yourBackground to true', () => {
      // arrange
      component.yourBackground = {
        value: {
          country: 'India',
          state: 'Bihar',
          distict: 'dis-1'
        }
      }
      jest.spyOn(component, 'updateProfile').mockImplementation(() => {
          return Promise.resolve();
      });
      component.isOthers = true;
      // act
      component.onsubmit();
      // assert
      expect(component.yourBackground).toBeTruthy();
      expect(component.selectedAddress).toBe('India, Bihar, dis-1');
      expect(component.almostDoneForm.controls.profession.value).toBe('ASHA');
      expect(component.almostDoneForm.controls.designation.value).toBe('ASHA');
      expect(component.almostDoneForm.controls.selectBackground.value).toBe('ASHA');
    });
  });
});
