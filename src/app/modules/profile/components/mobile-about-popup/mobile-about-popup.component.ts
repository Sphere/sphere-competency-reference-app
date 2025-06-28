import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import {MatSnackBar} from '@angular/material/snack-bar'
import * as _ from 'lodash'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { UserProfileService } from '@ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { constructReq } from '../request-util'
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { Environment, ErrorType, InteractType, PageId, TelemetryGeneratorService } from '../../../../../services'

@Component({
  selector: 'ws-mobile-about-popup',
  templateUrl: './mobile-about-popup.component.html',
  styleUrls: ['./mobile-about-popup.component.scss'],
})
export class MobileAboutPopupComponent implements OnInit {
  aboutForm: UntypedFormGroup
  userProfileData!: any
  userID = ''
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>

  constructor(public dialogRef: MatDialogRef<MobileAboutPopupComponent>,
              private configSvc: ConfigurationsService,
              private userProfileSvc: UserProfileService,
              private matSnackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private appFrameworkDetectorService: AppFrameworkDetectorService,
              private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    this.aboutForm = new UntypedFormGroup({
      about: new UntypedFormControl('', [Validators.required, Validators.maxLength(500)]),
    })
  }
  ngOnInit() {
    this.getUserDetails()
    this.updateForm()
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
  updateForm() {
    this.aboutForm.patchValue({
      about: this.data,
    })
  }

  async onSubmit(form: any) {
    if (this.configSvc.userProfile) {
      this.userID = this.configSvc.userProfile.userId || ''
    }
    const profileRequest = constructReq(form.value, this.userProfileData)
    const appName = await this.appFrameworkDetectorService.detectAppFramework();
    console.log('appName', appName);
    const reqUpdate = {
      request: {
        userId: this.userID,
        profileDetails: {
          profileLocation: `${appName}/about-popup`,
          profileReq: {
            ...profileRequest.profileReq,
            personalDetails: {
              ...profileRequest.profileReq.personalDetails,
              profileLocation: `${appName}/about-popup`,
            }
          }
        },
      },
    }
    this.userProfileSvc.updateProfileDetails(reqUpdate).subscribe(
      (res: any) => {
        if (res) {
          this.generateInteractTelemetry('update-user-profile-success')
          this.openSnackBar(this.toastSuccess.nativeElement.value)
          this.userProfileSvc._updateuser.next('true')
          this.dialogRef.close();
        }
      }, (error) => {
        this.generateErrorTelemetry(error);
      })
  }

   generateInteractTelemetry(action) {
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
            ErrorType.SYSTEM,
            PageId.LOGIN,
            JSON.stringify(error)
          );
       }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  closeClick() {
    this.dialogRef.close()
  }
}
