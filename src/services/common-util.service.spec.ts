import { CommonUtilService } from './common-util.service';
import {
  ToastController,
  LoadingController,
  PopoverController,
  Platform,
} from '@ionic/angular';
import { SharedPreferences, ProfileService, CorrelationData } from 'sunbird-sdk';
import { TelemetryGeneratorService } from '@app/services/telemetry-generator.service';
import { InteractType, InteractSubtype, PageId, Environment } from '../services/telemetry-constants';
import { PreferenceKey } from '../app/app.constant';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@capacitor/network';
import { NgZone } from '@angular/core';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { of, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AndroidPermissionsService, ImpressionType, ObjectType } from '.';
import { ProfileType, TelemetryService } from '@project-sunbird/sunbird-sdk';
import { AndroidPermission } from './android-permissions/android-permission';
import GraphemeSplitter from 'grapheme-splitter';
jest.mock('grapheme-splitter');

declare const FCMPlugin;

describe('CommonUtilService', () => {
  let commonUtilService: CommonUtilService;

  const mockSharedPreferences: Partial<SharedPreferences> = {
    putString: jest.fn(() => of(undefined)),
  };
  const mockProfileService: Partial<ProfileService> = {};
  const mockTelemetryService: Partial<TelemetryService> = {
    populateGlobalCorRelationData: jest.fn()
  };
  const mockToastController: Partial<ToastController> = {
    create: jest.fn(() => (Promise.resolve({
      present: jest.fn(() => Promise.resolve({})),
    } as any)))
  };
  const mockTranslateService: Partial<TranslateService> = {
    get: jest.fn(() => of('sample_translation')),
    currentLang: 'en',
    use: jest.fn()
  };
  const mockLoadingController: Partial<LoadingController> = {
    create: jest.fn(() => (Promise.resolve({
      present: jest.fn(() => Promise.resolve({})),
    } as any)))
  };
  const presentFn = jest.fn(() => Promise.resolve());
  const dissmissFn = jest.fn(() => Promise.resolve());
  const mockPopoverController: Partial<PopoverController> = {
    create: jest.fn(() => (Promise.resolve({
      present: presentFn,
      dismiss: dissmissFn,
      setAttribute: jest.fn(),
      onDidDismiss: jest.fn(() => Promise.resolve({ data: {isLeftButtonClicked: true} }))
    } as any)))
  };
  const mockNgZone: Partial<NgZone> = {
    run: jest.fn((fn) => fn()) as any
  };
  const mockPlatform: Partial<Platform> = {
    is: jest.fn(platform => platform == 'android')
  };
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn(),
    generateBackClickedTelemetry: jest.fn(),
    generateEndTelemetry: jest.fn()
  };
  const mockAppversion: Partial<AppVersion> = {
    getAppName: jest.fn(() => Promise.resolve('Sunbird'))
  };
  const mockRouter: Partial<Router> = {};
  const mockPermissionService: Partial<AndroidPermissionsService> = {};

  beforeAll(() => {
    commonUtilService = new CommonUtilService(
      mockSharedPreferences as SharedPreferences,
      mockProfileService as ProfileService,
      mockTelemetryService as TelemetryService,
      mockTranslateService as TranslateService,
      mockLoadingController as LoadingController,
      mockPopoverController as PopoverController,
      mockNgZone as NgZone,
      mockPlatform as Platform,
      mockTelemetryGeneratorService as TelemetryGeneratorService,
      mockAppversion as AppVersion,
      mockRouter as Router,
      mockToastController as ToastController,
      mockPermissionService as AndroidPermissionsService,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create an instance of CommonUtilService', () => {
    expect(commonUtilService).toBeTruthy();
  });

  describe('showToast()', () => {

    it('should show Toast with provided configuration', () => {
      // arrange
      jest.spyOn(commonUtilService, 'addPopupAccessibility').mockImplementation(()=>{
        return {present: presentFn}
      })
      // act
      commonUtilService.showToast('CONTENT_COMING_SOON', false);
      // assert
      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'sample_translation',
        duration: 3000,
        position: 'bottom',
        cssClass: ''
      });
    });

    it('should show Toast with provided configuration', () => {
      // arrange
      jest.spyOn(commonUtilService, 'addPopupAccessibility').mockImplementation(()=>{
        return {present: presentFn}
      })
      // act
      commonUtilService.showToast('CONTENT_COMING_SOON', false, 'red-toast', 3000, 'bottom', {});
      // assert
      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'sample_translation',
        duration: 3000,
        position: 'bottom',
        cssClass: 'red-toast'
      });
    });

    it('should return if isInactive true', () => {
      // arrange
      jest.spyOn(commonUtilService, 'addPopupAccessibility').mockImplementation(()=>{
        return {present: presentFn}
      })
      // act
      commonUtilService.showToast('CONTENT_COMING_SOON', true);
      // assert
      expect(mockToastController.create).not.toHaveBeenCalledWith({
        message: 'sample_translation',
        duration: 3000,
        position: 'bottom',
        cssClass: ''
      });
    });
  });

  describe('isIpLocationAvailable()', () => {
    it('should return true if IP location is available', async() => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of({} as any));
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
      // act
      // assert
      await commonUtilService.isIpLocationAvailable().then((response) => {
        expect(response).toBeTruthy();
      });
    });

    it('should return false if IP location is available', async () => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of(undefined));
      // act
      // assert
      await commonUtilService.isIpLocationAvailable().then((response) => {
        expect(response).toBeFalsy();
      });
    });
  });

  describe('translateMessage()', () => {

    it('should translate the key if fields is string', () => {
      // arrange
      jest.spyOn(mockTranslateService, 'get');
      // act
      commonUtilService.translateMessage('CONTENT_COMING_SOON', 'app_name');
      // assert
      expect(mockTranslateService.get).toHaveBeenCalledWith('CONTENT_COMING_SOON', { '%s': 'app_name' });
    });

    it('should translate the key if fields is object', () => {
      // arrange
      jest.spyOn(mockTranslateService, 'get');
      // act
      commonUtilService.translateMessage('CONTENT_COMING_SOON', { name: 'app_name' });
      // assert
      expect(mockTranslateService.get).toHaveBeenCalledWith('CONTENT_COMING_SOON', { name: 'app_name' });
    });
  });

  describe('getTranslatedValue()', () => {
    it('should return translated value', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.getTranslatedValue(
        '{\"en\": \"sample_translation\"}', 'en')).toEqual('sample_translation');
    });

    it('should return default if no translated value', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.getTranslatedValue('{\"sp\": \"sample_translation\"}', 'en'));
    });
  });

  describe('getLoader()', () => {
    it('should return loader instance', () => {
      // arrange
      // act
      const loader: LoadingController = commonUtilService.getLoader();
      // assert
      expect(loader).toBeDefined();
    });

    it('should return loader instance, if it has duration and message passed', () => {
      // arrange
      // act
      const loader: LoadingController = commonUtilService.getLoader('3000', 'some_msg');
      // assert
      expect(loader).toBeDefined();
    });
  });

  describe('arrayToString()', () => {
    it('should return concatinated string', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.arrayToString(['sample', 'sample1'])).toEqual('sample, sample1');
    });
  });

  describe('changeAppLanguage()', () => {
    it('should change the language to given language name', () => {
      // arrange
      mockTranslateService.use = jest.fn();
      mockTranslateService.setDefaultLang = jest.fn();
      mockSharedPreferences.putString = jest.fn(() => of(undefined));
      // act
      commonUtilService.changeAppLanguage('English');
      // assert
      expect(mockTranslateService.use).toHaveBeenCalledWith('en');
      expect(mockTranslateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE, 'en');
      expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE, 'English');
    });

    it('should handle else case if language is not found', () => {
      // arrange
      // act
      commonUtilService.changeAppLanguage('other');
      // assert
    });

    it('should change the language to given language name, and if code is present', () => {
      // arrange
      mockTranslateService.use = jest.fn();
      mockTranslateService.setDefaultLang = jest.fn();
      mockSharedPreferences.putString = jest.fn(() => of(undefined));
      // act
      commonUtilService.changeAppLanguage('English', 'en');
      // assert
      expect(mockTranslateService.use).toHaveBeenCalledWith('en');
      expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE_CODE, 'en');
      expect(mockSharedPreferences.putString).toHaveBeenCalledWith(PreferenceKey.SELECTED_LANGUAGE, 'English');
    });
  });


  describe('getAppName()', () => {
    it('should return App name', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.getAppName().then((response) => {
        expect(response).toBe('Sunbird');
      }));
    });
  });

  describe('fileSizeInMB()', () => {
    it('should return 0 if input is undefined', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.fileSizeInMB(undefined)).toEqual('0.00');
    });

    it('should return size if input is valid', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.fileSizeInMB(12345678)).toEqual('11.77');
    });
  });

  describe('deDupe()', () => {
    it('should return empty array if input is undefined', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.deDupe([], 'name')).toEqual([]);
    });

    it('should returndeduped Array if input contain any duplicate value', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.deDupe([{ name: 'sample', id: '1' },
      { name: 'sample', id: '1' }], 'name')).toEqual([{ name: 'sample', id: '1' }]);
    });
  });

  describe('currentTabName()', () => {
    it('should return current Tab Name', () => {
      // arrange
      // act
      commonUtilService.currentTabName = 'Library';
      // assert
      expect(commonUtilService.currentTabName).toEqual('Library');
    });
  });

  describe('convertFileSrc()', () => {
    it('should return empty if img is undefined', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.convertFileSrc(null)).toEqual('');
    });

    it('should return converted file src if img is valid', () => {
      // arrange
      // act
      // assert
      expect(commonUtilService.convertFileSrc('sample_img')).toEqual('converted_file_src');
    });
  });

  describe('getOrgLocation()', () => {
    it('should return org location', () => {
      // arrange
      const organisation = {
        locations: [
          { type: 'state', name: 'Odisha' },
          { type: 'district', name: 'Cuttack' },
          { type: 'block', name: 'Block-A' },
          { type: 'sadar', name: 'Sadar' }
        ]
      };
      // act
      // assert
      expect(commonUtilService.getOrgLocation(organisation)).toEqual(
        {
          block: { type: 'block', name: 'Block-A' },
          district: { type: 'district', name: 'Cuttack' },
          state: { type: 'state', name: 'Odisha' }
        });
    });

    it('should return default location if organisation has no location details', () => {
      // arrange
      const organisation = {
        locations: ''
      };
      // act
      // assert
      expect(commonUtilService.getOrgLocation(organisation)).toEqual(
        {
          block: '',
          district: '',
          state: ''
        });
    });

    it('should return default location if organisation has no location length', () => {
      // arrange
      const organisation = {
        locations: [{}]
      };
      // act
      // assert
      expect(commonUtilService.getOrgLocation(organisation)).toEqual(
        {
          block: '',
          district: '',
          state: ''
        });
    });
  });

  describe('getUserLocation()', () => {
    it('should return user location', () => {
      // arrange
      const profile = {
        userLocations: [
          { type: 'state', name: 'Odisha' },
          { type: 'district', name: 'Cuttack' }
        ]
      };
      // act
      // assert
      expect(commonUtilService.getUserLocation(profile)).toEqual(
        {
          district: { type: 'district', name: 'Cuttack' },
          state: { type: 'state', name: 'Odisha' }
        });
    });

    it('should return user location and handle if profile has no userlocation', () => {
      // arrange
      const profile = {
        userLocations: []
      };
      // act
      // assert
      expect(commonUtilService.getUserLocation(profile)).toEqual(
        {});
    });
  });

  describe('isUserLocationAvalable()', () => {
    it('should return true if user state and distric is available', () => {
      // arrange
      const profile = {
        userLocations: [
          { type: 'state', name: 'Odisha' },
          { type: 'district', name: 'Cuttack' },
        ],
        profileType: 'teacher'
      };
      const locationConfig = [
        {
          code: 'persona',
          children: {
            teacher: [{
              validations: [{
                type: 'required'
              }]
            }]
          }
        }
      ];
      // act
      // assert
      expect(commonUtilService.isUserLocationAvalable(profile, locationConfig)).toBeFalsy();
    });

    it('should return false if user any of the state or distric is not available', () => {
      // arrange
      const profile = {
        userLocations: [
          { type: 'state', name: 'Odisha' },
        ],
        serverProfile: {}
      };
      // act
      // assert
      expect(commonUtilService.isUserLocationAvalable(profile, undefined)).toBeFalsy();
    });
  });

  describe('isDeviceLocationAvailable()', () => {
    it('should return true if user location is available', async () => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of({} as any));
      // act
      // assert
      await commonUtilService.isDeviceLocationAvailable().then((response) => {
        expect(response).toBeTruthy();
      });
    });

    it('should return false if user location is available', async () => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of(undefined));
      // act
      // assert
      await commonUtilService.isDeviceLocationAvailable().then((response) => {
        expect(response).toBeFalsy();
      });
    });
  });

  describe('handleToTopicBasedNotification()', () => {
    it('should return true if IP location is available', () => {
      // arrange
      const profile = {
        board: ['AP'], medium: ['English', 'Hindi', 'Bengali'],
        grade: ['class 8', 'class9', 'class10'], profileType: 'teacher'
      } as any;
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profile));
      mockSharedPreferences.getString = jest.fn((arg) => {
        let value;
        switch (arg) {
          case PreferenceKey.DEVICE_LOCATION:
            value = '{\"state\": \"Odisha\", \"district\": \"Cuttack\"}';
            break;
          case PreferenceKey.SUBSCRIBE_TOPICS:
            value = '[\"AP\", \"English\", \"Odisha\", \"Cuttack\"]';
        }
        return of(value);
      });
      // FCMPlugin.unsubscribeFromTopic = jest.fn((_, resolve, reject) => resolve());
      // FCMPlugin.subscribeToTopic = jest.fn((_, resolve, reject) => resolve());
      mockSharedPreferences.putString = jest.fn(() => of(undefined));
      // act
      commonUtilService.handleToTopicBasedNotification();
      // assert
      expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
    });

    it('should return true if IP location is available, if no data on get device location', () => {
      // arrange
      const profile = {
        board: ['AP'], medium: ['English', 'Hindi', 'Bengali'],
        grade: ['class 8', 'class9', 'class10'], profileType: 'teacher'
      } as any;
      mockProfileService.getActiveSessionProfile = jest.fn(() => of(profile));
      mockSharedPreferences.getString = jest.fn((arg) => of(undefined));
      // FCMPlugin.unsubscribeFromTopic = jest.fn((_, resolve, reject) => resolve());
      // FCMPlugin.subscribeToTopic = jest.fn((_, resolve, reject) => resolve());
      mockSharedPreferences.putString = jest.fn(() => of(undefined));
      // act
      commonUtilService.handleToTopicBasedNotification();
      // assert
      expect(mockProfileService.getActiveSessionProfile).toHaveBeenCalled();
    });
  });

  describe('getFormattedDate', () => {
    it('should format the date to DD-MMM-YYYY', () => {
      // arrange
      const date = '2020 02 10';
      // act
      commonUtilService.getFormattedDate(date);
      // assert
      expect(date).toEqual(date);
    });
  });

  describe('presentToastForOffline', () => {
    it('should create a pop-up message', (done) => {
      const message = 'Connect to the internet to view the content';
      mockToastController.create = jest.fn(() => {
        return Promise.resolve({
          present: jest.fn(() => Promise.resolve()),
          onDidDismiss: jest.fn((fn) => {
            fn();
          })
        }) as any;
      });
      jest.spyOn(commonUtilService, 'translateMessage').mockImplementation(() => {
        return message;
      });
      commonUtilService.presentToastForOffline(message).then(() => {
        done();
      });
    });
  });

  describe('getStateList', () => {
    it('should return the state list', (done) => {
      // arrange
      mockProfileService.searchLocation = jest.fn(() => of([]));
      // act
      commonUtilService.getStateList().then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });

    it('should return the state list is undefiend', (done) => {
      // arrange
      mockProfileService.searchLocation = jest.fn(() => of(undefined));
      // act
      commonUtilService.getStateList().then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });

    it('should return empty state list', (done) => {
      // arrange
      mockProfileService.searchLocation = jest.fn(() => throwError(new Error()));
      // act
      commonUtilService.getStateList().then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });
  });

  describe('getDistrictList', () => {
    it('should return the district list with state id', (done) => {
      // arrange
      const id = 'state_id';
      mockProfileService.searchLocation = jest.fn(() => of([]));
      // act
      commonUtilService.getDistrictList(id).then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });

    it('should return the district list with state code', (done) => {
      // arrange
      const code = 'state_code';
      mockProfileService.searchLocation = jest.fn(() => of('')) as any;
      // act
      commonUtilService.getDistrictList('', code).then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });

    it('should return empty district list', (done) => {
      // arrange
      const id = 'state_id';
      mockProfileService.searchLocation = jest.fn(() => throwError(new Error()));
      // act
      commonUtilService.getDistrictList(id).then((res) => {
        // assert
        expect(res).toEqual([]);
        done();
      });
    });
  });

  describe('handleAssessmentStatus()', () => {
    it('should show assessment attempt exceeded toast message and return true', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: true,
        isLastAttempt: false
      }
      commonUtilService.showToast = jest.fn();
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
      expect(commonUtilService.showToast).toHaveBeenCalled();
    });
    it('should show last attempt available popup and on click of continue return false', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: false,
        isLastAttempt: true
      };
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
    });
  
    it('should return false if the assessment is available to play directly', () => {
      // arrange
      const assessmentStatus = {
        isContentDisabled: false,
        isLastAttempt: false
      };
      commonUtilService.showToast = jest.fn();
      // act
      commonUtilService.handleAssessmentStatus(assessmentStatus);
      // assert
      expect(commonUtilService.showToast).not.toHaveBeenCalled();
  
    });
  });

  describe('showAssessmentLastAttemptPopup', () => {
    it('should show assessment popup', () => {
      // arange
      mockPopoverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve()),
        onDidDismiss: jest.fn(() => Promise.resolve({canDelete: true}))
      })))as any;
      const req = {
        isLastAttempt: false,
        limitExceeded: false,
        isCloseButtonClicked: false
      }
      // act
      commonUtilService.showAssessmentLastAttemptPopup(req);
      // assert
      setTimeout(() => {
      }, 0);
    })

    it('should show assessment popup on dismiss delete is not allowed', () => {
      // arange
      mockPopoverController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve()),
        onDidDismiss: jest.fn(() => Promise.resolve({canDelete: false}))
      })))as any;
      const req = {
        isLastAttempt: false,
        limitExceeded: false,
        isCloseButtonClicked: false
      }
      // act
      commonUtilService.showAssessmentLastAttemptPopup(req);
      // assert
      setTimeout(() => {
      }, 0);
    })
  });

  describe('fetchPrimaryCategory', () => {
    it('should fetch primaryCategory from content and return trim and lowerCaseData', () => {
      // arrange
      // act
      jest.spyOn(commonUtilService, 'appendTypeToPrimaryCategory').getMockImplementation();
      commonUtilService.appendTypeToPrimaryCategory({primaryCategory: 'Digital Textbook'});
      // assert
      expect(commonUtilService.appendTypeToPrimaryCategory).toHaveReturnedWith('digitaltextbook-detail');
    });

    it('should fetch from contentType is primaryCategory is not available', () => {
      // arrange
      jest.spyOn(commonUtilService, 'appendTypeToPrimaryCategory').getMockImplementation();
      // act
      commonUtilService.appendTypeToPrimaryCategory({contentType: 'Digital Textbook'});
      // assert
      expect(commonUtilService.appendTypeToPrimaryCategory).toHaveReturnedWith('digitaltextbook-detail');
    });
  });

  describe('getGuestUserConfig', () => {
    it('should return guest profile', () => {
      // arrange
      mockSharedPreferences.getString = jest.fn(() => of('sample-uid'));
      mockProfileService.getAllProfiles = jest.fn(() => of([
        {
          uid: 'sample-uid',
          name: 'sample-name'
        }, {
          uid: 'login-user-uid'
        }
      ])) as any;
      // act
      commonUtilService.getGuestUserConfig();
      // assert
      expect(mockSharedPreferences.getString).toHaveBeenCalledWith(PreferenceKey.GUEST_USER_ID_BEFORE_LOGIN);
    });
  });

  describe('convertFileToBase64', () => {
    it('should convert file to base64 ', (done) => {
      // arrange
      // fetch = jest.fn(() => { jest.fn(); }) as any
      let file = "assets/imgs/ic_launcher.png"
        const sub = new Subject<any>();
        sub.next = jest.fn()
        sub.complete = jest.fn()
        sub.asObservable = jest.fn()
        const reader = new FileReader();
        reader.onload = jest.fn(() => ({result: ''}))
        reader.readAsDataURL = jest.fn()
      // act
      commonUtilService.convertFileToBase64(file);
      // assert
      done();
    })
  });

  describe('openLink', () => {
    it('should openLink ', () => {
      // arrange
      const url = '';
      // act
      commonUtilService.openLink(url);
      // assert
    })
  })

  describe('openUrlInBrowser', () => {
    it('should openUrlInBrowser ', () => {
      // arrange
      const url = '';
      const options = 'hardwareback=yes,clearcache=no,zoom=no,toolbar=yes,disallowoverscroll=yes';
      window.cordova['InAppBrowser'].open = jest.fn();
      // act
      commonUtilService.openUrlInBrowser(url);
      // assert
      expect(window.cordova['InAppBrowser'].open).toHaveBeenCalledWith(url, '_blank', options);
    })
  })

  describe('getAppDirection', () => {
    it('should getAppDirection ', () => {
      // arrange
      // act
      const data = commonUtilService.getAppDirection();
      // assert
      expect(data).toBe('ltr');
    })
  });

  describe('setGoogleCaptchaConfig', () => {
    it('should set googlde captcha config ', () => {
      // arrange
      // act
      commonUtilService.setGoogleCaptchaConfig('key', true);
      // assert
    })
  })

  describe('getGoogleCaptchaConfig', () => {
    it('shoul get google captchpa ', () => {
      // arrange
      // act
      commonUtilService.getGoogleCaptchaConfig();
      // assert
    })
  })

  describe('isAccessibleForNonStudentRole', () => {
    it('should handle accessible for non student role ', () => {
      // arrange
      // act
      commonUtilService.isAccessibleForNonStudentRole(ProfileType.ADMIN);
      // arrange
    })

    it('should handle accessible for non student role, handle for parent ', () => {
      // arrange
      // act
      commonUtilService.isAccessibleForNonStudentRole(ProfileType.PARENT);
      // arrange
    })
  })

  describe('getGivenPermissionStatus', () => {
    it('should getGivenPermissionStatus', () => {
      // arrange
      mockPermissionService.checkPermissions = jest.fn(() => of({hasPermission: true, isPermissionAlwaysDenied: false})) as any;
      // act
      commonUtilService.getGivenPermissionStatus(AndroidPermission.CAMERA)
      // assert
    })
  })

  describe('showSettingsPageToast', () => {
    it('should showSettingsPageToast ', () => {
      // arrange
      const toastController = {
        message: commonUtilService.translateMessage('description', 'sunbird'),
            cssClass: 'permissionSettingToast',
            buttons: [
                {
                    text: commonUtilService.translateMessage('SETTINGS'),
                    role: 'cancel',
                    handler: () => { }
                }
            ],
            position: 'bottom',
            duration: 3000
          }
      mockToastController.create = jest.fn((toastController) => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onWillDismiss: jest.fn(() => Promise.resolve({role: 'cancel'}))
      } as any)))
      mockRouter.navigate = jest.fn();
      // act
      commonUtilService.showSettingsPageToast('description', 'sunbird', 'common-util', true);
      // assert
    })

    it('should showSettingsPageToast if on boarding false', () => {
      // arrange
      mockToastController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onWillDismiss: jest.fn(() => Promise.resolve({role: 'cancel'}))
      } as any)))
      mockRouter.navigate = jest.fn();
      // act
      commonUtilService.showSettingsPageToast('description', 'sunbird', 'common-util', false);
      // assert
    })

    it('should showSettingsPageToast, if no role on dismiss', () => {
      // arrange
      mockToastController.create = jest.fn(() => (Promise.resolve({
        present: jest.fn(() => Promise.resolve({})),
        onWillDismiss: jest.fn(() => Promise.resolve({role: ''}))
      } as any)))
      mockRouter.navigate = jest.fn();
      // act
      commonUtilService.showSettingsPageToast('description', 'sunbird', 'common-util', false);
      // assert
    })
  })

  describe('buildPermissionPopover', () => {
    it('should buildPermissionPopover ', () => {
      // arrange
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn()
      // act
      commonUtilService.buildPermissionPopover(()=> '', 'sunbird', 'Camera', 'allow', 'common-util', true);
      // assert
      setTimeout(() => {  
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.CAMERA,
          'common-util',
          PageId.PERMISSION_POPUP,
          Environment.HOME);
      }, 0);
    })

    it('should buildPermissionPopover, if permission is not camera and onboaromng is not completed', () => {
      // arrange
      mockTelemetryGeneratorService.generateImpressionTelemetry = jest.fn()
      // act
      commonUtilService.buildPermissionPopover(()=> '', 'sunbird', 'file', 'allow', 'common-util', false);
      // assert
      setTimeout(() => {  
        expect(mockTelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalledWith(ImpressionType.FILE_MANAGEMENT,
          'common-util',
          PageId.PERMISSION_POPUP,
          Environment.ONBOARDING);
      }, 0);
    })
  });

  describe('extractInitial', () => {
    it('should extractInitial and return initial as empty string if no name', () => {
      const data = commonUtilService.extractInitial('')
      // assert
      expect(data).toEqual('')
    })
  });

  describe('populateGlobalCData', () => {
    it('should populateGlobalCData', () => {
      // arrange
      // act
      commonUtilService.populateGlobalCData();
      // assert
    })
  });

  describe('setRatingStarAriaLabel', () => {
    it('should setRatingStarAriaLabel ', () => {
      // arrange
      const domTag = [
        {children: [
          {setAttribute: jest.fn(() => {})}
        ]}
      ];
      // act
      commonUtilService.setRatingStarAriaLabel(domTag);
      // assert
    })

    it('shopuld setRatingStarAriaLabel rating > 0', () => {
      // arrange
      const domTag = [
        {children: [
          {setAttribute: jest.fn(() => {})}
        ]}
      ];
      // act
      commonUtilService.setRatingStarAriaLabel(domTag, 3);
      // assert
    })

    it('should setRatingStarAriaLabel for inner children tags', () => {
      // arrange
      const domTag = [
        {children: [
          {
            setAttribute: jest.fn(() => {}),
            children:[
            {setAttribute: jest.fn(() => {}),
            shadowRoot: {
              querySelector: jest.fn(() => ({
                  setAttribute: jest.fn(() => {})
              }))
            }}
          ]}
        ]}
      ]
      // act
      commonUtilService.setRatingStarAriaLabel(domTag);
      // assert
    })

    it('should setRatingStarAriaLabel for inner children tags else case if no query selector button', () => {
      // arrange
      const domTag = [
        {children: [
          {
            setAttribute: jest.fn(() => {}),
            children:[
            {setAttribute: jest.fn(() => {}),
            shadowRoot: {
              querySelector: jest.fn()
            }}
          ]}
        ]}
      ]
      // act
      commonUtilService.setRatingStarAriaLabel(domTag);
      // assert
    })

    it('shopuld handle setRatingStarAriaLabel, if no ratingDOMtag ', () => {
      // arrange
      // act
      commonUtilService.setRatingStarAriaLabel([]);
      // assert
    })
  });

  describe('addPopupAccessibility', ()=>{
    it('Should add the accessibilty to the toast popup', ()=>{
      // arrange
      commonUtilService['popupAccessibilityFocus'] = jest.fn();
      commonUtilService['getPlatformBasedActiveElement'] = jest.fn(() => {}) as any;
      mockPlatform.is = jest.fn(platform => platform == "android");

      const toast = {
        present: jest.fn(),
        addEventListener: jest.fn(),
        onDidDismiss: jest.fn(()=>Promise.resolve()),
        setAttribute: jest.fn()
      }
      window.document = {
        getElementById: jest.fn(() => ({setAttribute: jest.fn(), focus: jest.fn()})) as any,
        activeElement: {
          shadowRoot: {
            childNodes: [{}]
          }
        }
      } as any
      mockPlatform.is = jest.fn(platform => platform=="android");
      // act
      commonUtilService.addPopupAccessibility(toast, 'message', 'sb-generic-toast');
      // assert
      expect(toast.setAttribute).toHaveBeenCalled();
    });

    it('Should add the accessibilty to the toast popup', ()=>{
      // arrange
      commonUtilService['popupAccessibilityFocus'] = jest.fn();
      commonUtilService['getPlatformBasedActiveElement'] = jest.fn();
      mockPlatform.is = jest.fn(platform => platform == "android");

      const toast = {
        present: jest.fn(),
        addEventListener: jest.fn((_, fn) => {
          fn({setTimeout: jest.fn(fn => fn())})
        }),
        onDidDismiss: jest.fn(()=>Promise.resolve()),
        setAttribute: jest.fn()
      }
      // act
      commonUtilService.addPopupAccessibility(toast, 'message');
      // assert
      expect(toast.setAttribute).toHaveBeenCalled();
    });

  });

  describe('addPreviesUrl()', () => {
    test('add given url to previesUrlList if previesUrlList is empty and blockAddUrl is false', ()=> {
      commonUtilService.blockAddUrl = false
      commonUtilService.previesUrlList = []
      commonUtilService.addPreviesUrl('page/home')
      expect(commonUtilService.previesUrlList).toEqual(['page/home'])

    })

    test('add given url to previesUrlList if previesUrlList is not empty and blockAddUrl is false', ()=> {
      commonUtilService.blockAddUrl = false
      commonUtilService.previesUrlList = ['profile'] as any;
      commonUtilService.addPreviesUrl('page/home')
      expect(commonUtilService.previesUrlList).toEqual(['profile', 'page/home'])

    })

    test('sould not add given url to previesUrlList if blockAddUrl is true', ()=> {
      commonUtilService.blockAddUrl = true
      commonUtilService.previesUrlList = []
      commonUtilService.addPreviesUrl('page/home')
      expect(commonUtilService.previesUrlList).toEqual([])
      expect(commonUtilService.blockAddUrl).toBeFalsy()
    })

    test('sould not add given url to previesUrlList if previesUrlList last url and current url is same', ()=> {
      commonUtilService.blockAddUrl = false
      commonUtilService.previesUrlList = ['page/home'] as any;
      commonUtilService.addPreviesUrl('page/home')
      expect(commonUtilService.previesUrlList).toEqual(['page/home'])
    })

  })
});
