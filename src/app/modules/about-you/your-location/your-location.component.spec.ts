import { UserProfileService } from "../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service";
import { CommonUtilService } from "../../../../services";
import { YourLocationComponent } from "./your-location.component";
import { Router } from "@angular/router";
import { ConfigurationsService } from "../../../../library/ws-widget/utils/src/public-api";
import { of } from "rxjs";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";

jest.mock('../../core/services/cordova-http.service', () => {
  return {
    CordovaHttpService: class {
      get = jest.fn();
      post = jest.fn();
    }
  };
});

describe("YourLocationComponent", () => {
  let component: YourLocationComponent;

  const userProfileSvc: Partial<UserProfileService> = {};
  const commonUtilService: Partial<CommonUtilService> = {
    removeLoader: jest.fn(() => Promise.resolve()),
  };
  const router: Partial<Router> = {};
  const configSvc: Partial<ConfigurationsService> = {};

  beforeAll(() => {
    component = new YourLocationComponent(
      userProfileSvc as UserProfileService,
      commonUtilService as CommonUtilService,
      router as Router,
      configSvc as ConfigurationsService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a instance of component", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should navigate if dob is available", () => {
      // arrange
      configSvc.userProfile = {
        dob: new Date(),
        uid: "123",
      } as any;
      configSvc.unMappedUser = {
        id: "123",
      };
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() =>
        of({
          fname: "test",
          profileDetails: {
            profileReq: {
              personalDetails: {
                dob: new Date(),
              },
            },
          },
        })
      ) as any;
      router.navigate = jest.fn(() => Promise.resolve(true));
      //act
      component.ngOnInit();
      //assert
      expect(configSvc.unMappedUser && configSvc.unMappedUser.id).toBeTruthy();
      expect(configSvc.userProfile).toBeTruthy();
      expect(userProfileSvc.getUserdetailsFromRegistry).toBeCalledWith(
        configSvc.unMappedUser.id
      );
    });

    it("should not navigate if FromRegistry is null", () => {
      // arrange
      configSvc.userProfile = {
        dob: undefined,
        uid: "123",
      } as any;
      configSvc.unMappedUser = {
        id: "123",
      };
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() =>
        of({
          fname: "test",
          profileDetails: {
            profileReq: {
              personalDetails: {
                dob: undefined,
              },
            },
          },
        })
      ) as any;
      router.navigate = jest.fn(() => Promise.resolve(true));
      //act
      component.ngOnInit();
      //assert
      expect(configSvc.unMappedUser && configSvc.unMappedUser.id).toBeTruthy();
      expect(configSvc.userProfile).toBeTruthy();
      expect(userProfileSvc.getUserdetailsFromRegistry).toBeCalledWith(
        configSvc.unMappedUser.id
      );
    });

    it("should not navigate if FromRegistry is null", () => {
      // arrange
      configSvc.userProfile = {
        dob: undefined,
        uid: "123",
      } as any;
      configSvc.unMappedUser = {
        id: "123",
      };
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() =>
        of(undefined)
      ) as any;
      router.navigate = jest.fn(() => Promise.resolve(true));
      //act
      component.ngOnInit();
      //assert
      expect(configSvc.unMappedUser && configSvc.unMappedUser.id).toBeTruthy();
      expect(configSvc.userProfile).toBeTruthy();
      expect(userProfileSvc.getUserdetailsFromRegistry).toBeCalledWith(
        configSvc.unMappedUser.id
      );
    });

    it("should not navigate if userProfile is undefined", () => {
      // arrange
      configSvc.userProfile = undefined;
      configSvc.unMappedUser = {
        id: "123",
      };
      userProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of({})) as any;
      router.navigate = jest.fn(() => Promise.resolve(true));
      //act
      component.ngOnInit();
      //assert
      expect(configSvc.unMappedUser && configSvc.unMappedUser.id).toBeTruthy();
      expect(configSvc.userProfile).toBeUndefined();
    });
  });

  describe("countrySelect", () => {
    it("should set country code for india", () => {
      // arrange
      const option = "India";
      component.countries = [
        {
          name: "India",
          countryCode: "IN",
        },
      ];
      //act
      component.countrySelect(option);
      //assert)
      expect(component.selectDisable).toBe(false);
    });

    it("should set country code for other than india", () => {
      // arrange
      const option = "canada";
      component.countries = [
        {
          name: "canada",
          countryCode: "cn",
        },
      ];
      //act
      component.countrySelect(option);
      //assert)
      expect(component.selectDisable).toBe(true);
    });
  });

  describe("onDateChange", () => {
    it("should set invalidDob to true", () => {
      // arrange
      component.dob = new Date();
      //act
      component.onDateChange(component.dob);
      //assert)
      expect(component.invalidDob).toBe(true);
    });

    it("should set invalidDob to false", () => {
      // arrange
      component.dob = "2005-10-31";
      //act
      component.onDateChange(component.dob);
      //assert)
      expect(component.invalidDob).toBe(false);
    });
  });

  describe("disableNextBtn", () => {
    it("should set nextBtnDisable to true", () => {
      // arrange
      component.aboutYouForm = new UntypedFormGroup({
        dob: new UntypedFormControl(''),
        country: new UntypedFormControl(''),
        state: new UntypedFormControl(''),
        distict: new UntypedFormControl('')
      });
      //act
      component.disableNextBtn();
      //assert)
      expect(component.nextBtnDisable).toBe(true);
    });

    it("should set nextBtnDisable for other cuntries", () => {
        // arrange
        component.aboutYouForm = new UntypedFormGroup({
            dob: new UntypedFormControl('2000-01-01'),
            country: new UntypedFormControl('USA'),
            state: new UntypedFormControl(''),
            distict: new UntypedFormControl('')
          });
        //act
        component.disableNextBtn();
        //assert)
        expect(component.nextBtnDisable).toBe(false);
      });

      it("should set nextBtnDisable for india", () => {
        // arrange
        component.aboutYouForm = new UntypedFormGroup({
            dob: new UntypedFormControl('2000-01-01'),
            country: new UntypedFormControl('India'),
            state: new UntypedFormControl(''),
            distict: new UntypedFormControl('')
          });
        //act
        component.disableNextBtn();
        //assert)
        expect(component.nextBtnDisable).toBe(true);
      });

      it("should set nextBtnDisable for india and set state and distict", () => {
        // arrange
        component.aboutYouForm = new UntypedFormGroup({
            dob: new UntypedFormControl('2000-01-01'),
            country: new UntypedFormControl('India'),
            state: new UntypedFormControl('Bihar'),
            distict: new UntypedFormControl('rajgir')
          });
        //act
        component.disableNextBtn();
        //assert)
        expect(component.nextBtnDisable).toBe(false);
      });

      it("should set nextBtnDisable for india and set state and distict", () => {
        // arrange
        component.aboutYouForm = new UntypedFormGroup({
            dob: new UntypedFormControl('2000-01-01'),
            country: new UntypedFormControl(undefined),
            state: new UntypedFormControl(''),
            distict: new UntypedFormControl('')
          });
        //act
        component.disableNextBtn();
        //assert)
        expect(component.nextBtnDisable).toBe(true);
      });
  });

  describe('stateSelect', () => {
    it('should set state', () => {
      // arrange
      const option = 'Bihar';
      userProfileSvc.getData = jest.fn(() => of({states: [{state: 'Bihar', districts: []}]}));
      //act
      component.stateSelect(option);
      //assert
      expect(userProfileSvc.getData).toBeCalledWith('/fusion-assets/files/district.json');
      expect(component.aboutYouForm.controls.state.value).toEqual('');  
    });

    it('should set state for else part', () => {
      // arrange
      const option = 'Bihar';
      userProfileSvc.getData = jest.fn(() => of({}));
      //act
      component.stateSelect(option);
      //assert
      expect(userProfileSvc.getData).toBeCalledWith('/fusion-assets/files/district.json');
      expect(component.aboutYouForm.controls.state.value).toEqual('');  
    });
  });

  describe('onsubmit', () => {
    it('should set yourBackground to true', () => {
      // arrange
      //act
      component.onsubmit();
      //assert
      expect(component.yourBackground).toBe(true);
    });
  });

  it('should update dobData event', () => {
    // arrange  
    const mockDate = '2000-01-01';
    component.aboutYouForm = new UntypedFormGroup({
      dob: new UntypedFormControl('')
    });
    jest.spyOn(component, 'disableNextBtn').mockImplementation();
    //act   
    component.dobData(mockDate);            
    //assert
    expect(component.aboutYouForm.get('dob')?.value).toBe(mockDate);
    expect(component.disableNextBtn).toHaveBeenCalled();  
  });

  it('should change location', () => {
    // arrange  
    // act
    component.changelocation();
    // assert
    expect(component.yourBackground).toBe(false);
  })
});
