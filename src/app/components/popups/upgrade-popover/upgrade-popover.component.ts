import { Component, Input } from '@angular/core';
import { NavParams, Platform, PopoverController } from '@ionic/angular';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import {
  Environment, ID,
  ImpressionSubtype,
  ImpressionType,
  InteractSubtype,
  InteractType,
  PageId,
} from '../../../../services';
import { TelemetryGeneratorService } from '../../../../services/telemetry-generator.service';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';

@Component({
  selector: 'app-upgrade-popover',
  templateUrl: './upgrade-popover.component.html',
  styleUrls: ['./upgrade-popover.component.scss'],
})
export class UpgradePopoverComponent {

  upgradeType: any;
  isMandatoryUpgrade = false;
  pageId: PageId;
  appName: string;
  actionButtonYes: any;
  actionButtonNo: any;

  @Input() type;
  constructor(
    private popCtrl: PopoverController,
    private telemetryGeneratorService: TelemetryGeneratorService,
    private appVersion: AppVersion,
    private iab: InAppBrowser
  ) {
    this.init();
  }

  async init() {
    const values = {};
    this.appName = await this.appVersion.getAppName();
    if (this.upgradeType.type === 'force' || this.upgradeType.type === 'forced') {
      this.isMandatoryUpgrade = true;
      values['minVersionCode'] = this.upgradeType.minVersionCode;
      values['maxVersionCode'] = this.upgradeType.maxVersionCode;
    }
    values['currentAppVersionCode'] = this.upgradeType.currentAppVersionCode;
    values['requiredVersionCode'] = this.upgradeType.requiredVersionCode;
    const impressionSubtype: string = this.upgradeType.requiredVersionCode ? ImpressionSubtype.DEEPLINK : ImpressionSubtype.UPGRADE_POPUP;
    if (this.upgradeType.actionButtons) {
      for (const actionButton of this.upgradeType.actionButtons) {
        if (actionButton.action === 'yes') {
          this.actionButtonYes = actionButton;
        } else if (actionButton.action === 'no') {
          this.actionButtonNo = actionButton;
        }
      }
    }
    const interactSubType: string = this.upgradeType.type === 'force' || this.upgradeType.type === 'forced'
        ? InteractSubtype.FORCE_UPGRADE_INFO : this.upgradeType.type === 'optional' &&
        this.upgradeType.isFromDeeplink ? InteractSubtype.DEEPLINK_UPGRADE : InteractSubtype.OPTIONAL_UPGRADE;

    this.telemetryGeneratorService.generateImpressionTelemetry(
      ImpressionType.VIEW,
      impressionSubtype,
      PageId.UPGRADE_POPUP,
      this.upgradeType.isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING
    );
    this.telemetryGeneratorService.generateInteractTelemetry(
      InteractType.OTHER,
      interactSubType,
      this.upgradeType.isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING,
      PageId.UPGRADE_POPUP,
      undefined,
      values
    );
  }

  cancel() {
    this.popCtrl.dismiss();
    this.telemetryGeneratorService.generateInteractTelemetry(
        InteractType.OTHER,
        '',
        this.upgradeType.isOnboardingCompleted ? Environment.HOME : Environment.ONBOARDING,
        PageId.UPGRADE_POPUP,
        undefined,
        undefined,
        undefined,
        undefined,
        ID.CANCEL_CLICKED
    );
  }

  upgradeApp(link) {
      const browser = this.iab.create(link, '_system');
      browser.on('exit').subscribe(() => {
        this.popCtrl.dismiss()
      })
  }
}
