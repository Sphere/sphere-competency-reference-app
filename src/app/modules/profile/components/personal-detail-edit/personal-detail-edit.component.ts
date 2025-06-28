import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import moment from 'moment'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { ValueService } from '../../../../../library/ws-widget/utils/src/lib/services/value.service'
import { ILanguages, IUserProfileDetailsFromRegistry } from '@ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '@ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { AppDateAdapter, APP_DATE_FORMATS } from '@ws/app/src/public-api'
import { constructReq } from '../request-util'
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { debounceTime, distinctUntilChanged, map, mergeMap, startWith } from 'rxjs/operators'
import { ENTER, COMMA } from '@angular/cdk/keycodes'
// import { LanguageDialogComponent } from '../language-dialog/language-dialog.component'
import * as _ from 'lodash'
import { storageKeys } from '../../../../../app/manage-learn/storageKeys'
import { LocalStorageService } from '../../../../../app/manage-learn/core'
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service'
import countriesList from 'assets/fusion-assets/files/country.json'
import statesList from 'assets/fusion-assets/files/state.json'
import districtsList from 'assets/fusion-assets/files/district.json'
import { ProfileModalComponent } from '../profile-modal/profile-modal.component'
import { TranslateService } from '@ngx-translate/core';
import { Environment, InteractType, PageId, TelemetryGeneratorService } from '../../../../../services'
@Component({
  selector: 'ws-personal-detail-edit',
  templateUrl: './personal-detail-edit.component.html',
  styleUrls: ['./personal-detail-edit.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalDetailEditComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('firstName') firstName!: ElementRef;
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  invalidDob = false
  personalDetailForm: UntypedFormGroup
  userProfileData!: IUserProfileDetailsFromRegistry
  academicsArray: any[] = []
  userDetails: any
  // profileUserName: any
  userID = ''
  savebtnDisable = true
  orgTypeField = false
  orgOthersField = false
  selectedKnowLangs: ILanguages[] = []
  masterKnownLanguages: Observable<ILanguages[]> | undefined
  masterLanguagesEntries!: ILanguages[]
  masterLanguages: Observable<ILanguages[]> | undefined
  separatorKeysCodes: number[] = [ENTER, COMMA]
  rnShow = false
  professionOtherField = false
  startDate = new Date(1999, 0, 1)
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('knownLanguagesInput', { static: true }) knownLanguagesInputRef!: ElementRef<HTMLInputElement>
  professions = ['Healthcare Worker', 'Healthcare Volunteer', 'Mother/Family Member', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  langList = ['English', 'Hindi']
  langDialog: any
  preferedLanguage: any = 'English'
  loadDob = false
  showDesignation = false
  defaultLanguage;
  appFramework: any
  disticts: any
  countries: any
  states: any
  countryUrl = '/fusion-assets/files/country.json'
  districtUrl = '/fusion-assets/files/district.json'
  stateUrl = '/fusion-assets/files/state.json'
  selectDisable = true
  address: any
  formChanged = false;
  initialFirstname: any
  initialSurname: any

  constructor(private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private matSnackBar: MatSnackBar,
    public dialog: MatDialog,
    private valueSvc: ValueService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private localStorage: LocalStorageService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private translate: TranslateService,
    private telemetryGeneratorService: TelemetryGeneratorService

  ) {
    this.initializeForm();
    this.getDefaultLanguage();
    this.trackFormChanges();
  }

  ngOnInit() {
    this.fetchMeta()
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.showbackButton = true

      } else {
        this.showbackButton = true
      }
    })
  }

  initializeForm(){
    this.personalDetailForm = new UntypedFormGroup({
      firstname: new UntypedFormControl('', [Validators.required]),
      surname: new UntypedFormControl('', [Validators.required]),
      // userName: new FormControl('', [Validators.required]),
      dob: new UntypedFormControl('', [Validators.required]),
      profession: new UntypedFormControl(),
      designation: new UntypedFormControl(),
      professionOtherSpecify: new UntypedFormControl(),
      regNurseRegMidwifeNumber: new UntypedFormControl(),
      orgType: new UntypedFormControl(),
      orgOtherSpecify: new UntypedFormControl(),
      organizationName: new UntypedFormControl(),
      nationality: new UntypedFormControl(),
      domicileMedium: new UntypedFormControl(),
      gender: new UntypedFormControl(),
      maritalStatus: new UntypedFormControl(),
      // knownLanguages: new FormControl([], []),
      // knownLanguage: new FormControl(this.preferedLanguage),
      mobile: new UntypedFormControl(),
      country: new UntypedFormControl(),
      distict: new UntypedFormControl(),
      state: new UntypedFormControl(),
      countryCode: new UntypedFormControl(),
      postalAddress: new UntypedFormControl(),
      pincode: new UntypedFormControl(),
      languages: new UntypedFormControl(),
    })
  }

  trackFormChanges() {
    // Set initial values to compare against later
    this.initialFirstname = this.personalDetailForm.get('firstname').value;
    this.initialSurname = this.personalDetailForm.get('surname').value;
    this.formChanged = false;

  }

  async getDefaultLanguage() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (this.appFramework === 'Ekshamata') {
        this.defaultLanguage = 'hi';
        // this.personalDetailForm.get('firstname')?.disable();
        // this.personalDetailForm.get('surname')?.disable();
      } else {
        this.defaultLanguage = 'en';
        // this.personalDetailForm.get('firstname')?.enable();
        // this.personalDetailForm.get('surname')?.enable();
      }
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }

  fetchMeta() {
    this.userProfileSvc.getMasterLanguages().subscribe(
      data => {
        this.masterLanguagesEntries = data ? data.languages : [{name: 'en'}]
        this.onChangesLanuage()
        // this.onChangesKnownLanuage()
      },
      (_err: any) => {
      })
    this.countries = _.get(countriesList, 'nationalities')
    this.states = _.get(statesList, 'states')
  }

  onChangesLanuage(): void {

    // tslint:disable-next-line: no-non-null-assertion
    this.masterLanguages = this.personalDetailForm.get('domicileMedium')!.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        startWith(''),
        map(value => typeof (value) === 'string' ? value : (value && value.name ? value.name : '')),
        map(name => name ? this.filterLanguage(name) : this.masterLanguagesEntries.slice())
      )
  }

  stateSelect(option: any) {
    console.log("state selected", option)
    this.userProfileSvc.getData(this.districtUrl).subscribe((statesdata: any) => {
      _.get(statesdata, 'states', districtsList.states).map((item: any) => {
        if (item.state === option) {
          this.disticts = item.districts
        }
      })
    })
    console.log(this.address, this.address.length)

    if (this.address.length) {
      const splitValues: string[] = this.address.split(', ')
      console.log("split data", splitValues)
      this.address = `${splitValues[0]}` + ', ' + `${option}` + ', ' + `${splitValues[2]}`
    } else {
      this.address += ', ' + `${option}`
    }
  }

  updateDistrict(dictrict, state) {
    this.userProfileSvc.getData(this.districtUrl).subscribe((statesdata: any) => {
      _.get(statesdata, 'states', districtsList.states).map((item: any) => {
        if (item.state === state) {
          this.disticts = item.districts
        }
      })
    })
    return dictrict;
  }

  countrySelect(option: any) {
    console.log("country selected", option)
    this.setCountryCode(option)
    if (option === 'India') {
      this.selectDisable = false
      this.address = option
    } else {
      this.selectDisable = true
      this.personalDetailForm.controls.state.setValue(null)
      this.personalDetailForm.controls.distict.setValue(null)
      this.address = option
    }


  }

  setCountryCode(country: string) {
    const selectedCountry = this.countries.filter((e: any) => e.name.toLowerCase() === country.toLowerCase())
    this.personalDetailForm.controls.countryCode.setValue(selectedCountry[0].countryCode)
  }

  districtSelect(district) {
    if (this.address.length) {
      const splitValues: string[] = this.address.split(', ')
      this.address = `${splitValues[0]}` + ', ' + `${splitValues[1]}` + ', ' + `${district}`
    } else {
      this.address += ', ' + `${district}`
    }
    this.personalDetailForm.controls.postalAddress.setValue(this.address)

  }
  // onChangesKnownLanuage(): void {
  //   // tslint:disable-next-line: no-non-null-assertion
  //   this.masterKnownLanguages = this.personalDetailForm.get('knownLanguages')!.valueChanges
  //     .pipe(
  //       debounceTime(500),
  //       distinctUntilChanged(),
  //       startWith(''),
  //       map(value => typeof value === 'string' || 'ILanguages' ? value : value.name),
  //       map(name => {
  //         if (name) {
  //           if (name.constructor === Array) {
  //             return this.filterMultiLanguage(name)
  //           }
  //           return this.filterLanguage(name)
  //         }
  //         return this.masterLanguagesEntries.slice()
  //       })
  //     )
  // }
  // private filterMultiLanguage(name: string[]): ILanguages[] {
  //   if (name) {
  //     const filterValue = name.map(n => n.toLowerCase())
  //     return this.masterLanguagesEntries.filter(option => {
  //       // option.name.toLowerCase().includes(filterValue))
  //       filterValue.map(f => {
  //         return option.name.toLowerCase().includes(f)
  //       })
  //     })
  //   }
  //   return this.masterLanguagesEntries
  // }

  private filterLanguage(name: string): ILanguages[] {
    if (name) {
      const filterValue = name.toLowerCase()
      return this.masterLanguagesEntries.filter(option => option.name.toLowerCase().includes(filterValue))
    }
    return this.masterLanguagesEntries
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userDetails = data;
            this.userProfileData = data.profileDetails.profileReq
            this.updateForm()
            // if (data.profileDetails.preferences!.language === 'hi') {
            //   this.personalDetailForm.patchValue({
            //     knownLanguage: 'हिंदी',
            //   })
            // } else {
            //   this.personalDetailForm.patchValue({
            //     knownLanguage: 'English',
            //   })
            // }

            // this.populateChips(this.userProfileData)
          }
        })
    }
  }

  public selectKnowLanguage(data: any) {
    this.savebtnDisable = false
    const value: ILanguages = data.option.value
    if (!this.selectedKnowLangs.includes(value)) {
      this.selectedKnowLangs.push(data.option.value)
    }
    this.knownLanguagesInputRef.nativeElement.value = ''
  }

  public removeKnowLanguage(lang: any) {
    this.savebtnDisable = false
    const index = this.selectedKnowLangs.indexOf(lang)

    if (index >= 0) {
      this.selectedKnowLangs.splice(index, 1)
    }
  }

  add(event: MatChipInputEvent): void {
    this.savebtnDisable = false
    const input = event.input
    const value = event.value as unknown as ILanguages

    // Add our fruit
    if ((value || '')) {
      this.selectedKnowLangs.push(value)
    }

    // Reset the input value
    if (input) {
      input.value = ''
    }
    this.knownLanguagesInputRef.nativeElement.value = ''
  }

  // private populateChips(data: any) {
  //   if (data.personalDetails.knownLanguages && data.personalDetails.knownLanguages.length) {
  //     data.personalDetails.knownLanguages.map((lang: ILanguages) => {
  //       if (lang) {
  //         this.selectedKnowLangs.push(lang)
  //       }
  //     })
  //   }
  // }

  professionalChange(value: any) {
    this.savebtnDisable = false
    if (value === 'Healthcare Worker') {
      this.rnShow = true
      this.showDesignation = true
      this.orgTypeField = false
      this.professionOtherField = false
    } else if (value === 'Healthcare Volunteer') {
      this.orgTypeField = false
      this.professionOtherField = false
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
    } else if (value === 'Others') {
      this.rnShow = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.professionOtherField = true
      this.orgTypeField = false
    } else {
      this.orgTypeField = true
      this.rnShow = false
      this.professionOtherField = false
      this.personalDetailForm.controls.regNurseRegMidwifeNumber.setValue(null)
      this.personalDetailForm.controls.orgType.setValue(null)
    }
  }

  fieldChange() {
    this.savebtnDisable = false
  }

  onDateChange(event: any) {
    const customerDate = moment(event)
    const dateNow = moment(new Date())
    const duration = moment.duration(dateNow.diff(customerDate))
    if (duration.asYears() > 18) {
      this.invalidDob = false
      this.savebtnDisable = false
    } else {
      this.invalidDob = true
      this.savebtnDisable = true
    }
  }

  updateForm() {
    if (this.userProfileData && this.userProfileData.personalDetails) {
      const data = this.userProfileData

      // this.profileUserName = `${data.personalDetails.firstname} `
      // if (data.personalDetails.middlename) {
      //   this.profileUserName += `${data.personalDetails.middlename} `
      // }
      // if (data.personalDetails.surname) {
      //   this.profileUserName += `${data.personalDetails.surname}`
      // }

      // if (data.personalDetails.dob) {

      //   this.getDateFromText(data.personalDetails.dob)
      // }

      data.professionalDetails[0].orgType === 'Others' ? this.orgOthersField = true : this.orgOthersField = false
      data.professionalDetails[0].profession === 'Others' ? this.professionOtherField = true : this.professionOtherField = false
      data.professionalDetails[0].profession === 'Healthcare Worker' ? this.rnShow = true : this.rnShow = false
      this.personalDetailForm.patchValue({
        // userName: this.profileUserName,
        firstname: data.personalDetails.firstname,
        surname: data.personalDetails.surname,
        dob: this.getDateFromText(data.personalDetails.dob),
        profession: data.professionalDetails[0].profession,
        professionOtherSpecify: data.professionalDetails[0].professionOtherSpecify,
        regNurseRegMidwifeNumber: data.personalDetails.regNurseRegMidwifeNumber,
        orgType: data.professionalDetails[0].orgType,
        orgOtherSpecify: data.professionalDetails[0].orgOtherSpecify,
        organizationName: data.professionalDetails[0].name,
        nationality: data.personalDetails.nationality,
        domicileMedium: data.personalDetails.domicileMedium,
        gender: data.personalDetails.gender,
        maritalStatus: data.personalDetails.maritalStatus,
        mobile: data.personalDetails.mobile,
        postalAddress: this.getAddress(data.personalDetails.postalAddress),
        pincode: data.personalDetails.pincode,
        designation: data.professionalDetails[0].designation,
      })

      this.trackFormChanges()
    }
    this.loadDob = true
    
  }

  private getDateFromText(dateString: string): any {
    if (dateString) {
      const splitValues: string[] = dateString.split('/')
      const [dd, mm, yyyy] = splitValues
      const dateToBeConverted = `${dd}/${mm}/${yyyy}`
      return dateToBeConverted
    }
    return ''
  }

  getAddress(data) {
    console.log("upadte data", data)
    if (data) {
      const splitValues: string[] = data.split(',').map(item => item.trim())
      console.log("split data", splitValues)
      this.personalDetailForm.patchValue({
        country: splitValues[0],
        state: splitValues[1],
        distict: this.updateDistrict(splitValues[2], splitValues[1]),
        countryCode: this.setCountryCode(splitValues[0]),
      })

      if (splitValues[0] === 'India') {
        this.selectDisable = false
        this.address = splitValues[0] + ', ' + splitValues[1] + ', ' + splitValues[2]
      } else {
        this.selectDisable = true
        this.address = splitValues[0]
      }
    }

    return this.address

  }

  orgTypeSelect(option: any) {
    this.savebtnDisable = false
    if (option !== 'null') {
      this.personalDetailForm.controls.orgType.setValue(option)
    } else {
      this.personalDetailForm.controls.orgType.setValue(null)
    }

    if (option === 'Others') {
      this.orgOthersField = true
      this.personalDetailForm.controls.orgOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      this.orgOthersField = false
      this.personalDetailForm.controls.orgOtherSpecify.clearValidators()
      this.personalDetailForm.controls.orgOtherSpecify.setValue('')
    }
  }
  nameFocus() {
    this.firstName.nativeElement.focus();
  }

  openConfirmModal(form: any) {
    // Only show popup if firstname or surname was changed
    const firstname = this.personalDetailForm.get('firstname').value;
    const surname = this.personalDetailForm.get('surname').value;
    const msgOne = this.translate.instant('NAME_CHANGE_MSG')
    const msgTwo = this.translate.instant('NAME_CHANGE_UPDATE')
    if (firstname || surname) {
      const dialogopen = this.dialog.open(ProfileModalComponent, {
        panelClass: 'auth-alert-modal',
        disableClose: true,
        data: {
          type: 'caAlert',
          msgOne,
          msgTwo,
          first: firstname,
          last: surname
        },
      }
      );

      dialogopen.afterClosed().subscribe((res: any) => {
        if (res.event == 'EDIT') {
          this.nameFocus()
        } else if (res.event == 'CONFIRMED') {
          this.proceedtoSubmit(form);
        }
      })
    }
  }

  onSubmit(form: any) {

    // Track changes for firstname
    if (form.value.firstname !== this.initialFirstname) {
      this.formChanged = true;
    }
    // Track changes for surname
    if (form.value.surname !== this.initialSurname) {
      this.formChanged = true;
    }
    if (this.formChanged) {
      this.openConfirmModal(form);
    } else {
      this.proceedtoSubmit(form);
    }

  }

  async proceedtoSubmit(form: any) {
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }

    console.log("form data", form.value)
    let profileRequest = constructReq(form.value, this.userProfileData)
    const preferences = {
      preferences: {
        language: _.get(this.userDetails, 'profileDetails.preferences.language') ? _.get(this.userDetails, 'profileDetails.preferences.language') : this.defaultLanguage
      }
    }
    profileRequest = Object.assign(profileRequest, preferences)
    const appName = await this.appFrameworkDetectorService.detectAppFramework();
    console.log('appName', appName);
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: {
          profileLocation: `${appName}/presonal-detail-edit`,
          profileReq: {
            ...profileRequest.profileReq,
            personalDetails: {
              ...profileRequest.profileReq.personalDetails,
              profileLocation: `${appName}/presonal-detail-edit`,
            }
          }
        },
      },
    }

    this.userProfileSvc.updateProfileDetails(reqUpdate).pipe(mergeMap((res: any) => {

      return this.userProfileSvc.getUserdetailsFromRegistry(this.userID)

    })).subscribe(async (res) => {

      if (res) {
        this.generateInteractTelemetry('update-user-profile-success')
        this.localStorage.setLocalStorage(storageKeys.userProfile, res)
        await this.userProfileSvc.updateProfileData(res)
        this.openSnackbar(this.toastSuccess.nativeElement.value)
        this.router.navigate(['/app/personal-detail-list'])
      }

    }, (error) => {
      this.generateErrorTelemetry(error)
    })
  }

     generateInteractTelemetry( action) {
          this.telemetryGeneratorService.generateInteractTelemetry(
            InteractType.UPDATE_PROFILE,
            action,
            PageId.PROFILE,
            Environment.HOME
          );
      }
        generateErrorTelemetry(error) {
            this.telemetryGeneratorService.generateErrorTelemetry(
              Environment.HOME,
              'update-user-profile',
              '',
              PageId.PROFILE,
              JSON.stringify(error)
            );
        }

  private openSnackbar(message: string) {
    this.matSnackBar.open(message)
  }

  // changeLanguage() {
  //   this.langDialog = this.dialog.open(LanguageDialogComponent, {
  //     panelClass: 'language-modal',
  //     data: {
  //       selected: this.preferedLanguage,
  //     },
  //   })

  //   this.langDialog.afterClosed().subscribe((result: any) => {
  //     console.log(result, !!result)
  //     if (result) {
  //       this.preferedLanguage = result
  //       this.personalDetailForm.controls.
  //         knownLanguage.setValue(_.upperFirst(result.lang))

  //       if (this.configSvc.userProfile) {
  //         let user: any
  //         const userid = this.configSvc.userProfile.userId
  //         // this.userProfileSvc.getUserdetailsFromRegistry(userid).subscribe((data: any) => {
  //           // user = data
  //           user = this.userDetails
  //           const obj = {
  //             preferences: {
  //               language: result.id,
  //             },
  //           }
  //           const userdata = Object.assign(user['profileDetails'], obj)
  //           // this.chosenLanguage = path.value
  //           const reqUpdate = {
  //             request: {
  //               userId: userid,
  //               profileDetails: userdata,
  //             },
  //           }

  //             this.userProfileSvc.updateProfileDetails(reqUpdate).pipe(mergeMap((res: any) => {
  //               return this.userProfileSvc.getUserdetailsFromRegistry(userid)
  //             })).subscribe(async(res) => {
  //               // this.userHomeSvc.userRead(userId)
  //               this.localStorage.setLocalStorage(storageKeys.userProfile, res)
  //               await this.userProfileSvc.updateProfileData(res)
  //               this.commonUtilService.updateAppLanguage(result.id);
  //               this.router.navigate([`/page/home`])
  //             })
  //         // })
  //       }
  //     }
  //   })
  // }

  dobData(event: any) {
    // console.log(event)
    this.personalDetailForm.patchValue({
      dob: event,
    })
    // console.log(this.personalDetailForm)
  }
  ngAfterViewInit(): void {
    this.getUserDetails()
    
  }
  ngAfterViewChecked(): void {
    this.changeDetectorRef.markForCheck()
    this.changeDetectorRef.detectChanges()
  }
}
