import { Component, OnInit, Input } from '@angular/core'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { RouterLinks } from '../../../../../app/app.constant';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { ValueService } from '../../../../../library/ws-widget/utils/src/lib/services/value.service';
import { Platform } from '@ionic/angular';
import { Environment, InteractType, PageId, TelemetryGeneratorService } from '../../../../../services';

@Component({
  selector: 'app-sphere-footer',
  templateUrl: './sphere-footer.component.html',
  styleUrls: ['./sphere-footer.component.scss'],
})
export class SphereFooterComponent implements OnInit {
  @Input() isHomePage!: any
  isXSmall = false
  termsOfUser = true
  appIcon: SafeUrl | null = null
  isMedium = false
  currentYear = new Date().getFullYear()
  isTablet = false;

  constructor(
    private configSvc: ConfigurationsService,
    private valueSvc: ValueService,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private emailComposer: EmailComposer,
    private platform: Platform,
    private telemetryGeneratorService: TelemetryGeneratorService
  ) {
    if (this.configSvc.restrictedFeatures) {
      if (this.configSvc.restrictedFeatures.has('termsOfUser')) {
        this.termsOfUser = false
      }
    }
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
    this.valueSvc.isLtMedium$.subscribe(isMedium => {
      this.isMedium = isMedium
    })
    if (this.configSvc.instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        this.configSvc.instanceConfig.logos.app,
      )
    }
  }

  ngOnInit() {
    this.isTablet = this.platform.is('tablet');
  }

  createAcct() {
    this.generateInteractTelemetry('start-today');
    this.router.navigateByUrl('app/create-account')
  }

  navigateToPublcTOC(panel) {
    this.generateInteractTelemetry(panel === 'dp' ? 'privacy-policy' : 'terms-of-use');
    this.router.navigate([RouterLinks.PUBLIC_TNC], { queryParams: { panel } })
  }

  // openDefaultMailApp() {
  //   window.location.href = 'mail-to:support@aastrika.org';
  // }
  openDefaultMailApp() {
    this.emailComposer.open({
      to: 'support@aastrika.org',
      subject: '',
      body: '',
    });
  }

  generateInteractTelemetry(action) {
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.TOUCH,
      action,
      PageId.PUBLIC_HOME,
      Environment.HOME
    )
  }

}
