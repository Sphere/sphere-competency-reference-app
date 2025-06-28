import { Component, Inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { AppFrameworkDetectorService } from '../../../../../../app/modules/core/services/app-framework-detector-service.service';
import { ConfigurationsService } from '../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { CommonUtilService, Environment, ImpressionType, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../services';
import * as _ from 'lodash-es';

@Component({
  selector: 'ws-app-language-selection',
  templateUrl: './language-selection.component.html',
  styleUrls: ['./language-selection.component.scss'],
})
export class LanguageSelectionComponent implements OnInit {
  @Input() showbackButton?: any;
  @Input() trigerrNavigation?: any;
  @Input() navigateBack?: Boolean = false;
  @Input() navigateTohome?: Boolean = false;
  @Input() navigateToPreviesPage?: Boolean = true;
  @Input() showLogOutIcon?: any;
  @Output() selectedLanguage = new EventEmitter<any>()
  preferredLanguageList: any[] = [
    { code: 'en', name: 'English', checked: false }, 
    { code: 'hi', name: 'हिंदी', checked: false },
    { code: 'kn', name: 'ಕನ್ನಡ', checked: false }
  ]
  @Output() hideLanguagePage = new EventEmitter<Boolean>()
  preferredLanguage: any
  languageForm: UntypedFormGroup
  defaultLanguage: any
  isbackground: boolean = true;
  appFramework: any;
  selectedLang: any;


  constructor(
    public dialogRef: MatDialogRef<LanguageSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public selectedData: any,
    private commonUtilService: CommonUtilService,
    private spherFormBuilder: UntypedFormBuilder,
    public configSvc: ConfigurationsService,
    private router: Router,
    public appFrameworkDetectorService: AppFrameworkDetectorService,
    private telemetryGeneratorService: TelemetryGeneratorService

  ) {
    //this.commonUtilService.updateAppLanguage('hi);
  }

  ngOnInit() {
    this.initializeFormFields()
    this.getDefaultLanguage()
    this.generateImpressionTelemetry()
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/profile-dashboard')) {
          this.isbackground = false
        }
      }
    })
  }

  initializeFormFields() {
    this.languageForm = this.spherFormBuilder.group({
      lang: new UntypedFormControl('', [Validators.required])
    })
  }

  manageSelection(event){
    this.selectedLang = event
    this.languageForm.patchValue({ lang: event.code });
  }

  preferredLanguageSet(event) {
  
    if (this.languageForm.value.lang != event.code) {
      this.commonUtilService.changeAppLanguage(event.name, event.code);
    }
  }

  onSubmit(languageForm: any) {
    this.preferredLanguageSet(this.selectedLang)
    this.generateInteractTelemetry();
    this.selectedLanguage.emit(languageForm.value.lang)
  }

  hideLanguageSelectionPage(event) {
    this.hideLanguagePage.emit(event)
  }

  async getDefaultLanguage() {
    if (!_.isNull(this.configSvc.userProfile)) {
      _.forEach(this.preferredLanguageList, (lang) => {
      if (lang.code == this.configSvc.userProfile.language) {
          lang.checked = true;
          this.languageForm.patchValue({
            lang: lang.code,
          });
        } else {
          lang.checked = false;
          this.languageForm.patchValue({
            lang: this.configSvc.userProfile.language,
          });
        }
      });
    } else {
      try {
        this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
        if (this.appFramework === 'Ekshamata') {
          this.defaultLanguage = 'hi';
          this.commonUtilService.updateAppLanguage('hi');
        } else {
          this.defaultLanguage = 'en';
          this.commonUtilService.updateAppLanguage('en');
        }
      } catch (error) {
        console.error('Error while detecting app framework', error);
        this.defaultLanguage = 'en'; // Fallback default language
      }
  
      _.forEach(this.preferredLanguageList, (lang) => {
        if (lang.code === this.defaultLanguage) {
          lang.checked = true;
          this.selectedLang = lang;
        } else {
          lang.checked = false;
        }
      });
  
      // Patch the form value once after the loop
      if (this.selectedLang) {
        this.languageForm.patchValue({ lang: this.selectedLang.code });
      } else {
        this.languageForm.patchValue({ lang: this.configSvc.userProfile?.language });
      }
    }
  }

  generateImpressionTelemetry() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW, '',
      PageId.LANGUAGE,
      this.commonUtilService.previesUrlList.includes('create-account') ? Environment.CREATE_ACCOUNT : Environment.LANGUAGE_SELECTED)
  }

  generateInteractTelemetry() {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractType.SELECT_LANGUAGE,
      this.commonUtilService.previesUrlList.includes('create-account') ? Environment.CREATE_ACCOUNT : Environment.LANGUAGE_SELECTED,
      PageId.LANGUAGE,
      undefined,
      {
        selectedLanguage: this.selectedLang.name
      }
    )
  }
  
}
