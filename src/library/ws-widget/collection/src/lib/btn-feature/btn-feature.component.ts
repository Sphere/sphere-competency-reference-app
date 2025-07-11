import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Event, NavigationEnd, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { MobileAppsService } from '../../../../../../services/mobile-apps.service'
import { CustomTourService } from '../_common/tour-guide/tour-guide.service'
import { BtnFeatureService } from './btn-feature.service'
import { UserProfileService } from '../../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import * as  _ from 'lodash'
import { RouterLinks } from '../../../../../../app/app.constant'
import { WidgetBaseComponent } from '../../../../resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '../../../../resolver/src/lib/widget-resolver.model'
import { NsPage } from '../../../../utils/src/lib/resolvers/page.model'
import { EventService } from '../../../../utils/src/lib/services/event.service'
import { ConfigurationsService } from '../../../../utils/src/lib/services/configurations.service'
import { AppGlobalService, CommonUtilService, InteractType, TelemetryGeneratorService } from '../../../../../../services'
import {TelemetryObject} from 'sunbird-sdk';
import { Events } from '../../../../../../util/events';
export const typeMap = {
  cardFull: 'card-full',
  cardMini: 'card-mini',
  cardMiniClick: 'card-mini-click',
  cardSmall: 'card-small',
  matButton: 'mat-button',
  matFabButton: 'mat-fab',
  matFlatButton: 'mat-flat-button',
  matIconButton: 'mat-icon-button',
  matMiniFabButton: 'mat-mini-fab',
  matRaisedButton: 'mat-raised-button',
  matStrokedButton: 'mat-stroked-button',
  menuItem: 'mat-menu-item',
  featureItem: 'feature-item',
  externalLinkButton: 'external-link-button',
}

