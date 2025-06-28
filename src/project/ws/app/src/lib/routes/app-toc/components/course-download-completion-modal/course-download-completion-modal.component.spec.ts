import { MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import {
  CommonUtilService,
  TelemetryGeneratorService,
} from "../../../../../../../../../services";
import { CourseDownloadCompletionModalComponent } from "./course-download-completion-modal.component";

describe("CourseDownloadCompletionModalComponent", () => {
  let component: CourseDownloadCompletionModalComponent;
  const mockdialogRef: Partial<MatDialogRef<CourseDownloadCompletionModalComponent>> = {
    close: jest.fn(),
  };
  const mockData = {
    identifiers: 'sample-identifier',
    message: 'sample-message',
  };
  const mockrouter: Partial<Router> = {
    navigate: jest.fn(),
  };
  const mockcommonUtilService: Partial<CommonUtilService> = {
    addLoader: jest.fn(),
  };
  const mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
  };

  beforeAll(() => {
    component = new CourseDownloadCompletionModalComponent(
      mockdialogRef as MatDialogRef<CourseDownloadCompletionModalComponent>,
      mockData as any,
      mockrouter as Router,
      mockcommonUtilService as CommonUtilService,
      mocktelemetryGeneratorService as TelemetryGeneratorService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('ngoninit', () => {
    component.ngOnInit();
  })

  it("should call generateInteractTelemetry and dialogRef.close(false) on closeNo", () => {
    mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn(),
    component.closeNo();
    expect(mockdialogRef.close).toHaveBeenCalledWith(false);
  });

  it("should call telemetryGeneratorService.generateInteractTelemetry with correct params for NO", () => {
    mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn(),
    component.generateInteractTelemetry({ type: "NO" });
    expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
      expect.anything(),
      "Do-not-go-to-download-section",
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        id: undefined,
        type: "sample-message",
        version: "",
      }),
      expect.any(Map)
    );
  });

  it("should call telemetryGeneratorService.generateInteractTelemetry with correct params for YES", () => {
    mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn(),
    component.data = {
      identifiers: 'sample-identifier',
      message: 'sample-message',
    }
    component.generateInteractTelemetry({ type: "YES" });
    expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
      expect.anything(), // InteractType.TOUCH
      "Go-to-downlod-section",
      expect.anything(), // Environment.COURSE
      expect.anything(), // PageId.COURSE_TOC
      expect.objectContaining({
        id: undefined,
        type: "sample-message",
        version: "",
      }),
      expect.any(Map)
    );
  });

    it("should call generateInteractTelemetry, addLoader, and dialogRef.close({event: 'YES'}) on closeYes", () => {
    const spyGenerate = jest.spyOn(component, "generateInteractTelemetry");
    mockcommonUtilService.addLoader = jest.fn(() => Promise.resolve());
    component.data = {
      identifiers: 'sample-identifier',
      message: 'sample-message',
    }
    component.closeYes();
    expect(spyGenerate).toHaveBeenCalledWith({ type: "YES" });
    expect(mockcommonUtilService.addLoader).toHaveBeenCalled();
    expect(mockdialogRef.close).toHaveBeenCalledWith({ event: "YES" });
  });
});
