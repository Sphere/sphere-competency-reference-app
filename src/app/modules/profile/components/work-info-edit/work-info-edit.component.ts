import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { UserProfileService } from '@ws/app/src/lib/routes/user-profile/services/user-profile.service'
import * as _ from 'lodash'
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import { constructReq } from '../request-util'
import { AppDateAdapter, APP_DATE_FORMATS, changeformat } from '@ws/app/src/public-api'
import { ValueService } from '../../../../../library/ws-widget/utils/src/lib/services/value.service'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { AppFrameworkDetectorService } from '../../../../modules/core/services/app-framework-detector-service.service';
@Component({
  selector: 'ws-work-info-edit',
  templateUrl: './work-info-edit.component.html',
  styleUrls: ['./work-info-edit.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
})
export class WorkInfoEditComponent implements OnInit {
  maxDate = new Date()
  minDate = new Date(1900, 1, 1)
  workInfoForm: UntypedFormGroup
  userProfileData!: any
  userID = ''
  showbackButton = false
  showLogOutIcon = false
  navigateToWorkInfo = true
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  constructor(private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private valueSvc: ValueService,
  private appFrameworkDetectorService:AppFrameworkDetectorService,) {
    this.workInfoForm = new UntypedFormGroup({
      doj: new UntypedFormControl('', []),
      organizationName: new UntypedFormControl('', []),
      designation: new UntypedFormControl('', []),
      location: new UntypedFormControl('', []),
    })
  }

  ngOnInit() {
    this.getUserDetails()
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall) {
        this.showbackButton = true
        this.showLogOutIcon = true

      } else {
        this.showbackButton = true
        this.showLogOutIcon = false
      }
    })
  }

  updateForm() {
    if (this.userProfileData && this.userProfileData.professionalDetails && this.userProfileData.professionalDetails.length > 0) {
      const organisation = this.userProfileData.professionalDetails[0]
      this.workInfoForm.patchValue({
        doj: this.getDateFromText(organisation.doj),
        organizationName: organisation.name,
        designation: organisation.designation,
        location: organisation.location,
      })
    }
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
            this.route.queryParams.subscribe(isEdit => {
              if (isEdit.isEdit) {
                this.updateForm()
              }
            })
          }
        })
    }
  }

  async onSubmit(form: any) {
    if (form.doj) {
      form.doj = changeformat(new Date(`${form.doj}`))
    }

    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const profileRequest = constructReq(form, this.userProfileData)
    const appName = await this.appFrameworkDetectorService.detectAppFramework();
    console.log('appName', appName);
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: {
          profileLocation: `${appName}/work-info-edit`,
          profileReq: {
            ...profileRequest.profileReq,
            personalDetails: {
              ...profileRequest.profileReq.personalDetails,
              profileLocation: `${appName}/work-info-edit`
            }
          }
        },
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.workInfoForm.reset()
          this.openSnackbar(this.toastSuccess.nativeElement.value)
          this.userProfileSvc._updateuser.next('true')
          this.router.navigate(['/app/workinfo-list'])
        }
      })
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  private getDateFromText(dateString: string): any {
    if (dateString) {
      const splitValues: string[] = dateString.split('-')
      const [dd, mm, yyyy] = splitValues
      const dateToBeConverted = `${yyyy}-${mm}-${dd}`
      return new Date(dateToBeConverted)
    }
    return ''
  }
}
