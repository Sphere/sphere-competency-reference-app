import { OverlayContainer } from '@angular/cdk/overlay';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthService } from '@project-sunbird/sunbird-sdk';
import { WidgetUserService, ContentCorodovaService } from '../../../../../library/ws-widget/collection/src/public-api';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api';
import { CommonUtilService } from '../../../../../services';
import { Events } from '../../../../../util/events';
import { CardService } from '../../../shared/services/card.service';
import { ScrollService } from '../../../shared/services/scroll.service';
import { UserService } from '../../services/user.service';
import {SphereMobileDashboardComponent} from './sphere-mobile-dashboard.component';
import { ConfigService as CompetencyConfiService } from '../../../../../app/competency/services/config.service'
import { BehaviorSubject, of } from 'rxjs';

describe('SphereMobileDashboardComponent', () => {
    let sphereMobileDashboardComponent: SphereMobileDashboardComponent;
    const mockauthService: Partial<AuthService> = {};
    const mockconfigSvc: Partial<ConfigurationsService> = {};
    const mockuserSvc: Partial<WidgetUserService> = {};
    const mockContentSvc: Partial<ContentCorodovaService> = {};
    const mockrouter: Partial<Router> = {};
    const mockuserHomeSvc: Partial<UserService> = {};
    const mockcommonUtilService: Partial<CommonUtilService> = {
        removeLoader: jest.fn(() => Promise.resolve())
    };
    const mockCompetencyConfiService: Partial<CompetencyConfiService> = {};
    const mocksanitizer: Partial<DomSanitizer> = {};
    const mockscrollService: Partial<ScrollService> = {};
    const mockcardService: Partial<CardService> = {};
    const mockoverlayContainer: Partial<OverlayContainer> = {};
    const mockevents: Partial<Events> = {};
    const mockplatform: Partial<Platform> = {};

    beforeAll(() => {
        sphereMobileDashboardComponent = new SphereMobileDashboardComponent(
             mockconfigSvc as ConfigurationsService,
                mockuserSvc as WidgetUserService,
                mockContentSvc as ContentCorodovaService,
                mockrouter as Router,
                mockuserHomeSvc as UserService,
                mocksanitizer as DomSanitizer,
                mockauthService as AuthService,
                mockcommonUtilService as CommonUtilService,
                mockCompetencyConfiService as CompetencyConfiService,
                mockscrollService as ScrollService,
                mockcardService as CardService,
                mockoverlayContainer as OverlayContainer,
                mockevents as Events,
                mockplatform as Platform,
        )
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of SphereMobileDashboardComponent', () => {
        expect(sphereMobileDashboardComponent).toBeTruthy();
    });

    it('should set isTablet and call setHomeContent and setUserprofile on ngOnInit', async () => {
        const mockPlatform = { is: jest.fn().mockReturnValue(true) };
        // const mockUserHomeSvc = {
        //     updateValue$: { subscribe: jest.fn() }
        // };
        mockuserHomeSvc.getActiveRole = jest.fn().mockResolvedValue('learner')
        mockplatform.is = jest.fn(() => true);
        mockscrollService.scrollToDivEvent= of('scrollToCneCourses') as any;
        mockscrollService.scrollToElement = jest.fn();
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation();
        mockauthService.getSession = jest.fn(() => of({
            userToken: 'sample.user.token'
        })) as any;
        sphereMobileDashboardComponent.setHomeContent = jest.fn();
        sphereMobileDashboardComponent.setUserprofile = jest.fn().mockResolvedValue(undefined);
        mockuserHomeSvc.updateValue$ = new BehaviorSubject({});
        await sphereMobileDashboardComponent.ngOnInit();

        expect(mockPlatform.is).toHaveBeenCalledWith('tablet');
        expect(sphereMobileDashboardComponent.isTablet).toBe(true);
        expect(sphereMobileDashboardComponent.setHomeContent).toHaveBeenCalled();
        expect(sphereMobileDashboardComponent.setUserprofile).toHaveBeenCalled();
    });

    it('should unsubscribe scroll$ on ngOnDestroy', () => {
        const unsubscribeMock = jest.fn();
        sphereMobileDashboardComponent.scroll$ = { unsubscribe: unsubscribeMock } as any;
        sphereMobileDashboardComponent.ngOnDestroy();
        expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should set dataCarousel and videoData from localStorage in setHomeContent', async () => {
        const mockContent = {
            private: {
                content: [{ id: 1 }],
                videoData: [{ url: 'test' }]
            }
        };
        jest.spyOn(global.localStorage, 'getItem').mockReturnValue(JSON.stringify(mockContent));
        sphereMobileDashboardComponent.setVideoData = jest.fn();
        sphereMobileDashboardComponent.setHomeContentByAPI = jest.fn();
        await sphereMobileDashboardComponent.setHomeContent();
        expect(sphereMobileDashboardComponent.dataCarousel).toEqual(mockContent.private.content);
        expect(sphereMobileDashboardComponent.setVideoData).toHaveBeenCalledWith(mockContent.private.videoData);
    });

    it('should call setHomeContentByAPI if no localStorage content in setHomeContent', async () => {
        jest.spyOn(global.localStorage, 'getItem').mockReturnValue(null);
        sphereMobileDashboardComponent.setHomeContentByAPI = jest.fn();
        await sphereMobileDashboardComponent.setHomeContent();
        expect(sphereMobileDashboardComponent.setHomeContentByAPI).toHaveBeenCalled();
    });

    it('should call setHomeContentByAPI on error in setHomeContent', async () => {
        jest.spyOn(global.localStorage, 'getItem').mockImplementation(() => { throw new Error('fail') });
        sphereMobileDashboardComponent.setHomeContentByAPI = jest.fn();
        await sphereMobileDashboardComponent.setHomeContent();
        expect(sphereMobileDashboardComponent.setHomeContentByAPI).toHaveBeenCalled();
    });

    it('should set dataCarousel and videoData in setHomeContentByAPI', () => {
        const mockContent = {
            private: {
                content: [{ id: 2 }],
                videoData: [{ url: 'test2' }]
            }
        };
        mockContentSvc.getHomeStaticContent = jest.fn().mockReturnValue({
                subscribe: (cb: any) => cb(mockContent)
            })
        sphereMobileDashboardComponent.setVideoData = jest.fn();
        jest.spyOn(global.localStorage, 'setItem').mockImplementation(() => {});
        sphereMobileDashboardComponent.setHomeContentByAPI();
        expect(sphereMobileDashboardComponent.dataCarousel).toEqual(mockContent.private.content);
        expect(sphereMobileDashboardComponent.setVideoData).toHaveBeenCalledWith(mockContent.private.videoData);
    });

    it('should set videoData with sanitized urls in setVideoData', async () => {
        const videoList = [{ url: 'http://test.com' }];
        const sanitizedUrl = 'safeUrl';
        mocksanitizer.bypassSecurityTrustResourceUrl = jest.fn().mockResolvedValue(sanitizedUrl)

        await sphereMobileDashboardComponent.setVideoData(videoList);
        expect(mocksanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('http://test.com');
    });

    it('should return identifiers list and set enrolledCourses in getIdentifiersList', () => {
        const coursesList = [
            { completionPercentage: 50, content: { identifier: 'id1' }, dateTime: 123 },
            { completionPercentage: 100, content: { identifier: 'id2' }, dateTime: 456 },
            { completionPercentage: 80, content: { identifier: 'id3' }, dateTime: 789 }
        ];
        const result = sphereMobileDashboardComponent.getIdentifiersList(coursesList);
        expect(result).toEqual(['id1', 'id3']);
        expect(sphereMobileDashboardComponent.enrolledCourses.length).toBe(2);
    });

    it('should update defaultLang and names in userLanguage', () => {
        const res = {
            profileDetails: {
                preferences: { language: 'hi' },
                profileReq: { personalDetails: { firstname: 'A', surname: 'B' } }
            }
        };
        mockcommonUtilService.updateAppLanguage = jest.fn()
        sphereMobileDashboardComponent.userLanguage(res);
        expect(sphereMobileDashboardComponent.defaultLang).toBe('hi');
        expect(sphereMobileDashboardComponent.firstName).toBe('A');
        expect(sphereMobileDashboardComponent.lastName).toBe('B');
        expect(mockcommonUtilService.updateAppLanguage).toHaveBeenCalledWith('hi');
    });

    it('should format featuredCourse in formatFeaturedCourseResponse', () => {
        sphereMobileDashboardComponent.featuredCourseIdentifier = ['f1', 'f2'];
        const res = { result: { content: [{ identifier: 'f1' }, { identifier: 'f2' }, { identifier: 'f3' }] } };
        sphereMobileDashboardComponent.featuredCourse = [];
        sphereMobileDashboardComponent.formatFeaturedCourseResponse(res);
        expect(sphereMobileDashboardComponent.featuredCourse.length).toBe(2);
    });

    it('should call userHomeSvc.userRead in setUserprofile', async () => {
        const session = { userToken: 'token' };
        sphereMobileDashboardComponent.authService = {
            getSession: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue(session) })
        } as any;
        mockuserHomeSvc.userRead = jest.fn()
        await sphereMobileDashboardComponent.setUserprofile();
        expect(sphereMobileDashboardComponent.authService.getSession).toHaveBeenCalled();
        expect(mockuserHomeSvc.userRead).toHaveBeenCalledWith('token');
    });

    it('should set cneCourse in cneCourses', () => {
        sphereMobileDashboardComponent.cneCourseIdentifier = ['c1'];
        const res = { result: { content: [{ identifier: 'c1' }, { identifier: 'c2' }] } };
        sphereMobileDashboardComponent.cneCourses(res);
        expect(sphereMobileDashboardComponent.cneCourse.length).toBe(1);
    });

    it('should set topCertifiedCourse in formatTopCertifiedCourseResponse', () => {
        sphereMobileDashboardComponent.topCertifiedCourseIdentifier = ['t1'];
        sphereMobileDashboardComponent.hindiTopCertifiedCourseIdentifier = ['h1'];
        sphereMobileDashboardComponent.defaultLang = 'en';
        const res = { result: { content: [{ identifier: 't1' }, { identifier: 't2' }] } };
        sphereMobileDashboardComponent.formatTopCertifiedCourseResponse(res);
        expect(sphereMobileDashboardComponent.topCertifiedCourse.length).toBeLessThanOrEqual(10);
    });

    it('should set userEnrollCourse in formatmyCourseResponse', () => {
        sphereMobileDashboardComponent.enrolledCourses = [
            { identifier: 'id1', completionPercentage: 50, dateTime: 2 },
            { identifier: 'id2', completionPercentage: 80, dateTime: 1 }
        ];
        const coursesDetails = [
            { identifier: 'id1', appIcon: 'icon1', thumbnail: 'thumb1', name: 'Course1', sourceName: 'src', cneName: 'cne', issueCertification: true },
            { identifier: 'id2', appIcon: 'icon2', thumbnail: 'thumb2', name: 'Course2', sourceName: 'src2', cneName: 'cne2', issueCertification: false }
        ];
        sphereMobileDashboardComponent.formatmyCourseResponse(coursesDetails);
        expect(sphereMobileDashboardComponent.userEnrollCourse.length).toBe(2);
        expect(sphereMobileDashboardComponent.userEnrollCourse[0].identifier).toBe('id1');
    });

    it('should call router.navigateByUrl in raiseTelemetry', () => {
        const mockRouter = { navigateByUrl: jest.fn() };
        sphereMobileDashboardComponent.raiseTelemetry('abc');
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/toc/abc/overview');
    });

    it('should call router.navigate in openIframe', () => {
        const mockRouter = { navigate: jest.fn() };
        sphereMobileDashboardComponent.openIframe({ videoIndex: 5 });
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/video-player'], { queryParams: { video: 5 } });
    });

    it('should set isAPIInProgress and call router.navigateByUrl in naviagateToviewAllCourse', async () => {
        const mockRouter = { navigateByUrl: jest.fn() };
        await sphereMobileDashboardComponent.naviagateToviewAllCourse();
        expect(sphereMobileDashboardComponent.isAPIInProgress).toBe(true);
        expect(mockRouter.navigateByUrl).toHaveBeenCalled();
    });

    it('should emit scrollToHowSphereWorks in scrollParentToHowSphereWorks', () => {
        const emitMock = jest.fn();
        mockscrollService.scrollToDivEvent = { emit: emitMock } as any;
        sphereMobileDashboardComponent.scrollParentToHowSphereWorks();
        expect(emitMock).toHaveBeenCalledWith('scrollToHowSphereWorks');
    });

    it('should set roleSelected and call setRole and events.publish in learner', () => {
        const setRoleMock = jest.fn();
        const publishMock = jest.fn();
        mockuserHomeSvc.setRole = setRoleMock as any;
        mockevents.publish = publishMock  as any;
        sphereMobileDashboardComponent.learner();
        expect(sphereMobileDashboardComponent.roleSelected).toBe('learner');
        expect(setRoleMock).toHaveBeenCalledWith('learner');
        expect(publishMock).toHaveBeenCalledWith('updatePrimaryNavBarConfig');
    });

    it('should set roleSelected and call setRole and events.publish in mentor', () => {
        const setRoleMock = jest.fn();
        const publishMock = jest.fn();
   mockuserHomeSvc.setRole = setRoleMock as any;
        mockevents.publish = publishMock  as any;
        sphereMobileDashboardComponent.mentor();
        expect(sphereMobileDashboardComponent.roleSelected).toBe('mentor');
        expect(setRoleMock).toHaveBeenCalledWith('mentor');
        expect(publishMock).toHaveBeenCalledWith('updatePrimaryNavBarConfig');
    });

    it('should stop event propagation in stopPropagation', () => {
        const event = { stopPropagation: jest.fn() } as any;
        sphereMobileDashboardComponent.stopPropagation(event);
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should add classes and set isMenuOpen in preventCloseOnClickOut', () => {
        const addMock = jest.fn();
        mockoverlayContainer.getContainerElement = jest.fn(() => ({ classList: { add: addMock } })) as any;
        document.body.classList.add = jest.fn();
        Object.defineProperty(document.body.style, 'overflow', { value: '', writable: true });
        sphereMobileDashboardComponent.preventCloseOnClickOut();
        expect(addMock).toHaveBeenCalledWith('disable-backdrop-click');
        expect(addMock).toHaveBeenCalledWith('blur-background');
        expect(sphereMobileDashboardComponent.isMenuOpen).toBe(true);
    });

    it('should remove classes and set isMenuOpen in allowCloseOnClickOut', () => {
        const removeMock = jest.fn();
        mockoverlayContainer.getContainerElement = jest.fn(() => ({ classList: { remove: removeMock } })) as any;
        document.body.classList.remove = jest.fn();
        Object.defineProperty(document.body.style, 'overflow', { value: '', writable: true });
        sphereMobileDashboardComponent.allowCloseOnClickOut();
        expect(removeMock).toHaveBeenCalledWith('disable-backdrop-click');
        expect(removeMock).toHaveBeenCalledWith('blur-background');
        expect(sphereMobileDashboardComponent.isMenuOpen).toBe(false);
    });

    it('should call closeMenu on menu in closeMenu', () => {
        const menu = { closeMenu: jest.fn() };
        sphereMobileDashboardComponent.closeMenu(menu as any);
        expect(menu.closeMenu).toHaveBeenCalled();
    });
})