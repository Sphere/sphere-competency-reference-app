import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { ValueService } from '../../../../../library/ws-widget/utils/src/lib/services/value.service'
import { IUserProfileDetailsFromRegistry } from '@ws/app/src/lib/routes/user-profile/models/user-profile.model'
import { UserProfileService } from '@ws/app/src/lib/routes/user-profile/services/user-profile.service'

@Component({
  selector: 'ws-work-info-list',
  templateUrl: './work-info-list.component.html',
  styleUrls: ['./work-info-list.component.scss'],
})
export class WorkInfoListComponent implements OnInit {
  userProfileData!: IUserProfileDetailsFromRegistry
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  constructor(private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private valueSvc: ValueService) { }

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
  redirectToWorkInfo(isEdit?: any) {
    if (isEdit) {
      this.router.navigate([`app/workinfo-edit`], {
        queryParams: { isEdit },
      })
    } else {
      this.router.navigate([`app/workinfo-edit`])
    }

  }
}
