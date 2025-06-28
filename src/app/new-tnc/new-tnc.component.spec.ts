// import { async, ComponentFixture, TestBed } from '@angular/core/testing'

// import { NewTncComponent } from './new-tnc.component'

// describe('NewTncComponent', () => {
//   let component: NewTncComponent
//   let fixture: ComponentFixture<NewTncComponent>

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [NewTncComponent],
//     })
//     .compileComponents()
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(NewTncComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//   })

//   it('should create', () => {
//     expect(component).toBeTruthy()
//   })
// })

import { NewTncComponent } from './new-tnc.component';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('NewTncComponent', () => {
  let component: NewTncComponent;
  let mockActivatedRoute: any;
  let mockRouter: any;
  let mockConfigurationsService: any;
  let mockTncPublicResolverService: any;
  let mockSignupService: any;
  let mockAppGlobalService: any;
  let mockCommonUtilService: any;
  let mockTelemetryGeneratorService: any;
  let mockFormAndFrameworkUtilService: any;
  let mockSbProgressLoader: any;
  let mockNgZone: any;
  let mockAuthService: any;
  let mockSharedPreferences: any;
  let mockUserService: any;
  let mockLocalStorageService: any;
  let mockConfigService: any;
  let mockChangeDetectorRef: any;
  let mockAuthKeycloakService: any;
  let mockEvents: any;
  let mockAppFrameworkDetectorService: any;

  beforeEach(() => {
    mockActivatedRoute = {
      data: of({ tnc: { /* mock TNC data */ }, isPublic: true }),
    };
    mockRouter = {
      navigate: jest.fn(),
    };
    mockConfigurationsService = {
      unMappedUser: { id: 'mockUserId' },
      userDetails: {
        profileDetails: {
          tcStatus: 'false',
        },
      },
      profileDetailsStatus: false,
      hasAcceptedTnc: false,
      get userProfile() {
        return this.unMappedUser;
      },
      set userProfile(user: any) {
        this.unMappedUser = user;
      },
    };
    mockTncPublicResolverService = {
      getPublicTnc: jest.fn().mockReturnValue(of({ /* mock TNC data */ })),
    };
    mockSignupService = {
      fetchStartUpDetails: jest.fn().mockResolvedValue({ /* mock startup details */ }),
    };
    mockAppGlobalService = {
      resetSavedQuizContent: jest.fn(),
    };
    mockCommonUtilService = {
      networkInfo: {
        isNetworkAvailable: true,
      },
      showToast: jest.fn(),
      generateInteractTelemetry: jest.fn(),
      getLoader: jest.fn().mockResolvedValue({ present: jest.fn(), dismiss: jest.fn() }),
    };
    mockTelemetryGeneratorService = {
      generateInteractTelemetry: jest.fn(),
    };
    mockFormAndFrameworkUtilService = {
      getWebviewSessionProviderConfig: jest.fn().mockResolvedValue({ /* mock webview session config */ }),
    };
    mockSbProgressLoader = {
      hide: jest.fn(),
    };
    mockNgZone = {
      run: jest.fn((fn: Function) => fn()),
    };
    mockAuthService = {
      setSession: jest.fn().mockResolvedValue(undefined),
      getSession: jest.fn().mockResolvedValue({ userToken: 'mockUserToken' }),
    };
    mockSharedPreferences = {
      putString: jest.fn().mockResolvedValue(undefined),
    };
    mockUserService = {
      userReadCall: jest.fn().mockReturnValue(of({ /* mock user data */ })),
    };
    mockLocalStorageService = {
      getLocalStorage: jest.fn().mockResolvedValue('mockUrl'),
    };
    mockConfigService = {
      clearConfig: jest.fn(),
    };
    mockChangeDetectorRef = {
      markForCheck: jest.fn(),
    };
    mockAuthKeycloakService = {
      logout: jest.fn().mockResolvedValue(undefined),
    };
    mockEvents = {
      publish: jest.fn(),
    };
    mockAppFrameworkDetectorService = {
      detectAppFramework: jest.fn().mockResolvedValue('mockAppFramework'),
    };

    component = new NewTncComponent(
      mockActivatedRoute,
      mockRouter,
      {} as any, // mockLoggerService
      mockConfigurationsService,
      mockTncPublicResolverService,
      {} as any, // mockUserProfileService
      mockSignupService,
      mockAppGlobalService,
      mockCommonUtilService,
      mockTelemetryGeneratorService,
      mockFormAndFrameworkUtilService,
      mockSbProgressLoader,
      mockNgZone,
      mockAuthService,
      mockSharedPreferences,
      mockUserService,
      mockLocalStorageService,
      mockConfigService,
      mockChangeDetectorRef,
      mockAuthKeycloakService,
      mockEvents,
      mockAppFrameworkDetectorService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component data', async () => {
      // Mock ActivatedRoute data
      const mockData = { tnc: { /* mock TNC data */ }, isPublic: true };
      jest.spyOn(mockActivatedRoute, 'data', 'get').mockReturnValue(of(mockData));

      await component.ngOnInit();

      expect(component.tncData).toEqual(mockData.tnc);
      expect(component.isPublic).toEqual(true);
      expect(mockSignupService.fetchStartUpDetails).toHaveBeenCalled();
      expect(component.createUserForm).toBeDefined();
    });

    it('should navigate to error route if tnc data is not available', async () => {
      jest.spyOn(mockActivatedRoute, 'data', 'get').mockReturnValue(of({}));

      await component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['error-service-unavailable']);
    });

    it('should handle unMappedUser and showAcceptbtn logic', async () => {
      // Mock configurations service with unMappedUser
      const mockUserDetails = {

        
        profileDetails: {
          tcStatus: 'false',
        },
      };
      mockConfigurationsService.unMappedUser = { id: 'mockUserId' };
      mockConfigurationsService.userDetails = mockUserDetails;

      await component.ngOnInit();

      expect(component.showAcceptbtn).toEqual(true);
    });

    it('should handle createUserForm creation', async () => {
      await component.ngOnInit();

      expect(component.createUserForm).toBeDefined();
      expect(component.createUserForm.controls.tncAccepted.value).toEqual('');
    });
  });

  describe('acceptTnc', () => {
    // it('should handle accepting TNC', async () => {
    //   component.tncData = {
    //     termsAndConditions: [
    //       { name: 'Generic T&C', language: 'en', version: '1.0' },
    //       { name: 'Data Privacy', language: 'en', version: '1.0' },
    //     ],
    //   };
    //   component.configSvc.userDetails = { userId: 'mockUserId', email: 'test@example.com', firstName: 'John', lastName: 'Doe' };

    //   jest.spyOn(component.createUserForm.controls.tncAccepted, 'setValue');
    //   jest.spyOn(component, 'updateUser').mockImplementation();

    //   component.acceptTnc();

    //   expect(component.createUserForm.controls.tncAccepted.setValue).toHaveBeenCalledWith('true');
    //   expect(component.updateUser).toHaveBeenCalled();
    // });

    // it('should handle accepting TNC without userDetails', async () => {
    //   component.tncData = {
    //     termsAndConditions: [
    //       { name: 'Generic T&C', language: 'en', version: '1.0' },
    //       { name: 'Data Privacy', language: 'en', version: '1.0' },
    //     ],
    //   };
    //   component.configSvc.userDetails = undefined;

    //   jest.spyOn(component.createUserForm.controls.tncAccepted, 'setValue');
    //   jest.spyOn(component, 'updateUser').mockImplementation();

    //   component.acceptTnc();

    //   expect(component.createUserForm.controls.tncAccepted.setValue).toHaveBeenCalledWith('true');
    //   expect(component.updateUser).toHaveBeenCalled();
    // });

    // it('should handle error during acceptTnc', async () => {
    //   component.tncData = {
    //     termsAndConditions: [
    //       { name: 'Generic T&C', language: 'en', version: '1.0' },
    //       { name: 'Data Privacy', language: 'en', version: '1.0' },
    //     ],
    //   };
    //   component.configSvc.userDetails = { userId: 'mockUserId', email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
    //   jest.spyOn(component, 'updateUser').mockRejectedValue('error');

    //   component.acceptTnc();

    //   expect(component.errorInAccepting).toEqual(true);
    //   expect(component.isAcceptInProgress).toEqual(false);
    // });
  });

  // Add more test cases for other methods as needed
});
