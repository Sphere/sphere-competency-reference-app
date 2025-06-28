import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog';
import { ConfigurationsService } from '../../services/configurations.service'
import { UtilityService } from '../../services/utility.service'
import { UserService } from '../../../../../../../app/modules/home/services/user.service'
import { Router } from '@angular/router'
import { ConfigService } from '@aastrika_npmjs/comptency/entry-module'
import { CommonUtilService, TelemetryGeneratorService, InteractSubtype, InteractType, Environment, PageId } from '../../../../../../../services'
import { AuthService } from 'sunbird-sdk';
import { LocalStorageService } from '../../../../../../../app/manage-learn/core/services/local-storage/local-storage.service';
@Component({
  selector: 'ws-utils-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {

  disabled = false
  isDownloadableIos = false
  isDownloadableAndroid = false
  constructor(
    @Inject('AUTH_SERVICE') private authService: AuthService,
    public dialogRef: MatDialogRef<LogoutComponent>,
    private configSvc: ConfigurationsService,
    private utilitySvc: UtilityService,
    private userService:UserService,
    private CompetencyConfigService:ConfigService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private commanUtilservice: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isDownloadableIos = !this.configSvc.restrictedFeatures.has('iosDownload')
      this.isDownloadableAndroid = !this.configSvc.restrictedFeatures.has('androidDownload')
    }
  }

  async confirmed() {
    this.disabled = true
    this.userService.resetUserProfile()
    await this.localStorageService.deleteAllStorage()
    localStorage.removeItem('isOnlyPassbook');
    localStorage.removeItem('competency')
    sessionStorage.clear()
    this.authService.resignSession()
    this.configSvc.userDetails = null
    this.CompetencyConfigService.clearConfig()
    this.dialogRef.close()
    this.cdr.markForCheck();
    this.commanUtilservice.previesUrlList = [];
    this.commanUtilservice.setShowNavBar(false)
    this.generateInteractEvent(this.configSvc.userProfile?.profileData['id']);
    this.router.navigate(['/public/home'])
  }

  get isDownloadable() {
    if (this.configSvc.instanceConfig && this.configSvc.instanceConfig.isContentDownloadAvailable &&
      (this.utilitySvc.iOsAppRef || this.utilitySvc.isAndroidApp)) {
      return true
    }
    return false
  }

  generateInteractEvent(uid) {
    const valuesMap = {};
    valuesMap['UID'] = uid;
    this.telemetryGeneratorService.generateInteractTelemetry(InteractType.OTHER,
      InteractSubtype.LOGOUT_INITIATE,
      Environment.USER,
      PageId.LOGOUT,
      undefined,
      valuesMap
    );
  }

}
