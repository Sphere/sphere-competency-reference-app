import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../../app/modules/home/services/user.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';

@Component({
  selector: 'app-ekshamata-footer',
  templateUrl: './ekshamata-footer.component.html',
  styleUrls: ['./ekshamata-footer.component.scss'],
})
export class EkshamataFooterComponent implements OnInit {
  @Input() appName?: string
  @Input() isLogo?: boolean
  orgName: any;
  currentOrgId: string;
 

  constructor(
    private userSvc: UserService,
    private configSvc: ConfigurationsService,) { }

  ngOnInit() {
   this.getOrgName();
  //  console.log(this.appName, this.isLogo)
  }

  async getOrgName(){
    console.log('call ')
    this.currentOrgId = this.configSvc.userProfile.rootOrgId;
    let res:any = await this.userSvc.getOrgData();
    this.orgName = res.orgNames.find(obj => obj.channelId === this.currentOrgId);
  }
}
