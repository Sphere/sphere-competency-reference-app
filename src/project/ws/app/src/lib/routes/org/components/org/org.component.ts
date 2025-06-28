import { OrgServiceService } from './../../org-service.service'
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router, Data } from '@angular/router'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { MdePopoverTrigger } from '@material-extended/mde'

@Component({
  selector: 'ws-app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],
})
export class OrgComponent implements OnInit, OnDestroy {
  @ViewChild('target', { static: false }) target!: MdePopoverTrigger
  orgName!: string
  courseData!: any
  routeSubscription: any
  orgData: any
  currentOrgData: any
  showEndPopup = false
  btnText = ''
  courseCount = 0

  constructor(private activateRoute: ActivatedRoute,
              private orgService: OrgServiceService,
              private router: Router,
              private configSvc: ConfigurationsService) {
  }

  ngOnInit() {
    this.routeSubscription = this.activateRoute.data.subscribe((response: Data) => {
      this.orgName = this.activateRoute.snapshot.queryParams.orgId
      const currentOrg = this.orgName
      if (response.orgData) {
        this.orgData = response.orgData.data.sources
        this.currentOrgData = this.orgData.filter(
          (org: any) => org.sourceName === currentOrg
        )
        if (this.currentOrgData) {
          this.currentOrgData = this.currentOrgData[0]
        }
      }
    })
    this.orgService.getSearchResults().subscribe((result: any) => {
      this.courseData = result.result.content.filter(
        (org: any) => org.sourceName === this.orgName
      )
      this.courseCount = this.courseData
    })
    this.configSvc.isAuthenticated ? this.btnText = 'View Course' : this.btnText = 'Login'
  }

  gotoOverview(identifier: any) {
    this.router.navigate([`/app/toc/${identifier}/overview`])
  }

  showMoreCourses() {
    this.router.navigate(['/app/org-details/all-courses'], { queryParams: { orgId: this.orgName } })
  }

  goToProfile(id: string) {
    this.router.navigate(['/app/person-profile'], { queryParams: { userId: id } })
  }
  showTarget(event: any) {
    if (window.innerWidth - event.clientX < 483) {
      this.showEndPopup = true
      this.target.targetOffsetX = event.clientX + 1
    } else {
      // // console.log('this.showEndPopup', this.showEndPopup)
    }
  }
  loginRedirect(contentId: any) {
    this.router.navigateByUrl(`/app/toc/${contentId}/overview`)
  }
  ngOnDestroy() {
    this.orgService.hideHeaderFooter.next(false)
  }
  goToLink(a: string) {
    window.open(a, '_blank')
  }
}
