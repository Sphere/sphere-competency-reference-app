// Component subscribes to 'showProgressSyncBar' event on construction
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Events } from "../../../../../util/events";
import { ProgressSyncBarComponent } from "./progress-sync-bar.component";

describe("OfflineModalComponent", () => {
  it("should subscribe to showProgressSyncBar event when component is constructed", () => {
    const mockEvents = {
      subscribe: jest.fn((topic, handler) => {}),
    } as unknown as Events;

    const component = new ProgressSyncBarComponent(mockEvents);

    expect(mockEvents.subscribe).toHaveBeenCalledWith(
      "showProgressSyncBar",
      expect.any(Function)
    );
  });
  it("should show spinner when showProgressSyncBar event is published with true", () => {
    const mockEvents = {
      subscribe: jest.fn(),
    } as unknown as Events;

    const component = new ProgressSyncBarComponent(mockEvents);
    const callback = (mockEvents.subscribe as jest.Mock).mock.calls[0][1] as (
      value: boolean
    ) => void;

    callback(true);

    expect(component.showSpinner).toBe(true);
  });
  it("should hide spinner when showProgressSyncBar event is published with false", () => {
    const mockEvents = {
      subscribe: jest.fn(),
    } as unknown as Events;

    const component = new ProgressSyncBarComponent(mockEvents);
    const callback = (mockEvents.subscribe as jest.Mock).mock.calls[0][1] as (
      value: boolean
    ) => void;

    callback(false);

    expect(component.showSpinner).toBe(false);
  });
  // Method calls unsubscribeFromShowProgressSyncBar() successfully
  it("should call unsubscribeFromShowProgressSyncBar successfully", () => {
    // Create a mock of the Events object, including the unsubscribe method
    const mockEvents = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(), // Mock the unsubscribe method
    } as unknown as Events;

    // Create the component instance with the mocked Events
    const component = new ProgressSyncBarComponent(mockEvents);

    // Spy on the unsubscribeFromShowProgressSyncBar method
    jest.spyOn(component, "unsubscribeFromShowProgressSyncBar");

    // Call ngOnDestroy which should call unsubscribeFromShowProgressSyncBar
    component.ngOnDestroy();

    // Check if unsubscribeFromShowProgressSyncBar was called once
    expect(component.unsubscribeFromShowProgressSyncBar).toHaveBeenCalledTimes(
      1
    );

    // Optionally, also check if unsubscribe was called
    expect(mockEvents.unsubscribe).toHaveBeenCalledWith("showProgressSyncBar");
  });
  // Timeout is set for 90000ms and triggers callback after duration
  it("should trigger callback after 90000ms timeout", () => {
    jest.useFakeTimers();
    const mockEvents = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(), // Mock the unsubscribe method
    } as unknown as Events;
    const component = new ProgressSyncBarComponent(mockEvents);

    component.setupTimeout();

    jest.advanceTimersByTime(90000);

    expect(component["showSpinner"]).toBeFalsy();
    jest.useRealTimers();
  });
  it("should clear timeout on ngOnDestroy", () => {
    // Use fake timers to mock setTimeout/clearInterval
    jest.useFakeTimers();
    
    // Mock events
    const mockEvents = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    } as unknown as Events;
    
    // Create component instance
    const component = new ProgressSyncBarComponent(mockEvents);
  
    // Set up the timeout
    component.setupTimeout();
    
    // Store the timeout ID
    const timeoutId = component["setTimeOutObj"];
    
    // Spy on global.clearInterval
    const clearIntervalMock = jest.spyOn(global, 'clearInterval').mockImplementation(() => {});
  
    // Call ngOnDestroy which should clear the timeout
    component.ngOnDestroy();
  
    // Ensure clearInterval was called with the correct timeout ID
    expect(clearIntervalMock).toHaveBeenCalledWith(timeoutId);
  
    // Restore real timers
    jest.useRealTimers();
  });
  
  


});
