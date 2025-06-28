import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { LogoutComponent } from '../../../../../library/ws-widget/utils/src/lib/helpers/logout/logout.component'
import { RouterLinks } from '../../../../../app/app.constant'
import { CommonUtilService, TelemetryGeneratorService } from '../../../../../services'
import { NavController } from '@ionic/angular'
import { storageKeys } from '../../../../../app/manage-learn/storageKeys'
import { LocalStorageService } from '../../../../../app/manage-learn/core'
import { CorrelationData } from 'sunbird-sdk'

@Component({
  selector: 'ws-mobile-profile-nav',
  templateUrl: './mobile-profile-nav.component.html',
  styleUrls: ['./mobile-profile-nav.component.scss'],
})
export class MobileProfileNavComponent implements OnInit, OnDestroy {
  @Input() showbackButton?: Boolean
  @Input() showLogOutIcon?: Boolean
  @Input() trigerrNavigation?: Boolean = false
  @Input() navigateTohome?: Boolean = false
  @Input() navigateToProfile?: Boolean = false
  @Input() navigateToEducation?: Boolean = false
  @Input() navigateToWorkInfo?: Boolean = false
  @Input() emitNavigateBack?: Boolean = false
  @Input() navigateToPreviesPage?: Boolean = false
  @Input() navigateToEkshmataHome?: Boolean = false
  @Input() navigateToSphereHome?: Boolean = false
  @Input() navigateAshaHome?: Boolean = false

  @Output() navigateBack = new EventEmitter()
  OnDestroy: any
  redirectUrl: any
  public corRelationList: Array<CorrelationData>;
  constructor(
    public dialog: MatDialog,
    private _location: Location,
    public router: Router,
    private route: ActivatedRoute,
    private commonUtilService: CommonUtilService,
    private navCtrl: NavController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private localStorage: LocalStorageService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.redirectUrl = params.redirect
    })
  }

  logout() {
    this.dialog.open<LogoutComponent>(LogoutComponent)
  }

  backScreen() {
    this.commonUtilService.updateAppLanguage('en');
    this.localStorage.getLocalStorage(storageKeys.userProfile).then(resp => {
      if (resp) {
        const code = resp.profileDetails!.preferences!.language
        this.commonUtilService.updateAppLanguage(code);
      }
    })
   
    if (this.emitNavigateBack) {
      this.navigateBack.emit(true)
    } else if (this.navigateToPreviesPage) {
      this.navigateBackToPreviesPage()
    } else if (this.trigerrNavigation) {
      this.router.navigateByUrl(RouterLinks.PROFILE_DASHBOARD)
    } else if (this.navigateToProfile) {
      this.router.navigate([`app/personal-detail-list`])
    } else if (this.navigateToEducation) {
      this.router.navigate([`app/education-list`])
    } else if (this.navigateToWorkInfo) {
      this.router.navigate([`app/organization-list`])
    }else if(this.redirectUrl) {
      this.router.navigate([this.redirectUrl])
    }else if(this.navigateToEkshmataHome){
      this.router.navigate(['public/home'])
      this.commonUtilService.setShowNavBar(false)
    }else if(this.navigateToSphereHome){
      this.router.navigate(['public/home'])
    } else if(this.navigateAshaHome){
      this.router.navigate(['page/home'])
    }
    else {
      if (this.navigateTohome) {
        if (localStorage.getItem('orgValue') === 'nhsrc') {
          this.router.navigateByUrl('/organisations/home')
        } else {
          this.router.navigate(['/page/home'])
        }
      } else {
        this._location.back()
      }
    }
  }

  navigateBackToPreviesPage() {
    this.commonUtilService.blockAddUrl = true
    const previesUrl = this.commonUtilService.getPreviesUrl
    this.generateBackClickEvent(previesUrl)
    this.commonUtilService.addLoader()
    if (previesUrl) {
      this.router.navigateByUrl(`${previesUrl}`)
    } else {
      // let animations: AnimationOptions = {
      //   animated: true,
      //   animationDirection: "back"
      // }
      // this.navCtrl.back(animations)
      this.router.navigateByUrl('page/home');
    }
  }

  generateBackClickEvent(previesUrl: string) {
    const duration = this.commonUtilService.getPageLoadTime()
    this.telemetryGeneratorService.generateBackClickedNewTelemetry(false, previesUrl.split('/')[1], previesUrl, duration)
  }


  ngOnDestroy(): void {
    if (this.OnDestroy) {
      this.OnDestroy.unsubscribe()
      this.OnDestroy = null
    }
  }
}
