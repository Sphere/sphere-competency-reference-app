import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { SafeHtml, DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { UserProfileService } from '../../../user-profile/services/user-profile.service'
import { of } from 'rxjs'
import { delay, mergeMap } from 'rxjs/operators'
import { v4 as uuid } from 'uuid'
import * as _ from 'lodash'
import { WidgetBaseComponent } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '../../../../../../../../../library/ws-widget/resolver/src/lib/widget-resolver.model'
import { NsCardContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/card-content/card-content.model'
import { NsContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/widget-content.model'
import { ConfigurationsService } from '../../../../../../../../../library/ws-widget/utils/src/lib/services/configurations.service'
@Component({
  selector: 'ws-app-learning-card',
  templateUrl: './learning-card.component.html',
  styleUrls: ['./learning-card.component.scss'],
})
export class LearningCardComponent extends WidgetBaseComponent
  implements OnInit, OnChanges, NsWidgetResolver.IWidgetData<NsCardContent.ICard> {
  @Input()
  displayType: 'basic' | 'advanced' = 'basic'
  @Input()
  content: NsContent.IContent = {} as NsContent.IContent
  @Input() widgetData!: NsCardContent.ICard
  contentProgress = 0
  isExpanded = false
  defaultThumbnail = ''
  description: SafeHtml = ''
  redirectUrl = ''
  cometencyData: { name: any; levels: string }[] = []
  constructor(
    private configSvc: ConfigurationsService,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private userProfileSvc: UserProfileService
  ) { super() }

  ngOnInit() {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
    let url = `${document.baseURI}openid/keycloak`
    this.redirectUrl = url
    if (this.content.competencies_v1 && Object.keys(this.content.competencies_v1).length > 0) {

      _.forEach(JSON.parse(this.content.competencies_v1), (value: any) => {
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
  ngOnChanges(changes: SimpleChanges) {
    for (const prop in changes) {
      if (prop === 'content' && this.content.description) {
        this.content.description = this.content.description.replace(/<br>/g, '')
        this.description = this.domSanitizer.bypassSecurityTrustHtml(this.content.description)
      }
    }
  }

  raiseTelemetry(content: any) {
    const url = `app/toc/` + `${content.identifier}` + `/overview`
    if (localStorage.getItem('telemetrySessionId') === null && localStorage.getItem('loginbtn') === null) {
      localStorage.setItem(`url_before_login`, url)
      sessionStorage.setItem('login-btn', 'clicked')
    } else {
      if (this.configSvc.unMappedUser) {
        this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(500), mergeMap((data: any) => {
          return of(data)
        })).subscribe((userDetails: any) => {
          if (userDetails.profileDetails.profileReq.personalDetails.dob !== undefined) {
            this.router.navigateByUrl(url)
          } else {
            const courseUrl = `/app/toc/${content.identifier}/overview`
            this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
          }
        })
      }
    }
  }
}
