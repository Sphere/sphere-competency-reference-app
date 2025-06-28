import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core'
import * as moment from "moment";
import { Observable } from 'rxjs';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../../project/ws/app/src/lib/routes/user-profile/services/format-datepicker'
import countriesList from 'assets/fusion-assets/files/country.json'
import statesList from 'assets/fusion-assets/files/state.json'
import districtsList from 'assets/fusion-assets/files/district.json'
import * as _ from 'lodash';
import { UserProfileService } from '../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import { CommonUtilService } from '../../../../services';
import { buildConfig } from '../../../../../configurations/configuration';
import { Router } from '@angular/router';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { IUserProfileDetailsFromRegistry } from '../../../../project/ws/app/src/lib/routes/user-profile/models/user-profile.model';

@Component({
  selector: 'ws-your-location',
  templateUrl: './your-location.component.html',
  styleUrls: ['./your-location.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
})
export class YourLocationComponent implements OnInit {
  
  disticts: any
  countries: any
  states: any
  dob: any
  districtArr: any
  selectDisable = true
  yourBackground = false
  aboutYouForm: UntypedFormGroup
  invalidDob = false
  nextBtnDisable = true
  filteredOptionsDistrict: Observable<string[]> | undefined
  countryUrl = '/fusion-assets/files/country.json'
  districtUrl = '/fusion-assets/files/district.json'
  stateUrl = '/fusion-assets/files/state.json'
  startDate = new Date(1999, 0, 1)
  baseUrl = buildConfig.SITEPATH
  userProfileData!: IUserProfileDetailsFromRegistry
  
  constructor(
    private userProfileSvc: UserProfileService,
    private commonUtilService: CommonUtilService,
    private router: Router,
    private configSvc: ConfigurationsService,
  ) {
    this.commonUtilService.removeLoader()
    this.aboutYouForm = new UntypedFormGroup({
      dob: new UntypedFormControl(),
      country: new UntypedFormControl(),
      distict: new UntypedFormControl(),
      state: new UntypedFormControl(),
      countryCode: new UntypedFormControl(),
    })
  }

  ngOnInit() {
    this.fetchMeta()
  }

  getUserDetails() {
    return new Promise(resolve => {
      if (this.configSvc.userProfile) {
        this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
          (data: any) => {
            if (data) {
              this.commonUtilService.removeLoader()
              this.userProfileData = data.profileDetails.profileReq;
              resolve(true)
            } else {
              resolve(true);
            }
          })
      } else{
        resolve(true);
      }
    });
  }

  async fetchMeta() {
    await this.getUserDetails();
    if (this.userProfileData?.personalDetails?.dob !== undefined) {
      this.router.navigate(['..']);
    } else {
      this.countries = _.get(countriesList, 'nationalities')
      this.states = _.get(statesList, 'states')
    }
  }

  countrySelect(option: any) {
    this.setCountryCode(option)
    if (option === 'India') {
      this.selectDisable = false
      this.aboutYouForm.controls.state.enable()
      this.aboutYouForm.controls.distict.enable()
    } else {
      this.selectDisable = true
      this.aboutYouForm.controls.state.disable()
      this.aboutYouForm.controls.distict.disable()
      this.aboutYouForm.controls.state.setValue(null)
      this.aboutYouForm.controls.distict.setValue(null)
    }
  }

  setCountryCode(country: string) {
    const selectedCountry = this.countries.filter((e: any) => e.name.toLowerCase() === country.toLowerCase())
    this.aboutYouForm.controls.countryCode.setValue(selectedCountry[0].countryCode)
  }

  onDateChange(event: any) {
    const customerDate = moment(event)
    const dateNow = moment(new Date())
    const duration = moment.duration(dateNow.diff(customerDate))
    if (duration.asYears() > 18) {
      this.invalidDob = false
    } else {
      this.invalidDob = true
    }
  }

  disableNextBtn() {
    if (this.aboutYouForm.get('dob').value && this.aboutYouForm.get('country').value) {
      if (this.aboutYouForm.controls.country.value !== 'India') {
        this.nextBtnDisable = false
      } else if (this.aboutYouForm.controls.country.value === 'India') {
        if (this.aboutYouForm.controls.state.value && this.aboutYouForm.controls.distict.value) {
          this.nextBtnDisable = false
        } else {
          this.nextBtnDisable = true
        }
      } else {
        this.nextBtnDisable = true
      }
    } else {
      this.nextBtnDisable = true
    }
  }

  stateSelect(option: any) {
    this.userProfileSvc.getData(this.districtUrl).subscribe((statesdata: any) => {
      _.get(statesdata, 'states', districtsList.states).map((item: any) => {
        if (item.state === option) {
          this.disticts = item.districts
        }
      })
    })
  }

  onsubmit() {
    this.yourBackground = true
  }

  dobData(event: any) {
    this.aboutYouForm.patchValue({
      dob: event,
    })
    this.disableNextBtn()
  }

  changelocation(){
    this.yourBackground = false
  }

}
