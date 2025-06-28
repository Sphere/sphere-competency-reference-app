import { OnlineSqliteService } from "./online-sqlite.service";
import { Platform } from "@ionic/angular";
import { SQLite, SQLiteObject } from "@awesome-cordova-plugins/sqlite/ngx";
import { LocalStorageService } from "../../../../app/manage-learn/core";
import { ConfigurationsService } from "../../../../library/ws-widget/utils/src/public-api";

describe("OnlineSqliteService", () => {
  let service: OnlineSqliteService;
  let platformSpy: jest.Mocked<Platform>;
  let sqliteSpy: jest.Mocked<SQLite>;
  let localStorageServiceSpy: jest.Mocked<LocalStorageService>;
  let configSvcSpy: jest.Mocked<ConfigurationsService>;
  let sqliteObjectSpy: jest.Mocked<SQLiteObject>;

  beforeEach(() => {
    platformSpy = {
      ready: jest.fn().mockResolvedValue(Promise.resolve()),
    } as unknown as jest.Mocked<Platform>;

    sqliteObjectSpy = {
      executeSql: jest.fn(),
      transaction: jest.fn(),
    } as unknown as jest.Mocked<SQLiteObject>;

    sqliteSpy = {
      create: jest.fn().mockResolvedValue(sqliteObjectSpy),
    } as unknown as jest.Mocked<SQLite>;

    localStorageServiceSpy = {
      setLocalStorage: jest.fn(),
      getLocalStorage: jest.fn(),
    } as unknown as jest.Mocked<LocalStorageService>;

    configSvcSpy = {
      userProfile: { userId: "testUserId" },
    } as unknown as jest.Mocked<ConfigurationsService>;

    service = new OnlineSqliteService(
      platformSpy,
      sqliteSpy,
      localStorageServiceSpy,
      configSvcSpy
      // Add any additional required arguments here
    );
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should create database if online", async () => {
    jest.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const createDatabaseSpy = jest.spyOn(service, "createDatabase");
    await service.createDatabaseIfOnline();
    expect(createDatabaseSpy).toHaveBeenCalled();
  });

  it("should not create database if offline", async () => {
    jest.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const createDatabaseSpy = jest.spyOn(service, "createDatabase");
    await service.createDatabaseIfOnline();
    expect(createDatabaseSpy).not.toHaveBeenCalled();
  });

  it("should create database", async () => {
    await service.createDatabase();
    expect(sqliteSpy.create).toHaveBeenCalledWith(service.databseConfig);
    expect(service.database).toBe(sqliteObjectSpy);
  });

  it("should resolve when database is ready", async () => {
    await service.createDatabase();
    await expect(service.databaseReady()).resolves.toBeUndefined();
  });

  it("should insert user enroll course data", async () => {
    await service.createDatabase();
    const executeSqlSpy = jest
      .spyOn(sqliteObjectSpy, "executeSql")
      .mockResolvedValueOnce({ rows: { length: 0 } });
    await service.insertUserEnrollCourseData(
      "courseId",
      "contentId",
      "userId",
      "batchId",
      "mimeType",
      50,
      "lastReadContentId",
      1,
      {}
    );
    expect(executeSqlSpy).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO userEnrollCourse"),
      expect.any(Array)
    );
  });
  // Creates table 'onlineCourseProgress' if it doesn't exist
  it("should create onlineCourseProgress table when called", async () => {
    const mockExecuteSql = jest.fn().mockResolvedValue({});
    const mockDatabase = {
      executeSql: mockExecuteSql,
      _objectInstance: {},
      databaseFeatures: {},
      openDBs: {},
      addTransaction: jest.fn(),
      transaction: jest.fn(),
      readTransaction: jest.fn(),
      close: jest.fn(),
      startNextTransaction: jest.fn(),
      _executeSql: jest.fn(),
      _createTransaction: jest.fn(),
    } as unknown as SQLiteObject;

    service.database = mockDatabase;

    await service.createTables();

    expect(mockExecuteSql).toHaveBeenCalledWith(
      expect.stringContaining(
        "CREATE TABLE IF NOT EXISTS onlineCourseProgress"
      ),
      []
    );
  });
  // Successful table creation logs confirmation message
  it("should log success message when table is created", async () => {
    const mockExecuteSql = jest.fn().mockResolvedValue({});
    const mockDatabase = {
      executeSql: mockExecuteSql,
      _objectInstance: {},
      databaseFeatures: {},
      openDBs: {},
      addTransaction: jest.fn(),
      transaction: jest.fn(),
      readTransaction: jest.fn(),
      close: jest.fn(),
      startNextTransaction: jest.fn(),
      _executeSql: jest.fn(),
      _createTransaction: jest.fn(),
    } as unknown as SQLiteObject;
    const consoleSpy = jest.spyOn(console, "log");
    service.database = mockDatabase;

    await service.createTables();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Optimistic online courseProgress Table created"
    );
    consoleSpy.mockRestore();
  });

  

  it("should update user enroll course data if exists", async () => {
    await service.createDatabase();
    const executeSqlSpy = jest
      .spyOn(sqliteObjectSpy, "executeSql")
      .mockResolvedValueOnce({ rows: { length: 1 } });
    await service.insertUserEnrollCourseData(
      "courseId",
      "contentId",
      "userId",
      "batchId",
      "mimeType",
      50,
      "lastReadContentId",
      1,
      {}
    );
    expect(executeSqlSpy).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE userEnrollCourse"),
      expect.any(Array)
    );
  });

  it("should fetch user enroll course data", async () => {
    await service.createDatabase();
    const executeSqlSpy = jest
      .spyOn(sqliteObjectSpy, "executeSql")
      .mockResolvedValueOnce({
        rows: { length: 1, item: jest.fn().mockReturnValue({}) },
      });
    const result = await service.getUserEnrollCourse("courseId", "userId");
    expect(executeSqlSpy).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM userEnrollCourse"),
      ["courseId", "userId"]
    );
    expect(result.result.courses.length).toBe(1);
  });

  it("should check if content ID exists", async () => {
    await service.createDatabase();
    const executeSqlSpy = jest
      .spyOn(sqliteObjectSpy, "executeSql")
      .mockResolvedValueOnce({ rows: { length: 1 } });
    const exists = await service.isContentIdExistsOrNot(
      "courseId",
      "userId",
      "contentId"
    );
    expect(executeSqlSpy).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM onlineCourseProgress"),
      ["courseId", "userId", "contentId"]
    );
    expect(exists).toBe(true);
  });

  it("should check if content ID exists with percentage", async () => {
    await service.createDatabase();
    const executeSqlSpy = jest
      .spyOn(sqliteObjectSpy, "executeSql")
      .mockResolvedValueOnce({
        rows: {
          length: 1,
          item: jest.fn().mockReturnValue({ completionPercentage: 50 }),
        },
      });
    const result = await service.isContentIdExistsWithPercentage(
      "courseId",
      "userId",
      "contentId"
    );
    expect(executeSqlSpy).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM onlineCourseProgress"),
      ["courseId", "userId", "contentId"]
    );
    expect(result.exists).toBe(true);
    expect(result.completionPercentage).toBe(50);
  });

  it("should fetch data", async () => {
    await service.createDatabase();
    const executeSqlSpy = jest
      .spyOn(sqliteObjectSpy, "executeSql")
      .mockResolvedValueOnce({
        rows: { length: 1, item: jest.fn().mockReturnValue({}) },
      });
    const data = await service.fetchData();
    expect(executeSqlSpy).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM onlineCourseProgress"),
      []
    );
    expect((data || []).length).toBe(1);
  });

  it("should fetch data by course ID and user ID", async () => {
    await service.createDatabase();
    const executeSqlSpy = jest
      .spyOn(sqliteObjectSpy, "executeSql")
      .mockResolvedValueOnce({
        rows: { length: 1, item: jest.fn().mockReturnValue({}) },
      });
    const data = await service.fetchDataByCourseIdAndUserId(
      "courseId",
      "userId"
    );
    expect(executeSqlSpy).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM onlineCourseProgress"),
      ["courseId", "userId"]
    );
    expect((data || []).length).toBe(1);
  });

  it("should clear course progress data", async () => {
    await service.createDatabase();
    const executeSqlSpy = jest
      .spyOn(sqliteObjectSpy, "executeSql")
      .mockResolvedValueOnce({});
    await service.clearCourseProgressData();
    expect(executeSqlSpy).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM onlineCourseProgress"),
      []
    );
  });

  it("should update resume data", async () => {
    const mockResponse = {
      id: "api.course.progress.read",
      ver: "1.0",
      ts: new Date().toISOString(),
      params: {
        resmsgid: null,
        msgid: "12345",
        err: null,
        status: "successful",
        errmsg: null,
      },
      responseCode: "OK",
      result: { contentList: [] },
    };
    const mockProgressAPIFormatedListSpy = jest
      .spyOn(service, "mockProgressAPIFormatedList")
      .mockResolvedValueOnce(mockResponse);
    await service.updateResumeData("courseId");
    expect(mockProgressAPIFormatedListSpy).toHaveBeenCalledWith("courseId");
    expect(localStorageServiceSpy.setLocalStorage).toHaveBeenCalledWith(
      "courseIdresumeData",
      mockResponse.result.contentList
    );
  });
});
