import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserProfileService } from '@ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { constructReq } from '../request-util'
import * as _ from 'lodash'
import { ActivatedRoute, Router } from '@angular/router'
import { CommonUtilService } from '../../../../../services'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { ValueService } from '../../../../../library/ws-widget/utils/src/lib/services/value.service';
import { AppFrameworkDetectorService } from '../../../../modules/core/services/app-framework-detector-service.service';
@Component({
  selector: 'ws-education-edit',
  templateUrl: './education-edit.component.html',
  styleUrls: ['./education-edit.component.scss'],
})
export class EducationEditComponent implements OnInit {
  educationForm: UntypedFormGroup
  academics: any = []
  userID = ''
  userProfileData!: any
  showbackButton = false
  showLogOutIcon = false
  navigateToEducation = true
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  yearPattern = '(^[0-9]{4}$)'
  constructor(private configSvc: ConfigurationsService,
              private userProfileSvc: UserProfileService,
              private snackBar: MatSnackBar,
              private router: Router,
              private route: ActivatedRoute,
              private valueSvc: ValueService,
              private commonUtilService: CommonUtilService,
             private appFrameworkDetectorService:AppFrameworkDetectorService,) {
    this.educationForm = new UntypedFormGroup({
      courseDegree: new UntypedFormControl(),
      courseName: new UntypedFormControl(),
      institutionName: new UntypedFormControl(),
      yearPassing: new UntypedFormControl('', [Validators.pattern(this.yearPattern)]),
    })
    this.academics = [
      {
        type: 'X_STANDARD',
      },
      {
        type: 'XII_STANDARD',
      },
      {
        type: 'GRADUATE',
      },
      {
        type: 'POSTGRADUATE',

      },
    ]
  }

  ngOnInit() {
    this.getUserDetails()
    this.route.queryParams.subscribe(params => {
      if (params.nameOfInstitute) {
        this.updateForm(params)
      }
    })
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

 
  updateForm(data?: any) {
    this.educationForm.patchValue({
      courseDegree: data.type === 'X_STANDARD' ? this.academics[0] : data.type
        === 'XII_STANDARD' ? this.academics[1] : data.type === 'GRADUATE' ? this.academics[2] : this.academics[3],
      courseName: data.nameOfQualification,
      institutionName: data.nameOfInstitute,
      yearPassing: data.yearOfPassing,
    })

  }
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          if (data) {
            this.userProfileData = data.profileDetails.profileReq
          }
        })
    }
  }

  async onSubmit(form: any) {
    const appName = await this.appFrameworkDetectorService.detectAppFramework();
    console.log('appName', appName);
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const profileRequest = constructReq(form, this.userProfileData)
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: {
          profileLocation: `${appName}/education-edit`,
          profileReq: {
            ...profileRequest.profileReq,
            personalDetails: {
              ...profileRequest.profileReq.personalDetails,
              profileLocation: `${appName}/education-edit`
            }
          }
        },
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          form.reset()
          this.openSnackbar(this.toastSuccess.nativeElement.value)
          this.userProfileSvc._updateuser.next('true')
          this.commonUtilService.addLoader()
          this.router.navigate(['/app/education-list'])
        }
      })
  }
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }
}
