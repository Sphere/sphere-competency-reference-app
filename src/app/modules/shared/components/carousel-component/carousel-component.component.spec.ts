// Component initializes with default language 'en' when no language input provided
import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { IonSlides, Platform } from "@ionic/angular";
import { ScrollService } from "../../services/scroll.service";
import { CarouselComponentComponent } from "./carousel-component.component";
describe('CarouselComponentComponent', () => {
  it('should initialize with default language "en" when no language input provided', () => {
    const mockPlatform = {
      is: jest.fn(),
      ready: jest.fn().mockResolvedValue(true),
    };
    const mockScrollService = {
      scrollToDivEvent: { emit: jest.fn() },
    };
  
    const component = new CarouselComponentComponent(
      mockScrollService as any,
      mockPlatform as any
    );
    component.ngOnInit();
  
    expect(component.deafaultLan).toBe("en");
  });
  it("should set language from input when platform is ready", async () => {
    const mockPlatform = {
      is: jest.fn(),
      ready: jest.fn().mockResolvedValue(true),
    };
    const mockScrollService = {
      scrollToDivEvent: { emit: jest.fn() },
    };
  
    const component = new CarouselComponentComponent(
      mockScrollService as any,
      mockPlatform as any
    );
    component.lang = "fr";
    await component.ngOnInit();
  
    expect(component.deafaultLan).toBe("fr");
  });
  it('should emit scroll event with provided data', () => {
    const mockPlatform = {
      is: jest.fn(),
      ready: jest.fn().mockResolvedValue(true)
    };
    const mockScrollService = {
      scrollToDivEvent: { emit: jest.fn() }
    };
  
    const component = new CarouselComponentComponent(mockScrollService as any, mockPlatform as any);
    const testData = 'test-section';
    component.scrollToContent(testData);
  
    expect(mockScrollService.scrollToDivEvent.emit).toHaveBeenCalledWith(testData);
  });
  it('should handle undefined lang input', async () => {
    const mockPlatform = {
      is: jest.fn(),
      ready: jest.fn().mockResolvedValue(true)
    };
    const mockScrollService = {
      scrollToDivEvent: { emit: jest.fn() }
    };
  
    const component = new CarouselComponentComponent(mockScrollService as any, mockPlatform as any);
    component.lang = undefined;
    await component.ngOnInit();
  
    expect(component.deafaultLan).toBe('en');
  });
  it('should initialize with undefined dataCarousel', () => {
    const mockPlatform = {
      is: jest.fn(),
      ready: jest.fn().mockResolvedValue(true)
    };
    const mockScrollService = {
      scrollToDivEvent: { emit: jest.fn() }
    };
  
    const component = new CarouselComponentComponent(mockScrollService as any, mockPlatform as any);
    component.dataCarousel = undefined;
  
    expect(component.dataCarousel).toBeUndefined();
  });
})

