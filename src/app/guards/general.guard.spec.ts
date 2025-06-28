import { GeneralGuard } from "./general.guard";
import { Router } from "@angular/router";
import { ConfigurationsService } from "../../library/ws-widget/utils/src/public-api";
import { CommonUtilService } from "../../services";
import { UserService } from "../modules/home/services/user.service";
import { of } from "rxjs";

describe("GeneralGuard", () => {
  let guard: GeneralGuard;
  const mockCommonUtilService: Partial<CommonUtilService> = {};
  const mockConfigSvc: Partial<ConfigurationsService> = {};
  const mockRouter: Partial<Router> = {};
  const mockUserHomeSvc: Partial<UserService> = {};

  beforeAll(() => {
    guard = new GeneralGuard(
      mockRouter as Router,
      mockConfigSvc as ConfigurationsService,
      mockCommonUtilService as CommonUtilService,
      mockUserHomeSvc as UserService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be created", () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true', () => {
      mockConfigSvc.userProfile = {
        language: 'en'
      } as any;
      mockConfigSvc.userDetails = {
        tcStatus: 'true'
      }
      mockUserHomeSvc.updateValue$ = of({ profileDetails: { preferences: { language: 'en' } } })
      const next = {
        data: {
          requiredFeatures: ['BLOGS'],
          requiredRoles: ['asha', 'student', 'learner']
        }
      } as any;
      const state = {
        url: 'public/home'
      } as any;
      mockRouter.navigateByUrl = jest.fn(() => Promise.resolve(true));

      const result = guard.canActivate(next, state);
      expect(result).toBeTruthy();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith("page/home");
    })

    it('should return true for empty state', () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('en');
      mockConfigSvc.userProfile = {
        language: 'en'
      } as any;
      mockConfigSvc.userDetails = {
        tcStatus: 'false'
      }
      mockConfigSvc.restrictedFeatures = new Set(['BLOGS']);
      mockConfigSvc.userDetails = { tcStatus: 'true', profileDetails: undefined }
      mockUserHomeSvc.updateValue$ = of({ profileDetails: { preferences: { language: 'en' } } })
      const next = {
        data: {
          requiredFeatures: ['BLOGS'],
          requiredRoles: ['asha', 'student', 'learner']
        }
      } as any;
      const state = {
        url: ''
      } as any;
      mockRouter.navigateByUrl = jest.fn(() => Promise.resolve(true));

      const result = guard.canActivate(next, state);
      expect(result).toBeTruthy();
    })
  })

  it('should return true for empty language', () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(false);
    mockConfigSvc.userProfile = {
      language: 'en'
    } as any;
    mockConfigSvc.userDetails = {
      tcStatus: 'false'
    }
    mockConfigSvc.restrictedFeatures = new Set(['BLOGS']);
    mockConfigSvc.userDetails = { tcStatus: 'false', profileDetails: true }
    mockUserHomeSvc.updateValue$ = of({ profileDetails: { preferences: { language: 'en' } } })
    const next = {
      data: {
        requiredFeatures: ['BLOGS'],
        requiredRoles: ['asha', 'student', 'learner']
      }
    } as any;
    const state = {
      url: ''
    } as any;
    mockRouter.navigateByUrl = jest.fn(() => Promise.resolve(true));
    mockRouter.navigate = jest.fn(() => Promise.resolve(true));
    const result = guard.canActivate(next, state);
    expect(result).toBeTruthy();
    expect (mockRouter.navigate).toHaveBeenCalledWith(['app', 'new-tnc']);
  })

  it('should return true for empty language and profile language is empty', () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(false);
    mockConfigSvc.userProfile = {
      language: undefined
    } as any;
    mockConfigSvc.userDetails = {
      tcStatus: 'false'
    }
    mockConfigSvc.restrictedFeatures = new Set(['BLOGS']);
    mockConfigSvc.userDetails = { tcStatus: 'true', profileDetails: true }
    mockUserHomeSvc.updateValue$ = of({ profileDetails: { preferences: { language: 'en' } } })
    const next = {
      data: {
        requiredFeatures: ['BLOGS'],
        requiredRoles: ['asha', 'student', 'learner']
      }
    } as any;
    const state = {
      url: ''
    } as any;
    mockRouter.navigateByUrl = jest.fn(() => Promise.resolve(true));

    const result = guard.canActivate(next, state);
    expect(result).toBeTruthy();
  })

  it('should return true for empty language and profile language is empty', () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(false);
    mockConfigSvc.userProfile = {
      language: undefined
    } as any;
    mockConfigSvc.userDetails = {
      tcStatus: 'true',
      profileDetails: undefined
    }
    mockConfigSvc.userRoles = new Set(['asha', 'student', 'learner']);
    mockConfigSvc.restrictedFeatures = new Set(['BLOGS']);
    mockUserHomeSvc.updateValue$ = of({ profileDetails: { preferences: { language: 'en' } } })
    const next = {
      data: {
        requiredFeatures: ['BLOGS'],
        requiredRoles: ['asha', 'student', 'learner']
      }
    } as any;
    const state = {
      url: ''
    } as any;
    mockRouter.navigateByUrl = jest.fn(() => Promise.resolve(true));

    const result = guard.canActivate(next, state);
    expect(result).toBeTruthy();
  })

  it('should return true for empty profile', () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(false);
    mockConfigSvc.userProfile = null;
    mockConfigSvc.userDetails = {
      tcStatus: 'true',
      profileDetails: undefined
    }
    mockConfigSvc.instanceConfig = {
      disablePidCheck: false
    } as any;
    mockConfigSvc.userRoles = new Set(['asha', 'student', 'learner']);
    mockConfigSvc.restrictedFeatures = new Set(['BLOGS']);
    mockUserHomeSvc.updateValue$ = of({ profileDetails: { preferences: { language: 'en' } } })
    const next = {
      data: {
        requiredFeatures: ['BLOGS'],
        requiredRoles: ['asha', 'student', 'learner']
      }
    } as any;
    const state = {
      url: ''
    } as any;
    mockRouter.navigateByUrl = jest.fn(() => Promise.resolve(true));
    mockRouter.parseUrl = jest.fn();
    const result = guard.canActivate(next, state);
    expect(result).toBeTruthy();
  })
});
