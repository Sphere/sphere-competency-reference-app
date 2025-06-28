import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { IGovtOrgMeta, IProfileAcademics } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model';
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import * as _ from 'lodash';
import districtsList from 'assets/fusion-assets/files/district.json'
import { UserService } from '../../home/services/user.service';
import { storageKeys } from '../../../../app/manage-learn/storageKeys';
import { LocalStorageService } from '../../../../app/manage-learn/core';
import { mergeMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AppFrameworkDetectorService } from '../../../modules/core/services/app-framework-detector-service.service';
import { Environment, ErrorCode, ErrorType, InteractType, PageId, TelemetryGeneratorService } from '../../../../services';

@Component({
  selector: 'ws-almost-done',
  templateUrl: './almost-done.component.html',
  styleUrls: ['./almost-done.component.scss'],
})
export class AlmostDoneComponent implements OnInit {

  @Input() yourBackground: any
  @Input() backgroundSelect: any
  @Input() selectedProfession?: any
  @Input() selectedBackground: any
  @Output() redirectToParent = new EventEmitter()
  createUserForm!: UntypedFormGroup
  almostDoneForm!: UntypedFormGroup
  professionOthersField = false
  orgOthersField = false
  rnFieldDisabled = true
  userId = ''
  firstName = ''
  middleName = ''
  lastName = ''
  email = ''
  govtOrgMeta!: IGovtOrgMeta
  masterNationalities: any = []
  public degrees!: UntypedFormArray
  profession = ''
  studentInstitute = ''
  studentCourse = ''
  selectedAddress = ''
  enableSubmit = false
  errorMsg = 'Invalid.Please correct and try again';
  ashaVolunteerProfessions = ['ASHA']
  facultyVolunteerProfessions = ['Nursing Faculty', 'Medical Faculty', 'Others']
  studentVolunteerProfessions = ['Bsc nursing', 'GNM', 'ANM/MPW', 'Midwife', 'Medical Student', 'Others'];
  healthWorkerProfessions = ['Midwives', 'GNM', 'Doctors', 'Public Health Professionals', 'Paramedical', 'Pharmacist', 'Community Health Officer (CHO)', 'BSC Nurse', 'ANM/MPW', 'Others']
  healthVolunteerProfessions = ['Anganwadi Workers', 'Mukhya Sevika (MS)', 'Child Development Project Officer (CDPO)', 'District Programme Officer (DPO)', 'BSC Nurse', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  districtUrl = '/fusion-assets/files/district.json';
  disticts: any
  selectedBg = ''
  blockEntered = false
  subcentreEntered = false
  hideAsha = false
  userData: any
  defaultLang: any
  isRnNumber: boolean = true;
  isOthers: boolean;
  whatsupNotification = false
  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
    private activateRoute: ActivatedRoute,
    private http: HttpClient,
    private userHomeSvc: UserService,
    private localStorage: LocalStorageService,
    public translate: TranslateService,
    private appFrameworkDetectorService:AppFrameworkDetectorService,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
  }

  ngOnInit() {
    this.almostDoneForm = this.almostDoneFormFields()
    this.createUserForm = this.createUserFormFields()
    if (this.yourBackground.value.country !== 'India') {
      this.hideAsha = true
    } else {
      this.hideAsha = false
    }
    if (this.backgroundSelect === 'ASHA') {
      this.enableSubmit = true
      this.almostDoneForm.controls.locationselect.setValue(this.yourBackground.value.distict)
      this.userProfileSvc.getData(this.districtUrl).subscribe((statesdata: any) => {
        _.get(statesdata, 'states', districtsList.states).map((item: any) => {
          if (item.state === this.yourBackground.value.state) {
            this.disticts = item.districts
          }
        })
      })
    }

    this.setProfession()
    this.setFormFields()
  }

  redirectToYourBackground() {
    this.redirectToParent.emit('true')
  }
  changeWhatsupNotifification() {
    this.whatsupNotification = false
  }
  chooseBackground(data: any) {
    this.selectedBg = data
    if (this.selectedBg === 'Mother/Family Members') {
      this.enableSubmit = false
    }
    if (this.selectedBg === 'Asha Facilitator' || this.selectedBg === 'Asha Trainer') {
      this.enableSubmit = true
      this.almostDoneForm.controls.locationselect.setValue(this.yourBackground.value.distict)
      this.http.get(this.districtUrl).subscribe((statesdata: any) => {
        statesdata.states.map((item: any) => {
          if (item.state === this.yourBackground.value.state) {
            this.disticts = item.districts
          }
        })
      })
    }
  }