@Component({
  selector: 'ws-widget-btn-feature',
  templateUrl: './btn-feature.component.html',
  styleUrls: ['./btn-feature.component.scss'],
})
export class BtnFeatureComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<NsPage.INavLink> {
  @Input() widgetData!: NsPage.INavLink
  @Input() showFixedLength = false
  // @Input()
  // @HostBinding('id')
  // public id!: string
  readonly displayType = typeMap
  profileData: any
  badgeCount = ''
  defaultIconSize = 24
  isPinned = false
  instanceVal = ''
  isPinFeatureAvailable = true
  searchButton = true
  private pinnedAppsChangeSubs?: Subscription
  private navigationSubs?: Subscription
  public telemetryObject: TelemetryObject;
  public telemetryNavbarStart: any;
  numberOfNotification: any;
  constructor(
    private events: EventService,
    private configurationsSvc: ConfigurationsService,
    private btnFeatureSvc: BtnFeatureService,
    private router: Router,
    private mobileSvc: MobileAppsService,
    private configSvc: ConfigurationsService,
    private tour: CustomTourService,
    private userProfileSvc: UserProfileService,
    private commonUtilService: CommonUtilService,
    private appGlobalService: AppGlobalService,
    private event: Events,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) {
    super()
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.searchButton = false
    }
  }

  updateBadge() {
    if (this.widgetData.actionBtn && this.widgetData.actionBtn.badgeEndpoint) {
      this.btnFeatureSvc
        .getBadgeCount(this.widgetData.actionBtn.badgeEndpoint)
        .then(count => {
          if (count > 99) {
            this.badgeCount = '99+'
          } else if (count > 0) {
            this.badgeCount = count.toString()
          } else {
            this.badgeCount = ''
          }
        })
        .catch(_err => { })
    }
  }
  search() {
    if (this.router.url.includes(`/${RouterLinks.PRIVATE_HOME}`)) {
      // this.searchApi.changeMessage('search')
    }
    if (this.router.url.includes(`/${RouterLinks.SEARCH_PAGE}/${RouterLinks.learning}`)) {
      this.commonUtilService.addLoader()
      this.router.navigateByUrl(`/${RouterLinks.SEARCH_PAGE}/home`)
    }
  }
  ngOnInit() {
    this.instanceVal = this.configSvc.rootOrg || ''
    if (this.configSvc.restrictedFeatures) {
      this.isPinFeatureAvailable = !this.configSvc.restrictedFeatures.has('pinFeatures')
    }
    if (
      !this.widgetData.actionBtn &&
      this.widgetData.actionBtnId &&
      this.configurationsSvc.appsConfig
    ) {
      this.widgetData.actionBtn = this.configurationsSvc.appsConfig.features[this.widgetData.actionBtnId]
      if (this.widgetData.actionBtn && this.widgetData.actionBtn.badgeEndpoint) {
        this.navigationSubs = this.router.events.subscribe((e: Event) => {
          if (e instanceof NavigationEnd) {
            this.updateBadge()
          }
        })
      }
    }
    const count = this.appGlobalService.getNumberOfNotifications();
    this.numberOfNotification = (count>1) ? '1+' : (count>0 ? '1' : '');
    this.event.subscribe('notificationCountUpdated', (data) => {
      this.numberOfNotification = (data>1) ? '1+' : (data>0 ? '1' : '');
    })

    this.pinnedAppsChangeSubs = this.configurationsSvc.pinnedApps.subscribe(pinnedApps => {
      this.isPinned = Boolean(
        this.widgetData.actionBtn && pinnedApps.has(this.widgetData.actionBtn.id),
      )
    })
    if (_.get(this.configSvc, 'unMappedUser.id')) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe().subscribe((res: any) => {
        this.profileData = _.get(res, 'profileDetails.profileReq')
        if (this.profileData !== undefined) {
          // this.setCompetency(this.profileData)
        }
      })
    }

  }
  // setCompetency(data: any) {
  //   this.CompetencyConfiService.setConfig(data, data.profileDetails)
  // }

  ngOnDestroy() {
    if (this.pinnedAppsChangeSubs) {
      this.pinnedAppsChangeSubs.unsubscribe()
    }
    if (this.navigationSubs) {
      this.navigationSubs.unsubscribe()
    }
  }

  get featureStatusColor() {
    if (this.widgetData.actionBtn) {
      switch (this.widgetData.actionBtn.status) {
        case 'earlyAccess':
          return 'primary'
        case 'beta':
          return 'accent'
        case 'alpha':
          return 'warn'
        default:
          return null
      }
    }
    return null
  }

  get desktopVisible() {
    if (this.widgetData.actionBtn && this.widgetData.actionBtn.mobileAppFunction) {
      if (!this.mobileSvc.isMobile) {
        return false
      }
      return true
    }
    return true
  }

  togglePin(featureId: string, event: any) {
    event.preventDefault()
    event.stopPropagation()
    this.events.raiseInteractTelemetry('pin', 'feature', {
      featureId,
    })
    this.configurationsSvc.pinnedApps.pipe(take(1)).subscribe(pinnedApps => {
      const newPinnedApps = new Set(pinnedApps)
      if (newPinnedApps.has(featureId)) {
        newPinnedApps.delete(featureId)
      } else {
        newPinnedApps.add(featureId)
      }
      this.isPinned = newPinnedApps.has(featureId)
      this.configurationsSvc.prefChangeNotifier.next({
        pinnedApps: Array.from(newPinnedApps).join(','),
      })
      this.configurationsSvc.pinnedApps.next(newPinnedApps)
    })
  }

  startTour() {
    this.tour.startTour()
  }

  addLoder(actionBtn?:any) {
    localStorage.setItem('isOnlyPassbook', 'false')
    this.generateInteractEvent(actionBtn);
    this.setTelemetryStartEndData(actionBtn)
    // this.commonUtilService.addLoader()
  }

  generateInteractEvent(actionBtn) {
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.TAB_CHANGED,
          actionBtn.toolTip,
          actionBtn.shortName,
          actionBtn.url,
          undefined
    )
  }

  competencyNav(url) {
    localStorage.setItem('isOnlyPassbook', 'false');
    this.generateInteractEvent(this.widgetData.actionBtn)
    // this.router.navigate([url])
  }

  setTelemetryStartEndData(actionBtn){
    const telemetryObject = new TelemetryObject(actionBtn.id, actionBtn.iconType, '1.0');
    this.telemetryNavbarStart = {
      pageId: actionBtn.id,
      duration: this.commonUtilService.getPageLoadTime(),
      object: telemetryObject
    };
  }
}
