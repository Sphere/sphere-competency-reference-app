import { TestBed } from "@angular/core/testing";

import { CourseOptimisticUiService } from "./course-optimistic-ui.service";
import { OnlineSqliteService } from "./online-sqlite.service";

jest.mock("./online-sqlite.service");
describe("CourseOptimisticUiService", () => {
  // insertCourseProgress successfully stores course progress data with valid parameters
  it("should store course progress data when valid parameters are provided", async () => {
    class MockOnlineSqliteService {
      insertData = jest.fn().mockResolvedValue(undefined);
      // Add other properties and methods as needed
    }

    const mockOnlineSqliteService = new MockOnlineSqliteService();
    const service = new CourseOptimisticUiService(
      mockOnlineSqliteService as any
    );

    await service.insertCourseProgress(
      "course1",
      "content1",
      "user1",
      50,
      "batch1",
      "video/mp4",
      "lastContent1",
      1
    );

    expect(mockOnlineSqliteService.insertData).toHaveBeenCalledWith(
      "course1",
      "content1",
      "user1",
      50,
      "batch1",
      "video/mp4",
      "lastContent1",
      1
    );
  });
  // enrollUser successfully stores user enrollment data with valid parameters
  it("should store user enrollment data when valid parameters are provided", async () => {
    class MockOnlineSqliteService {
      insertUserEnrollCourseData = jest.fn().mockResolvedValue(undefined);
      // Add other properties and methods as needed to match OnlineSqliteService
    }

    const mockOnlineSqliteService = new MockOnlineSqliteService();
    const service = new CourseOptimisticUiService(
      mockOnlineSqliteService as any
    );
    const batchDetails = { name: "Batch 1", startDate: "2024-01-01" };

    await service.enrollUser(
      "course1",
      "content1",
      "user1",
      "batch1",
      "video/mp4",
      0,
      "",
      1,
      batchDetails
    );

    expect(
      mockOnlineSqliteService.insertUserEnrollCourseData
    ).toHaveBeenCalledWith(
      "course1",
      "content1",
      "user1",
      "batch1",
      "video/mp4",
      0,
      "",
      1,
      batchDetails
    );
  });
  // insertCourseProgress handles empty or invalid parameter values gracefully
  it("should handle empty parameter values without throwing error", async () => {
    class MockOnlineSqliteService {
      insertData = jest.fn().mockResolvedValue(undefined);
      // Add other properties and methods as needed to match OnlineSqliteService
    }

    const mockOnlineSqliteService = new MockOnlineSqliteService();
    const service = new CourseOptimisticUiService(
      mockOnlineSqliteService as any
    );

    await service.insertCourseProgress("", "", "", 0, "", "", "", 0);

    expect(mockOnlineSqliteService.insertData).toHaveBeenCalledWith(
      "",
      "",
      "",
      0,
      "",
      "",
      "",
      0
    );
  });
  // enrollUser handles missing or malformed batchDetails object
  it("should handle null batchDetails without throwing error", async () => {
    const mockOnlineSqliteService = {
      insertUserEnrollCourseData: jest.fn().mockResolvedValue(undefined),
    };

    const service = new CourseOptimisticUiService(
      mockOnlineSqliteService as any
    );

    await service.enrollUser(
      "course1",
      "content1",
      "user1",
      "batch1",
      "video/mp4",
      0,
      "",
      1,
      null
    );

    expect(
      mockOnlineSqliteService.insertUserEnrollCourseData
    ).toHaveBeenCalledWith(
      "course1",
      "content1",
      "user1",
      "batch1",
      "video/mp4",
      0,
      "",
      1,
      null
    );
  });
  // getUserEnrollCourse returns empty courses array when no enrollments exist
  it("should return empty courses array when no enrollments found", async () => {
    const mockEmptyResponse = {
      result: {
        courses: [],
      },
    };

    const mockOnlineSqliteService = {
      getUserEnrollCourse: jest.fn().mockResolvedValue(mockEmptyResponse),
    };

    const service = new CourseOptimisticUiService(
      mockOnlineSqliteService as any
    );
    const result = await service.getUserEnrollCourse("course1", "user1");

    expect(mockOnlineSqliteService.getUserEnrollCourse).toHaveBeenCalledWith(
      "course1",
      "user1"
    );
    expect(result.result.courses).toHaveLength(0);
  });
  it('should return false when content does not exist', async () => {
    // Mock dependencies
    const mockPlatform = { is: jest.fn().mockReturnValue(false) };
    const mockSQLite = { executeSql: jest.fn() };
    const mockLocalStorageService = { getItem: jest.fn() };
    const mockConfigurationsService = { getConfiguration: jest.fn() };
  
    // Mock OnlineSqliteService
    const mockOnlineSqliteService = new OnlineSqliteService(
      mockPlatform as any,
      mockSQLite as any,
      mockLocalStorageService as any,
      mockConfigurationsService as any
    );
    jest
      .spyOn(mockOnlineSqliteService, 'isContentIdExistsWithPercentage')
      .mockResolvedValue({ completionPercentage: null, exists: false });
  
    // Service under test
    const service = new CourseOptimisticUiService(mockOnlineSqliteService);
  
    // Act
    const result = await service.isContentIdExistsWithPercentage('courseId', 'userId', 'nonExistentContentId');
  
    // Assert
    expect(result).toStrictEqual({ completionPercentage: null, exists: false });
    expect(mockOnlineSqliteService.isContentIdExistsWithPercentage).toHaveBeenCalledWith(
      'courseId',
      'userId',
      'nonExistentContentId'
    );
  });
  
  
  it("should log an error when database insertion fails", async () => {
    const mockPlatform = { is: jest.fn().mockReturnValue(false) }; // Example Platform mock
    const mockSQLite = { executeSql: jest.fn() }; // Example SQLite mock
    const mockLocalStorageService = { getItem: jest.fn() }; // LocalStorageService mock
    const mockConfigurationsService = { getConfiguration: jest.fn() }; // ConfigurationsService mock

    // Mock OnlineSqliteService
    const mockOnlineSqliteService = new OnlineSqliteService(
      mockPlatform as any,
      mockSQLite as any,
      mockLocalStorageService as any,
      mockConfigurationsService as any
    );
    const service = new CourseOptimisticUiService(mockOnlineSqliteService);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    jest
      .spyOn(mockOnlineSqliteService, "insertData")
      .mockRejectedValue(new Error("DB Error"));

    await service.insertCourseProgress(
      "course1",
      "content1",
      "user1",
      50,
      "batch1",
      "video/mp4",
      "content2",
      1
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error inserting course progress data:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
  it('should update last read content ID when valid courseId and contentId provided', async () => {
    const mockOnlineSqliteService = {
      updateLastReadContentId: jest.fn().mockResolvedValue(undefined)
    };
    const service = new CourseOptimisticUiService(mockOnlineSqliteService as any);
    const consoleSpy = jest.spyOn(console, 'log');

    await service.updateLastReadContentId('course123', 'content123');

    expect(mockOnlineSqliteService.updateLastReadContentId).toHaveBeenCalledWith('course123', 'content123', undefined);
    expect(consoleSpy).toHaveBeenCalledWith('Last Read Content Id Updated Successfully.', 'content123');
  });
  it('should execute successfully when mockResponse is provided', async () => {
    const mockResponse = { status: 'success' };
    const mockOnlineSqliteService = {
      updateLastReadContentId: jest.fn().mockResolvedValue(undefined)
    };
    const service = new CourseOptimisticUiService(mockOnlineSqliteService as any);

    await service.updateLastReadContentId('course123', 'content123', mockResponse);

    expect(mockOnlineSqliteService.updateLastReadContentId).toHaveBeenCalledWith('course123', 'content123', mockResponse);
  });
  it('should handle empty courseId gracefully', async () => {
    const mockOnlineSqliteService = {
      updateLastReadContentId: jest.fn().mockResolvedValue(undefined)
    };
    const service = new CourseOptimisticUiService(mockOnlineSqliteService as any);
    const consoleErrorSpy = jest.spyOn(console, 'error');

    await service.updateLastReadContentId('', 'content123');

    expect(mockOnlineSqliteService.updateLastReadContentId).toHaveBeenCalledWith('', 'content123', undefined);
  });

  it("should log an error when enrollment data insertion fails", async () => {
    const mockOnlineSqliteService = {
      insertUserEnrollCourseData: jest.fn().mockRejectedValue(new Error("DB Error")),
    };
    const service = new CourseOptimisticUiService(mockOnlineSqliteService as any);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await service.enrollUser(
      "course1",
      "content1",
      "user1",
      "batch1",
      "video/mp4",
      0,
      "",
      1,
      { name: "Batch 1", startDate: "2024-01-01" }
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error inserting user enrollment data:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("should return empty courses array when no enrollments found", async () => {
    const mockEmptyResponse = {
      result: {
        courses: [],
      },
    };

    const mockOnlineSqliteService = {
      getUserEnrollCourse: jest.fn().mockResolvedValue(mockEmptyResponse),
    };

    const service = new CourseOptimisticUiService(
      mockOnlineSqliteService as any
    );

    const result = await service.getUserEnrollCourse("course1", "user1");

    expect(mockOnlineSqliteService.getUserEnrollCourse).toHaveBeenCalledWith(
      "course1",
      "user1"
    );
    expect(result.result.courses).toHaveLength(0);
  });

  it("should return false when content does not exist", async () => {
    const mockOnlineSqliteService = {
      isContentIdExistsWithPercentage: jest.fn().mockResolvedValue({ completionPercentage: null, exists: false }),
    };
    const service = new CourseOptimisticUiService(mockOnlineSqliteService as any);

    const result = await service.isContentIdExistsWithPercentage("courseId", "userId", "nonExistentContentId");

    expect(result).toStrictEqual({ completionPercentage: null, exists: false });
    expect(mockOnlineSqliteService.isContentIdExistsWithPercentage).toHaveBeenCalledWith(
      "courseId",
      "userId",
      "nonExistentContentId"
    );
  });

  it("should update last read content ID when valid courseId and contentId provided", async () => {
    const mockOnlineSqliteService = {
      updateLastReadContentId: jest.fn().mockResolvedValue(undefined)
    };
    const service = new CourseOptimisticUiService(mockOnlineSqliteService as any);
    const consoleSpy = jest.spyOn(console, "log");

    await service.updateLastReadContentId("course123", "content123");

    expect(mockOnlineSqliteService.updateLastReadContentId).toHaveBeenCalledWith("course123", "content123", undefined);
    expect(consoleSpy).toHaveBeenCalledWith("Last Read Content Id Updated Successfully.", "content123");
  });

  it("should execute successfully when mockResponse is provided", async () => {
    const mockResponse = { status: "success" };
    const mockOnlineSqliteService = {
      updateLastReadContentId: jest.fn().mockResolvedValue(undefined)
    };
    const service = new CourseOptimisticUiService(mockOnlineSqliteService as any);

    await service.updateLastReadContentId("course123", "content123", mockResponse);

    expect(mockOnlineSqliteService.updateLastReadContentId).toHaveBeenCalledWith("course123", "content123", mockResponse);
  });

  it("should handle empty courseId gracefully", async () => {
    const mockOnlineSqliteService = {
      updateLastReadContentId: jest.fn().mockResolvedValue(undefined)
    };
    const service = new CourseOptimisticUiService(mockOnlineSqliteService as any);
    const consoleErrorSpy = jest.spyOn(console, "error");

    await service.updateLastReadContentId("", "content123");

    expect(mockOnlineSqliteService.updateLastReadContentId).toHaveBeenCalledWith("", "content123", undefined);
  });

});