  almostDoneFormFields() {
    return new UntypedFormGroup({
      selectBackground: new UntypedFormControl(),
      professSelected: new UntypedFormControl(),
      block: new UntypedFormControl(),
      subcentre: new UntypedFormControl(),
      locationselect: new UntypedFormControl(),
      profession: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      rnNumber: new UntypedFormControl('', [Validators.pattern(/[^\s]/)]),
      orgType: new UntypedFormControl(),
      orgName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      professionOtherSpecify: new UntypedFormControl(),
      designationName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      orgOtherSpecify: new UntypedFormControl(),
      instituteName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      courseName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      othersProfession: new UntypedFormControl(),
    })
  }

  createUserFormFields() {
    return new UntypedFormGroup({
      firstname: new UntypedFormControl('', []),
      middlename: new UntypedFormControl('', []),
      surname: new UntypedFormControl('', []),
      about: new UntypedFormControl(''),
      countryCode: new UntypedFormControl('', []),
      mobile: new UntypedFormControl('', []),
      telephone: new UntypedFormControl('', []),
      primaryEmail: new UntypedFormControl('', []),
      primaryEmailType: new UntypedFormControl('', []),
      secondaryEmail: new UntypedFormControl('', []),
      nationality: new UntypedFormControl('', []),
      dob: new UntypedFormControl('', []),
      domicileMedium: new UntypedFormControl('', []),
      regNurseRegMidwifeNumber: new UntypedFormControl('', []),
      knownLanguages: new UntypedFormControl([], []),
      residenceAddress: new UntypedFormControl('', []),
      schoolName10: new UntypedFormControl('', []),
      yop10: new UntypedFormControl('', []),
      schoolName12: new UntypedFormControl('', []),
      yop12: new UntypedFormControl('', []),
      degrees: this.fb.array([this.createDegree()]),
      postDegrees: this.fb.array([this.createDegree()]),
      certificationDesc: new UntypedFormControl('', []),
      interests: new UntypedFormControl([], []),
      hobbies: new UntypedFormControl([], []),
      skillAquiredDesc: new UntypedFormControl('', []),
      isGovtOrg: new UntypedFormControl(false, []),
      orgName: new UntypedFormControl('', []),
      orgNameOther: new UntypedFormControl('', []),
      industry: new UntypedFormControl('', []),
      industryOther: new UntypedFormControl('', []),
      designation: new UntypedFormControl('', []),
      profession: new UntypedFormControl('', []),
      location: new UntypedFormControl('', []),
      locationOther: new UntypedFormControl('', []),
      doj: new UntypedFormControl('', []),
      orgDesc: new UntypedFormControl('', []),
      payType: new UntypedFormControl('', []),
      service: new UntypedFormControl('', []),
      cadre: new UntypedFormControl('', []),
      allotmentYear: new UntypedFormControl('', []),
      otherDetailsDoj: new UntypedFormControl('', []),
      civilListNo: new UntypedFormControl('', []),
      employeeCode: new UntypedFormControl('', []),
      otherDetailsOfficeAddress: new UntypedFormControl('', []),
      otherDetailsOfficePinCode: new UntypedFormControl('', []),
      residenceState: new UntypedFormControl('', []),
      residenceDistrict: new UntypedFormControl('', []),
      orgType: new UntypedFormControl('', []),
    })
  }

  createDegree(): UntypedFormGroup {
    return this.fb.group({
      degree: new UntypedFormControl('', []),
      instituteName: new UntypedFormControl('', []),
      yop: new UntypedFormControl('', []),
    })
  }

  setProfession() {
    if (this.selectedProfession) {
      this.almostDoneForm.controls.profession.setValue(this.selectedProfession)
      this.createUserForm.controls.designation.setValue(this.selectedProfession)
    } else {
      this.almostDoneForm.controls.profession.setValue(null)
    }
  }

