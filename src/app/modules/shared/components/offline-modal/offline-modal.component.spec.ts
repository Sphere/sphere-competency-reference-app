import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";
import { NgZone } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { CommonUtilService } from "../../../../../services";
import { OfflineModalComponent } from "./offline-modal.component";

describe("OfflineModalComponent", () => {
  // Modal closes successfully when closeModal() is called with existing dialog reference
  it("should close modal when dialog reference exists", () => {
    const mockDialog = {
      getDialogById: jest.fn().mockReturnValue({
        close: jest.fn(),
      }),
    };

    const component = new OfflineModalComponent(
      {} as CommonUtilService,
      {} as Router,
      mockDialog as any,
      {} as NgZone
    );

    component.closeModal();

    expect(mockDialog.getDialogById).toHaveBeenCalledWith("offlineModal");
    expect(mockDialog.getDialogById().close).toHaveBeenCalled();
  });
  // navigateToDownloadCourse() adds loader and navigates to download-course route
  it("should add loader and navigate to download course route", () => {
    const mockCommonUtilService = {
      addLoader: jest.fn(),
    };
    const mockRouter = {
      navigate: jest.fn(),
    };
    const mockZone = {
      run: jest.fn((fn) => fn()),
    };
    const MatDialog = {
      getDialogById: jest.fn(),
    };
    const component = new OfflineModalComponent(
      mockCommonUtilService as any,
      mockRouter as any,
      MatDialog as any,
      mockZone as any
    );

    component.navigateToDownloadCourse();

    expect(mockCommonUtilService.addLoader).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(["app/download-course"]);
  });
  // refreshContent() shows spinner and closes modal when online
  it("should show spinner and close modal when online", () => {
    const mockDialog = {
      getDialogById: jest.fn().mockReturnValue({
        close: jest.fn(),
      }),
    };

    Object.defineProperty(navigator, "onLine", {
      value: true,
      writable: true,
    });

    const component = new OfflineModalComponent(
      {} as CommonUtilService,
      {} as Router,
      mockDialog as any,
      {} as NgZone
    );

    component.refreshContent();

    expect(component.showSpinner).toBeFalsy();
    expect(mockDialog.getDialogById().close).toHaveBeenCalled();
  });
  // refreshContent() handles network status changes during spinner display
  it("should handle network status changes during spinner display", () => {
    jest.useFakeTimers();

    Object.defineProperty(navigator, "onLine", {
      value: false,
      writable: true,
    });

    const component = new OfflineModalComponent(
      {} as CommonUtilService,
      {} as Router,
      {} as MatDialog,
      {} as NgZone
    );

    component.refreshContent();
    expect(component.showSpinner).toBeTruthy();

    jest.advanceTimersByTime(5000);
    expect(component.showSpinner).toBeFalsy();

    jest.useRealTimers();
  });
});
