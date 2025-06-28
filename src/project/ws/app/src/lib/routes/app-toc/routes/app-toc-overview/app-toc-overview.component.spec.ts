import { NgModule } from "@angular/core";

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
})
export class MockMdePopoverModule {}

jest.mock("@material-extended/mde", () => ({
  MdePopoverModule: MockMdePopoverModule,
}));

import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppTocService } from '../../services/app-toc.service';
import {AppTocOverviewComponent} from './app-toc-overview.component';
import { AccessControlService } from '@ws/author';
import { BehaviorSubject, of } from 'rxjs';
import { NsAppToc } from "../../models/app-toc.model";

jest.mock('../../../../../../../../../assets/configurations/license.meta.json', () => ({
  __esModule: true,
  default: {
    "licenses": [
        {
            "licenseName": "CC BY",
            "desc": "This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use.",
            "link": "https://creativecommons.org/licenses/by/4.0/"
        },
        {
            "licenseName": "CC BY-SA",
            "desc": "This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use. If you remix, adapt, or build upon the material, you must license the modified material under identical terms.",
            "link": "https://creativecommons.org/licenses/by-sa/4.0/"
        },
        {
            "licenseName": "CC BY-NC",
            "desc": "This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator.",
            "link": "https://creativecommons.org/licenses/by-nc/4.0/"
        }
      ]
  }
})) as any;

describe('AppTocOverviewComponent', () => {
    let appTocOverviewComponent: AppTocOverviewComponent;
    const mockroute: Partial<ActivatedRoute> = {
      parent: {
        data: new BehaviorSubject({})
      } as any
    };
    const mocktocSharedSvc: Partial<AppTocService> = {};
    const mockdomSanitizer: Partial<DomSanitizer> = {};
    const mockauthAccessControlSvc: Partial<AccessControlService> = {};
    const mockrouter: Partial<Router> = {};

    beforeAll(() => {
        appTocOverviewComponent = new AppTocOverviewComponent(
              mockroute as ActivatedRoute,
                mocktocSharedSvc as AppTocService,
                mockdomSanitizer as DomSanitizer,
                mockauthAccessControlSvc as AccessControlService,
                mockrouter as Router
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create an instance of AppTocOverviewComponent', () => {
        expect(appTocOverviewComponent).toBeTruthy();
    });

   describe('ngOnInit', () => {
     it('should call getTocData', () => {
        mocktocSharedSvc.showComponent$ = of({ showComponent: false });
        mockroute.queryParams = of({
          license: 'CC BY'
        });
        appTocOverviewComponent.forPreview = false;
        mocktocSharedSvc.initData = jest.fn(() => ({
          content: {
            identifier: "do_123",
            name: "test",
            primaryCategory: "Digital Textbook",
            completionPercentage: 80,
            children: [
              {
                identifier: "do_234",
                mimeType: "application/vnd.ekstep.content-collection",
                name: "test",
              },
            ],
          },
          errorCode: NsAppToc.EWsTocErrorCode.API_FAILURE,
        })) as any;
        mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
        mockauthAccessControlSvc.proxyToAuthoringUrl = jest.fn(() => 'sample');
       appTocOverviewComponent.ngOnInit();
       expect(appTocOverviewComponent.loadOverview).toBeFalsy();
     });

     it('should call getTocData for showComponent', () => {
        mocktocSharedSvc.showComponent$ = of({ showComponent: true });
        mockroute.queryParams = of({
          license: 'CC BY'
        });
        appTocOverviewComponent.forPreview = false;
        mocktocSharedSvc.initData = jest.fn(() => ({
          content: {
            identifier: "do_123",
            name: "test",
            primaryCategory: "Digital Textbook",
            completionPercentage: 80,
            children: [
              {
                identifier: "do_234",
                mimeType: "application/vnd.ekstep.content-collection",
                name: "test",
              },
            ],
          },
          errorCode: NsAppToc.EWsTocErrorCode.API_FAILURE,
        })) as any;
       mockdomSanitizer.bypassSecurityTrustHtml = jest.fn();
       appTocOverviewComponent.ngOnInit();
       expect(appTocOverviewComponent.loadOverview).toBeTruthy();
     });

    it('should return subtitleOnBanners from tocSharedSvc in showSubtitleOnBanner getter', () => {
      (mocktocSharedSvc as any).subtitleOnBanners = true;
      expect(appTocOverviewComponent.showSubtitleOnBanner).toBe(true);
    });

    it('should return true from showDescription getter if content exists and body is falsy', () => {
      appTocOverviewComponent.content = { body: '' } as any;
      expect(appTocOverviewComponent.showDescription).toBe(true);
    });

    it('should return showDescription from tocSharedSvc in showDescription getter', () => {
      (mocktocSharedSvc as any).showDescription = false;
      appTocOverviewComponent.content = null;
      expect(appTocOverviewComponent.showDescription).toBe(false);
    });

    it('should call router.navigate in goToProfile', () => {
      const navigateSpy = jest.fn();
      (mockrouter as any).navigate = navigateSpy;
      appTocOverviewComponent.goToProfile('user123');
      expect(navigateSpy).toHaveBeenCalledWith(['/app/person-profile'], { queryParams: { userId: 'user123' } });
    });

    it('should unsubscribe on ngOnDestroy', () => {
      const nextSpy = jest.spyOn(appTocOverviewComponent.unsubscribe, 'next');
      const completeSpy = jest.spyOn(appTocOverviewComponent.unsubscribe, 'complete');
      appTocOverviewComponent.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should set content and body in initData', async () => {
      const mockData = { some: 'data' };
      const mockContent = { body: '<p>test</p>' };
      (mocktocSharedSvc as any).initData = jest.fn().mockResolvedValue({ content: mockContent });
      (mockdomSanitizer as any).bypassSecurityTrustHtml = jest.fn((html: string) => html);
      appTocOverviewComponent.forPreview = false;
      await (appTocOverviewComponent as any).initData(mockData);
      expect(appTocOverviewComponent.content).toEqual(mockContent);
      expect(appTocOverviewComponent.body).toBe('<p>test</p>');
    });

    it('should use proxyToAuthoringUrl in initData if forPreview is true', async () => {
      const mockData = { some: 'data' };
      const mockContent = { body: '<p>test</p>' };
      (mocktocSharedSvc as any).initData = jest.fn().mockResolvedValue({ content: mockContent });
      (mockdomSanitizer as any).bypassSecurityTrustHtml = jest.fn((html: string) => html);
      (mockauthAccessControlSvc as any).proxyToAuthoringUrl = jest.fn(() => 'proxied');
      appTocOverviewComponent.forPreview = true;
      await (appTocOverviewComponent as any).initData(mockData);
      expect(mockauthAccessControlSvc.proxyToAuthoringUrl).toHaveBeenCalledWith('<p>test</p>');
      expect(appTocOverviewComponent.body).toBe('proxied');
    });
   });
})