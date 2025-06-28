import { Component, OnInit, Input, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { Subject } from 'rxjs'
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { UserService } from '../../services/user.service'
import * as _ from 'lodash'
import { RouterLinks } from '../../../../../app/app.constant'
import { LocalStorageService } from '../../../../../app/manage-learn/core/services/local-storage/local-storage.service';
import { CommonUtilService, Environment, InteractSubtype, InteractType, PageId, TelemetryGeneratorService } from '../../../../../services'
import { Title } from '@angular/platform-browser'
import { TelemetryObject } from 'sunbird-sdk';
@Component({
  selector: 'ws-mobile-course-view',
  templateUrl: './mobile-course-view.component.html',
  styleUrls: ['./mobile-course-view.component.scss'],
})
export class MobileCourseViewComponent implements OnInit ,OnDestroy {

  @Input() courseData: any
  @Input() enableConfig = false
  @Input() showCompentencyDetails = true
  @Input() showProgress = false;
  @Input() ashaData: any = {};
  @Input() isTablet = false;
  @Input() displayConfig: {
    displayType: String,
    showProgress: Boolean,
    badges: {
      orgIcon: Boolean,
      certification: Boolean,
      isCertified:Boolean
    }
  }
  cometencyData: { name: any; levels: string }[] = []
  public unsubscribe = new Subject<void>();
  constructor(private router: Router,
    private configSvc: ConfigurationsService,
    private userHomeSvc: UserService,
    private commonUtilService: CommonUtilService,
    private titleService: Title,
    private localStorageService: LocalStorageService,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) { }

  async ngOnInit() {
    this.isTablet = await this.commonUtilService.isTablet();
    if (this.courseData.competencies_v1 && Object.keys(this.courseData.competencies_v1).length > 0) {

      _.forEach(JSON.parse(this.courseData.competencies_v1), (value: any) => {
        if (value.level) {
          this.cometencyData.push(
            {
              name: value.competencyName,
              levels: ` Level ${value.level}`
            }
          )
        }
        return this.cometencyData
      })
    }
  }

  // For opening Course Page
  async navigateToToc(contentIdentifier: any) {
    this.commonUtilService.removeLoader();
    this.generateInteractEvent(contentIdentifier);
    if (this.configSvc.unMappedUser) {
      let url = `/app/toc/` + `${contentIdentifier}` + `/overview`
      this.commonUtilService.addLoader()
      await this.userHomeSvc.userRead(this.configSvc.unMappedUser.id)
      if (_.get(this.configSvc.unMappedUser, 'profileDetails.profileReq.personalDetails.dob', undefined) !== undefined) {
        this.router.navigate([url], { replaceUrl: true, queryParams: { data: JSON.stringify(this.ashaData) } })
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

  generateInteractEvent(contentIdentifier: any) {
    const telemetryObject = new TelemetryObject(contentIdentifier, 'Course', undefined)
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      InteractSubtype.COURSE_CLICKED,
      Environment.HOME,
      PageId.COURSE_DETAIL,
      telemetryObject,
      undefined,
    )
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
