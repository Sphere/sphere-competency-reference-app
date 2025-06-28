import { Component, OnInit } from '@angular/core'
import { UserProfileService } from '@ws/app/src/lib/routes/user-profile/services/user-profile.service'
import * as _ from 'lodash'
import { Router } from '@angular/router'
import { CommonUtilService, ImpressionType, InteractSubtype, InteractType, TelemetryGeneratorService } from '../../../../../services'
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { ValueService } from '../../../../../library/ws-widget/utils/src/lib/services/value.service'

@Component({
  selector: 'ws-education-list',
  templateUrl: './education-list.component.html',
  styleUrls: ['./education-list.component.scss'],
})
export class EducationListComponent implements OnInit {
  academicsArray: any[] = []
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  showEdit: boolean = true;
  appFramework: any;
  constructor(private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private valueSvc: ValueService,
    private commonUtilService: CommonUtilService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private telemetryGeneratorService: TelemetryGeneratorService) {
      this.commonUtilService.removeLoader()
  }

  ngOnInit() {
    this.userProfileSvc.updateuser$.pipe().subscribe(item => {
      this.getUserDetails()
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

    this.detectFramework();
  }

  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          // console.log("sjkdksj", data)
          this.commonUtilService.removeLoader()
          if (data && _.get(data, 'profileDetails.profileReq.academics')) {
            this.academicsArray = _.get(data, 'profileDetails.profileReq.academics')
          }
        })
    }
  }

  redirectTo(isEdit?: any, academic?: any) {
    this.generateInteractTelemetry(isEdit);
    if (isEdit) {
      this.router.navigate([`app/education-edit`], { queryParams: { ...academic }, skipLocationChange: false })
    } else {
      this.router.navigate([`app/education-edit`])
    }

  }

  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      this.generateImpressionEvent()
      if(this.appFramework === 'Ekshamata'){
        this.showEdit = false
      }
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }

  generateImpressionEvent() {
    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      '',
      'academic-details',
      this.appFramework, 
      undefined,
      undefined
    );
  }

  generateInteractTelemetry(isEdit) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      isEdit ? InteractSubtype.EDIT_CLICKED : InteractSubtype.ADD_ACTIVITY_CLICKED,
      'academic-details',
      this.appFramework,
      undefined,
      undefined,
      undefined,
      undefined
    );
  }
}
