import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LocalStorageService } from '../../../../../app/manage-learn/core';
import { UserService } from '../../../../../app/modules/home/services/user.service';
import { CommonUtilService } from '../../../../../services/common-util.service';
import { Router } from '@angular/router'
import { RouterLinks } from '../../../../../app/app.constant'
import * as _ from 'lodash-es';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPopUpComponent } from '../confirm-modal/confirm-modal.component';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() displayConfig: {
    displayType: String,
    badges: {
      orgIcon: Boolean,
      certification: Boolean,
      isCertified: Boolean
    }
  }
  @Input() customClass: string;
  @Input() courseData: any
  @Input() showCompentencyDetails = true
  @Input() showProgress = false;
  @Input() enableConfig = false
  cometencyData: { name: any; levels: string }[] = []
  @Output() clickEvent = new EventEmitter<any>();
  isTablet = false;
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    private userHomeSvc: UserService,
    private commonUtilService: CommonUtilService,
    private titleService: Title,
    private localStorageService: LocalStorageService,
    private dialog: MatDialog,
  ) {
  }
  
  async ngOnInit() {
    this.isTablet = await this.commonUtilService.isTablet();
    console.log('this.courseData', this.courseData)
  }
  
  async navigateToToc(contentIdentifier: any) {
    this.commonUtilService.removeLoader()
    if (this.configSvc.unMappedUser) {
      let url = `/app/toc/` + `${contentIdentifier}` + `/overview`
      this.commonUtilService.addLoader()
      const result = await this.userHomeSvc.userRead(this.configSvc.unMappedUser.id)
      this.commonUtilService.addLoader()
      if (_.get(this.configSvc.unMappedUser, 'profileDetails.profileReq.personalDetails.dob', undefined) !== undefined) {
        this.router.navigate([url], {
          state: this.courseData,
          replaceUrl: true
        });
      } else {
        this.router.navigate([`/${RouterLinks.ABOUT_YOU}`], { queryParams: { redirect: url } })
      }
    } else {
      let name = `${this.courseData.name} - Aastrika`
      this.titleService.setTitle(name)
      this.router.navigate([RouterLinks.PUBLIC_TOC_OVERVIEW], {
        state: {
          tocData: this.courseData,
        },
        queryParams: {
          courseId: this.courseData.identifier,
        },
      })
      this.localStorageService.setLocalStorage('tocData', JSON.stringify(this.courseData))
      this.localStorageService.setLocalStorage(`url_before_login`, `app/toc/` + `${this.courseData.identifier}` + `/overview`)
    }
  }
  async mycourseNavigateToToc(contentIdentifier: any) {
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
  public onAction(data, action) {

    const dialogRef = this.dialog.open(ConfirmPopUpComponent,
      {
        width: this.isTablet ? '41%' : '542px',
        panelClass: 'confirm-popup-close-modal',
        disableClose: true,
        data: {}
      })
    dialogRef.afterClosed().subscribe((res:any)=>{
      if(res.event =='YES'){
        this.clickEvent.emit({ 'action': action, 'data': data });
      }
    })
  }
}
