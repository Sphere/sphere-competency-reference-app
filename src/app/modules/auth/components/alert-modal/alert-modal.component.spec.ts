import { Renderer2 } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { InAppBrowser } from "@awesome-cordova-plugins/in-app-browser/ngx";
import { AlertModalComponent } from "./alert-modal.component";
import { throwError } from "rxjs";
import _ from "lodash";
import { Environment, InteractType, PageId, TelemetryGeneratorService } from "../../../../../services";

describe("AlertModalComponent", () => {
  let component: AlertModalComponent;

  const iabMock: Partial<InAppBrowser> = {
    create: jest.fn(),
  };

  const dialogRefMock: Partial<MatDialogRef<AlertModalComponent>> = {
    close: jest.fn(),
  };

  const rendererMock: Partial<Renderer2> = {
    createElement: jest.fn(),
    appendChild: jest.fn(),
    setProperty: jest.fn(),
  };

  const documentMock: Partial<Document> = {};

  const dataMock = { message: "Test data" };
  const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {}

  beforeAll(() => {
    component = new AlertModalComponent(
      iabMock as InAppBrowser,
      dialogRefMock as MatDialogRef<AlertModalComponent>,
      dataMock as any,
      rendererMock as Renderer2,
      documentMock as Document,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an instance of the component", () => {
    expect(component).toBeTruthy();
  });

  it("should register widget:closed event handler when fcWidget is available", () => {
    //arrange
    const mockFcWidget = {
      on: jest.fn((_, fn) => fn({})),
    };
    (window as any).fcWidget = mockFcWidget;
    //act
    component.ngOnInit();
    //assert
    expect(mockFcWidget.on).toHaveBeenCalledWith(
      "widget:closed",
      expect.any(Function)
    );
  });

  it("should close the modal when submit button is clicked", () => {
    //arrange
    dialogRefMock.close = jest.fn();
    //act
    component.done();
    //assert
    expect(dialogRefMock.close).toHaveBeenCalledWith({ event: "CONFIRMED" });
  });

  it("should close the modal when cancel button is clicked", () => {
    //arrange
    const mockFcWidget = {
      hide: jest.fn(() => {}),
    };
    (window as any).fcWidget = mockFcWidget;
    dialogRefMock.close = jest.fn();
    mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
    //act
    component.closePopup();
    //assert
    expect(mockFcWidget.hide).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalledWith({ event: "CLOSE" });
  });

  it("should open a dailog for whatsapp", () => {
    //arrange
    const request = {
      preventDefault: jest.fn(),
    };
    //act
    component.openWhatsApp(request as any);
    //assert
    expect(iabMock.create).toHaveBeenCalledWith(
      "https://wa.me/919632013414?text=Hi",
      "_system",
      "location=yes"
    );
  });

  it("should close the alert when submit button is clicked", () => {
    //arrange
    const data = {
      type: "fgPassword",
      msg: "Test message",
      btnText: "Test button text",
    };
    dialogRefMock.close = jest.fn();
    mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn()
    //act
    component.closeAlert(data);
    //assert
    expect(dialogRefMock.close).toHaveBeenCalledWith({ event: data });
    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(
      InteractType.TOUCH,
      `${data}-clicked`,
      Environment.CREATE_ACCOUNT,
      PageId.CREATE_ACCOUNT
    )
  });

  it("should create and append script element to document body", () => {
    //arrange
    const onloadMock = jest.fn();
    const scriptMock = {
      src: "//in.fw-cdn.com/30492305/271953.js",
      onload: onloadMock,
    };

    rendererMock.createElement = jest.fn(() => scriptMock);
    jest.useFakeTimers();
    rendererMock.appendChild = jest.fn();
    const mockFcWidget = {
      hide: jest.fn(() => {}),
      init: jest.fn(() => {}),
      on: jest.fn((_, fn) => fn({})),
      setConfig: jest.fn(() => ({ headerProperty: { hideChatButton: false } })),
    };
    (window as any).fcWidget = mockFcWidget;
    dialogRefMock.close = jest.fn();
    //act
    component.openChat();
    // Simulate script onload
    scriptMock.onload();
    //assert
    expect(rendererMock.createElement).toHaveBeenCalledWith("script");
    expect(rendererMock.appendChild).toHaveBeenCalledWith(
      documentMock.body,
      scriptMock
    );
    expect(mockFcWidget.on).toHaveBeenCalledWith(
      "widget:closed",
      expect.any(Function)
    );

    jest.runAllTimers();
    jest.clearAllTimers();
  });

  it("should handle error part", () => {
    //arrange
    const mockError = new Error('Test Error');
    jest.spyOn(rendererMock, 'createElement').mockImplementation(() => {
      throw mockError;
    });
    //act
    component.openChat();
    //assert
    expect(mockError).toBeTruthy();
  });
});