  setFormFields() {
    if (this.selectedBackground.name === 'Healthcare Worker') {
      if (this.selectedProfession === 'Midwife' || this.selectedProfession === 'GNM' || this.selectedProfession === 'ANM/MPW' || this.selectedProfession === 'B. Sc Nurse') {
        this.isRnNumber = true
      } else {
        this.almostDoneForm.controls.rnNumber.setValue(null)
        this.isRnNumber = false
      }
    } else if (this.selectedBackground.name === "Others") {
      if (this.selectedProfession === "Others") {
        this.isOthers = true;
      } else {
        this.isOthers = false;
      }
    }
  }

  professionSelect(option: any) {
    if (option !== 'null') {
      this.createUserForm.controls.designation.setValue(option)
      this.almostDoneForm.controls.profession.setValue(option)
    } else {
      this.almostDoneForm.controls.profession.setValue(null)
    }

    if (option === 'Others') {
      this.professionOthersField = true
      this.almostDoneForm.controls.professionOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      this.professionOthersField = false
      this.almostDoneForm.controls.professionOtherSpecify.clearValidators()
      this.almostDoneForm.controls.professionOtherSpecify.setValue(null)
    }

    if (option === 'Midwives' || option === 'ANM' || option === 'GNM' || option === 'BSC Nurse' || option === 'ANM/MPW') {
      this.rnFieldDisabled = false
    } else {
      this.almostDoneForm.controls.rnNumber.setValue(null)
      this.rnFieldDisabled = true
    }
  }
  orgTypeSelect(option: any) {
    if (option !== 'null') {
      this.almostDoneForm.controls.orgType.setValue(option)
    } else {
      this.almostDoneForm.controls.orgType.setValue(null)
    }

    if (option === 'Others') {
      this.orgOthersField = true
      this.createUserForm.controls.orgOtherSpecify.setValue(null)
      this.almostDoneForm.controls.orgOtherSpecify.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z][^\s]/)])
    } else {
      this.orgOthersField = false
      this.almostDoneForm.controls.orgOtherSpecify.clearValidators()
      this.almostDoneForm.controls.orgOtherSpecify.setValue(null)
    }
  }
  onsubmit() {
    this.selectedAddress = this.yourBackground.value.country
    if (this.yourBackground.value.state) {
      this.selectedAddress += ', ' + `${this.yourBackground.value.state}`
    }
    if (this.yourBackground.value.distict) {
      this.selectedAddress += ', ' + `${this.yourBackground.value.distict}`
    }

    if(this.backgroundSelect === 'ASHA'){
      this.almostDoneForm.controls.profession.setValue(this.backgroundSelect)
      this.createUserForm.controls.designation.setValue(this.backgroundSelect)
    }

    if( this.isOthers){
      this.almostDoneForm.controls.selectBackground.setValue(this.almostDoneForm.controls.profession.value)
    }
    this.updateProfile()
  }

  assignFields(qid: any, data: any, event: any) {
    const value = data.trim()
    switch (qid) {
      case 'profession':
      case 'designation':
      case 'others':
      case 'Others - Please Specify':
        this.createUserForm.controls.designation.setValue(value)
        break
      case 'organizationType':
        this.createUserForm.controls.orgType.setValue(value)
        break
      case 'organizationName':
        this.createUserForm.controls.orgName.setValue(value)
        break
      case 'institutionName':
        if (this.profession === 'faculty') {
          this.createUserForm.controls.orgName.setValue(value)
        } else {
          this.studentInstitute = value
        }
        break
      case 'coursename':
        this.studentCourse = value
        break
      case 'locationselect':
        this.almostDoneForm.controls.locationselect.setValue(value)
        break
      case 'block':
        if (value && value !== '') {
          this.blockEntered = true
        } else {
          this.blockEntered = false
        }
        break
      case 'subcentre':
        if (value && value !== '') {
          this.subcentreEntered = true
        } else {
          this.subcentreEntered = false
        }
        break
      default:
        break
    }
    if (this.blockEntered && this.subcentreEntered) {
      this.enableSubmit = false
    } else {
      this.enableSubmit = true
    }

    if (this.backgroundSelect === 'Healthcare Volunteer' || this.backgroundSelect === 'Healthcare Worker') {
      // tslint:disable-next-line
      this.almostDoneForm.valueChanges.subscribe(value => {
        if (value.professSelected || value.professionOtherSpecify || value.orgOtherSpecify && value.orgType && value.orgName) {
          this.enableSubmit = false
        } else {
          this.enableSubmit = true
        }
      })
      // if (this.almostDoneForm.value.professSelected && this.almostDoneForm.value.orgType && this.almostDoneForm.value.orgName) {
      //   this.enableSubmit = false
      // }
    }
    if (this.backgroundSelect === 'ASHA') {
      // tslint:disable-next-line
      this.almostDoneForm.valueChanges.subscribe(value => {
        if (value.block && value.subcentre) {
          this.enableSubmit = false
        } else {
          this.enableSubmit = true
        }
      })
      // if (this.almostDoneForm.value.block && this.almostDoneForm.value.subcentre) {
      //   this.enableSubmit = false
      // }
    }
    if (this.backgroundSelect === 'Student') {
      // tslint:disable-next-line
      this.almostDoneForm.valueChanges.subscribe(value => {
        if (value.instituteName) {
          this.enableSubmit = false
        } else {
          this.enableSubmit = true
        }
      })
    }

    // if (this.backgroundSelect === 'Healthcare Worker') {
    //   this.almostDoneForm.valueChanges.subscribe(value => {
    //     if (value.professSelected || value.professionOtherSpecify && value.orgOtherSpecify && value.orgType && value.orgName) {
    //       this.enableSubmit = false
    //     } else {
    //       this.enableSubmit = true
    //     }
    //   })

    //   // if (this.almostDoneForm.value.orgType && this.almostDoneForm.value.orgName) {
    //   //   this.enableSubmit = false
    //   // }
    // }
    if (this.profession === 'student' && this.studentInstitute) {
      this.degrees = this.createUserForm.get('degrees') as UntypedFormArray
      this.degrees.removeAt(0)
      this.degrees.push(this.fb.group({
        degree: new UntypedFormControl(this.studentCourse, []),
        instituteName: new UntypedFormControl(this.studentInstitute, []),
        yop: new UntypedFormControl('', []),
      }))
    }

    if (Object.keys(event).length && this.almostDoneForm.dirty) {
      this.enableSubmit = false
    }
  }

  private getOrganisationsHistory() {
    const organisations: any = []
    const org = {
      orgType: this.almostDoneForm.value.orgType,
      orgOtherSpecify: this.almostDoneForm.value.orgOtherSpecify,
      name: this.almostDoneForm.value.orgName.trim(),
      nameOther: '',
      designation: this.almostDoneForm.value.profession.trim(),
      profession: this.backgroundSelect,
      location: '',
      doj: '',
      completePostalAddress: '',
    }

    if (this.backgroundSelect === 'ASHA') {
      org['locationselect'] = this.almostDoneForm.value.locationselect
      org['block'] = this.almostDoneForm.value.block
      org['subcentre'] = this.almostDoneForm.value.subcentre
    }
    if (this.backgroundSelect === 'Others') {
      org['selectBackground'] = this.almostDoneForm.value.selectBackground
    }

    // tslint:disable-next-line:max-line-length
    if ((this.backgroundSelect === 'Others' && this.selectedBg === 'Asha Facilitator') || (this.backgroundSelect === 'Others' && this.selectedBg === 'Asha Trainer')) {
      org['selectBackground'] = this.almostDoneForm.value.selectBackground
      org['locationselect'] = this.almostDoneForm.value.locationselect
      org['block'] = this.almostDoneForm.value.block
      org['subcentre'] = this.almostDoneForm.value.subcentre
    }
    if (this.backgroundSelect === 'Student') {
      org['qualification'] = this.almostDoneForm.value.courseName
      org['instituteName'] = this.almostDoneForm.value.instituteName
    }

    organisations.push(org)
    return organisations
  }

  getDegree(degreeType: string): IProfileAcademics[] {
    const formatedDegrees: IProfileAcademics[] = []
    formatedDegrees.push({
      nameOfQualification: this.studentCourse,
      type: degreeType,
      nameOfInstitute: this.studentInstitute,
      yearOfPassing: '',
    })
    return formatedDegrees
  }
  private getAcademics() {
    const academics = []
    // @ts-ignore
    academics.push(...this.getDegree('GRADUATE'))
    return academics
  }

  private constructReq() {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.unMappedUser.id || ''
      this.email = this.configSvc.userProfile.email || ''
      this.firstName = this.configSvc.userProfile.firstName || ''
      this.middleName = this.configSvc.userProfile.middleName || ''
      this.lastName = this.configSvc.userProfile.lastName || ''
    }

    const userObject = {
      firstname: this.firstName,
      middlename: this.middleName,
      surname: this.lastName,
      dob: this.yourBackground.value.dob,
      regNurseRegMidwifeNumber: this.almostDoneForm.value.rnNumber ? this.almostDoneForm.value.rnNumber : '[NA]',
      countryCode: this.yourBackground.value.countryCode,
      primaryEmail: this.email,
      postalAddress: this.selectedAddress,
    }
    Object.keys(userObject).forEach(key => {
      if (userObject[key] === '') {
        delete userObject[key]
      }
    })

    const profileReq = {
      id: this.userId,
      userId: this.userId,
      personalDetails: userObject,
      academics: this.getAcademics(),
      employmentDetails: {},
      professionalDetails: [
        // @ts-ignore
        ...this.getOrganisationsHistory(),
      ],
      skills: {
        additionalSkills: '',
        certificateDetails: '',
      },
      interests: {
        professional: '',
        hobbies: '',
      },
    }

    return { profileReq }
  }

  async updateProfile() {
    const profileRequest = this.constructReq()
    this.userId = _.get(this.configSvc, 'unMappedUser.id', '')
    this.userHomeSvc.userRead(this.userId)
    // this.userHomeSvc.updateValue$.subscribe(async (res: any) => {
    if (this.configSvc && this.configSvc.userProfile.language) {
      if (_.get(this.configSvc, 'userProfile.language')) {
        const code = _.get(this.configSvc, 'userProfile.language')
        this.defaultLang = code;

      }
    }
    // })
    // let reqObj = localStorage.getItem(`preferedLanguage`) || ''
    // let obj1 = reqObj === '' ? reqObj : JSON.parse(reqObj)
    const obj = {
      preferences: {
        // language: obj1.id,
        language: this.defaultLang ? this.defaultLang : 'en'
      },
    }
    const userdata = Object.assign(profileRequest, obj)
    const appName = await this.appFrameworkDetectorService.detectAppFramework();
    console.log('appName', appName);
    const reqUpdate = {
      request: {
        userId: this.userId,
        profileDetails: {
          profileLocation: `${appName}/almost-done`,
          profileReq: {
            ...userdata.profileReq,
            personalDetails: {
              ...userdata.profileReq.personalDetails,
              profileLocation: `${appName}/work-info-edit`
            }
          }
        },
      },
    }
    
    this.userProfileSvc.updateProfileDetails(reqUpdate).pipe(mergeMap((res: any) => {
      return this.userProfileSvc.getUserdetailsFromRegistry(this.userId)
    })).subscribe(async (res:any) => {
      if (res) {
        this.localStorage.setLocalStorage(storageKeys.userProfile, res)
        this.openSnackbar(this.translate.instant('USER_PROFILE_DETAILS_UPDATED_SUCCESSFULLY'));
        this.generateInteractTelemetry('success');
        localStorage.removeItem('preferedLanguage')
        if(res?.phone?.trim()){
           this.whatsupNotification = true
        }else {
          this.router.navigate(['/page/home'])
        }
      }
    }, (error) => {
      this.generateErrorTelemetry(error)
    })
  }
  
  generateInteractTelemetry(action) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.UPDATE_PROFILE,
      action,
      Environment.HOME,
      PageId.PROFILE
    );
  }
  generateErrorTelemetry(error) {
      this.telemetryGeneratorService.generateErrorTelemetry(
        Environment.HOME,
        'update-user-profile',
        ErrorType.SYSTEM,
        PageId.LOGIN,
        JSON.stringify(error)
      );
    }

  private openSnackbar(primaryMsg: string, duration: number = 2000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

}
