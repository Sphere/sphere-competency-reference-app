import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppFrameworkDetectorService } from '../../../../../app/modules/core/services/app-framework-detector-service.service';
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service';
import { CommonUtilService } from '../../../../../services';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'app-org-details-list',
  templateUrl: './org-details-list.component.html',
  styleUrls: ['./org-details-list.component.scss'],
})
export class OrgDetailsListComponent implements OnInit {

  orgData:any;
  showEdit: boolean = true;
  appFramework: any;
  rnNumber:any;

  constructor(
    private configSvc: ConfigurationsService,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private commonUtilService: CommonUtilService,
  ) { 
    this.commonUtilService.removeLoader()
  }

  ngOnInit() {
    this.getOrganizationData()
    this.detectFramework();
  }

  getOrganizationData(){
    if (this.configSvc.userProfile) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        (data: any) => {
          this.commonUtilService.removeLoader()
          if (data) {
            this.orgData = data.profileDetails.profileReq.professionalDetails;
            this.rnNumber = data.profileDetails.profileReq.personalDetails.regNurseRegMidwifeNumber;
          }
        })
    }

  }


  editOrg(){
    this.router.navigate([`app/organization-edit`], { queryParams: { ...this.orgData[0], rnNumber: this.rnNumber}, skipLocationChange: false })
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
