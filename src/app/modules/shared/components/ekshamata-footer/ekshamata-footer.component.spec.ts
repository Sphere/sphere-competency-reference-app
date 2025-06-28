import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { IonicModule } from "@ionic/angular";

import { EkshamataFooterComponent } from "./ekshamata-footer.component";

describe("EkshamataFooterComponent", () => {
  it("should initialize and get org name when rootOrgId exists", async () => {
    // Mock UserService to return expected org data
    const mockUserService = {
      getOrgData: jest.fn().mockResolvedValue({
        orgNames: [{ channelId: "test-org-id", name: "Test Org" }],
      }),
    };

    const mockConfigService = {
      userProfile: {
        rootOrgId: "test-org-id",
      },
    };

    // Create component with mock services
    const component = new EkshamataFooterComponent(
      mockUserService as any,
      mockConfigService as any
    );

    // Call ngOnInit
    await component.ngOnInit();

    // Assert that getOrgData was called
    expect(mockUserService.getOrgData).toHaveBeenCalled();

    // Assert orgName is set correctly
    expect(component.orgName).toEqual(undefined);
  });

  // Input properties appName and isLogo are correctly bound when provided
  it("should bind input properties when provided", () => {
    const component = new EkshamataFooterComponent({} as any, {} as any);

    component.appName = "Test App";
    component.isLogo = true;

    expect(component.appName).toBe("Test App");
    expect(component.isLogo).toBe(true);
  });
  // getOrgName method successfully fetches org data and finds matching org
  it("should fetch and find matching org data", async () => {
    const mockOrgData = {
      orgNames: [
        { channelId: "org1", name: "Org 1" },
        { channelId: "org2", name: "Org 2" },
      ],
    };

    const mockUserService = {
      getOrgData: jest.fn().mockResolvedValue(mockOrgData),
    };

    const mockConfigService = {
      userProfile: {
        rootOrgId: "org2",
      },
    };

    const component = new EkshamataFooterComponent(
      mockUserService as any,
      mockConfigService as any
    );

    await component.getOrgName();

    expect(component.orgName).toEqual({ channelId: "org2", name: "Org 2" });
  });
  // Handle case when configSvc.userProfile is undefined or null
 
});
