import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import { CommonUtilService } from '../../../../../services/common-util.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'app-personal-details-list',
  templateUrl: './personal-details-list.component.html',
  styleUrls: ['./personal-details-list.component.scss'],
})
export class PersonalDetailsListComponent implements OnInit {

  userDetails;
  userProfileData;
  appFramework: any;
  showEdit: boolean = true;
  country: string;
  distict: string;
  state: string;

  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private commonUtilService: CommonUtilService,
  ) { 
    this.commonUtilService.removeLoader()
  }

  async ngOnInit() {
    this.getUserDetails()
    await this.detectFramework();
  }
 
  getUserDetails() {
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          this.commonUtilService.removeLoader()
          if (data) {
            this.userDetails = data;
            this.userProfileData = data.profileDetails.profileReq
            this.getAddress(data.profileDetails.profileReq.personalDetails.postalAddress)
          }
        })
    }
  }

  getAddress(data){
    if(data){
      const splitValues: string[] = data.split(', ')
      console.log("split data",splitValues)
      this.country =  splitValues[0]
      this.state = splitValues[1]
      this.distict = splitValues[2]
  }
}
  editProfile() {
    this.router.navigate([`app/personal-detail-edit`])
  }

  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
      if(this.appFramework === 'Ekshamata'){
        this.showEdit = false
      }
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }

}
