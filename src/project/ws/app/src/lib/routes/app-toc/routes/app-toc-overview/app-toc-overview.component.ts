import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core'
import { AppTocOverviewDirective } from './app-toc-overview.directive'
import { AccessControlService } from '@ws/author'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { Observable, Subscription, Subject } from 'rxjs'
import { NsAppToc } from '../../models/app-toc.model'
import { AppTocService } from '../../services/app-toc.service'
import * as _ from 'lodash'
import { takeUntil } from 'rxjs/operators'
import LicenseMetadata from '../../../../../../../../../assets/configurations/license.meta.json'
import tocData from '../../../../../../../../../assets/configurations/toc.json'
import { NsContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { NsWidgetResolver } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
// import { HttpErrorResponse } from '@angular/common/http'
@Component({
  selector: 'ws-app-app-toc-overview-root',
  templateUrl: './app-toc-overview.component.html',
  styleUrls: ['./app-toc-overview.component.scss'],
})
export class AppTocOverviewComponent implements OnInit, OnDestroy {

  @ViewChild(AppTocOverviewDirective, { static: true }) wsAppAppTocOverview!: AppTocOverviewDirective
  content: NsContent.IContent | null = null
  routeSubscription: Subscription | null = null
  tocStructure: NsAppToc.ITocStructure | null = null
  trainingLHubCount$?: Observable<number>
  body: SafeHtml | null = null
  @Input() forPreview = false
  tocConfig: any = null
  contentParents: { [key: string]: NsAppToc.IContentParentResponse[] } = {}
  objKeys = Object.keys
  public loadOverview = true
  licenseName: any
  currentLicenseData: any
  loadLicense = true
  license = 'CC BY'
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: 'errorResolver',
    widgetSubType: 'errorResolver',
    widgetData: {
      errorType: 'internalServer',
    },
  }
  /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  constructor(
    private route: ActivatedRoute,
    private tocSharedSvc: AppTocService,
    private domSanitizer: DomSanitizer,
    private authAccessControlSvc: AccessControlService,
    private router: Router
  ) {
    // this.licenseurl = `${this.configSvc.sitePath}/license.meta.json`
  }

  // loadComponent() {
  //   const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.appTocSvc.getComponent())
  //   const viewContainerRef = this.wsAppAppTocOverview.viewContainerRef
  //   viewContainerRef.clear()
  //   viewContainerRef.createComponent(componentFactory)
  // }

  ngOnInit() {
    // this.loadComponent()
    // this.licenseurl = `${this.configSvc.sitePath}/license.meta.json`
    this.tocSharedSvc.showComponent$.pipe(takeUntil(this.unsubscribe)).subscribe(item => {
      if (item && !_.get(item, 'showComponent')) {
        this.loadOverview = item.showComponent
        // this.loadLicense = item.showComponent
        // // console.log(item.showComponent)
      } else {
        this.loadOverview = true
        // this.loadLicense = true
      }
    })

    this.route.queryParams.subscribe(params => {
      this.licenseName = params['license'] || this.license
      this.getLicenseConfig()
    })

    if (!this.forPreview) {
      this.forPreview = window.location.href.includes('/author/')
    }
    if (this.route && this.route.parent) {
      this.routeSubscription = this.route.parent.data.subscribe((data: Data) => {
        this.initData(data)
        this.tocConfig = tocData
      })
    }
  }

  getLicenseConfig() {
      const licenseData = LicenseMetadata
      if (licenseData) {
        this.currentLicenseData = licenseData.licenses.filter((license: any) => license.licenseName === this.licenseName)
      }
  }

  get showSubtitleOnBanner() {
    return this.tocSharedSvc.subtitleOnBanners
  }
  get showDescription() {
    if (this.content && !this.content.body) {
      return true
    }
    return this.tocSharedSvc.showDescription
  }
  private async initData(data: Data) {
    const initData = await this.tocSharedSvc.initData(data)
    this.content = initData.content
    this.body = this.domSanitizer.bypassSecurityTrustHtml(
      this.content && this.content.body
        ? this.forPreview
          ? this.authAccessControlSvc.proxyToAuthoringUrl(this.content.body)
          : this.content.body
        : '',
    )
    this.contentParents = {}
  }

  goToProfile(id: string) {
    this.router.navigate(['/app/person-profile'], { queryParams: { userId: id } })
  }
  ngOnDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }
}
