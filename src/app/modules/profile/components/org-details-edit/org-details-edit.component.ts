import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import backGroundList from 'assets/fusion-assets/files/professions.json'
import * as _ from 'lodash';
import { constructReq } from '../request-util';
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonUtilService, Environment, ErrorType, PageId, TelemetryGeneratorService } from '../../../../../services';
import districtsList from 'assets/fusion-assets/files/district.json';
import { mergeMap } from 'rxjs/operators';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { LocalStorageService } from '../../../../../app/manage-learn/core';
import { storageKeys } from '../../../../../app/manage-learn/storageKeys';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'app-org-details-edit',
  templateUrl: './org-details-edit.component.html',
  styleUrls: ['./org-details-edit.component.scss'],
})
export class OrgDetailsEditComponent implements OnInit {

  backgroundDetails = ['Healthcare Worker', 'Healthcare Volunteer', 'ASHA', 'Student', 'Faculty', 'Others']
  orgTypes = ['Public/Government Sector', 'Private Sector', 'NGO', 'Academic Institue- Public ', 'Academic Institute- Private', 'Others']
  healthWorkerProfessions = ['Midwives', 'GNM', 'Doctors', 'Public Health Professionals', 'Paramedical', 'Pharmacist', 'Community Health Officer (CHO)', 'BSC Nurse', 'ANM/MPW', 'Others']
  healthVolunteerProfessions = ['Anganwadi Workers', 'Mukhya Sevika (MS)', 'Child Development Project Officer (CDPO)', 'District Programme Officer (DPO)', 'BSC Nurse', 'Others']
  otherBackground = ['Asha Facilitator', 'Asha Trainer', 'Anganwadi Worker' , 'Mukhya Sevika (MS)', 'District programme officer (DPO)', 'Child development project officer (CDPO)','Other' ]

  ashaVolunteerProfessions = ['ASHA']
  facultyVolunteerProfessions = ['Nursing Faculty', 'Medical Faculty', 'Others']
  studentVolunteerProfessions = ['Bsc nursing', 'GNM', 'ANM/MPW', 'Midwife', 'Medical Student', 'Post graduate', 'Others'];

  back
  orgForm: UntypedFormGroup
  defaultField: boolean = true;
  userID: string;
  userProfileData: any;
  disticts: any
  districtUrl = '/fusion-assets/files/district.json';
  country: string;
  distict: string;
  state: string;
  rnFieldDisabled:boolean = false;
  userDetails: any
  defaultLanguage;
  appFramework: any

  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>

