import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { DomSanitizer } from "@angular/platform-browser";

import { VideoPopupComponent } from "./how-does-it-works-popup.component";

describe("VideoPopupComponent", () => {
  // Component initializes with default isOpen state as false
  it("should initialize with isOpen set to false", () => {
    const dialogRef = { close: jest.fn() };
    const component = new VideoPopupComponent(
      dialogRef as any,
      {},
      {} as DomSanitizer
    );
    expect(component.isOpen).toBeFalsy();
  });
  // Component loads video URL from injected data
  it("should set videoLink from injected data url when provided", () => {
    const dialogRef = { close: jest.fn() };
    const testUrl = "https://test-video.com";
    const data = { url: testUrl };
    const component = new VideoPopupComponent(
      dialogRef as any,
      data,
      {} as DomSanitizer
    );
    component.ngOnInit();
    expect(component.videoLink).toBe(testUrl);
  });
  // Close method triggers dialog close
  it("should call dialogRef.close when close method is called", () => {
    const dialogRef = { close: jest.fn() };
    const component = new VideoPopupComponent(
      dialogRef as any,
      {},
      {} as DomSanitizer
    );
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
