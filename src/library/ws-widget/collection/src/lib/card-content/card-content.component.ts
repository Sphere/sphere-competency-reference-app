import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Subscription, of } from 'rxjs'
import { NsGoal } from '../btn-goals/btn-goals.model'
import { NsPlaylist } from '../btn-playlist/btn-playlist.model'
import { NsContent } from '../_services/widget-content.model'
import { NsCardContent } from './card-content.model'
import { MdePopoverTrigger } from '@material-extended/mde'
import { Router } from '@angular/router'
import { delay, mergeMap } from 'rxjs/operators'
import { UserProfileService } from '../../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { Title } from '@angular/platform-browser'
import * as _ from 'lodash-es'
import { LocalStorageService } from '../../../../../../app/manage-learn/core/services/local-storage/local-storage.service'
import { AppFrameworkDetectorService } from '../../../../../../app/modules/core/services/app-framework-detector-service.service'
import { WidgetBaseComponent } from '../../../../resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '../../../../resolver/src/lib/widget-resolver.model'
import { NsInstanceConfig } from '../../../../utils/src/lib/services/configurations.model'
import { ConfigurationsService } from '../../../../utils/src/lib/services/configurations.service'
import { UtilityService } from '../../../../utils/src/lib/services/utility.service'

@Component({
  selector: 'ws-widget-card-content',
  templateUrl: './card-content.component.html',
  styleUrls: ['./card-content.component.scss'],
})
export class CardContentComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, AfterViewInit, NsWidgetResolver.IWidgetData<NsCardContent.ICard> {
  @ViewChild('target', { static: false }) target!: MdePopoverTrigger
  @Input() widgetData!: NsCardContent.ICard
  defaultThumbnail = ''
  defaultSLogo = ''
  showFlip = false
  isCardFlipped = false
  showIsMode = false
  showContentTag = false
  offSetXValue: number | undefined
  offSetYValue: number | undefined
  isUserLoggedIn = false

  btnPlaylistConfig: NsPlaylist.IBtnPlaylist | null = null
  btnGoalsConfig: NsGoal.IBtnGoal | null = null
  prefChangeSubscription: Subscription | null = null
  sourceLogos: NsInstanceConfig.ISourceLogo[] | undefined

  isIntranetAllowedSettings = false
  showLoggedInCard = false
  showEndPopup = false
  userDetails: any
  cometencyData: { name: any; levels: string }[] = []
  appFramework: string;

  constructor(
    private configSvc: ConfigurationsService,
    private utilitySvc: UtilityService,
    private snackBar: MatSnackBar,
    private userProfileSvc: UserProfileService,
    private router: Router,
    private titleService: Title,
    private localStorageService: LocalStorageService,
    private appFrameworkDetectorService: AppFrameworkDetectorService
  ) {
    super()
    this.offSetXValue = 290
    this.offSetYValue = -340
  }

