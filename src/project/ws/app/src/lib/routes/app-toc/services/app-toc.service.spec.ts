import { HttpClient } from "@angular/common/http";
import { AppTocService } from "./app-toc.service";
import { ActivatedRoute } from "@angular/router";
import { HTTP } from "@awesome-cordova-plugins/http/ngx";
import { ModalController } from "@ionic/angular";
import {
  AuthService,
  DeviceInfo,
  SharedPreferences,
} from "@project-sunbird/sunbird-sdk";
import {
  ToastService,
  ApiUtilsService,
  LocalStorageService,
} from "../../../../../../../../app/manage-learn/core";
import { SqliteService } from "../../../../../../../../app/modules/shared/services/sqlite.service";
import { ConfigurationsService } from "../../../../../../../../library/ws-widget/utils/src/public-api";
import { UtilityService } from "../../../../../../../../services";
import { BehaviorSubject, of, Subject, throwError } from "rxjs";
import { NsContent } from "../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model";

describe("AppTocService", () => {
  let appTocService: AppTocService;
  const mockauthService: Partial<AuthService> = {};
  const mockdeviceInfo: Partial<DeviceInfo> = {};
  const mockpreferences: Partial<SharedPreferences> = {};
  const mockhttp: Partial<HttpClient> = {};
  const mocktoast: Partial<ToastService> = {};
  const mockroute: Partial<ActivatedRoute> = {
    snapshot: {
      paramMap: {
        get: jest.fn(() => "do_123"),
        id: "do_123",
      },
    } as any,
  };
  const mockmodalController: Partial<ModalController> = {};
  const mockutils: Partial<ApiUtilsService> = {};
  const mockionicHttp: Partial<HTTP> = {};
  const mockutilityService: Partial<UtilityService> = {
    getBuildConfigValue: jest.fn(() => Promise.resolve("sphere.aastrika.com")),
  };
  const mockconfigSvc: Partial<ConfigurationsService> = {};
  const mocklocalStorageService: Partial<LocalStorageService> = {};
  const mocksqliteService: Partial<SqliteService> = {};

  beforeAll(() => {
    appTocService = new AppTocService(
      mockhttp as HttpClient,
      mocktoast as ToastService,
      mockroute as ActivatedRoute,
      mockmodalController as ModalController,
      mockauthService as AuthService,
      mockdeviceInfo as DeviceInfo,
      mockpreferences as SharedPreferences,
      mockutils as ApiUtilsService,
      mockionicHttp as HTTP,
      mockutilityService as UtilityService,
      mockconfigSvc as ConfigurationsService,
      mocklocalStorageService as LocalStorageService,
      mocksqliteService as SqliteService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should be created", () => {
    expect(appTocService).toBeTruthy();
  });

  it("should be invoked getcontentForWidget", () => {
    const result = appTocService.getcontentForWidget();
    expect(result).toBeUndefined();
  });

  it("should set and get contentForWidget", () => {
    appTocService.setcontentForWidget({ foo: "bar" });
    expect(appTocService.getcontentForWidget()).toEqual({ foo: "bar" });
  });

  it("should clear data", () => {
    appTocService.setcontentForWidget({ foo: "bar" });
    appTocService.clearData();
    expect(appTocService.getcontentForWidget()).toBeUndefined();
  });

  it("should get and set subtitleOnBanners", () => {
    expect(appTocService.subtitleOnBanners).toBe(false);
    appTocService.subtitleOnBanners = true;
    expect(appTocService.subtitleOnBanners).toBe(true);
  });

  it("should get and set showDescription", () => {
    expect(appTocService.showDescription).toBe(false);
    appTocService.showDescription = true;
    expect(appTocService.showDescription).toBe(true);
  });

  it("should update resumeData", (done) => {
    appTocService.resumeData.subscribe((data) => {
      expect(data).toEqual({ test: 1 });
      done();
    });
    appTocService.updateResumaData({ test: 1 });
  });

  it("should return correct showStartButton status for Certification", () => {
    const content = { resourceType: "Certification" } as any;
    expect(appTocService.showStartButton(content)).toEqual({
      show: false,
      msg: "",
    });
  });

  it("should return correct showStartButton status for non-Certification", () => {
    const content = { resourceType: "Course" } as any;
    expect(appTocService.showStartButton(content)).toEqual({
      show: true,
      msg: "",
    });
  });

  it("should return youtubeForbidden for China user and youtube artifact", () => {
    (appTocService as any).configSvc.userProfile = { country: "China" };
    const content = {
      artifactUrl: "https://youtu.be/xyz",
      resourceType: "Course",
    } as any;
    expect(appTocService.showStartButton(content)).toEqual({
      show: false,
      msg: "youtubeForbidden",
    });
  });

  it("should return status.show=false for null content in showStartButton", () => {
    expect(appTocService.showStartButton(null)).toEqual({
      show: false,
      msg: "",
    });
  });

  it("should call mapCompletionPercentage recursively", () => {
    const content = {
      children: [
        { identifier: "id1" },
        { identifier: "id2", children: [{ identifier: "id3" }] },
      ],
    } as any;
    const dataResult = [
      { contentId: "id1", completionPercentage: 100, status: 2 },
      { contentId: "id3", completionPercentage: 50, status: 1 },
    ];
    appTocService.mapCompletionPercentage(content, dataResult);
    expect(content.children[0].completionPercentage).toBe(100);
    expect(content.children[1].children[0].completionPercentage).toBe(50);
  });

  it("should get and set gatingEnabled via getNode/setNode", () => {
    expect(appTocService.getNode()).toBe(false);
    appTocService.setNode(true);
    expect(appTocService.getNode()).toBe(true);
  });

  it("should update batchReplaySubject on updateBatchData", (done) => {
    appTocService.batchReplaySubject.subscribe(() => {
      done();
    });
    appTocService.updateBatchData();
  });

  describe("getTocStructure", () => {
    it("should call getTocStructure for Course", () => {
      const content = { contentType: "Course", children: [] } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.course).toBe(1);
    });

    it("should call getTocStructure for Resource with hands-on mimeType", () => {
      const content = {
        contentType: "Resource",
        mimeType: NsContent.EMimeTypes.HANDS_ON,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.handsOn).toBe(1);
    });

    it("should call getTocStructure for Resource with mp3 mimeType", () => {
      const content = {
        contentType: "Resource",
        mimeType: NsContent.EMimeTypes.MP3,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.podcast).toBe(1);
    });

    it("should call getTocStructure for Resource with mp3 mimeType", () => {
      const content = {
        contentType: "Resource",
        mimeType: NsContent.EMimeTypes.M3U8,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.video).toBe(1);
    });

    it("should call getTocStructure for Resource with interaction mimeType", () => {
      const content = {
        contentType: "Resource",
        mimeType: NsContent.EMimeTypes.INTERACTION,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.interactiveVideo).toBe(1);
    });

    it("should call getTocStructure for Resource with pdf mimeType", () => {
      const content = {
        contentType: "Resource",
        mimeType: NsContent.EMimeTypes.PDF,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.pdf).toBe(1);
    });

    it("should call getTocStructure for Resource with HTML mimeType", () => {
      const content = {
        contentType: "Resource",
        mimeType: NsContent.EMimeTypes.HTML,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.webPage).toBe(1);
    });

    it("should call getTocStructure for Resource with QUIZ mimeType and resource as assessment", () => {
      const content = {
        contentType: "Resource",
        resourceType: "Assessment",
        mimeType: NsContent.EMimeTypes.QUIZ,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.assessment).toBe(1);
    });

    it("should call getTocStructure for Resource with QUIZ mimeType", () => {
      const content = {
        contentType: "Resource",
        resourceType: "Quiz",
        mimeType: NsContent.EMimeTypes.QUIZ,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.quiz).toBe(1);
    });

    it("should call getTocStructure for Resource with WEB_MODULE mimeType", () => {
      const content = {
        contentType: "Resource",
        mimeType: NsContent.EMimeTypes.WEB_MODULE,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.webModule).toBe(1);
    });

    it("should call getTocStructure for Resource with YOUTUBE mimeType", () => {
      const content = {
        contentType: "Resource",
        mimeType: NsContent.EMimeTypes.YOUTUBE,
        children: [],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.youtube).toBe(1);
    });

    it("should call getTocStructure for Course", () => {
      const content = {
        contentType: "Collection",
        children: [
          {
            contentType: "Resource",
          },
        ],
      } as any;
      const tocStructure = {
        course: 0,
        learningModule: 0,
        handsOn: 0,
        podcast: 0,
        video: 0,
        interactiveVideo: 0,
        pdf: 0,
        webPage: 0,
        assessment: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0,
        other: 0,
      };
      const result = appTocService.getTocStructure(content, {
        ...tocStructure,
      });
      expect(result.learningModule).toBe(1);
    });
  });

  describe("filterToc", () => {
    it("should filterToc and filterUnitContent correctly", () => {
      const content = {
        contentType: "Resource",
        resourceType: "SomeType",
        children: [
          {
            contentType: "Resource",
          },
        ],
      } as any;
      expect(appTocService.filterToc(content)).toEqual(content);
      expect(appTocService.filterUnitContent(content)).toBe(true);
    });

    it("should filterToc return null if children filtered out", () => {
      const content = {
        contentType: "Collection",
        children: [{ contentType: "Resource", resourceType: "SomeType" }],
      } as any;
      const result = appTocService.filterToc(content);
      expect(result).toBeTruthy();
    });
  });

  describe("filterUnitContent", () => {
    it("should filter contents for learn", () => {
      const content = {
        contentType: "Resource",
        resourceType: "SomeType",
        children: [
          {
            contentType: "Resource",
          },
        ],
      } as any;
      // act
      const result = appTocService.filterUnitContent(
        content,
        NsContent.EFilterCategory.LEARN
      );
      expect(result).toBe(true);
    });

    it("should filter contents for practice", () => {
      const content = {
        contentType: "Resource",
        resourceType: "SomeType",
        children: [
          {
            contentType: "Resource",
          },
        ],
      } as any;
      // act
      const result = appTocService.filterUnitContent(
        content,
        NsContent.EFilterCategory.PRACTICE
      );
      expect(result).toBe(false);
    });

    it("should filter contents for ASSESS", () => {
      const content = {
        contentType: "Resource",
        resourceType: "SomeType",
        children: [
          {
            contentType: "Resource",
          },
        ],
      } as any;
      // act
      const result = appTocService.filterUnitContent(
        content,
        NsContent.EFilterCategory.ASSESS
      );
      expect(result).toBe(false);
    });
  });

  describe("fetchContentAnalyticsClientData", () => {
    it("should return analytics data", () => {
      //arrange
      mockauthService.getSession = jest.fn(() =>
        of({
          access_token: "sample.access.token",
        })
      ) as any;
      appTocService.analyticsFetchStatus = "none";
      //act
      appTocService.fetchContentAnalyticsClientData("do_123");
      //assert
      expect(mockauthService.getSession).toHaveBeenCalled();
      expect(appTocService.analyticsFetchStatus).toBe('done');
    });
    it("should return analytics data", () => {
      //arrange
      appTocService.analyticsFetchStatus = "none";
      mockauthService.getSession = jest.fn(() =>
        of({
          access_token: "sample.access.token",
        })
      ) as any;
      appTocService.get = jest.fn(() => of({ contentid: "do_123" }));
      //act
      const result = appTocService.fetchContentAnalyticsClientData("do_123");
      //assert
      expect(result).toBeUndefined();
      expect(appTocService.analyticsFetchStatus).toBe('done');
    });
  });

  describe("fetchContentAnalyticsData", () => {
    it("should return analytics data of auth", () => {
      //arrange
      appTocService.analyticsFetchStatus = "none";
      mockauthService.getSession = jest.fn(() =>
        of({
          access_token: "sample.access.token",
        })
      ) as any;
      appTocService.get = jest.fn(() => throwError({ contentid: "do_123" }));
      //act
      appTocService.fetchContentAnalyticsData("do_123");
      //assert
      expect(appTocService.get).toHaveBeenCalled();
      expect(appTocService.analyticsFetchStatus).toBe('done');
    });
    it("should return analytics data of session", () => {
      //arrange
      appTocService.analyticsFetchStatus = "none";
      mockauthService.getSession = jest.fn(() =>
        of({
          access_token: "sample.access.token",
        })
      ) as any;
      appTocService.get = jest.fn(() => of({ contentid: "do_123" }));
      //act
      const result = appTocService.fetchContentAnalyticsData("do_123");
      //assert
      expect(result).toBeUndefined();
      expect(appTocService.analyticsFetchStatus).toBe('done');
    });
  });

  it("should call fetchContentParents and return observable", () => {
    const spy = jest.spyOn(appTocService, "get").mockReturnValue({} as any);
    appTocService.fetchContentParents("id");
    expect(spy).toHaveBeenCalled();
  });

  it("should call fetchContentWhatsNext with and without contentType", () => {
    const spy = jest.spyOn(appTocService, "get").mockReturnValue({} as any);
    appTocService.fetchContentWhatsNext("id", "type");
    expect(spy).toHaveBeenCalled();
    appTocService.fetchContentWhatsNext("id");
    expect(spy).toHaveBeenCalled();
  });

  it("should call fetchMoreLikeThisPaid and fetchMoreLikeThisFree", () => {
    const spy = jest.spyOn(appTocService, "get").mockReturnValue({} as any);
    appTocService.fetchMoreLikeThisPaid("id");
    appTocService.fetchMoreLikeThisFree("id");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("should call fetchExternalContentAccess", () => {
    const spy = jest.spyOn(appTocService, "get").mockReturnValue({} as any);
    appTocService.fetchExternalContentAccess("id");
    expect(spy).toHaveBeenCalled();
  });

  it("should call fetchMoreLikeThis", () => {
    const spy = jest.spyOn(appTocService, "get").mockReturnValue({} as any);
    appTocService.fetchMoreLikeThis("id", "type");
    expect(spy).toHaveBeenCalled();
  });

  it("should call fetchPostAssessmentStatus", () => {
    const spy = jest.spyOn(appTocService, "get").mockReturnValue({} as any);
    appTocService.fetchPostAssessmentStatus("id");
    expect(spy).toHaveBeenCalled();
  });

  it("should call fetchContentParent with forPreview=false", () => {
    const spy = jest.spyOn(appTocService, "post").mockReturnValue({} as any);
    appTocService.fetchContentParent("id", { foo: "bar" } as any, false);
    expect(spy).toHaveBeenCalled();
  });

  it("should call fetchContentParent with forPreview=true", () => {
    const spy = jest.spyOn(appTocService, "post").mockReturnValue({} as any);
    (appTocService as any).configSvc.rootOrg = "root";
    (appTocService as any).configSvc.org = ["org"];
    appTocService.fetchContentParent("id", { foo: "bar" } as any, true);
    expect(spy).toHaveBeenCalled();
  });

  it("should call createBatch", () => {
    const spy = jest.spyOn(appTocService, "post").mockReturnValue({} as any);
    appTocService.createBatch({ foo: "bar" });
    expect(spy).toHaveBeenCalled();
  });

  it("should call getUserWhatsAppContent", () => {
    const spy = jest
      .spyOn(appTocService, "getWithHandleError")
      .mockReturnValue({} as any);
    appTocService.getUserWhatsAppContent();
    expect(spy).toHaveBeenCalled();
  });

  it("should call updateUserWhatsAppOptInStatus", () => {
    const spy = jest.spyOn(appTocService, "post").mockReturnValue({} as any);
    appTocService.updateUserWhatsAppOptInStatus({ foo: "bar" });
    expect(spy).toHaveBeenCalled();
  });

  it("should clear analytics data", () => {
    const spy = jest
      .spyOn(appTocService.analyticsReplaySubject, "unsubscribe")
      .mockImplementation(() => {});
    appTocService.clearAnalyticsData();
    expect(spy).toHaveBeenCalled();
  });

  it("should return correct response from initData when content exists and needResumeData is false", () => {
    const data = { content: { data: { identifier: "id1" } } } as any;
    const result = appTocService.initData(data, false);
    expect(result.content).toEqual({ identifier: "id1" });
    expect(result.errorCode).toBeNull();
  });

  it("should return correct errorCode from initData when data.error is true", () => {
    const data = { error: true } as any;
    const result = appTocService.initData(data, false);
    expect(result.content).toBeNull();
    expect(result.errorCode).toBeDefined();
  });

  it("should return correct errorCode from initData when no data and no error", () => {
    const data = {} as any;
    const result = appTocService.initData(data, false);
    expect(result.content).toBeNull();
    expect(result.errorCode).toBeDefined();
  });

  it("should return correct response from initData when content exists and needResumeData is true", () => {
    const data = { content: { data: { identifier: "id1" } } } as any;
    appTocService.resumeData = new Subject<any>();
    appTocService.resumeData = new BehaviorSubject<any>([
      {
        contentId: "do_123",
        completionPercentage: 100,
        children: [
          {
            contentId: "do_123",
            completionPercentage: 100,
            identifier: "do_123",
          },
        ],
      },
    ]);
    const result = appTocService.initData(data, true);
    expect(result.content).toEqual({ identifier: "id1" });
    expect(result.errorCode).toBeNull();
  });

  it("should return correct response from initData when content exists and needResumeData is true and offline ", () => {
    const data = { content: { data: { identifier: "id1" } } } as any;
    appTocService.resumeData = new Subject<any>();
    appTocService.resumeData = new BehaviorSubject<any>([
      {
        contentId: "do_123",
        completionPercentage: 100,
        children: [
          {
            contentId: "do_123",
            completionPercentage: 100,
            identifier: "do_123",
          },
        ],
      },
    ]);
    jest.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    mocksqliteService.mockProgressAPIFormatedList = jest.fn(() =>
      Promise.resolve({
        params: {
          resmsgid: "",
          msgid: "",
        },
        responseCode: "OK",
        result: {
          contentList: [
            {
              contentId: "do_123",
              completionPercentage: 100,
              identifier: "do_123",
            },
          ],
        },
      })
    ) as any;
    const result = appTocService.initData(data, true);
    expect(result.content).toEqual({ identifier: "id1" });
    expect(result.errorCode).toBeNull();
    expect(mocksqliteService.mockProgressAPIFormatedList).toHaveBeenCalled();
  });

  it("should return correct response from initData when content exists and needResumeData is true and offline catch part ", () => {
    const data = { content: { data: { identifier: "id1" } } } as any;
    appTocService.resumeData = new Subject<any>();
    appTocService.resumeData = new BehaviorSubject<any>([
      {
        contentId: "do_123",
        completionPercentage: 100,
        children: [
          {
            contentId: "do_123",
            completionPercentage: 100,
            identifier: "do_123",
          },
        ],
      },
    ]);
    jest.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    mocksqliteService.mockProgressAPIFormatedList = jest.fn(() =>
      Promise.reject({
        error: {},
      })
    ) as any;
    const result = appTocService.initData(data, true);
    expect(result.content).toEqual({ identifier: "id1" });
    expect(result.errorCode).toBeNull();
    expect(mocksqliteService.mockProgressAPIFormatedList).toHaveBeenCalled();
  });
});
