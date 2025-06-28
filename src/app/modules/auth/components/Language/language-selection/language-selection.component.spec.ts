import { LanguageSelectionComponent } from "./language-selection.component";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  FormBuilder,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { Router, NavigationEnd } from "@angular/router";
import { AppFrameworkDetectorService } from "../../../../../../app/modules/core/services/app-framework-detector-service.service";
import { CommonUtilService, TelemetryGeneratorService } from "../../../../../../services";
import { ConfigurationsService } from "../../../../../../library/ws-widget/utils/src/public-api";

import * as _ from "lodash-es";
import { of, Subject } from "rxjs";

jest.mock("@ws-widget/utils", () => ({
  ConfigurationsService: jest.fn().mockImplementation(() => ({
    userProfile: null,
  })),
}));

describe("LanguageSelectionComponent", () => {
  let component: LanguageSelectionComponent;
  let mockRouter: Router;
  let mockAppFrameworkDetectorService: AppFrameworkDetectorService;
  let mockConfigSvc: ConfigurationsService;
  let mockCommonUtilService: Partial<CommonUtilService>; // Use Partial to mock only selected methods
  let dialogRefMock: Partial<MatDialogRef<LanguageSelectionComponent>>;
  let formBuilder: FormBuilder;
  let mockTelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
    generateInteractTelemetry: jest.fn(),
    generateImpressionTelemetry: jest.fn(),
  };
  beforeEach(async () => {
    mockRouter = {
      events: new Subject(),
      navigate: jest.fn(), // Mock events as a Subject
    } as any;

    mockAppFrameworkDetectorService = {
      detectAppFramework: jest.fn().mockResolvedValue("Ekshamata"),
    } as any;

    mockConfigSvc = {
      userProfile: null,
    } as ConfigurationsService;

    mockCommonUtilService = {
      changeAppLanguage: jest.fn(), // Only mock the method needed
      previesUrlList: ['create-account']
    } as any;

    component = new LanguageSelectionComponent(
      {} as MatDialogRef<LanguageSelectionComponent>,
      {} as any,
      mockCommonUtilService as CommonUtilService, // Cast to the expected type
      new UntypedFormBuilder(),
      mockConfigSvc,
      mockRouter as Router,
      mockAppFrameworkDetectorService,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );
    await component.ngOnInit(); // Initialize the component
  });

  it("should call initializeFormFields on initialization", () => {
    jest.spyOn(component, "initializeFormFields");
    component.ngOnInit();
    expect(component.initializeFormFields).toHaveBeenCalledTimes(1);
  });
  // Component fetches default language by calling getDefaultLanguage()
  it("should call getDefaultLanguage on initialization", () => {
    jest.spyOn(component, "getDefaultLanguage");

    component.ngOnInit();

    expect(component.getDefaultLanguage).toHaveBeenCalledTimes(1);
  });
  it("should subscribe to router events on initialization", () => {
    jest.spyOn(mockRouter.events, "subscribe");

    component.ngOnInit();

    expect(mockRouter.events.subscribe).toHaveBeenCalled();
  });
  it("should not update isbackground for non-NavigationEnd events", () => {
    component.isbackground = true;

    component.ngOnInit();
    (mockRouter.events as Subject<any>).next({ type: "other" });

    expect(component.isbackground).toBe(true);
  });
  it("should set isbackground to false when URL contains profile-dashboard", () => {
    component.isbackground = true;
    component.ngOnInit();
    (mockRouter.events as Subject<any>).next(
      new NavigationEnd(1, "/profile-dashboard", "")
    );
    expect(component.isbackground).toBe(false);
  });
  // Language selection form updates when user clicks on a language option
  it("should update form and selection when language option clicked", () => {
    const mockEvent = {
      code: "kn",
      name: "ಕನ್ನಡ",
    };

    component.manageSelection(mockEvent);
    const langControl = component.languageForm.get("lang");
    expect(langControl).not.toBeNull();
    expect(langControl!.value).toBe("kn");
  });
  it("should handle error during app framework detection", async () => {
    // Arrange
    mockConfigSvc.userProfile = null;

    mockAppFrameworkDetectorService.detectAppFramework = jest
      .fn()
      .mockRejectedValueOnce("error");

    component.preferredLanguageList = [
      { code: "en", label: "English", checked: false },
      { code: "hi", label: "Hindi", checked: false },
    ];

    // Act
    await component.getDefaultLanguage();

    // Assert: Only 'en' should be checked
    expect(
      component.preferredLanguageList.find((l) => l.code === "en").checked
    ).toBeTruthy();
    expect(
      component.preferredLanguageList.find((l) => l.code === "hi").checked
    ).toBeFalsy();

    // Assert: selectedLang should be the 'en' language
    expect(component.selectedLang.code).toBe("en");

    // Assert: Default language should be 'en'
    expect(component.defaultLanguage).toBe("en");
  });

  it("should not update language when selected same as current", () => {
    const mockEvent = { code: "en", name: "English" };
    component.languageForm.patchValue({ lang: "en" });

    component.preferredLanguageSet(mockEvent);

    expect(mockCommonUtilService.changeAppLanguage).not.toHaveBeenCalled();
  });

  it("should navigate based on input flags when using Jest", () => {
    // Set flags for test
    component.navigateBack = true;
    component.navigateTohome = false;
    component.navigateToPreviesPage = false;

    component.ngOnInit();

    expect(component.isbackground).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(["/home"]);
  });
  // Component should emit the selected language code when the form is submitted
  it("should emit selected language code on form submission", () => {
    // Arrange
    component.ngOnInit();
    component.selectedLang = { code: "hi", name: "हिंदी" };
    component.languageForm.patchValue({ lang: "hi" });

    jest.spyOn(component.selectedLanguage, "emit");
    mockTelemetryGeneratorService.generateInteractTelemetry = jest.fn();

    // Act
    component.onSubmit(component.languageForm);

    // Assert
    expect(component.selectedLanguage.emit).toHaveBeenCalledWith("hi");
    expect(mockTelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalled();
  });
  it("should handle valid language parameters correctly", () => {
    const formBuilderMock = {
      group: jest.fn().mockReturnValue({
        value: { lang: "kn" },
      }),
    };
    component.languageForm = formBuilderMock.group({
      lang: ["kn"],
    });

    const event = { code: "en", name: "English" };

    component.preferredLanguageSet(event);

    expect(mockCommonUtilService.changeAppLanguage).toHaveBeenCalledWith(
      "English",
      "en"
    );
  });
  // Method emits the received event value through hideLanguagePage EventEmitter
  it("should emit the received event value through hideLanguagePage EventEmitter", () => {
    const spy = jest.spyOn(component.hideLanguagePage, "emit");
    const testEvent = true;

    component.hideLanguageSelectionPage(testEvent);

    expect(spy).toHaveBeenCalledWith(testEvent);
  });
  // Method correctly propagates boolean values through the event emitter
  it("should correctly propagate boolean values through the event emitter", () => {
    const emitSpy = jest.spyOn(component.hideLanguagePage, "emit");

    component.hideLanguageSelectionPage(true);
    expect(emitSpy).toHaveBeenCalledWith(true);

    component.hideLanguageSelectionPage(false);
    expect(emitSpy).toHaveBeenCalledWith(false);
  });
  // Sets language based on userProfile when profile exists
  it("should set language form value based on user profile language when profile exists", async () => {
    const mockUserProfile = { userId: "123", language: "hi" };
    const mockPreferredLanguageList = [
      { code: "en", name: "English", checked: false },
      { code: "hi", name: "Hindi", checked: false },
    ];

    component.configSvc.userProfile = mockUserProfile;
    component.preferredLanguageList = mockPreferredLanguageList;

    await component.getDefaultLanguage();

    expect(component.preferredLanguageList[1].checked).toBeTruthy();
    expect(component.languageForm.get("lang")?.value).toBe("hi");
  });
  // Handles errors in app framework detection by defaulting to English
  it("should default to English when app framework detection fails", async () => {
    component.configSvc.userProfile = null;
    jest
      .spyOn(component.appFrameworkDetectorService, "detectAppFramework")
      .mockRejectedValue(new Error("Detection failed"));

    await component.getDefaultLanguage();

    expect(component.defaultLanguage).toBe("en");
  });
  // Handles case when selectedLang is undefined
  it("should handle undefined selectedLang by using userProfile language", async () => {
    component.configSvc.userProfile = { language: "kn", userId: "123" };
    component.selectedLang = undefined;
    component.preferredLanguageList = [
      { code: "en", checked: false },
      { code: "kn", checked: false },
    ];

    await component.getDefaultLanguage();

    expect(component.languageForm.get("lang")?.value).toBe("kn");
  });
  // should set default language to "en" and update app language when app framework is not "Ekshamata
  it('should set default language to "en" and update app language when app framework is not "Ekshamata"', async () => {
    // Arrange
    const mockAppFrameworkDetectorService = {
      detectAppFramework: jest.fn().mockResolvedValue("OtherFramework"),
    };
    const mockCommonUtilService = {
      updateAppLanguage: jest.fn(),
    };

    const component = new LanguageSelectionComponent(
      {} as MatDialogRef<LanguageSelectionComponent>,
      {} as typeof MAT_DIALOG_DATA,
      mockCommonUtilService as any,
      new UntypedFormBuilder(),
      mockConfigSvc as any,
      {} as Router,
      mockAppFrameworkDetectorService as any,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );
    component.preferredLanguageList = [
      { code: "en", name: "English", checked: false },
      { code: "hi", name: "हिंदी", checked: false },
    ];
    component.languageForm = new UntypedFormGroup({
      lang: new UntypedFormControl(""),
    });

    // Act
    await component.getDefaultLanguage();

    // Assert
    expect(component.defaultLanguage).toBe("en");
    expect(mockCommonUtilService.updateAppLanguage).toHaveBeenCalledWith("en");
    expect(component.languageForm.value.lang).toBe("en");
  });

  // generate test case when selectedLang is undefined
  it('should set default language to "en" when selectedLang is undefined and appFramework is not "Ekshamata"', async () => {
    // Arrange
    const mockAppFrameworkDetectorService = {
      detectAppFramework: jest.fn().mockResolvedValue("OtherFramework"),
    };
    const mockCommonUtilService = {
      updateAppLanguage: jest.fn(),
    };
    const mockConfigSvc = {
      userProfile: null, // Set userProfile to null so the else block is executed
    };

    const component = new LanguageSelectionComponent(
      {} as any,
      {} as any,
      mockCommonUtilService as any,
      new UntypedFormBuilder(),
      mockConfigSvc as any,
      {} as any,
      mockAppFrameworkDetectorService as any,
      mockTelemetryGeneratorService as TelemetryGeneratorService
    );

    component.preferredLanguageList = [
      { code: "en", name: "English", checked: false },
      { code: "hi", name: "हिंदी", checked: false },
    ];

    component.languageForm = new UntypedFormGroup({
      lang: new UntypedFormControl(""),
    });

    // Act
    await component.getDefaultLanguage();

    // Assert
    expect(
      mockAppFrameworkDetectorService.detectAppFramework
    ).toHaveBeenCalled(); // Now it should be called
    expect(mockCommonUtilService.updateAppLanguage).toHaveBeenCalledWith("en");

    // Check if the form's language is set to 'en'
    expect(component.languageForm.value.lang).toBe("en");

    // Check if the preferred language list is updated correctly
    expect(component.preferredLanguageList[0].checked).toBe(true); // English should be checked
    expect(component.preferredLanguageList[1].checked).toBe(false); // Hindi should not be checked

    // Check that selectedLang is set to the 'en' language object, not undefined
    expect(component.selectedLang).toEqual({
      checked: true,
      code: "en",
      name: "English",
    });

    // Check that the form is patched with the 'en' language
    expect(component.languageForm.value.lang).toBe("en");
  });
});
