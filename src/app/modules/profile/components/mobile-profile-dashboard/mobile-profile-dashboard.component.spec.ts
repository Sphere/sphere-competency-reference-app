import { MobileProfileDashboardComponent } from './mobile-profile-dashboard.component';
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api';
import { CommonUtilService } from '../../../../../services';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../../home/services/user.service';
import { WidgetContentService } from '../../../../../library/ws-widget/collection';
import { LocalStorageService } from '../../../../../app/manage-learn/core';
import { AppFrameworkDetectorService } from '../../../core/services/app-framework-detector-service.service';
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import { of } from 'rxjs';
import { mockBatchList, mockUserProfileDetailsFromRegistry } from './mobile-profile-dashboard.component.spec.data';
import { mergeMap } from 'rxjs/operators';


describe('MobileProfileDashboardComponent', () => {
  
  let component: MobileProfileDashboardComponent;
  
  // let mocDialog: Partial<MatDialogRef<MobileProfileDashboardComponent>> = {
  //   close: jest.fn()
  // };
  const mocDialog: Partial<MatDialog> = {
    open: jest.fn()
  };
  const mockConfigurationsService: Partial<ConfigurationsService> = {
    unMappedUser : {
      id:123
    }
  };
  const mockCommonUtilService: Partial<CommonUtilService> = {
    addLoader: jest.fn(),
    removeLoader: jest.fn(),
    changeAppLanguage: jest.fn()
  };
  const mockRouter: Partial<Router> = {
    getCurrentNavigation: jest.fn(),
    navigate: jest.fn()
  };
  
  const mockUserProfileSvc: Partial<UserProfileService> = {
    getUserdetailsFromRegistry: jest.fn(()=>of()),
    updateProfileDetails: jest.fn(()=>of())
  };
  const mockContentSvc: Partial<WidgetContentService>  = {
    fetchUserBatchList: jest.fn(()=>of())
  };
  const mockDomSanitizer: Partial<DomSanitizer> = {};
  const mockValueSvc: Partial<ValueService> = {};
  const mockLocalStorage: Partial<LocalStorageService> = {
    setLocalStorage: jest.fn()
  };
  const mockAppFrameworkDetectorService: Partial< AppFrameworkDetectorService> = {};
  const mockUserHomeSvc: Partial<UserService> = {};

  const constructComponent = () => {
    component = new MobileProfileDashboardComponent(
      mockConfigurationsService as ConfigurationsService,
      mockRouter as Router,
      mocDialog as MatDialog,
      mockUserProfileSvc as UserProfileService,
      mockContentSvc as WidgetContentService,
      mockDomSanitizer as DomSanitizer,
      mockValueSvc as ValueService,
      mockCommonUtilService as CommonUtilService,
      mockLocalStorage as LocalStorageService,
      mockAppFrameworkDetectorService  as AppFrameworkDetectorService,
      mockUserHomeSvc as UserService
    );
  }
  beforeAll(() => {
    constructComponent();
  });

  beforeEach(() => {
    mockConfigurationsService.userProfile = { userId: '1234' };
    
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy()
  });

  // it('should call the getUserDetails',(done)=>{
  //   mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of());
  //   constructComponent();
  //   expect(mockUserProfileSvc.getUserdetailsFromRegistry).toBeCalled();
  //   done();
  // })

  it('should call the detectFramework',async (done)=>{
    const detectFrameworkSpy = jest.spyOn(component, 'detectFramework');
    // const removeLoaderSpy = jest.spyOn(mockCommonUtilService, 'removeLoader');

    mockUserProfileSvc.updateuser$ = of('someValue');

    mockValueSvc.isXSmall$ = of(true)
    mockCommonUtilService.removeLoader = jest.fn();

    mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of());
    (mockUserProfileSvc.getUserdetailsFromRegistry as jest.Mock).mockReturnValue(of({profileDetails:{profileReq: mockUserProfileDetailsFromRegistry}}));
    mockContentSvc.fetchUserBatchList = jest.fn(() => of());

    component.ngOnInit();
    
    expect(mockUserProfileSvc.getUserdetailsFromRegistry).toBeCalledWith(mockConfigurationsService.unMappedUser.id);
    expect(mockContentSvc.fetchUserBatchList).toBeCalledWith(mockConfigurationsService.unMappedUser.id);

    setTimeout(() => {
      expect(component.profileData).toMatchObject(mockUserProfileDetailsFromRegistry);
      expect(component.showbackButton).toBeTruthy();
      expect(component.showLogOutIcon).toBeTruthy();
      expect(detectFrameworkSpy).toBeCalled();
      done();
    }, 1000);
  })

  it('should update the isXSmall',async (done)=>{
    mockValueSvc.isXSmall$ = of(false);
    mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of());
    mockContentSvc.fetchUserBatchList = jest.fn(() => of());
    component.ngOnInit();

    setTimeout(() => {
      expect(component.showbackButton).toBeFalsy();
      expect(component.showLogOutIcon).toBeFalsy();
      done();
    }, 1000);
  })

  it('should call setLanguage',async (done)=>{
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.setLanguage()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(component.showbackButton).toBeFalsy();
      expect(component.languagePage).toBeTruthy();
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  })

  it('should call navigateToLearnerObservation',async (done)=>{
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.navigateToLearnerObservation()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/learnere-observation']);
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  });

  it('should call navigateToDownloadCourse',async (done)=>{
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.navigateToDownloadCourse()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/download-course']);
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  })
  it('should call navigateToCertificate',async (done)=>{
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.navigateToCertificate()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/certificate-list']);
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  })
  it('should call navigateToPassbook',async (done)=>{
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.navigateToPassbook()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/passbook']);
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  })

  it('should call personalDetailEdit dob not exist',async (done)=>{
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.personalDetailEdit()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/about-you'],{"queryParams": {"redirect": "app/personal-detail-list"}});
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  })

  it('should call personalDetailEdit dob exist',async (done)=>{
    component.userProfileData.personalDetails = { dob: '01-01-2024'};
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.personalDetailEdit()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/personal-detail-list']);
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  })

  it('should call workInfoEdit',async (done)=>{
    component.userProfileData.personalDetails = { dob: '01-01-2024'};
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.workInfoEdit()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/organization-list']);
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  })

  it('should call eductionEdit',async (done)=>{
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.eductionEdit()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/education-list']);
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  })

  it('should call redirectToHelpWidget',async (done)=>{
    component.appFramework = 'Sphere'
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.redirectToHelpWidget()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['app/get-help']);
      document.body.removeChild(buttonElement);
      done();
    }, 1000);
  })
  it('should call logout',async (done)=>{
    const buttonElement = document.createElement('button'); // Create a new button element
    document.body.appendChild(buttonElement); // Append button to the DOM
    buttonElement.addEventListener('click', () => component.logout()); // Add click event listener
    buttonElement.click(); // Simulate a click event on the button
    setTimeout(() => {
      document.body.removeChild(buttonElement);
      done();
    }, 100);
  })

  it('should update languagePage value',async (done)=>{
    component.hideLanguagePage(false); // Add click event listener
    setTimeout(() => {
      expect(component.languagePage).toBeTruthy();
      done();
    }, 100);
  })

  it('should update language english',async (done)=>{
    mockUserProfileSvc.updateProfileDetails = jest.fn(()=>of({}));
    mockUserProfileSvc.updateProfileData = jest.fn();
    mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of());
    (mockUserProfileSvc.getUserdetailsFromRegistry as jest.Mock).mockReturnValue(of({profileDetails:{profileReq: mockUserProfileDetailsFromRegistry}}));

    mockConfigurationsService.userProfile = {userId: '123'}
    const param = {
      request: {
        userId: mockConfigurationsService.userProfile.userId,
        profileDetails: {profileReq: mockUserProfileDetailsFromRegistry}
      }
    }
    if(mockUserProfileSvc && mockUserProfileSvc.updateProfileDetails ){
      const mergeApiCalls = () => {
        return mockUserProfileSvc.updateProfileDetails(param).pipe(
          mergeMap(() => {
            return mockUserProfileSvc.getUserdetailsFromRegistry('123');
          })
        );
      };
      const mergedResult = await mergeApiCalls().toPromise();
    }

    component.selectLanguage('en'); // Add click event listener
    setTimeout(() => {
      expect(mockUserProfileSvc.updateProfileDetails).toHaveBeenCalled();
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalled();
      done();
    }, 100);
  })

  it('should update language hindi',async (done)=>{
    mockUserProfileSvc.updateProfileDetails = jest.fn(()=>of({}));
    mockUserProfileSvc.updateProfileData = jest.fn();
    mockUserProfileSvc.getUserdetailsFromRegistry = jest.fn(() => of());
    (mockUserProfileSvc.getUserdetailsFromRegistry as jest.Mock).mockReturnValue(of({profileDetails:{profileReq: mockUserProfileDetailsFromRegistry}}));

    mockConfigurationsService.userProfile = {userId: '123'}
    const param = {
      request: {
        userId: mockConfigurationsService.userProfile.userId,
        profileDetails: {profileReq: mockUserProfileDetailsFromRegistry}
      }
    }
    if(mockUserProfileSvc && mockUserProfileSvc.updateProfileDetails ){
      const mergeApiCalls = () => {
        return mockUserProfileSvc.updateProfileDetails(param).pipe(
          mergeMap(() => {
            return mockUserProfileSvc.getUserdetailsFromRegistry('123');
          })
        );
      };
      const mergedResult = await mergeApiCalls().toPromise();
    }

    component.selectLanguage('hi'); // Add click event listener
    setTimeout(() => {
      expect(mockUserProfileSvc.updateProfileDetails).toHaveBeenCalled();
      expect(mockUserProfileSvc.getUserdetailsFromRegistry).toHaveBeenCalled();
      done();
    }, 100);
  })

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });


})
