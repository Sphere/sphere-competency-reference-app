import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../../app/modules/home/services/user.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { CommonUtilService } from '../../../../../services/common-util.service';
import { RouterLinks } from '../../../../../app/app.constant'
import * as _ from 'lodash'
@Component({
  selector: 'app-my-courses-card',
  templateUrl: './my-courses-card.component.html',
  styleUrls: ['./my-courses-card.component.scss'],
})
export class MyCoursesCardComponent implements OnInit {

  // @Input() displayConfig: {
  //   showVideoIcon: Boolean,
  //   showProgress: Boolean
  // }
  @Input() displayConfig: {
    showVideoIcon: Boolean,
    showProgress: Boolean
    showSourceName?:Boolean
    showCompetency?:Boolean
  }
  @Input() data: any
  constructor(private router: Router,
    private configSvc: ConfigurationsService,
    private userHomeSvc: UserService,
    private commonUtilService: CommonUtilService,) { }
    
  ngOnInit() { }
  // For opening Course Page
  async navigateToToc(contentIdentifier: any) {
    let url = `/app/toc/` + `${contentIdentifier}` + `/overview`
    this.commonUtilService.addLoader()
    const result = await this.userHomeSvc.userRead(this.configSvc.unMappedUser.id)
    this.commonUtilService.removeLoader()
    if (this.configSvc.unMappedUser) {
      this.commonUtilService.addLoader()
      if (_.get(this.configSvc.unMappedUser, 'profileDetails.profileReq.personalDetails.dob', undefined) !== undefined) {
        this.router.navigate([url], { replaceUrl: true })
      } else {
        this.router.navigate([`/${RouterLinks.ABOUT_YOU}`], { queryParams: { redirect: url } })
      }
    }
  }
}
