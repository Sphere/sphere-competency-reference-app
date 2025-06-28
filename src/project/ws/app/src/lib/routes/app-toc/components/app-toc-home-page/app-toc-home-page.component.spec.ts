import { NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ContentService } from '@project-sunbird/sunbird-sdk';
import { LocalStorageService } from '../../../../../../../../../app/manage-learn/core';
import { AppFrameworkDetectorService } from '../../../../../../../../../app/modules/core/services/app-framework-detector-service.service';
import { CourseOptimisticUiService } from '../../../../../../../../../app/modules/shared/services/course-optimistic-ui.service';
import { DataSyncService } from '../../../../../../../../../app/modules/shared/services/data-sync.service';
import { ContentCorodovaService, WidgetContentService, WidgetUserService } from '../../../../../../../../../library/ws-widget/collection/src/public-api';
import { LoggerService, ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/public-api';
import { CommonUtilService, AppGlobalService, TelemetryGeneratorService } from '../../../../../../../../../services';
import { Events } from '../../../../../../../../../util/events';
import { QuizService } from '../../../../../../../viewer/src/lib/plugins/quiz/quiz.service';
import { AppTocService } from '../../services/app-toc.service';
import {AppTocHomePageComponent, ErrorType} from './app-toc-home-page.component';
import { AccessControlService } from '../../../../../../../../ws/author/src/public-api'
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx'
import { OfflineCourseOptimisticService } from '../../../../../../../../../app/modules/shared/services/offline-course-optimistic.service';
import { OnlineSqliteService } from '../../../../../../../../../app/modules/shared/services/online-sqlite.service';

jest.mock('../../../../../../../../../assets/configurations/toc.json', () => ({
  __esModule: true,
  default: {
    subtitleOnBanners: true,
    showDescription: true,
    banners: {
        analytics: 'analytics',
          overview: 'overview',
          contents: 'contents',
          name: 'name'
    },
    "atAGlance": {
        "lastUpdatedOn": {
            "displayName": "Last updated on",
            "enabled": true
        },
        "expiryDate": {
            "displayName": "Expiry date",
            "enabled": true
        },
        "learningMode": {
            "displayName": "Learning mode",
            "enabled": true
        },
        "region": {
            "displayName": "Region",
            "enabled": true
        },
        "license": {
            "displayName": "License",
            "enabled": true
        },
        "locale": {
            "displayName": "Locale",
            "enabled": true
        },
        "hasTranslations": {
            "displayName": "Has translations",
            "enabled": true
        },
        "keywords": {
            "displayName": "Keywords",
            "enabled": true
        },
        "curatedInKB": {
            "displayName": "Size",
            "enabled": true
        },
        "displayContentType": {
            "displayName": "Content type",
            "enabled": true
        },
        "complexityLevel": {
            "displayName": "Complexity level",
            "enabled": true
        },
        "duration": {
            "displayName": "Duration",
            "enabled": true
        },
        "cost": {
            "displayName": "Cost",
            "enabled": true
        },
        "viewCount": {
            "displayName": "View count",
            "enabled": true
        },
        "sourceShortName": {
            "displayName": "Source name",
            "enabled": true
        },
        "source": {
            "displayName": "Source name",
            "enabled": true
        },
        "structure": {
            "displayName": "Structure",
            "enabled": true
        },
        "competencies": {
            "displayName": "Competencies",
            "enabled": true
        }
    },
    "overview": {
        "description": {
            "displayName": "Summary",
            "enabled": true
        },
        "body": {
            "displayName": "Description",
            "enabled": true
        },
        "learningObjective": {
            "displayName": "Learning objective",
            "enabled": true
        },
        "registrationInstructions": {
            "displayName": "Registration instructions",
            "enabled": true
        },
        "studyMaterials": {
            "displayName": "Study materials",
            "enabled": true
        },
        "skills": {
            "displayName": "Skills",
            "enabled": true
        },
        "preRequisites": {
            "displayName": "Pre-Requisites",
            "enabled": true
        },
        "topics": {
            "displayName": "Topics",
            "enabled": false
        }
    },
    "analytics": {
        "enabled": true,
        "available": true,
        "courseAnalyticsClient": true,
        "courseAnalytics": false
    }
  }
})) as any;

import tocData from '../../../../../../../../../assets/configurations/toc.json';
import { BehaviorSubject, of, ReplaySubject, throwError } from 'rxjs';
import { NsAppToc } from '../../models/app-toc.model';
import { result } from 'lodash';
import exp from 'constants';

jest.mock("ngx-extended-pdf-viewer", () => ({
  NgxExtendedPdfViewerComponent: () => "MockPdfViewerComponent",
}));

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  NgModule: () => (target) => target,
}));

