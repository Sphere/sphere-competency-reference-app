import { UserService } from "./user.service";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { HTTP } from "@awesome-cordova-plugins/http/ngx";
import { ModalController } from "@ionic/angular";
import {
  AuthService,
  DeviceInfo,
  SharedPreferences,
} from "@project-sunbird/sunbird-sdk";
import { ConfigurationsService } from "../../../../library/ws-widget/utils/src/public-api";
import { UtilityService } from "../../../../services";
import {
  ToastService,
  ApiUtilsService,
  LocalStorageService,
} from "../../../manage-learn/core";
import { AppFrameworkDetectorService } from "../../core/services/app-framework-detector-service.service";
import { of } from "rxjs";

describe("UserService", () => {
  let service: UserService;
  const mockhttp: Partial<HttpClient> = {};
  const mocktoast: Partial<ToastService> = {};
  const mockmodalController: Partial<ModalController> = {};
  const mockauthService: Partial<AuthService> = {};
  const mockdeviceInfo: Partial<DeviceInfo> = {};
  const mockpreferences: Partial<SharedPreferences> = {};
  const mockutils: Partial<ApiUtilsService> = {};
  const mockionicHttp: Partial<HTTP> = {};
  const mockutilityService: Partial<UtilityService> = {
    getBuildConfigValue: jest.fn(() => Promise.resolve("https://localhost:4000/apis/public/v8/competencyAssets/roleWiseCompetencyData")), 
  };
  const mockconfigSvc: Partial<ConfigurationsService> = {};
  const mockrouter: Partial<Router> = {};
  const mocklocalStorage: Partial<LocalStorageService> = {};
  const mockframeWorkDetector: Partial<AppFrameworkDetectorService> = {};

  beforeAll(() => {
    service = new UserService(
      mockhttp as HttpClient,
      mocktoast as ToastService,
      mockmodalController as ModalController,
      mockauthService as AuthService,
      mockdeviceInfo as DeviceInfo,
      mockpreferences as SharedPreferences,
      mockutils as ApiUtilsService,
      mockionicHttp as HTTP,
      mockutilityService as UtilityService,
      mockconfigSvc as ConfigurationsService,
      mockrouter as Router,
      mocklocalStorage as LocalStorageService,
      mockframeWorkDetector as AppFrameworkDetectorService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it('should call userRead', async() => {
    mocklocalStorage.getLocalStorage = jest.fn(() => Promise.resolve({
      userId: 'uid',
      name: 'user-name'
    })); 
    mockauthService.getSession = jest.fn(() => of({
      userId: 'uid',
      name: 'user-name'
    })) as any;
    await service.userRead('uid');
    expect(mocklocalStorage.getLocalStorage).toHaveBeenCalled();
  });

  it('should set user role', () => {
    mocklocalStorage.setLocalStorage = jest.fn(() => Promise.resolve());
    service.setRole('student');
    expect(mocklocalStorage.setLocalStorage).toHaveBeenCalled();
  });

  describe('getActiveRole', () => {
    it('should return learner when localStorage returns undefined', async () => {
      mocklocalStorage.getLocalStorage = jest.fn(() => Promise.resolve(undefined));
      const result = await service.getActiveRole();
      expect(result).toBe('learner');
    });

    it('should return learner when localStorage returns role', async () => {
      mocklocalStorage.getLocalStorage = jest.fn(() => Promise.resolve('student'));
      const result = await service.getActiveRole();
      expect(result).toBe('student');
    });

    it('should return error for error handling', async () => {
      mocklocalStorage.getLocalStorage = jest.fn(() => Promise.reject({error: 'error'}));
      const result = await service.getActiveRole();
      expect(result).toBe('learner');
    });
  });

  describe('getUserProfilefromLocalstorage', () => {
    it('should set profile details', async () => {
      // arrange
      mocklocalStorage.getLocalStorage = jest.fn(() => Promise.resolve({
        roles: ['student', 'asha', 'PUBLIC'],
        firstName: 'f-name',
        lastName: 'l-name',
        email: 'email', 
        userId: 'user-id',
        profileImage: 'profile-image',
        userName: 'name',
        handle: 'handle',
        rootOrgId: 'sample-rootOrgId',
        channel: 'sample-channel',
        thumbnail: 'thumbnail',
        profileDetails: {
          preferences: {
            language: 'en'
          }
        },
        profileReq: {
          personalDetails: {
            countryCode: 'CODE',
            officialEmail: 'OFFICE_EMAIL'
          }
        }
      }));
      mockauthService.getSession = jest.fn(() => of({
        userId: 'user-id',
        name: 'name'
      })) as any;
      // act
      await service.getUserProfilefromLocalstorage('user-id');
      // assert
      expect(mocklocalStorage.getLocalStorage).toHaveBeenCalled();
    });

    it('should set profile details if user is not available in local', async () => {
      // arrange
      mocklocalStorage.getLocalStorage = jest.fn(() => Promise.resolve());
      mockauthService.getSession = jest.fn(() => of({
        userId: 'user-id',
        token: {
          access_token: 'sample-access-token',
          refresh_token: 'sample-refresh-token',
          userToken: 'sample-user-token'
        }
      })) as any;
      jest.spyOn(service, 'userReadCall').mockImplementation(() => {
        return of({
          response: {
            firstName: 'f-name',
            lastName: 'l-name',
            email: 'email', 
            userId: 'user-id',
            profileImage: 'profile-image',
            userName: 'name',
            handle: 'handle',
            rootOrgId: 'sample-rootOrgId',
            channel: 'sample-channel',
            thumbnail: 'thumbnail',
          }  as any
        }) as any;
      })
      // act
      await service.getUserProfilefromLocalstorage('user-id');
      // assert
      expect(mocklocalStorage.getLocalStorage).toHaveBeenCalled();
    })

    it('should set profile details if error part', async () => {
      // arrange
      mocklocalStorage.getLocalStorage = jest.fn(() => Promise.reject({error: 'error'}));
      mockauthService.getSession = jest.fn(() => of({
        userId: 'user-id',
        token: {
          access_token: 'sample-access-token',
          refresh_token: 'sample-refresh-token',
          userToken: 'sample-user-token'
        }
      })) as any;
      jest.spyOn(service, 'userReadCall').mockImplementation(() => {
        return of({
          response: {
            firstName: 'f-name',
            lastName: 'l-name',
            email: 'email', 
            userId: 'user-id',
            profileImage: 'profile-image',
            userName: 'name',
            handle: 'handle',
            rootOrgId: 'sample-rootOrgId',
            channel: 'sample-channel',
            thumbnail: 'thumbnail',
          }  as any
        }) as any;
      })
      // act
      await service.getUserProfilefromLocalstorage('user-id');
      // assert
      expect(mocklocalStorage.getLocalStorage).toHaveBeenCalled();
    })
  })

  it('should set user profile', () => {
    const res = {
      response: {
        firstName: 'f-name',
        lastName: 'l-name',
        email: 'email', 
        userId: 'user-id',
        profileImage: 'profile-image',
        userName: 'name',
        handle: 'handle',
        rootOrgId: 'sample-rootOrgId',
        channel: 'sample-channel',
        thumbnail: 'thumbnail',
      }
    };
    jest.spyOn(service, 'setConfigService').mockImplementation();
    mocklocalStorage.setLocalStorage = jest.fn(() => Promise.resolve());
    service.setUserProfile(res);
    expect(mocklocalStorage.setLocalStorage).toHaveBeenCalled();
  })

  it('should reset user profile', () => {
    mocklocalStorage.deleteOneStorage = jest.fn(() => Promise.resolve());
    service.resetUserProfile()
    expect(mocklocalStorage.deleteOneStorage).toHaveBeenCalled();
  });

  it('should set default language', () => {
    const userPidProfile = {
      profileDetails: {
        preferences: []
      }
    };
    mockframeWorkDetector.detectAppFramework = jest.fn(() => Promise.resolve('Sphere'));
    service.setLanguage(userPidProfile);
    expect(mockframeWorkDetector.detectAppFramework).toHaveBeenCalled();
  });

  describe('getOrgData', () => {
    it('should return org data', async() => {
      mockhttp.get = jest.fn(() => of({
        firstName: 'f-name',
          lastName: 'l-name',
          email: 'email', 
          userId: 'user-id',
          profileImage: 'profile-image',
          userName: 'name',
          handle: 'handle',
          rootOrgId: 'sample-rootOrgId',
          channel: 'sample-channel',
          thumbnail: 'thumbnail'
      })) as any;
      mocklocalStorage.setLocalStorage = jest.fn(() => Promise.resolve());
      // act
      service.getOrgData();
      //assert
      expect(mockhttp.get).toHaveBeenCalled();
    });

    it('should retrieve org data from local storage when offline', async () => {
      const mockStoredData = { data: 'stored data' };
      mocklocalStorage.getLocalStorage = jest.fn(() => Promise.resolve(mockStoredData));
      Object.defineProperty(navigator, 'onLine', { value: false });
      const result = await service.getOrgData();
      expect(result).toEqual(mockStoredData);
      expect(mocklocalStorage.getLocalStorage).toHaveBeenCalled();
    });
  });

  describe('getCompetencyData', () => {
    it('should be return competency data', () => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      mockhttp.get = jest.fn(() => of({
        firstName: 'f-name',
          lastName: 'l-name',
          email: 'email', 
          userId: 'user-id',
          profileImage: 'profile-image',
          userName: 'name',
          handle: 'handle',
          rootOrgId: 'sample-rootOrgId',
          channel: 'sample-channel',
          thumbnail: 'thumbnail'
      })) as any;
      mocklocalStorage.setLocalStorage = jest.fn(() => Promise.resolve());
      service.getCompetencyData();
    });

    it('should retrieve data from local storage when offline', async () => {
      const mockStoredData = { data: 'stored data' };
      mocklocalStorage.getLocalStorage = jest.fn(() => Promise.resolve(mockStoredData));
      Object.defineProperty(navigator, 'onLine', { value: false });
      const result = await service.getCompetencyData();
      expect(result).toEqual(mockStoredData);
      expect(mocklocalStorage.getLocalStorage).toHaveBeenCalled();
    });
  });

  it('should call base class get method with correct parameters', async () => {
    mockauthService.getSession = jest.fn(() => of({
      userId: 'user-id',
      token: {
        access_token: 'sample-access-token',
        refresh_token: 'sample-refresh-token',
        userToken: 'sample-user-token'
      }
    })) as any;
    const result = await service.getRoleWiseData();
    expect(result).toBeTruthy();
  });

  it('should call base class get method with correct parameters', async () => {
    mockauthService.getSession = jest.fn(() => of({
      userId: 'user-id',
      token: {
        access_token: 'sample-access-token',
        refresh_token: 'sample-refresh-token',
        userToken: 'sample-user-token'
      }
    })) as any;
    const result = await service.getAshaProgress('user-id');
    expect(result).toBeTruthy();
  });

  it('should call base class get method with correct parameters', async () => {
    mockauthService.getSession = jest.fn(() => of({
      userId: 'user-id',
      token: {
        access_token: 'sample-access-token',
        refresh_token: 'sample-refresh-token',
        userToken: 'sample-user-token'
      }
    })) as any;
    const result = await service.getCompetencyCourseIdentifier('en');
    expect(result).toBeTruthy();
  });
});
