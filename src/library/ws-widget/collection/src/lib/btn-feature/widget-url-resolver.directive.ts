import { Directive, HostListener, Input } from '@angular/core'
import { Router } from '@angular/router'
import { LocalStorageService } from '../../../../../../app/manage-learn/core'
import { storageKeys } from '../../../../../../app/manage-learn/storageKeys'
import { CommonUtilService } from '../../../../../../services'
import { MobileAppsService } from '../../../../../../services/mobile-apps.service'
import _ from 'lodash'
@Directive({
  selector: '[wsWidgetUrlResolver]',
})
export class WidgetUrlResolverDirective {
  constructor(
    private router: Router,
    // private mobileAppsSvc: MobileAppsService,
    private mobileAppsSvc: MobileAppsService,
    private commonUtilService: CommonUtilService,
    private localStorage: LocalStorageService
  ) { }

  @Input() wsWidgetUrlResolver!: boolean
  @Input() url!: string
  @Input() mobileAppFunction?: string

  // @Input() mobileAppFunction?: string
  @HostListener('click', ['$event'])
  clicked(event: Event) {
    event.preventDefault()
    // if (this.mobileAppFunction && this.mobileAppsSvc.isMobile) {
    //   this.mobileAppsSvc.sendDataAppToClient(this.mobileAppFunction, {})
    //   return
    // }
    this.localStorage.getLocalStorage(storageKeys.userProfile).then(resp => {
      if (resp) {
        const code = _.get(resp, 'profileDetails.preferences.language')
        this.commonUtilService.updateAppLanguage(code);
      }
    })
    if (this.mobileAppFunction && this.mobileAppsSvc.isMobile) {
      this.mobileAppsSvc.sendDataAppToClient(this.mobileAppFunction, {})
      return
    }
    if (!this.url) {
      return
    }
    if (this.wsWidgetUrlResolver) {
      this.router.navigate(['/externalRedirect', { externalUrl: this.url }], {
        skipLocationChange: true,
      })
    } else {
      this.router.navigateByUrl(this.url)
    }
  }
}
