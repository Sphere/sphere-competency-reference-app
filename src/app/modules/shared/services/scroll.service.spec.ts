// Service emits scrollToDivEvent when triggered
import { EventEmitter } from "@angular/core";
import { ScrollService } from "./scroll.service";

describe("ScrollService", () => {
  it("should emit scrollToDivEvent when triggered", () => {
    const service = new ScrollService();
    const emitSpy = jest.spyOn(service.scrollToDivEvent, "emit");
    service.scrollToDivEvent.emit("test-div");
    expect(emitSpy).toHaveBeenCalledWith("test-div");
  });
  it('should scroll to element smoothly when valid element provided', () => {
    const service = new ScrollService();
    const mockElement = document.createElement('div');
    const scrollIntoViewMock = jest.fn();
    mockElement.scrollIntoView = scrollIntoViewMock;
    service.scrollToElement(mockElement);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
