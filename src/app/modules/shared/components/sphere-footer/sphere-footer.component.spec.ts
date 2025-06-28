// Component initializes with default values and subscribes to value service observables
import { BehaviorSubject, of } from "rxjs";
import { ConfigurationsService } from "../../../../../library/ws-widget/utils/src/lib/services/configurations.service";
import { ValueService } from "../../../../../library/ws-widget/utils/src/lib/services/value.service";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { EmailComposer } from "@awesome-cordova-plugins/email-composer/ngx";
import { Platform } from "@ionic/angular";
import { SphereFooterComponent } from "./sphere-footer.component";
import { TelemetryGeneratorService } from "../../../../../services/telemetry-generator.service";

describe("SphereFooterComponent", () => {
  it("should initialize with default values and subscribe to observables", () => {
    const mockConfigSvc = {
      restrictedFeatures: new Set(),
      instanceConfig: { logos: { app: "test-url" } },
    };
    const mockValueSvc = {
      isXSmall$: of(true),
      isLtMedium$: of(false),
    };
    const mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn(),
    };
    const mockPlatform = {
      is: jest.fn(),
    };
    const mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};

    const component = new SphereFooterComponent(
      mockConfigSvc as any,
      mockValueSvc as any,
      mockDomSanitizer as any,
      {} as Router,
      {} as EmailComposer,
      mockPlatform as any,
      mockTelemetryGeneratorService as any
    );

    expect(component.isXSmall).toBe(true);
    expect(component.isMedium).toBe(false);
    expect(
      mockDomSanitizer.bypassSecurityTrustResourceUrl
    ).toHaveBeenCalledWith("test-url");
  }); // Router navigates to create account page when createAcct() is called
  it("should navigate to create account page on createAcct()", () => {
    const mockRouter = {
      navigateByUrl: jest.fn(),
    };
    const mockValueSvc = {
      isXSmall$: of(false),
      isLtMedium$: of(false),
    };
    const component = new SphereFooterComponent(
      {} as ConfigurationsService,
      mockValueSvc as any,
      {} as DomSanitizer,
      mockRouter as any,
      {} as EmailComposer,
      {} as Platform,
      {} as TelemetryGeneratorService as any
    );

    component.createAcct();

    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith("app/create-account");
  });
  // Router navigates to public TNC page with panel parameter when navigateToPublcTOC() is called
  it("should navigate to public TNC page with panel parameter", () => {
    // Mock Router
    const mockRouter = {
      navigate: jest.fn(),
    } as unknown as Router;

    const mockValueSvc = {
      isXSmall$: of(false),
      isLtMedium$: of(false),
    };
    const component = new SphereFooterComponent(
      {} as ConfigurationsService,
      mockValueSvc as any,
      {} as DomSanitizer,
      mockRouter as any,
      {} as EmailComposer,
      {} as Platform,
      {} as TelemetryGeneratorService
    );

    // Call the method
    component.navigateToPublcTOC("test-panel");

    // Assert navigation
    expect(mockRouter.navigate).toHaveBeenCalledWith(["public/tnc"], {
      queryParams: { panel: "test-panel" },
    });
  });

  // Component handles undefined/null configSvc.instanceConfig
  it("should handle null instanceConfig", () => {
    const mockConfigSvc = {
      restrictedFeatures: new Set(),
      instanceConfig: null,
    };
    const mockValueSvc = {
      isXSmall$: of(false),
      isLtMedium$: of(false),
    };

    const component = new SphereFooterComponent(
      mockConfigSvc as any,
      mockValueSvc as any,
      {} as DomSanitizer,
      {} as Router,
      {} as EmailComposer,
      {} as Platform,
      {} as TelemetryGeneratorService
    );

    expect(component.appIcon).toBeNull();
  });
  // Component handles missing/undefined configSvc.restrictedFeatures
  it("should handle undefined restrictedFeatures", () => {
    const mockConfigSvc = {
      restrictedFeatures: undefined,
      instanceConfig: null,
    };
    const mockValueSvc = {
      isXSmall$: of(false),
      isLtMedium$: of(false),
    };

    const component = new SphereFooterComponent(
      mockConfigSvc as any,
      mockValueSvc as any,
      {} as DomSanitizer,
      {} as Router,
      {} as EmailComposer,
      {} as Platform,
      {} as TelemetryGeneratorService
    );

    expect(component.termsOfUser).toBe(true);
  });
  it("should set isTablet to true when platform is tablet", () => {
    const platformMock = {
      is: jest.fn().mockReturnValue(true),
    };
    const mockConfigSvc = {
      restrictedFeatures: undefined,
      instanceConfig: null,
    };
    const mockValueSvc = {
      isXSmall$: of(false),
      isLtMedium$: of(false),
    };

    const component = new SphereFooterComponent(
      mockConfigSvc as any,
      mockValueSvc as any,
      {} as DomSanitizer,
      {} as Router,
      {} as EmailComposer,
      platformMock as any,
      {} as TelemetryGeneratorService
    );

    component.ngOnInit();

    expect(platformMock.is).toHaveBeenCalledWith("tablet");
    expect(component.isTablet).toBe(true);
  });
  it("should call EmailComposer.open with correct email address", () => {
    const platformMock = {
      is: jest.fn().mockReturnValue(true),
    };
    const mockConfigSvc = {
      restrictedFeatures: undefined,
      instanceConfig: null,
    };
    const mockValueSvc = {
      isXSmall$: of(false),
      isLtMedium$: of(false),
    };
    const mockEmailComposer = {
      open: jest.fn(), // Mock the open method
    };
  
    // Pass the mockEmailComposer to the component
    const component = new SphereFooterComponent(
      mockConfigSvc as any,
      mockValueSvc as any,
      {} as DomSanitizer,
      {} as Router,
      mockEmailComposer as any,
      platformMock as any,
      {} as TelemetryGeneratorService
    );
  
    // Call the method
    component.openDefaultMailApp();
  
    // Verify that the open method was called with the correct arguments
    expect(mockEmailComposer.open).toHaveBeenCalledWith({
      to: "support@aastrika.org",
      subject: "",
      body: "",
    });
  });

  it("should set termsOfUser to false when restrictedFeatures contains 'termsOfUser'", () => {
    const mockConfigSvc = {
      restrictedFeatures: new Set(['termsOfUser']), // Mock restrictedFeatures with 'termsOfUser'
    };
    const platformMock = {
      is: jest.fn().mockReturnValue(true),
    };
    const mockValueSvc = {
      isXSmall$: of(false),
      isLtMedium$: of(false),
    };
    const component = new SphereFooterComponent(
      mockConfigSvc as any,
      mockValueSvc as any,
      {} as DomSanitizer,
      {} as Router,
      {} as any,
      platformMock as any,
      {} as TelemetryGeneratorService
    );
  
    component.ngOnInit(); // Call ngOnInit to simulate initialization
  
    expect(component.termsOfUser).toBe(false); // Check that termsOfUser is set to false
  });
  
  
});