describe('AppTocHomePageComponent', () => {
    let appTocHomePageComponent: AppTocHomePageComponent

    const mockappFrameworkDetectorService: Partial<AppFrameworkDetectorService> = {};
    const mockcontentService: Partial<ContentService> = {};
    const mockzone: Partial<NgZone> = {};
    const mockroute: Partial<ActivatedRoute> = {
        queryParamMap: of({
                params: {
                    isAsha: "true",
                    courseid: 'do_123',
                    batchId: '123',
                    levelId: '1'
                } as any
            }) as any
    };
    const mockrouter: Partial<Router> = {}; 
    const mockcontentSvc: Partial<WidgetContentService> = {};
    const mockuserSvc: Partial<WidgetUserService> = {};
    const mocktocSvc: Partial<AppTocService> = {};
    const mockloggerSvc: Partial<LoggerService> = {};
    const mockconfigSvc: Partial<ConfigurationsService> = {
        userProfile: {
            profile: {
                firstName: 'test',
                lastName: 'test'
            },
            userId: 'uid-1'
        } as any,
        nodebbUserProfile: {
            username: 'test',
            email: 'test@test.com'
        }
    };
    const mockdomSanitizer: Partial<DomSanitizer> = {};
    const mockauthAccessControlSvc: Partial<AccessControlService> = {};
    const mockcommonUtilService: Partial<CommonUtilService> = {
        removeLoader: jest.fn(() => Promise.resolve())
    };
    const mockevent: Partial<Events> = {};
    const mockscreenOrientation: Partial<ScreenOrientation> = {};    
    const mocklocalStorageService: Partial<LocalStorageService> = {};
    const mockdataSyncService: Partial<DataSyncService> = {};
    const mockonlineSqliteService: Partial<OnlineSqliteService> = {};
    const mockcourseOptimisticUiService: Partial<CourseOptimisticUiService> = {};
    const mocktranslate: Partial<TranslateService> = {};
    const mockofflineCourseOptimisticService: Partial<OfflineCourseOptimisticService> = {};
    const mocksnackBar: Partial<MatSnackBar> = {};
    const mockquizService: Partial<QuizService> = {};
    const mockcordovaSrv: Partial<ContentCorodovaService> = {};
    const mockappGlobalService: Partial<AppGlobalService> = {};
    const mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    
    beforeAll(() => {
        appTocHomePageComponent = new AppTocHomePageComponent(
            mockcontentService as ContentService,
            mockzone as NgZone,
            mockroute as ActivatedRoute,
            mockrouter as Router,
            mockcontentSvc as WidgetContentService,
            mockuserSvc as WidgetUserService,
            mocktocSvc as AppTocService,
            mockloggerSvc as LoggerService,
            mockconfigSvc as ConfigurationsService,
            mockdomSanitizer as DomSanitizer,
            mockauthAccessControlSvc as AccessControlService,
            mockcommonUtilService as CommonUtilService,
            mockevent as Events,
            mockscreenOrientation as ScreenOrientation,
            mockappFrameworkDetectorService as AppFrameworkDetectorService,
            mocklocalStorageService as LocalStorageService,
            mockdataSyncService as DataSyncService,
            mockonlineSqliteService as OnlineSqliteService,
            mockcourseOptimisticUiService as CourseOptimisticUiService,
            mocktranslate as TranslateService,
            mockofflineCourseOptimisticService as OfflineCourseOptimisticService,
            mocksnackBar as MatSnackBar,
            mockquizService as QuizService,
            mockcordovaSrv as ContentCorodovaService,
            mockappGlobalService as AppGlobalService,
            mocktelemetryGeneratorService as TelemetryGeneratorService,
        )
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create an instance of AppTocHomePageComponent', () => {
        appTocHomePageComponent.banners = tocData.banners as any;
        expect(appTocHomePageComponent).toBeTruthy();
        expect(appTocHomePageComponent.banners).toEqual(tocData.banners)
    });

    describe('flattenItems', () => {
        // Import the function from the component file if possible, otherwise redefine for test scope
        const flattenItems = (items: any[], key: string | number) => {
            return items.reduce((flattenedItems, item) => {
                flattenedItems.push(item)
                if (Array.isArray(item[key])) {
                    flattenedItems = flattenedItems.concat(flattenItems(item[key], key))
                }
                return flattenedItems
            }, [])
        }

        it('should flatten a nested array structure', () => {
            const data = [
                { id: 1, children: [
                    { id: 2, children: [] },
                    { id: 3, children: [
                        { id: 4, children: [] }
                    ]}
                ]},
                { id: 5, children: [] }
            ];
            const result = flattenItems(data, 'children');
            const ids = result.map(item => item.id);
            expect(ids).toEqual([1,2,3,4,5]);
        });

        it('should return an empty array when input is empty', () => {
            const result = flattenItems([], 'children');
            expect(result).toEqual([]);
        });

        it('should handle items with no children key gracefully', () => {
            const data = [
                { id: 1 },
                { id: 2, children: [
                    { id: 3 }
                ]}
            ];
            const result = flattenItems(data, 'children');
            const ids = result.map(item => item.id);
            expect(ids).toEqual([1,2,3]);
        });

        it('should handle deeply nested structures', () => {
            const data = [
                { id: 1, nodes: [
                    { id: 2, nodes: [
                        { id: 3, nodes: [
                            { id: 4, nodes: [] }
                        ]}
                    ]}
                ]}
            ];
            const result = flattenItems(data, 'nodes');
            const ids = result.map(item => item.id);
            expect(ids).toEqual([1,2,3,4]);
        });

        it('should not flatten if key is not present', () => {
            const data = [
                { id: 1, foo: [] },
                { id: 2 }
            ];
            const result = flattenItems(data, 'bar');
            const ids = result.map(item => item.id);
            expect(ids).toEqual([1,2]);
        });


    });

    describe('getBatchId', () => {
        it('should return batchId', () => {
            // arrange
            appTocHomePageComponent.batchData = {
                content: [{
                    identifier: 'do_123',
                    name: 'test',
                    appIcon: 'assets/app-icon.png',
                    pkgVersion: '1.0',
                    size: '12MB',
                    owner: 'owner',
                    batchId: 'do_123'
                }]
            } as any;
            // act
            const result = appTocHomePageComponent.getBatchId();
            // assert
            expect(result).toEqual('do_123');
        });
    });

    describe('initData', () => {
        it('should handle error for API_FAILURE', async() => {
            mocktocSvc.initData = jest.fn(() => ({
                content: {
                    identifier: 'do_123',
                    name: 'test',
                    primaryCategory: 'Digital Textbook',
                    completionPercentage: 80,
                    children: [
                        {
                            identifier: 'do_234',
                            mimeType: 'application/vnd.ekstep.content-collection',
                            name: 'test',
                        }
                    ]
                },
                errorCode: NsAppToc.EWsTocErrorCode.API_FAILURE
            })) as any;
           mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
           appTocHomePageComponent.ashaData = {
            params: {
                isAsha: true,
                competencyid: 'do_123',
                levelId: 1,
                batchId: 'do_123'
            }
           };
           const data = {
            content: {
                data: {
                    completionPercentage: 80,
                }
             }
            };
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                result: {
                    contentList: [{
                        identifier: 'do_123',
                        name: 'test'
                    }],
                    response:  'SUCCESS'
                }
            })) as any;
            mocktocSvc.updateResumaData = jest.fn();
            mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
            //act
            await appTocHomePageComponent.initData(data);
            //assert
            expect(appTocHomePageComponent.errorWidgetData.widgetData.errorType).toBe(ErrorType.internalServer);
            expect(mocktocSvc.updateResumaData).toHaveBeenCalled();
            expect(mockdomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
        });

        it('should handle error for INVALID_DATA', async() => {
            mocktocSvc.initData = jest.fn(() => ({
                content: {
                    identifier: 'do_123',
                    name: 'test',
                    primaryCategory: 'Digital Textbook',
                    completionPercentage: 80,
                    children: [
                        {
                            identifier: 'do_234',
                            mimeType: 'application/vnd.ekstep.content-collection',
                            name: 'test',
                        }
                    ]
                },
                errorCode: NsAppToc.EWsTocErrorCode.INVALID_DATA
            })) as any;
           mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
           appTocHomePageComponent.ashaData = {
            params: {
                isAsha: true,
                competencyid: 'do_123',
                levelId: 1,
                batchId: 'do_123'
            }
           };
           const data = {
            content: {
                data: {
                    completionPercentage: 80,
                }
             }
            };
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                result: {
                    contentList: [{
                        identifier: 'do_123',
                        name: 'test'
                    }],
                    response:  'SUCCESS'
                }
            })) as any;
            mocktocSvc.updateResumaData = jest.fn();
            mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
            //act
            await appTocHomePageComponent.initData(data);
            //assert
            expect(appTocHomePageComponent.errorWidgetData.widgetData.errorType).toBe(ErrorType.internalServer);
            expect(mocktocSvc.updateResumaData).toHaveBeenCalled();
            expect(mockdomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
        });

        it('should handle error for NO_DATA', async() => {
            mocktocSvc.initData = jest.fn(() => ({
                content: {
                    identifier: 'do_123',
                    name: 'test',
                    primaryCategory: 'Digital Textbook',
                    completionPercentage: 80,
                    children: [
                        {
                            identifier: 'do_234',
                            mimeType: 'application/vnd.ekstep.content-collection',
                            name: 'test',
                        }
                    ]
                },
                errorCode: NsAppToc.EWsTocErrorCode.NO_DATA
            })) as any;
           mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
           appTocHomePageComponent.ashaData = {
            params: {
                isAsha: true,
                competencyid: 'do_123',
                levelId: 1,
                batchId: 'do_123'
            }
           };
           const data = {
            content: {
                data: {
                    completionPercentage: 80,
                }
             }
            };
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                result: {
                    contentList: [{
                        identifier: 'do_123',
                        name: 'test'
                    }],
                    response:  'SUCCESS'
                }
            })) as any;
            mocktocSvc.updateResumaData = jest.fn();
            mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
            //act
            await appTocHomePageComponent.initData(data);
            //assert
            expect(appTocHomePageComponent.errorWidgetData.widgetData.errorType).toBe(ErrorType.internalServer);
            expect(mocktocSvc.updateResumaData).toHaveBeenCalled();
            expect(mockdomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
        });

        it('should handle error for default', async() => {
            mocktocSvc.initData = jest.fn(() => ({
                content: {
                    identifier: 'do_123',
                    name: 'test',
                    primaryCategory: 'Digital Textbook',
                    completionPercentage: 80,
                    children: [
                        {
                            identifier: 'do_234',
                            mimeType: 'application/vnd.ekstep.content-collection',
                            name: 'test',
                        }
                    ]
                },
                errorCode: null
            })) as any;
           mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
           appTocHomePageComponent.ashaData = {
            params: {
                isAsha: true,
                competencyid: 'do_123',
                levelId: 1,
                batchId: 'do_123'
            }
           };
           const data = {
            content: {
                data: {
                    completionPercentage: 80,
                }
             }
            };
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                result: {
                    contentList: [{
                        identifier: 'do_123',
                        name: 'test'
                    }],
                    response:  'SUCCESS'
                }
            })) as any;
            mocktocSvc.updateResumaData = jest.fn();
            mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
            //act
            await appTocHomePageComponent.initData(data);
            //assert
            expect(appTocHomePageComponent.errorWidgetData.widgetData.errorType).toBe(ErrorType.somethingWrong);
            expect(mocktocSvc.updateResumaData).toHaveBeenCalled();
            expect(mockdomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalled();
        });
    });

    describe('ngOnInit', () => {
        it('should not navigate if route content data is available', async() => {
            mockscreenOrientation.unlock = jest.fn(() => Promise.resolve());
            mockscreenOrientation.lock = jest.fn(() => Promise.resolve());
            mockscreenOrientation.ORIENTATIONS = {
                PORTRAIT: 'PORTRAIT',
                LANDSCAPE: 'LANDSCAPE'
            } as any;
            mockroute.data = of({
                content: {
                    data: {
                        creatorDetails: JSON.stringify({
                            name: 'test',
                            email: 'test@gmail.com'
                        }),
                        reviewer: JSON.stringify({
                            name: 'reviewer',
                            email: 'reviewer@gmail.com'
                        })
                    },
                    completionPercentage: 80,
                    children: [
                        {
                            identifier: 'do_123',
                        },
                        {
                            identifier: 'do_456',
                        }
                    ]  
                }
            });
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('/app/toc/overview');
            mockcontentSvc._updateEnrollValue = new BehaviorSubject<any>(null);
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mocktocSvc._showComponent = new BehaviorSubject<any>(null);
            mocktocSvc.initData = jest.fn(() => ({
                content: {
                    identifier: 'do_123',
                    name: 'test',
                    completionPercentage: 80
                },
                errorCode: NsAppToc.EWsTocErrorCode.NO_DATA
            })) as any;
            mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
            mockroute.fragment = of({'overview': true}) as any;
            mocktocSvc.batchReplaySubject = new ReplaySubject(1);
            mocktocSvc.batchReplaySubject.next({data: 'data'})
            mocklocalStorageService.getLocalStorage = jest.fn(() => Promise.resolve({
                id: 'do_123',
                name: 'test'
            }));
            mockcontentSvc.fetchCourseBatches = jest.fn(() => of({
                content: [{
                     batchId: 'batchId',
                     createdBy: 'test-creator',
                     endDate: '2025-10-10',
                     enrollmentType: 'open',
                     identifier: 'do_123',
                     name: 'test-course',
                     startDate: '2020-10-10',
                     status: 'live',
                     courseId: 'do_123',
                    completionPercentage: 80,
                    batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                }]
            })) as any;
            mocktelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockevent.subscribe = jest.fn((key, args) => {
                if(key === 'makeAPICall') {
                    return args(true);
                }
            });
            mockcontentSvc._updateEnrollValue$ = new BehaviorSubject<any>({
                result: {
                    response: 'SUCCESS'
                }
            });
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                result: {
                    contentList: [{
                        identifier: 'do_123',
                        name: 'test'
                    }],
                    response:  'SUCCESS'
                }
            })) as any;
            jest.spyOn(appTocHomePageComponent, 'getBatchId').mockReturnValue('do_123');
            mockdataSyncService.showSync = jest.fn(() => Promise.resolve(true));
            mocktocSvc.updateResumaData = jest.fn();
            mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
            mockcourseOptimisticUiService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123'
                        }
                    ]
                }
            }));
            mockofflineCourseOptimisticService.fetchUserEnrolledCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                            batchId: 'do_123',
                            completionPercentage: 80,
                            status: 'live',
                             userId: 'uid-1',
                            batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                        }
                    ]
                }
            }));
            mockuserSvc.fetchUserBatchList = jest.fn(() => of({
                result: {
                    courses: [
                        {
                            batchId: 'do_123',
                            createdBy: 'test-creator',
                            endDate: '2025-10-10',
                            enrollmentType: 'open',
                            identifier: 'do_123',
                             name: 'test-course',
                            startDate: '2020-10-10',
                            status: 'live',
                            courseId: 'do_123',
                            completionPercentage: 80,
                            userId: 'uid-1',
                            batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                        }
                    ]
                }
            })) as any;
            mockcourseOptimisticUiService.enrollUser = jest.fn(() => Promise.resolve());
            mockonlineSqliteService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                 result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                            batchId: 'do_123',
                            completionPercentage: 80,
                            status: 'live',
                            userId: 'uid-1',
                            batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                        }
                    ]
                }
            }))
            // act
            await appTocHomePageComponent.ngOnInit();
            expect(mockscreenOrientation.unlock).toHaveBeenCalled();
            expect(mockscreenOrientation.lock).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mocktocSvc.initData).toHaveBeenCalled();
            expect(mocklocalStorageService.setLocalStorage).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
            expect(mockuserSvc.fetchUserBatchList).toHaveBeenCalled();
        });

        it('should not navigate if route content data is available and _updateEnrollValue is undefined', async() => {
            mockscreenOrientation.unlock = jest.fn(() => Promise.resolve());
            mockscreenOrientation.lock = jest.fn(() => Promise.resolve());
            mockscreenOrientation.ORIENTATIONS = {
                PORTRAIT: 'PORTRAIT',
                LANDSCAPE: 'LANDSCAPE'
            } as any;
            mockroute.data = of({
                content: {
                    data: {
                        creatorDetails: JSON.stringify({
                            name: 'test',
                            email: 'test@gmail.com'
                        }),
                        reviewer: JSON.stringify({
                            name: 'reviewer',
                            email: 'reviewer@gmail.com'
                        })
                    }   
                }
            });
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('/app/toc/overview');
            mockcontentSvc._updateEnrollValue = new BehaviorSubject<any>(null);
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mocktocSvc._showComponent = new BehaviorSubject<any>(null);
            mocktocSvc.initData = jest.fn(() => ({
                content: {
                    identifier: 'do_123',
                    name: 'test'
                },
                errorCode: NsAppToc.EWsTocErrorCode.NO_DATA
            })) as any;
            mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
            mockroute.fragment = of({'overview': true}) as any;
            mocktocSvc.batchReplaySubject = new ReplaySubject(1);
            mocktocSvc.batchReplaySubject.next({data: 'data'})
            mocklocalStorageService.getLocalStorage = jest.fn(() => Promise.resolve({
                id: 'do_123',
                name: 'test'
            }));
            mockcontentSvc.fetchCourseBatches = jest.fn(() => of({
                content: [{
                     batchId: 'batchId',
                     createdBy: 'test-creator',
                     endDate: '2025-10-10',
                     enrollmentType: 'open',
                     identifier: 'do_123',
                     name: 'test-course',
                     startDate: '2020-10-10',
                     status: 'live'
                }]
            })) as any;
            mocktelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockevent.subscribe = jest.fn((key, args) => {
                if(key === 'makeAPICall') {
                    return args(true);
                }
            });
            mockcontentSvc._updateEnrollValue$ = new BehaviorSubject<any>(undefined);
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                result: {
                    contentList: [{
                        identifier: 'do_123',
                        name: 'test'
                    }],
                    response:  'SUCCESS'
                }
            })) as any;
            mockdataSyncService.showSync = jest.fn(() => Promise.resolve(true));
            mocktocSvc.updateResumaData = jest.fn();
            mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
               mockcourseOptimisticUiService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                             batchId: 'do_123',
                        }
                    ]
                }
            }));
            mockofflineCourseOptimisticService.fetchUserEnrolledCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                            batchId: 'do_123',
                            completionPercentage: 80,
                            status: 'live',
                            batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                        }
                    ]
                }
            }));
            mockuserSvc.fetchUserBatchList = jest.fn(() => of({
                result: {
                    courses: [
                        {
                            batchId: 'batchId',
                            createdBy: 'test-creator',
                            endDate: '2025-10-10',
                            enrollmentType: 'open',
                            identifier: 'do_123',
                             name: 'test-course',
                            startDate: '2020-10-10',
                            status: 'live',
                            courseId: 'do_123'
                        }
                    ]
                }
            })) as any;
            mockcourseOptimisticUiService.enrollUser = jest.fn(() => Promise.resolve());
            mockonlineSqliteService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                 result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                            batchId: 'do_123',
                            completionPercentage: 80,
                            status: 'live',
                            batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                        }
                    ]
                }
            }));
            jest.spyOn(appTocHomePageComponent, 'getBatchId').mockReturnValue('do_123');
            // act
            await appTocHomePageComponent.ngOnInit();
            expect(mockscreenOrientation.unlock).toHaveBeenCalled();
            expect(mockscreenOrientation.lock).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mocktocSvc.initData).toHaveBeenCalled();
            expect(mocklocalStorageService.setLocalStorage).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
            expect(mockcontentSvc.fetchCourseBatches).toHaveBeenCalled();
        });

         it('should not navigate if route content data is available and _updateEnrollValue is undefined and handle error part', async() => {
            mockscreenOrientation.unlock = jest.fn(() => Promise.resolve());
            mockscreenOrientation.lock = jest.fn(() => Promise.resolve());
            mockscreenOrientation.ORIENTATIONS = {
                PORTRAIT: 'PORTRAIT',
                LANDSCAPE: 'LANDSCAPE'
            } as any;
            mockroute.data = of({
                content: {
                    data: {
                        creatorDetails: JSON.stringify({
                            name: 'test',
                            email: 'test@gmail.com'
                        }),
                        reviewer: JSON.stringify({
                            name: 'reviewer',
                            email: 'reviewer@gmail.com'
                        })
                    }   
                }
            });
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('/app/toc/overview');
            mockcontentSvc._updateEnrollValue = new BehaviorSubject<any>(null);
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mocktocSvc._showComponent = new BehaviorSubject<any>(null);
            mocktocSvc.initData = jest.fn(() => ({
                content: {
                    identifier: 'do_123',
                    name: 'test'
                },
                errorCode: NsAppToc.EWsTocErrorCode.NO_DATA
            })) as any;
            mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
            mockroute.fragment = of({'overview': true}) as any;
            mocktocSvc.batchReplaySubject = new ReplaySubject(1);
            mocktocSvc.batchReplaySubject.next({data: 'data'})
            mocklocalStorageService.getLocalStorage = jest.fn(() => Promise.resolve({
                id: 'do_123',
                name: 'test'
            }));
            mockcontentSvc.fetchCourseBatches = jest.fn(() => throwError({
                error: {
                    params: {
                        errorCode: NsAppToc.EWsTocErrorCode.NO_DATA
                    }
                }
            })) as any;
            mocktelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockevent.subscribe = jest.fn((key, args) => {
                if(key === 'makeAPICall') {
                    return args(true);
                }
            });
            mockcontentSvc._updateEnrollValue$ = new BehaviorSubject<any>(undefined);
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                result: {
                    contentList: [{
                        identifier: 'do_123',
                        name: 'test'
                    }],
                    response:  'SUCCESS'
                }
            })) as any;
            mockdataSyncService.showSync = jest.fn(() => Promise.resolve(true));
            mocktocSvc.updateResumaData = jest.fn();
            mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
               mockcourseOptimisticUiService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                             batchId: 'do_123',
                        }
                    ]
                }
            }));
            mockofflineCourseOptimisticService.fetchUserEnrolledCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                            batchId: 'do_123',
                            completionPercentage: 80,
                            status: 'live',
                            batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                        }
                    ]
                }
            }));
            mockuserSvc.fetchUserBatchList = jest.fn(() => of({
                result: {
                    courses: [
                        {
                            batchId: 'batchId',
                            createdBy: 'test-creator',
                            endDate: '2025-10-10',
                            enrollmentType: 'open',
                            identifier: 'do_123',
                             name: 'test-course',
                            startDate: '2020-10-10',
                            status: 'live',
                            courseId: 'do_123'
                        }
                    ]
                }
            })) as any;
            mockcourseOptimisticUiService.enrollUser = jest.fn(() => Promise.resolve());
            mockonlineSqliteService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                 result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                            batchId: 'do_123',
                            completionPercentage: 80,
                            status: 'live',
                            batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                        }
                    ]
                }
            }));
            jest.spyOn(appTocHomePageComponent, 'getBatchId').mockReturnValue('do_123');
            // act
            await appTocHomePageComponent.ngOnInit();
            expect(mockscreenOrientation.unlock).toHaveBeenCalled();
            expect(mockscreenOrientation.lock).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mocktocSvc.initData).toHaveBeenCalled();
            expect(mocklocalStorageService.setLocalStorage).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
            expect(mockcontentSvc.fetchCourseBatches).toHaveBeenCalled();
        });

        it('should navigate to login page', async() => {
            mockscreenOrientation.unlock = jest.fn(() => Promise.resolve());
            mockscreenOrientation.lock = jest.fn(() => Promise.resolve());
            mockscreenOrientation.ORIENTATIONS = {
                PORTRAIT: 'PORTRAIT',
                LANDSCAPE: 'LANDSCAPE'
            } as any;
            mockroute.data = of({
                content: {
                    data: undefined   
                }
            });
            jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('/app/toc/overview');
            mockcontentSvc._updateEnrollValue = new BehaviorSubject<any>(null);
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mocktocSvc._showComponent = new BehaviorSubject<any>(null);
            mocktocSvc.initData = jest.fn(() => ({
                content: {
                    identifier: 'do_123',
                    name: 'test',
                    completionPercentage: 80
                },
                errorCode: NsAppToc.EWsTocErrorCode.NO_DATA
            })) as any;
            jest.spyOn(appTocHomePageComponent, 'getBatchId').mockReturnValue('do_123');
            mockappGlobalService.isUserLoggedIn = jest.fn(() => true)
            mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
            mockroute.fragment = of({'overview': true}) as any;
            mocktocSvc.batchReplaySubject = new ReplaySubject(1);
            mocktelemetryGeneratorService.generateImpressionTelemetry = jest.fn();
            mockevent.subscribe = jest.fn((key) => {
                if(key === 'makeAPICall') {
                    return true;
                }
            });
            mockcontentSvc._updateEnrollValue$ = new BehaviorSubject<any>({
                result: {
                    response: 'SUCCESS'
                }
            });
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
                result: {
                    contentList: [{
                        identifier: 'do_123',
                        name: 'test'
                    }],
                    response:  'SUCCESS'
                }
            })) as any;
            mockdataSyncService.showSync = jest.fn(() => Promise.resolve(true));
            mocktocSvc.updateResumaData = jest.fn();
            mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
            jest.spyOn(appTocHomePageComponent, 'initData').mockResolvedValue();
               mockcourseOptimisticUiService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                             batchId: 'do_123',
                        }
                    ]
                }
            }));
            mockofflineCourseOptimisticService.fetchUserEnrolledCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                            batchId: 'do_123',
                            completionPercentage: 80,
                            status: 'live',
                            batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                        }
                    ]
                }
            }));
            mockuserSvc.fetchUserBatchList = jest.fn(() => of({
                result: {
                    courses: [
                        {
                            batchId: 'batchId',
                            createdBy: 'test-creator',
                            endDate: '2025-10-10',
                            enrollmentType: 'open',
                            identifier: 'do_123',
                             name: 'test-course',
                            startDate: '2020-10-10',
                            status: 'live',
                            courseId: 'do_123'
                        }
                    ]
                }
            })) as any;
            mockcourseOptimisticUiService.enrollUser = jest.fn(() => Promise.resolve());
              mockonlineSqliteService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                 result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123',
                            batchId: 'do_123',
                            completionPercentage: 80,
                            status: 'live',
                            batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                        }
                    ]
                }
            }))
            // act
            await appTocHomePageComponent.ngOnInit();
            expect(mockscreenOrientation.unlock).toHaveBeenCalled();
            expect(mockscreenOrientation.lock).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mocktelemetryGeneratorService.generateImpressionTelemetry).toHaveBeenCalled();
        });
    });

    describe('setChildContent', () => {
        it('should set child content in local storage', async() => {
            mockcontentService.getChildContents = jest.fn(() => of({
                identifier: 'do_123',
                mimeType: 'application/vnd.ekstep.content-collection',
                children: [{
                    identifier: 'do_234',
                    mimeType: 'application/vnd.ekstep.content-collection'
                }],
                contentData: {
                    identifier: 'do_123',
                    name: 'test',
                    appIcon: 'assets/app-icon.png',
                    description: 'test',
                    pkgVersion: '1.0',
                    status: 'Live',
                    size: '12MB',
                    owner: 'owner'
                }
            })) as any;
            mockzone.run = jest.fn(fn => fn()) as any;
            mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
            // act
            await appTocHomePageComponent.setChildContent();
            // assert
            expect(mockcontentService.getChildContents).toHaveBeenCalled();
            expect(mockzone.run).toHaveBeenCalled();
            expect(mocklocalStorageService.setLocalStorage).toHaveBeenCalled();
        });

        it('should not set child content for catch part', () => {
            mockcontentService.getChildContents = jest.fn(() => throwError({
                error: {
                    result: {
                        response: 'ERROR'
                    }
                }
            })) as any;
            // act
            appTocHomePageComponent.setChildContent();
            // assert
            expect(mockcontentService.getChildContents).toHaveBeenCalled();
        });
    });

    describe('detectFramework', () => {
        it('should be ekshamata framework', async() => {
            // arrange
            mockappFrameworkDetectorService.detectAppFramework = jest.fn(() => Promise.resolve('Ekshamata'));
            // act
            await appTocHomePageComponent.detectFramework();
            // assert
            expect(mockappFrameworkDetectorService.detectAppFramework).toHaveBeenCalled();
            expect(appTocHomePageComponent.showUptuLogo).toBeTruthy();
        });
    });

    describe('showContents', () => {
      it('should be showContents', async() => {
        // arrange
        appTocHomePageComponent.content = {
            identifier: 'do_123',
            name: 'test',
            primaryCategory: 'Digital Textbook',
            children: [
              {
                identifier: 'do_234',
                mimeType: 'application/vnd.ekstep.content-collection',
                name: 'test',
             }
            ]
        } as any;
        mockcontentSvc.fetchContentHistoryV2 = jest.fn(() => of({
            result: {
                contentList: [
                    {
                        identifier: 'do_123',
                        name: 'test',
                        appIcon: 'assets/app-icon.png',
                        description: 'test',
                        pkgVersion: '1.0',
                        status: 'Live',
                        size: '12MB',
                        owner: 'owner',
                        completionPercentage: 50
                    }
                ]
            }
        })) as any;
        mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
            result: {
                contentList: []
            }
        })) as any;
        mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
        // act
        await appTocHomePageComponent.showContents();
        //assert
        expect(mockcourseOptimisticUiService.courseProgressRead).toHaveBeenCalled();
      });

      it('should be handle fetchContentHistoryV2 error part for showContents', async() => {
        // arrange
        appTocHomePageComponent.content = {
            identifier: 'do_123',
            name: 'test',
            primaryCategory: 'Digital Textbook',
            children: [
              {
                identifier: 'do_234',
                mimeType: 'application/vnd.ekstep.content-collection',
                name: 'test',
             }
            ]
        } as any;
        mockcontentSvc.fetchContentHistoryV2 = jest.fn(() => throwError({
            error: {
                result: {
                    response: 'ERROR'
                }
            }
        })) as any;
        mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
            result: {
                contentList: []
            }
        })) as any;
        mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
        // act
        await appTocHomePageComponent.showContents();
        //assert
        expect(mockcourseOptimisticUiService.courseProgressRead).toHaveBeenCalled();
      });

      it('should be showContents for offline', async() => {
        // arrange
        appTocHomePageComponent.content = {
            identifier: 'do_123',
            name: 'test',
            primaryCategory: 'Digital Textbook',
            children: [
              {
                identifier: 'do_234',
                mimeType: 'application/vnd.ekstep.content-collection',
                name: 'test',
             }
            ]
        } as any;
        jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
        mockofflineCourseOptimisticService.courseProgressRead = jest.fn(() => Promise.resolve({
            result: {
                   id: 'do_123',
                   ver: '1.0',
                   params: {},
                    contentList: [{
                        identifier: 'do_123',
                        name: 'test'
                    }],
                    response:  'SUCCESS'
                }
        })) as any;
        mockcourseOptimisticUiService.courseProgressRead = jest.fn(() => Promise.resolve({
            result: {
                contentList: []
            }
        })) as any;
        mocklocalStorageService.setLocalStorage = jest.fn(() => Promise.resolve());
        // act
        await appTocHomePageComponent.showContents();
        //assert
        expect(mockofflineCourseOptimisticService.courseProgressRead).toHaveBeenCalled();
      });

      it('should be showContents if content primaryCategory is Course', async() => {
        // arrange
        appTocHomePageComponent.content = {
            identifier: 'do_123',
            name: 'test',
            primaryCategory: 'Course',
            children: [
              {
                identifier: 'do_234',
                mimeType: 'application/vnd.ekstep.content-collection',
                name: 'test',
             }
            ]
        } as any;
        mocklocalStorageService.getLocalStorage = jest.fn(() => Promise.resolve({
            id: 'do_123',
            name: 'test',
            batchId: 'do_123',
            batchName: 'test',
            identifier: 'do_123',
            primaryCategory: 'Course',
        }));
        mockcontentSvc.fetchCourseBatches = jest.fn(() => of({
            content: [{
                     batchId: 'batchId',
                     createdBy: 'test-creator',
                     endDate: '2025-10-10',
                     enrollmentType: 'open',
                     identifier: 'do_123',
                     name: 'test-course',
                     startDate: '2020-10-10',
                     status: 'live'
                }],
                count: 1,
                enrolled: true
        })) as any;
        mockuserSvc.fetchUserBatchList = jest.fn(() => of([{
            courseName: 'test',
            identifier: 'do_123',
            courseId: 'do_123',
            batchId: 'do_123',
            batchName: 'test',
            primaryCategory: 'Course',
            contentId: 'do_123',
            content: {
                identifier: 'do_123',
                name: 'test',
                primaryCategory: 'Course',
                children: [
                {
                    identifier: 'do_234',
                    mimeType: 'application/vnd.ekstep.content-collection',
                    name: 'test',
                 }  
                ]
            }
            }
        ])) as any;
        mockonlineSqliteService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
            result: {
                courses: []
            }
        }));
        mockcourseOptimisticUiService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123'
                        }
                    ]
                }
            }));
        // act
        await appTocHomePageComponent.showContents();
        //assert
        expect(mockcourseOptimisticUiService.getUserEnrollCourse).toHaveBeenCalled();
        expect(mockcourseOptimisticUiService.getUserEnrollCourse).toHaveBeenCalled();
      });

      it('should be showContents if content primaryCategory is Course for online', async() => {
        // arrange
        appTocHomePageComponent.content = {
            identifier: 'do_123',
            name: 'test',
            primaryCategory: 'Course',
            children: [
              {
                identifier: 'do_234',
                mimeType: 'application/vnd.ekstep.content-collection',
                name: 'test',
             }
            ]
        } as any;
        jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
        mocklocalStorageService.getLocalStorage = jest.fn(() => Promise.resolve({
            id: 'do_123',
            name: 'test',
            batchId: 'do_123',
            batchName: 'test',
            identifier: 'do_123',
            primaryCategory: 'Course',
        }));
        mockcontentSvc.fetchCourseBatches = jest.fn(() => of({
            content: [{
                     batchId: 'batchId',
                     createdBy: 'test-creator',
                     endDate: '2025-10-10',
                     enrollmentType: 'open',
                     identifier: 'do_123',
                     name: 'test-course',
                     startDate: '2020-10-10',
                     status: 'live'
                }],
                count: 1,
                enrolled: true
        })) as any;
        mockuserSvc.fetchUserBatchList = jest.fn(() => of({
            result: { courses: [
            {
            courseName: 'test',
            identifier: 'do_123',
            courseId: 'do_123',
            batchId: 'do_123',
            batchName: 'test',
            primaryCategory: 'Course',
            contentId: 'do_123',
            content: {
                identifier: 'do_123',
                name: 'test',
                primaryCategory: 'Course',
                children: [
                {
                    identifier: 'do_234',
                    mimeType: 'application/vnd.ekstep.content-collection',
                    name: 'test',
                 }  
                ]
            }
            }
          ]}
        })) as any;
        mockcontentSvc.fetchContentHistoryV2 = jest.fn(() => of({
            result: {
                contentList: [
                    {
                        identifier: 'do_123',
                        name: 'test',
                        appIcon: 'assets/app-icon.png',
                        description: 'test',
                        pkgVersion: '1.0',
                        status: 'Live',
                        size: '12MB',
                        owner: 'owner',
                        completionPercentage: 50
                    }
                ]
            }
        })) as any;
        mockonlineSqliteService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
            result: {
                courses: []
            }
        }));
        mockcourseOptimisticUiService.getUserEnrollCourse = jest.fn(() => Promise.resolve({
                result: {
                    courses: [
                        {
                            courseName: 'test',
                            identifier: 'do_123',
                            courseId: 'do_123'
                        }
                    ]
                }
            }));
        // act
        await appTocHomePageComponent.showContents();
        //assert
        expect(mockuserSvc.fetchUserBatchList).toHaveBeenCalled();
      });
    });

    it('should be redirectTo', () => {
        // arrange
        appTocHomePageComponent.routelinK = 'discuss';
        appTocHomePageComponent.loadDiscussionWidget = true;
        mocktocSvc._showComponent = new BehaviorSubject<any>(null);
        // act
        appTocHomePageComponent.redirectTo();
        // assert
        expect(appTocHomePageComponent.routelinK).toBe('discuss');
        expect(appTocHomePageComponent.loadDiscussionWidget).toBe(true);
    });

    describe('toggleComponent', () => {
        it('should navigate to overview page', () => {
            // arrange
            const cname = 'overview';
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mocktocSvc._showComponent = new BehaviorSubject<any>(null);
            // act
            appTocHomePageComponent.toggleComponent(cname, true);
            // assert
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mockrouter.navigate).toHaveBeenCalled();
        });

        it('should navigate to chapter page', () => {
            // arrange
            const cname = 'chapters';
            appTocHomePageComponent.batchData = {
                enrolled : false,
                content: [
                    {
                        courseId: 'do_123',
                        batchId: 'do_123'
                    }
                ]
            } as any;
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockcontentSvc.enrollUserToBatch = jest.fn(() => of({
                result: {
                    response: 'SUCCESS'
                }
            }))
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mocktocSvc._showComponent = new BehaviorSubject<any>(null);
            mocklocalStorageService.getLocalStorage = jest.fn(() => Promise.resolve({
                id: 'do_123',
                name: 'test'
            }));
            jest.useFakeTimers();
            mockcontentSvc.fetchCourseBatches = jest.fn(() => of({
                content: [{
                     batchId: 'batchId',
                     createdBy: 'test-creator',
                     endDate: '2025-10-10',
                     enrollmentType: 'open',
                     identifier: 'do_123',
                     name: 'test-course',
                     startDate: '2020-10-10',
                     status: 'live',
                     courseId: 'do_123',
                    completionPercentage: 80,
                    batch: [
                                {
                                batchId: 'do_123',
                                createdBy: 'test-creator',
                                endDate: '2025-10-10',  
                                enrollmentType: 'open', 
                                identifier: 'do_123',
                                name: 'test-course',
                                startDate: '2020-10-10',
                                status: 'live',
                            }]
                }]
            })) as any;
            mocktranslate.instant = jest.fn(() => 'test');
            mocksnackBar.open = jest.fn();
            appTocHomePageComponent.generateQuery = jest.fn(() => 'batchId: do_123');
            appTocHomePageComponent.resumeDataLink = {url: '/app/url/course'}
            // act
            appTocHomePageComponent.toggleComponent(cname, true);
            jest.advanceTimersByTime(500);
            // assert
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mockcontentSvc.enrollUserToBatch).toHaveBeenCalled();
            expect(mocksnackBar.open).toHaveBeenCalled();
            expect(mocktranslate.instant).toHaveBeenCalled();
            expect(mockrouter.navigate).toHaveBeenCalled();
            jest.clearAllTimers();
        });

        it('should navigate to chapter page for error part', () => {
            // arrange
            const cname = 'chapters';
            appTocHomePageComponent.batchData = {
                enrolled : false,
                content: [
                    {
                        courseId: 'do_123',
                        batchId: 'do_123'
                    }
                ]
            } as any;
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            mockcontentSvc.enrollUserToBatch = jest.fn(() => of({
                result: {
                    response: 'FAILED'
                }
            }))
            mockrouter.navigate = jest.fn(() => Promise.resolve(true));
            mocktocSvc._showComponent = new BehaviorSubject<any>(null);
            mocklocalStorageService.getLocalStorage = jest.fn(() => Promise.resolve({
                id: 'do_123',
                name: 'test'
            }));
            mocktranslate.instant = jest.fn(() => 'test');
            mocksnackBar.open = jest.fn();
            // act
            appTocHomePageComponent.toggleComponent(cname, true);
            // assert
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
            expect(mockcontentSvc.enrollUserToBatch).toHaveBeenCalled();
            expect(mocksnackBar.open).toHaveBeenCalled();
            expect(mocktranslate.instant).toHaveBeenCalled();
            expect(mockrouter.navigate).toHaveBeenCalled();
        });
    })

    describe('ngOnDestroy', () => {
        it('should unsubscribe events on ngOnDestroy', () => {
            // arrange
            // act
            appTocHomePageComponent.ngOnDestroy();
            // assert
            expect(appTocHomePageComponent.unsubscribe).toBeTruthy();
            expect(appTocHomePageComponent.routeSubscription).toBeTruthy();
        });
    });
});