  ngOnInit() {
    const url = window.location.href
    this.detectFramework()
    // if (url.indexOf('login') > 0 || url.indexOf('explore') > 0 && !this.authSvc.isAuthenticated) {
    //   this.showLoggedInCard = true
    // }
    if (url.indexOf('/public/home') > 0 || url.indexOf('explore') > 0) {
      this.showLoggedInCard = true
    }
    if (localStorage.getItem('loginbtn') || localStorage.getItem('url_before_login')) {
      this.isUserLoggedIn = true
    } else {
      this.isUserLoggedIn = false
    }

    this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    })

    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
      this.sourceLogos = instanceConfig.sources
      this.defaultSLogo = instanceConfig.logos.defaultSourceLogo
    }

    if (this.widgetData) {
      this.btnPlaylistConfig = {
        contentId: this.widgetData.content.identifier,
        contentName: this.widgetData.content.name,
        contentType: this.widgetData.content.contentType,
        mode: 'dialog',
      }
      this.btnGoalsConfig = {
        contentId: this.widgetData.content.identifier,
        contentName: this.widgetData.content.name,
        contentType: this.widgetData.content.contentType,
      }

      // this.cometencyData = JSON.parse(_.get(this.widgetData, 'content.competencies_v1', ''))
      try {
        const jsonData = JSON.parse(_.get(this.widgetData, 'content.competencies_v1'));
        _.forEach(jsonData, (value) => {
          if (value.level) {
            this.cometencyData.push({
              name: value.competencyName,
              levels: ` Level ${value.level}`
            });
          }
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }

      this.modifySensibleContentRating()
    }

    // required for knowledge board
    // TODO: make it more generic
    this.showFlip = Boolean(this.widgetData.content.reason)
    if (this.widgetData.content.mode) {
      this.showIsMode = this.isLatest(this.convertToISODate(this.widgetData.content.addedOn))
    }
    if (this.widgetData.contentTags) {
      this.showContentTag =
        this.checkCriteria() && this.checkContentTypeCriteria() && this.checkMimeTypeCriteria()
    }
  }

  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
    } catch (error) {
      console.log('error while getting packagename')
    }
  }

  showTarget(event: any) {
    if (window.innerWidth - event.clientX < 483) {
      this.showEndPopup = true
      this.target.targetOffsetX = event.clientX + 1
    } else {
      // // console.log('this.showEndPopup', this.showEndPopup)
    }
  }
  clickToRedirect(data: any) {
    if (this.configSvc.userProfile === null) {
      localStorage.setItem(`url_before_login`, `app/toc/` + `${data.identifier}` + `/overview`)
      const url = localStorage.getItem(`url_before_login`) || ''
      this.router.navigateByUrl(url)
    } else {
      this.raiseTelemetry()
    }

  }

  checkContentTypeCriteria() {
    if (
      this.widgetData.contentTags &&
      this.widgetData.contentTags.excludeContentType &&
      this.widgetData.contentTags.excludeContentType.length
    ) {
      return !this.widgetData.contentTags.excludeContentType.includes(
        this.widgetData.content.contentType,
      )
    }
    return true
  }

  checkMimeTypeCriteria() {
    if (
      this.widgetData.contentTags &&
      this.widgetData.contentTags.excludeMimeType &&
      this.widgetData.contentTags.excludeMimeType.length
    ) {
      return !this.widgetData.contentTags.excludeMimeType.includes(this.widgetData.content.mimeType)
    }
    return true
  }

  checkCriteria() {
    if (
      this.widgetData.contentTags &&
      this.widgetData.contentTags.criteriaField &&
      this.widgetData.contentTags.daysSpan
    ) {
      const dateOffset = 24 * 60 * 60 * 1000 * this.widgetData.contentTags.daysSpan
      const lastDay = new Date()
      lastDay.setTime(lastDay.getTime() - dateOffset)
      if (
        this.convertToISODate(
          this.widgetData.content[this.widgetData.contentTags.criteriaField],
        ).getTime() >= lastDay.getTime()
      ) {
        return true
      }
      return false
    }
    return true
  }

  ngOnDestroy() {
    if (this.prefChangeSubscription) {
      this.prefChangeSubscription.unsubscribe()
    }
  }

  login(data: any) {
    let name = `${data.name} - Aastrika`
    this.titleService.setTitle(name)
    this.router.navigate(['/public/toc/overview'], {
      state: {
        tocData: data,
      },
      queryParams: {
        courseId: data.identifier,
      },
    })
    this.localStorageService.setLocalStorage('tocData', JSON.stringify(data))
    this.localStorageService.setLocalStorage(`url_before_login`, `app/toc/` + `${data.identifier}` + `/overview`)
  }

  ngAfterViewInit() {
    this.offSetXValue = 290
    this.offSetYValue = -340
  }

  get checkDisplayName(): string {
    if (this.widgetData.content.creatorDetails && this.widgetData.content.creatorDetails.length) {
      if (
        !this.widgetData.content.creatorDetails[0].name ||
        this.widgetData.content.creatorDetails[0].name === '' ||
        this.widgetData.content.creatorDetails[0].name === 'null null'
      ) {
        return 'Not Disclosed'
      }
      return this.widgetData.content.creatorDetails[0].name
    }
    if (this.widgetData.content.creatorContacts && this.widgetData.content.creatorContacts.length) {
      if (
        !this.widgetData.content.creatorContacts[0].name ||
        this.widgetData.content.creatorContacts[0].name === '' ||
        this.widgetData.content.creatorContacts[0].name === 'null null'
      ) {
        return 'Not Disclosed'
      }
      return this.widgetData.content.creatorContacts[0].name
    }
    return ''
  }

  get imageIcon(): string[] {
    if (this.widgetData.content.contentType === NsContent.EContentTypes.KNOWLEDGE_ARTIFACT) {
      return ['class', 'Knowledge Artifact']
    }
    if (this.widgetData.content.contentType !== NsContent.EContentTypes.RESOURCE) {
      return ['folder', 'Course']
    }
    switch (this.widgetData.content.mimeType) {
      case NsContent.EMimeTypes.HTML:
        return ['library_add', this.widgetData.content.resourceType]
      // tslint:disable-next-line: max-line-length
      case NsContent.EMimeTypes.MP3:
      case NsContent.EMimeTypes.MP4:
      case NsContent.EMimeTypes.M4A:
      case NsContent.EMimeTypes.M3U8:
      case NsContent.EMimeTypes.PLAYLIST:
      case NsContent.EMimeTypes.YOUTUBE:
        return ['library_music', this.widgetData.content.resourceType]
      case NsContent.EMimeTypes.PDF:
        return ['picture_as_pdf', this.widgetData.content.resourceType]
      // tslint:disable-next-line: max-line-length
      case NsContent.EMimeTypes.QUIZ:
      case NsContent.EMimeTypes.HANDS_ON:
      case NsContent.EMimeTypes.RDBMS_HANDS_ON:
      case NsContent.EMimeTypes.IAP:
      case NsContent.EMimeTypes.CERTIFICATION:
        return ['assignment_ind', this.widgetData.content.resourceType]
      default:
        return ['description', this.widgetData.content.resourceType]
    }
  }

  private modifySensibleContentRating() {
    if (
      this.widgetData.content &&
      this.widgetData.content.averageRating &&
      typeof this.widgetData.content.averageRating !== 'number'
    ) {
      // tslint:disable-next-line: ter-computed-property-spacing
      this.widgetData.content.averageRating = (this.widgetData.content.averageRating as any)[
        this.configSvc.rootOrg || ''
        // tslint:disable-next-line: ter-computed-property-spacing
      ]
    }
    this.widgetData.content.averageRating = this.widgetData.content.averageRating || 0
  }

  // private assignThumbnail() {
  //   const thumbnailElement = document.getElementById(`card_${this.widgetData.content.identifier}`) as HTMLImageElement
  //   if (thumbnailElement) {
  //     try {
  //       const observer = new IntersectionObserver(
  //         entries => {
  //           entries.forEach(entry => {
  //             const { isIntersecting } = entry
  //             if (isIntersecting) {
  //               thumbnailElement.src = this.widgetData.content.appIcon
  //               observer.disconnect()
  //             }
  //           })
  //         },
  //       )
  //       observer.observe(thumbnailElement)
  //     } catch (e) {
  //       thumbnailElement.src = this.widgetData.content.appIcon
  //     }
  //   }
  // }

  get isKnowledgeBoard() {
    return (
      (this.widgetData.content && this.widgetData.content.contentType) ===
      NsContent.EContentTypes.KNOWLEDGE_BOARD
    )
  }

  raiseTelemetry() {
    if (this.configSvc.unMappedUser) {
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(50), mergeMap((data: any) => {
        return of(data)
      })).subscribe((userDetails: any) => {
        if (userDetails.profileDetails.profileReq.personalDetails.dob !== undefined) {
          // this.events.raiseInteractTelemetry('click', `${this.widgetType}-${this.widgetSubType}`, {
          //   contentId: this.widgetData.content.identifier,
          //   contentType: this.widgetData.content.contentType,
          //   context: this.widgetData.context,
          // })
          this.router.navigateByUrl(`/app/toc/${this.widgetData.content.identifier}/overview?primaryCategory=Course`)
        } else {
          const url = `/app/toc/${this.widgetData.content.identifier}/overview`
          this.router.navigate(['/app/about-you'], { queryParams: { redirect: url } })
        }
      })
    }
  }

  get isGreyedImage() {
    if (
      (this.widgetData.content && this.widgetData.content.status === 'Deleted') ||
      this.widgetData.content.status === 'Expired'
    ) {
      return true
    }
    return false
  }

  convertToISODate(date = ''): Date {
    try {
      return new Date(
        `${date.substring(0, 4)
        } -${date.substring(4, 6)} -${date.substring(6, 8)}${date.substring(
          8,
          11,
        )
        }:${date.substring(11, 13)}:${date.substring(13, 15)} .000Z`,
      )
    } catch (ex) {
      return new Date(new Date().setMonth(new Date().getMonth() - 1))
    }
  }

  isLatest(addedOn: Date) {
    if (addedOn) {
      const dateOffset = 24 * 60 * 60 * 1000 * 7
      const last7Day = new Date()
      last7Day.setTime(last7Day.getTime() - dateOffset)
      if (addedOn.getTime() >= last7Day.getTime()) {
        return true
      }
    }
    return false
  }

  get showIntranetContent() {
    if (this.widgetData.content.isInIntranet && this.utilitySvc.isMobile) {
      return !this.isIntranetAllowedSettings
    }
    return false
  }

  showSnackbar() {
    if (this.showIntranetContent) {
      this.snackBar.open('Content is only available in intranet', undefined, { duration: 2000 })
    } else if (!this.isLiveOrMarkForDeletion) {
      this.snackBar.open('Content may be expired or deleted', undefined, { duration: 2000 })
    }
  }

  get isLiveOrMarkForDeletion() {
    if (
      !this.widgetData.content.status ||
      this.widgetData.content.status === 'Live' ||
      this.widgetData.content.status === 'MarkedForDeletion'
    ) {
      return true
    }
    return false
  }

  openComment() { }
}