  constructor(
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private snackBar: MatSnackBar,
    private router: Router,
    private commonUtilService: CommonUtilService,
    private localStorage: LocalStorageService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) { 
    this.organizationForm()
    this.getDefaultLanguage();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // console.log("org params", params)
      this.updateOrgForm(params)
      if (params.country !== 'India') {
        this.backgroundDetails = _.get(backGroundList, 'professions', backGroundList.professions).filter((s: any) => {
          return s.name !== 'ASHA'
        })
      }else {
        this.backgroundDetails = _.get(backGroundList, 'professions', backGroundList.professions)
      }
    })
    this.fetchBasics();
  }

  async fetchBasics(){
    await this.getUserDetails();
    this.manageDisticts();
  }

  manageDisticts(){
    this.userProfileSvc.getData(this.districtUrl).subscribe((statesdata: any) => {
      _.get(statesdata, 'states', districtsList.states).map((item: any) => {
        if (item.state === this.state) {
          this.disticts = item.districts
        }
      })
    })
  }

  getAddress(data) {
    let self = this;
    return new Promise(function(resolve) {
      if (data) {
          var splitValues = data.split(', ');
          self.country = splitValues[0];
          self.state = splitValues[1];
          self.distict = splitValues[2];
          if (self.country !== 'India') {
            self.backgroundDetails = _.get(backGroundList, 'professions', backGroundList.professions).filter((s: any) => {
              return s.name !== 'ASHA'
            })
          }else {
            self.backgroundDetails = _.get(backGroundList, 'professions', backGroundList.professions)
          }
          resolve(true);
      }else{
        resolve(true);
      }
    });
  }

  organizationForm() {
    return this.orgForm = this.fb.group({
      selectBackground: new UntypedFormControl(),
      professSelected: new UntypedFormControl(),
      professionOtherSpecify: new UntypedFormControl(),
      orgType: new UntypedFormControl(),
      orgName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      orgOtherSpecify: new UntypedFormControl(),
      rnNumber: new UntypedFormControl('', [Validators.pattern(/[^\s]/)]),     
      block: new UntypedFormControl(),
      subcentre: new UntypedFormControl(),
      locationselect: new UntypedFormControl(),
      profession: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      designationName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      instituteName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
      courseName: new UntypedFormControl('', [Validators.pattern(/^[a-zA-Z][^\s]/)]),
    })
  }

  isRNFieldDisabled(){
    let selected = this.orgForm.value.professSelected ? this.orgForm.value.professSelected.trim() : "";
    if (['Midwives', 'ANM', 'GNM', 'BSC Nurse', 'ANM/MPW'].includes(selected)) {
      return false;
    } else {
      this.orgForm.controls.rnNumber.setValue(null)
      return true;
    }
  }

  updateOrgForm(data){
    this.orgForm.patchValue({
      selectBackground: data.selectBackground,
      professSelected: data.designation ,
      professionOtherSpecify: data.professionOtherSpecify,
      orgType: data.orgType,
      orgName: data.name,
      orgOtherSpecify:data.orgOtherSpecify,
      rnNumber:data.rnNumber,     
      block: data.block,
      subcentre:data.subcentre,
      locationselect: data.locationselect,
      profession: data.profession,
      designationName: "" ,
      instituteName: data.instituteName,
      courseName: data.qualification
    })

    if(data.profession == "Healthcare Worker"){
      this.defaultField = true
    }else{
      this.defaultField = false
    }
  }

  backgroundChange(value: any) {
    this.orgForm.controls.professSelected.clearValidators();
    this.orgForm.controls.professSelected.setValue(null);
    this.orgForm.controls.orgType.clearValidators();
    this.orgForm.controls.orgType.setValue(null);
    if(value == 'Healthcare Worker'){
      this.defaultField = true
      this.orgForm.controls.professSelected.setValidators([Validators.required])
      this.orgForm.controls.orgType.setValidators([Validators.required]);
    }else if(value == 'Healthcare Volunteer'){
      this.defaultField = false;
      this.orgForm.controls.professSelected.setValidators([Validators.required]);
    }else if(value == 'Student'){
      this.defaultField = false
      this.orgForm.controls.professSelected.setValidators([Validators.required]);
    }else if(value == 'Faculty'){
      this.defaultField = false
      this.orgForm.controls.professSelected.setValidators([Validators.required]);
    }else if(value == 'Others'){
      this.defaultField = false
      this.orgForm.controls.selectBackground.setValue(null);
      this.orgForm.controls.orgType.setValidators([Validators.required]);
    }else if(value == 'ASHA'){
      this.defaultField = false;
      this.orgForm.controls.locationselect.setValue(this.userProfileData.personalDetails.postalAddress.split(', ')[2]);
      this.orgForm.controls.locationselect.setValidators([Validators.required]);
    }
  }

  getUserDetails() {
    let self = this;
    return new Promise(function(resolve) {
      if (self.configSvc.userProfile) {
        self.userProfileSvc.getUserdetailsFromRegistry(self.configSvc.unMappedUser.id).subscribe(
          async (data: any) => {
            if (data) {
              self.userDetails = data;
              self.userProfileData = data.profileDetails.profileReq;
              await self.getAddress(data.profileDetails.profileReq.personalDetails.postalAddress);
              resolve(true)
            }else{
              resolve(true) 
            }
          })
      }else{
        resolve(true)
      }
    });
  }

  async onsubmit(data){
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    let formatedData = this.getOrganisationsHistory()

    let profileRequest = constructReq(formatedData[0], this.userProfileData)
    const preferences = {
      preferences: {
        language: _.get(this.userDetails, 'profileDetails.preferences.language') ? _.get(this.userDetails, 'profileDetails.preferences.language') : this.defaultLanguage
      }
    }
    const appName = await this.appFrameworkDetectorService.detectAppFramework();
    console.log('appName', appName);
    profileRequest = Object.assign(profileRequest, preferences)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: {
          profileLocation: `${appName}/org-edit`,
          profileReq: {
            ...profileRequest.profileReq,
            personalDetails: {
              ...profileRequest.profileReq.personalDetails,
              profileLocation: `${appName}/org-edit`,
            }
          }
        },
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).pipe(
      mergeMap((res: any) => {
        return this.userProfileSvc.getUserdetailsFromRegistry(this.userID)
      })
    ).subscribe(
      async (res: any) => {
        if (res) {
          data.reset();
          this.localStorage.setLocalStorage(storageKeys.userProfile, res)
          await this.userProfileSvc.updateProfileData(res)
          this.userProfileSvc._updateuser.next('true')
          this.commonUtilService.addLoader()
          this.router.navigate(['/app/organization-list'])
        }
      }, (err) => {
        this.generateErrorTelemetry(err, 'ORG_EDIT')
      }
    )
  }
  
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
  private getOrganisationsHistory() {
    const organisations: any = []
    const org = {
      profession: this.orgForm.value.profession ? this.orgForm.value.profession: "",

      designation: (this.orgForm.value.profession === 'ASHA') ? this.orgForm.value.profession : (this.orgForm.value.professSelected ? this.orgForm.value.professSelected.trim() : ""),
      professionOtherSpecify:  this.orgForm.value.professionOtherSpecify ? this.orgForm.value.professionOtherSpecify: "" ,

      orgType: this.orgForm.value.orgType ? this.orgForm.value.orgType : "",
      orgOtherSpecify: this.orgForm.value.orgOtherSpecify ?this.orgForm.value.orgOtherSpecify : "", 

      name: this.orgForm.value.orgName ? this.orgForm.value.orgName.trim(): "",

      // nameOther: '',
      // location: '',
      // doj: '',
      // completePostalAddress: '',
      // orgNameOther: "",
      // industry: "",
      // rnNumber:this.orgForm.value.rnNumber ?this.orgForm.value.rnNumber : "", 
      regNurseRegMidwifeNumber:this.orgForm.value.rnNumber ?this.orgForm.value.rnNumber : "", 
    }

    if (this.orgForm.value.profession === 'ASHA') {
      org['locationselect'] = this.orgForm.value.locationselect ? this.orgForm.value.locationselect : ""
      org['block'] = this.orgForm.value.block ? this.orgForm.value.block : ""
      org['subcentre'] = this.orgForm.value.subcentre ? this.orgForm.value.subcentre : ""
    }
    if (this.orgForm.value.profession === 'Others') {
      org['selectBackground'] = this.orgForm.value.selectBackground ?  this.orgForm.value.selectBackground : ""
    }

    // tslint:disable-next-line:max-line-length
    if ((this.orgForm.value.profession === 'Others' && this.orgForm.value.selectBackground === 'Asha Facilitator') || (this.orgForm.value.profession === 'Others' && this.orgForm.value.selectBackground === 'Asha Trainer')) {
      org['locationselect'] = this.orgForm.value.locationselect;
      org['block'] = this.orgForm.value.block;
      org['subcentre'] = this.orgForm.value.subcentre;
    }
    if (this.orgForm.value.profession === 'Student') {
      org['qualification'] = this.orgForm.value.courseName ? this.orgForm.value.courseName : ""
      org['instituteName'] =  this.orgForm.value.instituteName ? this.orgForm.value.instituteName : ""
    }

    organisations.push(org)
    return organisations
  }

  async getDefaultLanguage() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if (this.appFramework === 'Ekshamata') {
        this.defaultLanguage = 'hi';
       
      } else {
        this.defaultLanguage = 'en';
      
      }
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }

  generateErrorTelemetry(error: any, status) {
      this.telemetryGeneratorService.generateErrorTelemetry(
         Environment.USER,
         status,
         ErrorType.SYSTEM,
         PageId.PROFILE,
         JSON.stringify(error)
      )
  }

}
