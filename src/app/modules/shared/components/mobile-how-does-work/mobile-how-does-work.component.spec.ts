import { Component, ElementRef, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Platform } from "@ionic/angular";
import { ScrollService } from "../../services/scroll.service";
import { MobileHowDoesWorkComponent } from "./mobile-how-does-work.component";
import { VideoPopupComponent } from "../how-does-it-works-popup/how-does-it-works-popup.component";
describe("MobileHowDoesWorkComponent", () => {
  it("should scroll to element when receiving correct target div id", () => {
    const mockScrollService = {
      scrollToDivEvent: new EventEmitter(),
      scrollToElement: jest.fn(),
    };
    const mockDialog = { open: jest.fn() };
    const mockPlatform = { is: jest.fn() };

    const component = new MobileHowDoesWorkComponent(
      mockScrollService as ScrollService,
      mockDialog as any,
      mockPlatform as any
    );

    component.scrollToHowSphereWorks = {
      nativeElement: "mockElement",
    } as ElementRef;
    component.ngOnInit();

    mockScrollService.scrollToDivEvent.emit("scrollToHowSphereWorks");

    expect(mockScrollService.scrollToElement).toHaveBeenCalledWith(
      "mockElement"
    );
  });
  it("should open video popup dialog with correct configuration", () => {
    const mockDialog = { open: jest.fn() };
    const mockScrollService = { scrollToDivEvent: new EventEmitter() };
    const mockPlatform = { is: jest.fn() };

    const component = new MobileHowDoesWorkComponent(
      mockScrollService as ScrollService,
      mockDialog as any,
      mockPlatform as any
    );

    const videoData = { url: "test-url" };
    component.openVideoPopup(videoData);

    expect(mockDialog.open).toHaveBeenCalledWith(VideoPopupComponent, {
      data: videoData,
      panelClass: "youtube-modal",
    });
  });
});
