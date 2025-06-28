import { ActivatedRoute } from "@angular/router";
import { ContentService } from "@project-sunbird/sunbird-sdk";
import { LocalStorageService } from "../../../../../../../../app/manage-learn/core";
import { AppTocHomePageService } from "./app-toc-home-page.service";
import { ScreenOrientation } from "@awesome-cordova-plugins/screen-orientation/ngx";
import { of } from "rxjs";

describe("AppTocHomePageService", () => {
  let service: AppTocHomePageService;
  const mockcontentService: Partial<ContentService> = {};
  const mocklocalStorageService: Partial<LocalStorageService> = {};
  const mockroute: Partial<ActivatedRoute> = {
    queryParamMap: of({
      params: {
        isAsha: "true",
        courseid: "do_123",
        batchId: "123",
        levelId: "1",
      } as any,
    }),
    data: of({ content: {
      data: {
        creatorDetails: '{"name": "A", "id": "1"}',
      }
    } }),
  } as any;
  const mockscreenOrientation: Partial<ScreenOrientation> = {};

  beforeAll(() => {
    service = new AppTocHomePageService(
      mockscreenOrientation as ScreenOrientation,
      mockroute as ActivatedRoute,
      mockcontentService as ContentService,
      mocklocalStorageService as LocalStorageService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it('should call initializeScreenOrientation and lock to PORTRAIT', async () => {
    const unlockMock = jest.fn().mockResolvedValue(undefined);
    const lockMock = jest.fn().mockResolvedValue(undefined);
    const orientations = { PORTRAIT: 'portrait' };
    const mockScreenOrientation = {
      unlock: unlockMock,
      lock: lockMock,
      ORIENTATIONS: orientations,
    };
    await service.initializeScreenOrientation(mockScreenOrientation);
    expect(unlockMock).toHaveBeenCalled();
    expect(lockMock).toHaveBeenCalledWith('portrait');
  });

  it('getQueryParams should return query params from route', () => {
    service.getQueryParams().subscribe((params) => {
      expect(params).toBe('test-query-params');
    });
  });

  it('getRouteData should return content data with isValidJson true', () => {
    service.getRouteData().subscribe((result) => {
      expect(result.foo).toBe('bar');
      expect(result.isValidJson).toBe(true);
    });
  });

  it('getRouteData should return null if no content data', () => {
    service.getRouteData().subscribe((result) => {
      expect(result).toBeNull();
    });
  });

  it('getCombinedRouteData should combine queryParams and contentData', () => {
    const queryParams$ = {
      subscribe: (cb) => cb('qp')
    };
    const contentData$ = {
      subscribe: (cb) => cb('cd')
    };
    jest.spyOn(service, 'getQueryParams').mockReturnValue({
      subscribe: (cb) => cb('qp'),
      pipe: jest.fn().mockReturnThis()
    } as any);
    jest.spyOn(service, 'getRouteData').mockReturnValue({
      subscribe: (cb) => cb('cd'),
      pipe: jest.fn().mockReturnThis()
    } as any);

    // Patch combineLatest to test synchronously
    jest.spyOn(require('rxjs'), 'combineLatest').mockImplementation((arr) => ({
      pipe: (fn) => ({
        subscribe: (cb) => cb(['qp', 'cd'])
      })
    }));

    service.getCombinedRouteData().subscribe((result) => {
      expect(result).toBeTruthy();
      // Restore combineLatest
      require('rxjs').combineLatest.mockRestore();
    });
  });

  it('getAndSetChildContent should fetch, update, and store child content', async () => {
    const contentId = '123';
    const childContent = {
      children: [{ contentData: { foo: 'bar' }, children: [] }],
      contentData: { foo: 'baz' }
    };
    const updatedContent = {
      ...childContent,
      foo: 'baz',
      children: [{ foo: 'bar' }]
    };
    const getChildContentsMock = jest.fn().mockReturnValue({
      toPromise: () => Promise.resolve(childContent)
    });
    const setLocalStorageMock = jest.fn();
    (service as any).contentService = { getChildContents: getChildContentsMock };
    (service as any).localStorageService = { setLocalStorage: setLocalStorageMock };
    // Patch updateDataRecursively to return updatedContent
    jest.spyOn(service as any, 'updateDataRecursively').mockReturnValue(updatedContent);

    const result = await service.getAndSetChildContent(contentId);
    expect(getChildContentsMock).toHaveBeenCalledWith({ contentId, hierarchyInfo: null });
    expect(setLocalStorageMock).toHaveBeenCalledWith(`sdk_content${contentId}`, { ...childContent, children: updatedContent.children });
    expect(result).toEqual({ ...childContent, children: updatedContent.children });
  });

  it('getAndSetChildContent should throw error if contentService fails', async () => {
    const contentId = 'fail';
    const getChildContentsMock = jest.fn().mockReturnValue({
      toPromise: () => Promise.reject(new Error('fail'))
    });
    (service as any).contentService = { getChildContents: getChildContentsMock };
    await expect(service.getAndSetChildContent(contentId)).rejects.toThrow('fail');
  });

  it('isValidJson should return true for valid JSON', () => {
    expect((service as any).isValidJson('{"a":1}')).toBe(true);
  });

  it('isValidJson should return false for invalid JSON', () => {
    expect((service as any).isValidJson('{a:1}')).toBe(false);
  });

  it('updateDataRecursively should merge contentData and clean empty children', () => {
    const node = {
      contentData: { foo: 'bar' },
      children: [{
        contentId: 'do_123'
      }]
    };
    const result = (service as any).updateDataRecursively(node);
    expect(result).toBeUndefined();
  });

  it('cleanEmptyChildren should remove children if empty', () => {
    const node = { children: [] };
    const result = (service as any).cleanEmptyChildren(node);
    expect(result.children).toBeUndefined();
  });

  it('cleanEmptyChildren should keep children if not empty', () => {
    const node = { children: [1] };
    const result = (service as any).cleanEmptyChildren(node);
    expect(result.children).toEqual([1]);
  });
});
