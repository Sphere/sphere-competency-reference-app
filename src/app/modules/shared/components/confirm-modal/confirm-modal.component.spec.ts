// Component initialization with dialog reference and data injection
import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConfirmPopUpComponent } from "./confirm-modal.component";
import { TelemetryGeneratorService } from "../../../../../services";
describe("ConfirmPopUpComponent", () => {
  const mockTelemetryGeneratorService = {
    generateInteractTelemetry: jest.fn(),
  };

  it("should initialize with dialog reference and injected data", () => {
    const mockDialogRef = {
      close: jest.fn(),
    };
    const mockData = { title: "Test" };

  
    const component = new ConfirmPopUpComponent(
      mockDialogRef as unknown as MatDialogRef<ConfirmPopUpComponent>,
      mockData,
      mockTelemetryGeneratorService as unknown as TelemetryGeneratorService
    );
  
    expect(component.dialogRef).toBeTruthy();
    expect(component.data).toEqual(mockData);
  });
  it("should close dialog with YES event when closeYes is called", () => {
    const mockDialogRef = {
      close: jest.fn(),
    };
    const mockData = { title: "Test" };
    const component = new ConfirmPopUpComponent(
      mockDialogRef as unknown as MatDialogRef<ConfirmPopUpComponent>,
      mockData,
      mockTelemetryGeneratorService as unknown as TelemetryGeneratorService
    );
  
    component.closeYes();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ event: "YES" });
  });
  it('should close dialog with false when closeNo is called', () => {
    const mockDialogRef = {
      close: jest.fn()
    };

    const component = new ConfirmPopUpComponent(
      mockDialogRef as unknown as MatDialogRef<ConfirmPopUpComponent>,
      {},
      mockTelemetryGeneratorService as unknown as TelemetryGeneratorService
    );

    component.closeNo();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
})

